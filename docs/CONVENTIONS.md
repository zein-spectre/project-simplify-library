# Coding Conventions

## File Naming

| Type | Convention | Example |
|---|---|---|
| Web Pages | lowercase `page.tsx`, `layout.tsx` | `page.tsx`, `layout.tsx` |
| Dynamic Routes | brackets `[id]`, `[slug]` | `buku/[slug]/page.tsx` |
| Components | PascalCase | `BookCard.tsx`, `ChapterManager.tsx` |
| Helpers/Utils | lowercase, dash-separated | `appwrite-rest.ts`, `proxy.ts` |
| Route Groups | parentheses `(public)` | `(public)/page.tsx` |

## Styling

- **Tailwind CSS only** — no separate `.css` files unless absolutely necessary.
- Inline styles go directly in JSX (e.g., `className="flex gap-4"`).
- Global styles: `src/app/globals.css`.

## Database Access

- **Always** use `src/lib/appwrite-rest.ts` — never the official `node-appwrite` or `appwrite` SDK.
- Query format uses the `Q` helper (Appwrite 1.5.x JSON format):
  ```ts
  Q.eq('status', 'published')
  Q.search('title', query)
  ```
- Never expose `APPWRITE_API_KEY` to the client. All DB operations go through Server Actions or API routes.

## Where to Put Things

| Feature | Location |
|---|---|
| Public page | `src/app/(public)/` |
| Admin page | `src/app/admin/` |
| Admin login | `src/app/login/page.tsx` (not inside admin folder) |
| Server-side DB operation | `src/actions/` (Server Action) |
| Auth proxy | `src/app/api/auth/` |
| Shared UI component | `src/components/` |
| Admin-only component | `src/components/admin/` |
| Public-only component | `src/components/public/` |
| Editor wrapper | `src/components/editor/` |

## React Patterns

- **Server Components** for data fetching (pages, `StatsPanel`, etc.).
- **Client Components** (`"use client"`) only when needed: forms, interactivity, contexts.
- Auth contexts are Client Components wrapping their respective layouts.
- Never use `Models.Document` from Appwrite SDK — use `Record<string, unknown>` and cast to custom interfaces.

## BlockSuite Rules

- BlockSuite runs as a separate service. Never import BlockSuite code into Next.js.
- Communication is strictly `window.postMessage`.
- Editor is instantiated **inside** `mountEditor()` (not at module level).
- `_connectedRan` flag on `this` (not closure) — required for prototype patch to work.
- After changing prototype patches: `rm -rf blocksuite/node_modules/.vite blocksuite/.vite`.

## Component Patterns

- Extract types into `src/types/` for shared interfaces.
- Keep components small and single-purpose. Split long components.
- Use `String(value ?? '')` or `!!value` when casting `unknown` to `ReactNode`.

## API Routes

- Auth-related: `src/app/api/auth/` (admin) and `src/app/api/public-auth/` (readers).
- Keep API routes thin — delegate to Server Actions where possible.
- No SDK key exposure in client-side code.
