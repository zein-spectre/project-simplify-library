# Project Changelog

This file tracks what gets done in each work session.

## 2026-09-12 (Sesi 2): BlockSuite Editor — connectedCallback Re-entrancy & Editor Instantiation Fix

**Problem:** Editor was blank again on the admin page. Console showed:
- `Uncaught TypeError: Cannot read properties of undefined (reading 'slots')` at `connectedCallback`
- `[BlockSuite] Synced timeout — init empty template` firing alongside the `synced` handler (double-init)
- Vite HMR cache serving stale code where the `_connectedRan` guard was closure-scoped

**Root Cause 1 — Editor instantiation before registration:** `new AffineEditorContainer()` was called at module level before `customElements.define()` ran, creating a second unregistered instance.

**Root Cause 2 — Closure-scoped re-entrancy guard:** `_connectedRan` was a `let` in the module closure, shared across all instances — not isolated per element. Vite HMR cache compounded this by serving stale code.

**Root Cause 3 — Double `initEmptyTemplate()`:** The 3-second fallback timeout and the `synced` event both called `initEmptyTemplate()` since `_initialized` was set inside the timeout, not before.

**Fix Applied:**
- Move `new AffineEditorContainer()` into `mountEditor()` (only created after prototype is patched)
- Store `_connectedRan` as `this._connectedRan` (element instance property)
- Add module-level `_initialized` flag, set in both timeout and `initEmptyTemplate()` body
- Full Vite cache clear: `rm -rf blocksuite/node_modules/.vite blocksuite/.vite`

**Files Changed:**
- `blocksuite/src/main.ts` — editor moved to `mountEditor()`, `_connectedRan` on `this`, `_initialized` guard

**Verification:** Editor renders with editable "Title" heading and "Tags" section. No `slots` TypeError. After full restart via `start-dev.command` (cache cleared): confirmed no `slots` TypeError, no double `initEmptyTemplate()` call. Resolution confirmed.

---

## 2026-09-12: BlockSuite Editor — Shadow Root & Doc Initialization Fix

**Problem:** BlockSuite editor iframe showed a blank white screen despite all resources loading correctly.

**Root Cause 1 — Shadow Root Null:** Vite's pre-bundler (`optimizeDeps`) strips `customElements.define` calls from Lit decorators in `@blocksuite/presets`. This caused `AffineEditorContainer` to throw in `connectedCallback` before `attachShadow()` could run, leaving the element with no shadow root.

**Root Cause 2 — doc.root Null:** `editor.doc` was assigned BEFORE `document.body.append(editor)`. Lit's reactive update fired before the element was in the DOM, so the render pass ran but rendered nothing.

**Fix Applied:**
- Patch `AffineEditorContainer.prototype.connectedCallback` to create shadow root first, then wrap original call in try/catch
- Reorder `mountEditor` to set `editor.doc` AFTER `document.body.append(editor)`, then call `editor.requestUpdate()`
- Full Vite cache clear (`rm -rf node_modules/.vite`) required for prototype patches to take effect

**Files Changed:**
- `blocksuite/src/main.ts` [MODIFIED] — connectedCallback patch, reordered mountEditor
- `blocksuite/vite.config.ts` [MODIFIED] — simplified config, no special aliases needed for this fix
- `blocksuite/src/editor-registration.ts` [MODIFIED] — simplified to `import '@blocksuite/presets'` only

---

## 2026-09-10

**Search Bar Interaktif di Beranda**
- Tambah komponen `HomeSearchBar.tsx` dengan fitur *autocomplete* dropdown yang bersifat *real-time*: setiap ketikan memicu pencarian ke Appwrite dan menampilkan maksimal 4 saran buku secara langsung.
- Item kelima (jika ada lebih dari 4 hasil) ditampilkan sebagai tautan "Lihat hasil lainnya" yang mengarah ke halaman `/katalog` dengan kata kunci yang sudah terisi otomatis.
- Klik tombol "Telusuri" atau item "dll" akan menavigasi ke halaman Katalog dengan parameter `?q=...` yang terbawa.
- Placeholder search bar diubah dari "Cari judul buku, asas hukum, pasal..." menjadi "Cari judul buku, penulis..." agar lebih simpel.
- Tampilan *dropdown* diperbarui: ikon buku dihapus; setiap item kini berupa satu baris horizontal (Judul — Penulis) yang ringkas dan tidak memakan tempat.
- Buat Server Action `src/actions/search.ts` sebagai *endpoint* pencarian terpusat untuk komponen ini.

**Perbaikan Bug Bookmark (Error 500)**
- Identifikasi bahwa akar masalah Error 500 saat menekan tombol Bookmark adalah *server* `npm run dev` yang tidak membaca ulang variabel lingkungan `NEXT_PUBLIC_APPWRITE_BOOKMARKS_COLLECTION_ID` dari `.env.local` karena proses Node.js yang tidak pernah benar-benar mati saat menutup jendela terminal (proses "siluman").
- Solusi: Matikan paksa semua proses Next.js di background, lalu restart ulang server.

**Perbaikan Responsive Grid Kartu Buku**
- Masalah: Di layar HP, grid kartu buku menggunakan `auto-fill minmax(180px, 1fr)` sehingga jika hanya ada 1 buku, cover-nya membentang memenuhi seluruh lebar layar.
- Solusi: Mengganti ke *explicit breakpoints* Tailwind CSS agar selalu menampilkan minimal **2 kolom** di layar HP, dan bertambah seiring lebar layar.
- Perubahan ini diterapkan serentak di halaman Beranda dan halaman Katalog.

**Files Changed:**
- `src/components/public/HomeSearchBar.tsx` [NEW] Komponen search bar beranda dengan autocomplete.
- `src/actions/search.ts` [NEW] Server Action pencarian buku untuk suggestion.
- `src/app/page.tsx` [MODIFIED] Integrasi `HomeSearchBar`, perbaikan responsive grid.
- `src/components/public/CatalogClient.tsx` [MODIFIED] Perbaikan responsive grid.

---

## 2026-09-10 (Sesi 1): Perbaikan Rendering Konten Publik
- **Bug Fix Server Action**: Mengubah `ProgressTracker` untuk memanggil API Endpoint murni (`/api/progress`) alih-alih Server Action bawaan guna menghindari *bug* `FormData` Next.js pada halaman publik.
- **Server-Side KaTeX**: Memindahkan sistem rendering rumus fisika/matematika dari eksekusi *Client-Side* (*browser*) ke *Server-Side* menggunakan *library* `katex` Node.js, mengatasi isu *race condition* dan pemblokiran fitur CSP.
- **Iframe CSS Sandboxing**: Mengamankan render konten *Code Block* HTML/SVG milik pengguna ke dalam sebuah `<iframe srcdoc="...">` yang terisolasi. Hal ini mencegah kebocoran kode CSS global dari *code block* (seperti `body { width: 100% }`) yang sempat merusak *layout* utama Next.js.
- **BlockSuite Exporter Parser**: Mengembangkan fungsi pembersih tag pewarnaan kode (*syntax highlighting*) bawaan BlockSuite agar deteksi kode HTML murni dapat berjalan sukses.
- **Files Changed**: 
  - `src/components/public/ChapterContentRenderer.tsx` [MODIFIED]
  - `src/components/public/ProgressTracker.tsx` [MODIFIED]
  - `src/app/api/progress/route.ts` [MODIFIED]
  - `next.config.ts` [MODIFIED]


## 2026-09-09: Tahap 5 & 6 — Akun Pembaca, Bookmark, dan Optimasi SSG

**Tahap 5: Akun Pembaca & Bookmark**
- Buat koleksi `bookmarks` di Appwrite beserta index via `scripts/migrate-bookmarks-schema.mjs`.
- Pisahkan jalur autentikasi untuk memproteksi dashboard admin:
  - Admin login (`/api/auth/login`) men-set cookie tambahan `is_admin`.
  - Middleware `proxy.ts` sekarang memblokir akses ke `/admin` jika tidak memiliki cookie `is_admin`.
- Buat `PublicAuthContext.tsx` dan jalur login/register publik (`/api/public-auth/*`).
- Buat halaman publik `/masuk` dan `/daftar`.
- Buat halaman dashboard pembaca `/profil` untuk melihat buku yang tersimpan.
- Integrasikan `BookmarkButton` ke halaman pembaca buku `/buku/[slug]`.
- Buat server action `src/actions/bookmarks.ts` untuk operasi CRUD bookmark.
- Update `Navbar.tsx` untuk menampilkan tautan otentikasi publik.

**Perubahan Desain (Pivot): Penghapusan Fitur Berita**
- Setelah rilis fitur Berita di tahap sebelumnya, diputuskan bahwa fitur portal berita/pengumuman tidak sesuai dengan visi utama "Perpustakaan Personal".
- Menghapus secara permanen koleksi `news` dari Appwrite.
- Menghapus semua kode UI terkait berita: `/app/(public)/berita`, `/app/admin/news`, dan aksi-aksi servernya.
- Menghapus menu "Berita" dari navigasi.

**Tahap 6: Optimasi Kecepatan (SSG / ISR)**
- Aktifkan *Incremental Static Regeneration* (`export const revalidate = 3600;`) di seluruh halaman publik (`page`, `katalog`, `kategori`, `berita`, `buku/[slug]`).
- Tambahkan `generateStaticParams` ke `/buku/[slug]/page.tsx` untuk *pre-rendering* halaman buku yang telah dipublikasikan.

**Key Files Changed:**
- `scripts/migrate-bookmarks-schema.mjs`: [NEW] Script migrasi.
- `src/app/api/public-auth/*`: [NEW] Rute autentikasi pembaca.
- `src/app/(public)/masuk/page.tsx`, `src/app/(public)/daftar/page.tsx`: [NEW] Halaman login/register.
- `src/app/(public)/profil/page.tsx`: [NEW] Halaman daftar bookmark.
- `src/contexts/PublicAuthContext.tsx`: [NEW] State management pembaca.
- `src/components/public/BookmarkButton.tsx`: [NEW] Tombol interaktif penyimpan buku.
- `src/actions/bookmarks.ts`: [NEW] Server actions.
- `src/proxy.ts`, `src/app/api/auth/login/route.ts`: Update sekuriti sesi admin.
- `src/app/layout.tsx`: Integrasi `PublicAuthContext`.
- Semua halaman di `src/app/(public)/*`: Update implementasi SSG caching.


## 2026-09-09: Tahap 4 — Fitur Lanjutan (Post-MVP v1.1 & v1.2)

**v1.1-A: Halaman News Dinamis**
- Buat koleksi `news` di Appwrite via script migrasi `scripts/migrate-news-schema.mjs` dengan dual content strategy (JSON + HTML) identik dengan chapters.
- Buat server actions CRUD `src/actions/news.ts`: `createNews`, `updateNews`, `deleteNews`, `saveNewsContent`, `publishNewsContent`.
- Buat admin panel news lengkap: halaman daftar (`/admin/news`), form buat baru (`/admin/news/new`), editor (`/admin/news/[id]/edit`).
- Buat komponen `NewsEditorClient.tsx` yang mereuse `BlockSuiteEditor` — autosave JSON, publish HTML, status management.
- Buat komponen `NewsListTable.tsx` dengan action delete dan status badge.
- Buat halaman publik `/berita` (daftar artikel dengan colored accent cards) dan `/berita/[slug]` (detail artikel dengan `blocksuite-content` CSS — tampilan 1:1 dengan chapter reader).
- Tambah "Berita & Update" ke `AdminSidebar.tsx` dan link "Berita" ke `Navbar.tsx` publik.

**v1.1-B: Search Autocomplete**
- Buat API route `GET /api/search?q=...` yang query Appwrite `Q.search` pada `simplified_title` dan `original_author`, maks 6 hasil.
- Buat komponen `SearchAutocomplete.tsx` dengan debounce 300ms, navigasi keyboard (↑↓ Enter Escape), dan ARIA attributes.
- Upgrade `CatalogClient.tsx` — ganti plain input search dengan `SearchAutocomplete`.

**v1.2: Statistik Ringan Admin**
- Tambah atribut `view_count` (integer) ke koleksi `books` via script migrasi.
- Buat API route `POST /api/track-view` yang increment `view_count` buku saat bab dibuka.
- Buat komponen client `ViewTracker.tsx` (invisible, fire-and-forget, `useEffect` + `useRef` untuk prevent double-fire).
- Tambahkan `ViewTracker` ke halaman baca bab `/buku/[slug]/bab/[chapterSlug]/page.tsx`.
- Buat `StatsPanel.tsx` (Server Component async) menampilkan Top 5 Buku Terpopuler + CSS bar chart distribusi per kategori, tanpa library chart eksternal.
- Tambah `StatsPanel` ke dashboard admin `/admin/page.tsx`.

**Database Changes (Appwrite):**
- Koleksi `news`: Baru — atribut `title`, `slug`, `excerpt`, `content_json` (5MB), `content_html` (5MB), `renderer_version`, `cover_image_id`, `status`, `published_at` + index `slug` (unique) + index `status`.
- Koleksi `books`: Tambah atribut `view_count` (integer, default 0).

**Key Files Changed:**
- `scripts/migrate-news-schema.mjs`: [NEW] Script migrasi database.
- `src/lib/appwrite-rest.ts`: Tambah `NEWS_COL` export.
- `src/actions/news.ts`: [NEW] Server actions CRUD news.
- `src/components/admin/NewsEditorClient.tsx`: [NEW] Editor artikel dengan BlockSuite.
- `src/components/admin/NewsListTable.tsx`: [NEW] Tabel daftar artikel admin.
- `src/components/admin/StatsPanel.tsx`: [NEW] Panel statistik dashboard admin.
- `src/components/admin/AdminSidebar.tsx`: Tambah nav "Berita & Update".
- `src/components/public/SearchAutocomplete.tsx`: [NEW] Search dengan autocomplete dropdown.
- `src/components/public/ViewTracker.tsx`: [NEW] Client component fire-and-forget view counter.
- `src/components/public/CatalogClient.tsx`: Upgrade ke SearchAutocomplete.
- `src/components/public/Navbar.tsx`: Tambah link "Berita".
- `src/app/admin/news/page.tsx`: [NEW] Halaman daftar artikel admin.
- `src/app/admin/news/new/page.tsx`: [NEW] Form buat artikel baru.
- `src/app/admin/news/[id]/edit/page.tsx`: [NEW] Halaman editor artikel.
- `src/app/admin/page.tsx`: Tambah `StatsPanel`.
- `src/app/(public)/berita/page.tsx`: [NEW] Halaman daftar berita publik.
- `src/app/(public)/berita/[slug]/page.tsx`: [NEW] Halaman detail artikel publik.
- `src/app/(public)/buku/[slug]/bab/[chapterSlug]/page.tsx`: Tambah `ViewTracker`.
- `src/app/api/search/route.ts`: [NEW] API route autocomplete search.
- `src/app/api/track-view/route.ts`: [NEW] API route view counter.
- `simplify-app/.env.local`: Tambah `NEXT_PUBLIC_APPWRITE_NEWS_COLLECTION_ID=news`.

---
## 2026-09-09: Phase 3 — Halaman Publik & Data Real (Penyelesaian MVP)

**Completed Features:**
- Buat halaman `/kategori` baru: server component yang mengambil semua kategori dari Appwrite dengan jumlah buku real per kategori, grid berwarna, link ke `/katalog?kategori=...`.
- Perbaiki Navbar: link "Kategori" sekarang mengarah ke halaman `/kategori` yang sudah ada.
- Hapus data hardcoded dari chapter reader: "Dimulai dari hal. 42–69" diganti dengan tanggal update terakhir bab dari Appwrite `$updatedAt`.
- Fix `BookCard` & `CatalogClient`: hapus dependency `Models.Document` dari Appwrite SDK, ganti dengan `Record<string, unknown>`. Fix `getCoverUrl` agar aman di Client Component (gunakan `NEXT_PUBLIC_` env vars langsung).
- Fix chapter count di `BookCard`: badge "Bab Lengkap" dan "mnt baca" sekarang hanya tampil jika field `chapter_count` tersedia di data buku.
- Fix semua TypeScript errors (17 errors → 0): perbaiki cast `unknown` ke ReactNode dengan `String()`, `!!`, dan `as unknown as` pattern di semua komponen admin dan public.

**Key Files Changed:**
- `src/components/public/BookCard.tsx`: Hapus SDK import, fix getCoverUrl, fix TS errors.
- `src/components/public/CatalogClient.tsx`: Hapus SDK import.
- `src/app/(public)/kategori/page.tsx`: [NEW] Halaman kategori baru dengan data real.
- `src/app/(public)/buku/[slug]/bab/[chapterSlug]/page.tsx`: Hapus hardcoded page range, tambah tanggal update.
- `src/app/admin/page.tsx`: Fix TS errors pada rendering recentBooks.
- `src/app/admin/books/[id]/edit/page.tsx`: Fix breadcrumb label cast.
- `src/components/admin/BookForm.tsx`: Fix cast `as unknown as`.
- `src/components/admin/BookListTable.tsx`: Fix cast `as unknown as`.
- `src/components/admin/CategoryManager.tsx`: Fix cast `as unknown as`.
- `src/components/admin/ChapterManager.tsx`: Fix cast `as unknown as`.

---
## 2026-09-09: Phase 2 — BlockSuite Editor Integration & Hierarki Bab

**Completed Features:**
- Integrasi penuh BlockSuite editor dengan pipeline penyimpanan ke Appwrite.
- Implementasi strategi konten dual: JSON (source of truth) + HTML (build artifact).
- Estimasi waktu baca dari panjang konten nyata (bukan hardcoded).
- Skema database `sub_chapters` disiapkan untuk Tahap 3.

**Architecture Decisions:**
- `content_json` disimpan saat autosave (setiap kali editor berubah, debounce 1 detik).
- `content_html` di-generate oleh BlockSuite HtmlAdapter dan disimpan hanya saat admin klik "Terbitkan Bab".
- `renderer_version` dicatat untuk memungkinkan regenerasi HTML massal jika format berubah.
- Editor read-only ditangani via URL param `?readOnly=true` di iframe.

**Key Files Changed:**
- `blocksuite/src/main.ts`: Baca `docId` dari URL → IndexedDB per-bab. Export JSON+HTML via `postMessage` (debounce 1s).
- `src/components/editor/BlockSuiteEditor.tsx`: Handle payload `{ json, html }` baru, loading state saat editor belum siap.
- `src/components/editor/ChapterEditorClient.tsx`: Autosave JSON, simpan HTML saat publish.
- `src/actions/chapters.ts`: Tambah `saveChapterContent` (JSON only), `publishChapterContent` (HTML+JSON+status).
- `src/components/public/ChapterContentRenderer.tsx`: Render `content_html` dengan `dangerouslySetInnerHTML`.
- `src/app/(public)/buku/[slug]/bab/[chapterSlug]/page.tsx`: Pass `content_html` ke renderer, hitung waktu baca dinamis.
- `src/app/globals.css`: Tambah `.blocksuite-content` CSS class untuk styling HTML output BlockSuite.
- `scripts/migrate-chapters-schema.mjs`: Script migrasi untuk tambah `content_json`, `content_html`, `renderer_version` ke Appwrite.

**Database Changes (Appwrite):**
- Koleksi `chapters`: Tambah attribute `content_json` (string 5MB), `content_html` (string 5MB), `renderer_version` (string 20).
- Koleksi `sub_chapters`: Skema lengkap disiapkan (UI di Tahap 3).

---

## 2026-09-09: Phase 1 Completion (Backend & Admin CRUD) & Auth Fixes

**Completed Features:**
- Finished Phase 1: Integration of Backend and Admin CRUD operations.
- Successfully implemented complete Authentication flow for admins.
- Replaced direct browser Appwrite SDK calls with Server Actions and API proxy routes to resolve CORS and version compatibility issues.

**Key Files Changed:**
- **Auth System:**
  - `src/contexts/AuthContext.tsx`: Updated to use proxy API routes.
  - `src/app/api/auth/login/route.ts`: Created to handle login, bypass CORS, and extract session cookies.
  - `src/app/api/auth/me/route.ts`: Created to retrieve user session.
  - `src/app/api/auth/logout/route.ts`: Created to handle logout and clear cookies.
  - `src/proxy.ts` & `src/app/admin/layout.tsx`: Fixed infinite redirect loops and route pointing.
- **Admin CRUD (Server Actions):**
  - `src/actions/categories.ts`, `src/actions/books.ts`, `src/actions/chapters.ts`, `src/actions/storage.ts`: Created new Server Actions for all database operations.
- **Admin UI Components (Refactored to use Server Actions):**
  - `src/components/admin/CategoryManager.tsx`
  - `src/components/admin/BookForm.tsx`
  - `src/components/admin/BookListTable.tsx`
  - `src/components/admin/ChapterManager.tsx`
  - `src/components/editor/ChapterEditorClient.tsx`
- **Pages:**
  - `src/app/admin/books/page.tsx`: Implemented the full book listing page with stats.
