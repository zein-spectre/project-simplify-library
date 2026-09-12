# System Architecture

## Overview

Simplify Library has three independently deployable components:

1. **Next.js App** (`simplify-app/`) — public website + admin CMS. Port 3000 (dev), 2002 (prod).
2. **Appwrite** — database and authentication hosted at `appwrite.geladisalam.my.id`.
3. **BlockSuite Editor** (`blocksuite/`) — standalone Vite dev server (port 5173), nginx in production (port 2003).

## How They Communicate

```
Browser
  ├── localhost:3000 (Next.js)
  │     ├── Appwrite REST API (direct, server-side only)
  │     └── <iframe src="http://localhost:5173?docId=...">  (BlockSuite iframe)
  │           └── IndexedDB (per-chapter persistence)
  └── appwrite.geladisalam.my.id (Appwrite)
```

### BlockSuite ↔ Next.js Communication

BlockSuite runs inside an `<iframe>`. All communication is via `window.postMessage`:

| Direction | Message | Payload |
|---|---|---|
| BlockSuite → Next.js | `EDITOR_READY` | `{ docId }` |
| BlockSuite → Next.js | `EDITOR_CONTENT_CHANGE` | `{ json, html }` (debounced 1s) |
| Next.js → BlockSuite | `LOAD_INITIAL_CONTENT` | `{ json }` (load saved content) |
| Next.js → BlockSuite | `LOAD_EMPTY_TEMPLATE` | — (initialize blank editor) |

### Why BlockSuite is Separate

BlockSuite uses Lit web components. Running it as a separate Vite server avoids:
- React/Lit component conflicts in Next.js
- Heavy BlockSuite bundle polluting the public-facing Next.js bundle
- React strict mode double-invocation issues (`reactStrictMode: false` is set)

## Data Flow

### Public Reading (ISR, ~1 hour cache)
```
Visitor → Next.js (SSG) → Appwrite REST → content_html rendered with server-side KaTeX
```

### Admin Writing
```
Admin → Next.js → BlockSuite iframe (editing)
       → debounced 1s postMessage → autosave (content_json)
       → "Terbitkan" button → publish (content_html + content_json + status)
```

## Authentication Architecture

### Dual-auth (admin vs public readers)

**Admin:** `POST /api/auth/login` → Appwrite session → sets `a_session_*` cookie + `is_admin=true` cookie.
**Public reader:** `POST /api/public-auth/login` → Appwrite session → sets only `a_session_*` cookie.

Admin routes (`/admin/:path*`) are protected by `src/proxy.ts` middleware which checks for both `a_session_*` AND `is_admin` cookies.

## Database

**Appwrite 1.5.x** — accessed via custom REST helper (`src/lib/appwrite-rest.ts`).

**Collections:**
- `categories` — book categories
- `books` — title, author, slug, cover, status, view_count
- `chapters` — book chapters with dual content (JSON + HTML), status
- `sub_chapters` — sub-chapter structure
- `bookmarks` — user ↔ book mappings
- `user_progress` — reading progress per user/book
- `feedbacks` — public submissions

**Storage:** `simplify-covers` bucket (5MB max, jpg/png/webp).

## Caching Strategy

Public pages use **ISR** (`export const revalidate = 3600`). Top-level routes use `generateStaticParams` for popular books. View tracking is fire-and-forget via `POST /api/track-view`.

## Docker

```
simplify-app   → ghcr.io/zein-spectre/project-simplify-library-web:latest   :2002
blocksuite     → zeinspectre/simplify-library-editor:latest                  :2003
```

Both built via GitHub Actions on push to `main`.
