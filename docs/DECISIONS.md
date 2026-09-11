# Technical Decisions

This document records important architectural and technical decisions made during the development of the Simplify Library project. Recording these decisions helps future developers (and AI assistants) understand *why* certain approaches were chosen.

## 9. Responsive Grid: Explicit Breakpoints vs. Auto-Fill
**Date:** 2026-09-10
**Context:** Halaman Beranda dan Katalog menggunakan CSS Grid dengan `grid-cols-[repeat(auto-fill,minmax(180px,1fr))]`. Pada layar HP yang sempit (lebar < 360px), browser tidak bisa muat 2 kolom sekaligus, sehingga CSS memaksa hanya 1 kolom dan membentangkan 1 kartu buku memenuhi seluruh layar — terlihat sangat besar dan tidak proporsional, bahkan jika hanya ada 1 buku di koleksi.
**Decision:** Mengganti ke *explicit responsive breakpoints* Tailwind CSS: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6`. Ini memaksa grid untuk **selalu** menampilkan tepat 2 kolom di HP, tanpa pengecualian.
**Consequences:**
- **Pros:** Tampilan konsisten dan proporsional di semua ukuran layar. Kartu buku tidak pernah tampak terlalu raksasa bahkan jika hanya ada 1 item.
- **Cons:** Grid tidak lagi "fluid" — jumlah kolom akan berpindah secara tiba-tiba (bukan gradual) saat melewati breakpoint. Ini adalah trade-off yang dapat diterima untuk kontrol visual yang lebih presisi.

---

## 8. Homepage Search Bar: Server Action vs. API Route
**Date:** 2026-09-10
**Context:** Komponen `HomeSearchBar` di beranda membutuhkan cara untuk mencari saran buku secara *real-time* setiap kali pengguna mengetik. Pilihan yang ada adalah: (1) memanggil API Route (`/api/search`) yang sudah ada, atau (2) membuat Server Action baru di `src/actions/search.ts`.
**Decision:** Membuat Server Action baru (`searchBooksSuggestion` di `src/actions/search.ts`) yang dipanggil langsung dari komponen Client.
**Reasoning:** Server Actions untuk pencarian bersifat lebih langsung dan aman daripada API Route publik untuk *client-to-server* calls. API Route `/api/search` yang lama tetap dipertahankan karena dipakai oleh komponen `SearchAutocomplete.tsx` di halaman Katalog yang menggunakan fetch berbasis URL.
**Consequences:**
- **Pros:** Pencarian berjalan tanpa perlu melalui HTTP request publik yang bisa di-abuse. Kode lebih bersih.
- **Cons:** Ada dua mekanisme pencarian buku yang berbeda (`/api/search` dan `src/actions/search.ts`) yang perlu disinkronkan jika logikanya berubah di masa depan.

---

## 7. Server-Side Rendering KaTeX & Iframe Sandboxing for Raw HTML
**Date:** 2026-09-10
**Context:** BlockSuite's HTML export had several limitations. LaTeX formulas (`$$`) relied on client-side JS, causing Next.js race conditions and CSP blockages. Additionally, when users wrote SVG/HTML in code blocks containing their own `<style>` tags, rendering it via `dangerouslySetInnerHTML` caused global CSS leakage that completely broke the Next.js page layout. Finally, BlockSuite fundamentally degrades native tables into `<p>` elements upon HTML export.
**Decision:** We migrated KaTeX parsing entirely to the Server-Side using the `katex` npm package. For HTML/SVG code blocks, we strip the syntax highlighting injected by BlockSuite and render the raw HTML safely isolated inside an `<iframe srcdoc="...">`.
**Consequences:** 
- **Pros:** 100% reliable math rendering without client-side JS overhead or CSP issues. Absolute layout safety from malicious or poorly written user CSS in code blocks.
- **Cons:** Native BlockSuite tables are still unsupported by its HTML exporter; users must use HTML Code Blocks for tables.


## 5. Analytics View Tracking (Fire-and-Forget)
**Date:** 2026-09-09
**Context:** We needed a way to track book popularity (view counts) when users read chapters. Since chapter reading pages (`/buku/[slug]/bab/[chapterSlug]`) are meant to be fast and ideally static/cached (SSG/ISR), tracking views on the server-side during the initial page render would break caching and slow down page loads.
**Decision:** We implemented a "fire-and-forget" client-side component (`ViewTracker.tsx`) that triggers a `POST` request to `/api/track-view` once the page has mounted on the client.
- The component uses `useEffect` and a `useRef` flag to ensure the API is only called exactly once per page load (avoiding React StrictMode double-fire issues).
- The API route atomic-increments the `view_count` field in the database without blocking the user's UI.
**Consequences:**
- **Pros:** Does not block page rendering. Highly performant. Safe for SSG/SSR.
- **Cons:** Dependent on client-side JavaScript (if a user disables JS, the view is not tracked).

---

## 4. Penghapusan Fitur Berita (News)
**Date:** 2026-09-09
**Context:** Awalnya dibangun sebagai tempat pengumuman/blog menggunakan BlockSuite.
**Decision:** Dihapus sepenuhnya.
**Reasoning:** Tidak sesuai dengan visi inti dari sebuah "Personal Library" yang hanya membutuhkan katalog buku hukum murni. Kompleksitas ekstra (dual-content JSON+HTML) untuk fitur blog tidak sepadan dengan penggunaannya.

---

## 6. Pemisahan Autentikasi Publik vs Admin (Dual Proxy)
**Date:** 2026-09-09
**Context:** Kami perlu memberikan opsi kepada pembaca publik untuk mendaftar akun agar bisa menyimpan buku (Bookmark), namun sistem Appwrite kami mencampuradukkan semua *user* dalam satu sistem autentikasi. Jika pembaca publik masuk, sistem akan mengira mereka berhak masuk ke `/admin`.
**Decision:** Kami mengimplementasikan cookie sekunder `is_admin` saat login melalui `/api/auth/login`.
- Jika admin login (melalui rute API auth lama), server menge-set cookie Appwrite asli *dan* cookie `is_admin=true`.
- Jika publik login (melalui `/api/public-auth/login`), server hanya menge-set cookie Appwrite asli.
- Middleware Next.js (`proxy.ts`) secara eksplisit memeriksa keberadaan cookie `is_admin`. Jika tidak ada, rute `/admin` akan langsung ditolak (401) meskipun mereka punya sesi Appwrite yang valid.
**Consequences:** 
- **Pros:** Memisahkan hak akses secara mutlak tanpa perlu mengelola peran (Roles/Teams) yang rumit di level database Appwrite. Sangat aman dan mencegah *routing loop*.
- **Cons:** Harus memelihara dua jalur API login yang sedikit berbeda untuk frontend admin vs frontend publik.

---

## 7. Optimasi Kecepatan dengan SSG & ISR
**Date:** 2026-09-09
**Context:** Perpustakaan publik harus memuat konten dengan sangat cepat (< 1.5 detik) namun data buku bisa berubah sewaktu-waktu jika admin mengedit.
**Decision:** Menggunakan fitur Next.js *Incremental Static Regeneration* (ISR).
- Semua rute halaman publik (`page.tsx`, `katalog`, `kategori`, `buku/[slug]`) diberi atribut `export const revalidate = 3600;` (1 jam).
- Halaman detail buku `/buku/[slug]` juga dilengkapi `generateStaticParams` agar halaman-halaman buku populer di-*render* statis pada saat proses *build*.
**Consequences:**
- **Pros:** Halaman publik memuat secara instan (TTFB sangat rendah) karena dilayani dari *cache* statis CDN, bukan me-*query* Appwrite setiap saat.
- **Cons:** Jika admin mengubah isi buku, perubahan baru akan muncul ke publik maksimal setelah 1 jam (kecuali dilakukan *on-demand revalidation*).

---

## 3. Type Safety without Appwrite SDK Models
**Date:** 2026-09-09
**Context:** Because we removed the Appwrite SDK from the project due to compatibility and CORS issues (see Decision 1), we also lost access to `Models.Document` and other strict type definitions provided by the SDK.
**Decision:** We adopted the use of `Record<string, unknown>` for raw database responses coming from our custom `appwrite-rest.ts` proxy.
- **In Server Actions/API:** We cast these records to our own lightweight TypeScript interfaces (e.g., `Book`, `Chapter`) via an intermediate `unknown` cast (e.g. `const typedBook = book as unknown as Book`) to satisfy TypeScript's strict overlapping rules.
- **In React Components (JSX):** We extract properties into strictly typed local variables before rendering. Since JSX does not accept `unknown` as a valid `ReactNode`, we enforce casting using JavaScript primitives like `String(book.title ?? '')`, or explicit boolean checks like `!!book.description`.
- **Client Components & File URLs:** For features like `getCoverUrl`, Client Components cannot use the server-side REST helper. Instead of importing the helper, Client Components manually reconstruct Appwrite REST URLs using exposed `NEXT_PUBLIC_` environment variables.
**Consequences:** 
- **Pros:** Full independence from Appwrite SDK. Keeps the client bundle size small. Zero TypeScript compilation errors.
- **Cons:** Requires a bit of manual type wrangling and boilerplate `String()` casting when interacting directly with raw database objects in views.

---

## 2. BlockSuite Editor Dual Content Strategy (JSON + HTML)
**Date:** 2026-09-09
**Context:** BlockSuite (the rich text editor) stores its document state as a complex JSON snapshot, which it uses internally to render the editor via Canvas/DOM. However, we need to display the chapter content to public readers in a fast, SSG-friendly manner without loading the heavy BlockSuite library or waiting for client-side rendering.

**Decision:** We implemented a dual content strategy in the Appwrite database:
1. `content_json` (Source of Truth): The native JSON snapshot exported by BlockSuite. This is saved via autosave (debounced) while the admin edits the chapter. It guarantees no data loss and allows the editor to be rehydrated exactly as it was.
2. `content_html` (Build Artifact): Generated on-demand using BlockSuite's `HtmlAdapter` only when the admin clicks "Terbitkan Bab" (Publish Chapter).
3. `renderer_version`: Stored alongside `content_html` to track which version of the HTML generator was used. This allows for bulk HTML regeneration in the future if styling or markup requirements change.

**Consequences:**
- **Pros:** Public reading pages are extremely fast and lightweight as they only render raw HTML (`dangerouslySetInnerHTML`). The complex editor logic is strictly isolated to the admin panel.
- **Cons:** Storage overhead is slightly higher since we store both JSON and HTML representations. We must ensure the HTML generation logic in BlockSuite stays in sync with our public CSS styles (`.blocksuite-content`).

---

## 1. Dropping Browser-Side Appwrite SDK for Server Actions and API Proxies
**Date:** 2026-09-09
**Context:** During the implementation of the Admin CMS and Authentication, we encountered significant issues using the official `appwrite` (browser) and `node-appwrite` SDKs. 
- The Appwrite Server version (1.5.x) had compatibility issues with newer SDKs, causing syntax errors in standard queries.
- Direct browser-to-Appwrite API calls faced CORS restrictions because the frontend (`localhost:3000`) and the Appwrite instance (`appwrite.geladisalam.my.id`) were on different domains.
- We needed a secure way to manage sessions and perform database operations without exposing API keys.

**Decision:**
1. **Server Actions for CRUD:** All database operations (Create, Read, Update, Delete) for Books, Chapters, Categories, and File Storage were moved from Client Components to Next.js Server Actions (located in `src/actions/`). This ensures all database communication happens server-side via our custom REST helper (`appwrite-rest.ts`), completely bypassing the problematic SDKs and securing API keys.
2. **API Routes for Auth Proxy:** We implemented Next.js API routes (`/api/auth/login`, `/api/auth/me`, `/api/auth/logout`) to act as a proxy for authentication. The frontend talks to these local endpoints (avoiding CORS), and the local endpoints securely communicate with the remote Appwrite server.
3. **Cookie Handling:** Because Appwrite returns Set-Cookie headers tied to its own domain, our local proxy intercepts the session token and re-issues it as a localhost-compatible cookie (`httpOnly: false`, `sameSite: lax`). This allows the Next.js middleware and API routes to correctly identify the user.

**Consequences:**
- **Pros:** Completely resolved CORS issues. Eliminated dependency on problematic SDK versions. More secure architecture (no API keys or direct database access exposed to the browser client).
- **Cons:** Slightly more boilerplate code required for authentication proxying (manually extracting and forwarding cookies).
