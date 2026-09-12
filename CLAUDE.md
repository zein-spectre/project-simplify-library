# Simplify Library — Project Overview

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Database | Appwrite 1.5.x (direct REST API — no SDK) |
| Text Editor | BlockSuite 0.15 (runs as separate Vite server, embedded via iframe) |
| Persistence | IndexedDB via `y-indexeddb` (BlockSuite) |
| Math Rendering | KaTeX (server-side in Next.js, client-side in BlockSuite) |
| Auth | Appwrite Sessions + dual-cookie (`is_admin` flag) |
| Deployment | Docker (Next.js on port 3000, BlockSuite/nginx on port 80) |

## How to Run

### Prerequisites
- Node.js 20+
- Docker (for full stack)

### Development (two terminals required)

**Terminal 1 — Next.js app:**
```bash
cd simplify-app && npm install && npm run dev
# → http://localhost:3000
```

**Terminal 2 — BlockSuite editor:**
```bash
cd blocksuite && npm install && npm run dev
# → http://localhost:5173
```

### Production Build
```bash
cd simplify-app && npm run build
# Output: .next/standalone/
```

### Docker Stack
```bash
docker compose up --build
```

### Environment Variables

Copy `.env.local` from project root into `simplify-app/.env.local`:
```
NEXT_PUBLIC_BLOCKSUITE_URL=http://localhost:5173
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://appwrite.geladisalam.my.id
NEXT_PUBLIC_APPWRITE_PROJECT_ID=simplify-library-3
APPWRITE_API_KEY=<key>

NEXT_PUBLIC_APPWRITE_DATABASE_ID=simplify-db
NEXT_PUBLIC_APPWRITE_BOOKS_COLLECTION_ID=books
NEXT_PUBLIC_APPWRITE_CHAPTERS_COLLECTION_ID=chapters
NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID=categories
NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID=simplify-covers
NEXT_PUBLIC_APPWRITE_BOOKMARKS_COLLECTION_ID=bookmarks
NEXT_PUBLIC_APPWRITE_USER_PROGRESS_COLLECTION_ID=user_progress
NEXT_PUBLIC_APPWRITE_FEEDBACKS_COLLECTION_ID=feedbacks
```

## Project Structure

```
simplify-app/         Next.js app (admin + public pages)
  src/app/
    (public)/         Public pages (homepage, katalog, buku, dll.)
    admin/            Admin CMS dashboard
    api/              API routes (auth proxy, search, track-view, etc.)
  src/actions/        Server Actions (books, chapters, categories, bookmarks)
  src/components/     React components (admin/, editor/, public/)
  src/contexts/      AuthContext, PublicAuthContext, BookmarkContext
  src/lib/           appwrite-rest.ts, utilities
blocksuite/           Standalone BlockSuite Vite server (nginx in prod)
  src/main.ts         Editor entry point, IndexedDB persistence, postMessage API
  src/editor-registration.ts  Forces Lit web components via Vite pre-bundle
dokumentasi/          Indonesian original documentation PDFs
docs/                 English developer documentation
```

## Important Rules

### Appwrite — Use REST helper only
ALWAYS use `simplify-app/src/lib/appwrite-rest.ts` for all database operations.
DO NOT use `node-appwrite` or `appwrite` SDK — they have compatibility issues with Appwrite Server 1.5.x.

### Appwrite Queries
Use the `Q` helper from `appwrite-rest.ts`:
```ts
Q.eq('status', 'published')  // NOT the SDK query builder
```

### BlockSuite
BlockSuite runs as a completely separate server. Communication between Next.js and BlockSuite is via `window.postMessage`. Do not share code between the two.

### Admin Login
Login page is at `/login`. The admin layout at `/admin` checks for `is_admin` cookie. Never put the login page inside the admin folder to avoid infinite redirect loops.

### BlockSuite prototype patches
Any change to `AffineEditorContainer.prototype.connectedCallback` in `blocksuite/src/main.ts` requires a full Vite cache clear:
```bash
rm -rf blocksuite/node_modules/.vite blocksuite/.vite
```

### reactStrictMode
`reactStrictMode: false` in `next.config.ts`. BlockSuite uses Web Components — React strict mode causes double-invocation issues.
