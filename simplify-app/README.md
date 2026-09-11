# Simplify Library — Next.js App

Platform baca digital hukum terbuka yang mengubah buku-buku hukum menjadi ringkasan terstruktur.

## Stack Teknologi
- **Framework**: Next.js 16 (App Router, TypeScript)
- **Database & Auth**: Appwrite (self-hosted)
- **Editor**: BlockSuite v0.15.0-canary (Web Components)
- **Styling**: Tailwind CSS v4
- **Drag & Drop**: @dnd-kit

## Struktur Project

```
src/
├── app/
│   ├── (public)/          # Halaman publik (tidak butuh login)
│   │   ├── page.tsx        # Landing page
│   │   ├── katalog/        # Katalog buku
│   │   ├── buku/[slug]/    # Detail buku
│   │   │   └── bab/[chapterSlug]/  # Halaman baca bab
│   │   └── tentang-kami/   # Tentang kami
│   └── admin/             # CMS Admin (butuh login)
│       ├── page.tsx        # Dashboard
│       ├── books/          # Kelola buku
│       ├── categories/     # Kelola kategori
│       ├── media/          # Aset media
│       └── team/           # Tim & reviewer
├── components/
│   ├── admin/             # Komponen admin
│   ├── public/            # Komponen publik
│   └── editor/            # BlockSuite editor wrapper
├── contexts/
│   └── AuthContext.tsx    # Auth state management
└── lib/
    ├── appwrite.ts        # Client-side Appwrite
    ├── appwrite-server.ts # Server-side Appwrite (API key)
    └── utils.ts           # Utility functions
```

## Setup & Development

### 1. Konfigurasi Environment
File `.env.local` sudah dikonfigurasi dengan credentials Appwrite.

### 2. Setup Database Appwrite (jalankan sekali)
```bash
npm run setup:appwrite
```

### 3. Jalankan Dev Server
```bash
npm run dev
```
Buka http://localhost:3000

### 4. Akses Admin
Buka http://localhost:3000/admin/login

## Catatan Penting

### BlockSuite Editor
- Editor WAJIB diload dengan dynamic import + ssr: false
- BlockSuite menggunakan Web Components yang tidak kompatibel dengan SSR
- reactStrictMode: false diset di next.config.ts untuk mencegah double-init editor

### Folder blocksuite/
Jangan dimodifikasi! Folder ini adalah implementasi standalone BlockSuite yang sudah dikustomisasi.
Integrasi ke Next.js dilakukan via wrapper di src/components/editor/BlockSuiteEditor.tsx.
