# Project Structure

## Root

```
simplify-app/          Next.js application (admin + public)
blocksuite/            Standalone BlockSuite editor (Vite dev / nginx prod)
dokumentasi/           Indonesian documentation PDFs
docs/                  English developer guides
scripts/               Database setup/migration scripts
```

---

## `simplify-app/src/`

### `app/` — Routes

| Path | Type | Description |
|---|---|---|
| `(public)/` | Route Group | Public pages (no admin sidebar) |
| `(public)/page.tsx` | Page | Homepage |
| `(public)/katalog/` | Page | Book catalog |
| `(public)/kategori/` | Page | Category listing |
| `(public)/buku/[slug]/` | Page | Book detail |
| `(public)/buku/[slug]/bab/[chapterSlug]/` | Page | Chapter reader |
| `(public)/masuk/` | Page | Public reader login |
| `(public)/daftar/` | Page | Public reader registration |
| `(public)/profil/` | Page | Reader profile (bookmarks) |
| `admin/` | Route Group | Admin CMS (requires `is_admin` cookie) |
| `admin/page.tsx` | Page | Dashboard with stats |
| `admin/books/` | Pages | Book CRUD |
| `admin/books/[id]/chapters/` | Page | Chapter management (DnD tree) |
| `admin/books/[id]/chapters/[chapterId]/editor/` | Page | BlockSuite chapter editor |
| `admin/categories/` | Page | Category manager |
| `admin/media/` | Page | Cover file manager |
| `admin/team/` | Page | Team management |
| `admin/feedbacks/` | Page | Feedback manager |
| `api/auth/` | API Routes | Admin auth proxy |
| `api/public-auth/` | API Routes | Public reader auth proxy |
| `api/editor/` | API Route | Autosave/publish endpoint |
| `api/search/` | API Route | Catalog search autocomplete |
| `api/track-view/` | API Route | View count increment |
| `api/progress/` | API Route | Reading progress |
| `api/feedbacks/` | API Routes | Feedback CRUD |
| `api/debug/` | API Route | Debug: chapter content |
| `login/page.tsx` | Page | Admin login |

### `actions/` — Server Actions

| File | Exports |
|---|---|
| `books.ts` | `createBook`, `updateBook`, `deleteBook` |
| `chapters.ts` | `createChapter`, `updateChapter`, `updateChapterOrder`, `renameChapter`, `deleteChapter`, `publishHierarchy`, `saveChapterContent` (JSON), `publishChapterContent` (HTML+JSON+status) |
| `categories.ts` | `createCategory`, `updateCategory`, `deleteCategory` |
| `bookmarks.ts` | `toggleBookmark`, `checkBookmark`, `getUserBookmarkBookIds`, `getBookmarkedBooks` |
| `feedbacks.ts` | `createFeedback`, `getFeedbacks`, `markFeedbackRead`, `deleteFeedbackAction` |
| `progress.ts` | `updateProgress`, `getProgress`, `getUserProgresses` |
| `search.ts` | `searchBooksSuggestion` (Server Action, homepage autocomplete) |
| `storage.ts` | `uploadCoverFile`, `deleteCoverFile` (multipart REST) |

### `components/`

| Path | Description |
|---|---|
| `admin/AdminSidebar.tsx` | Left navigation sidebar |
| `admin/BookForm.tsx` | Create/edit book form |
| `admin/BookListTable.tsx` | Sortable book listing |
| `admin/CategoryManager.tsx` | Category CRUD |
| `admin/ChapterManager.tsx` | DnD chapter tree (`@dnd-kit`) |
| `admin/FeedbackListClient.tsx` | Feedback management UI |
| `admin/StatsPanel.tsx` | Top 5 books + category chart (server component) |
| `editor/BlockSuiteEditor.tsx` | iframe wrapper component |
| `editor/ChapterEditorClient.tsx` | Autosave + publish orchestration |
| `public/BookCard.tsx` | Book card with cover, title, author, bookmark |
| `public/CatalogClient.tsx` | Filterable book grid |
| `public/ChapterContentRenderer.tsx` | `content_html` renderer (server KaTeX, iframe sandbox) |
| `public/ChapterSidebarNav.tsx` | Left sidebar chapter tree |
| `public/HomeSearchBar.tsx` | Homepage search with Server Action autocomplete |
| `public/SearchAutocomplete.tsx` | Catalog search with API route autocomplete |
| `public/ViewTracker.tsx` | Fire-and-forget view counter |
| `public/ProgressTracker.tsx` | Reading progress updater |
| `public/BookmarkButton.tsx` | Bookmark toggle |
| `public/Navbar.tsx` | Public navigation |
| `public/Footer.tsx` | Site footer |

### `contexts/`

| File | Description |
|---|---|
| `AuthContext.tsx` | Admin auth state |
| `PublicAuthContext.tsx` | Public reader auth state |
| `BookmarkContext.tsx` | Reader bookmarks |

### `lib/`

| File | Description |
|---|---|
| `appwrite-rest.ts` | Custom REST helper (Q query builder, CRUD helpers) |
| `appwrite-server.ts` | Server-side fetch with API key |

### `proxy.ts`

Next.js middleware: protects `/admin` routes, redirects unauthenticated/non-admin users to `/login`.

---

## `blocksuite/src/`

| File | Description |
|---|---|
| `main.ts` | Entry point. Patches `AffineEditorContainer.connectedCallback`, manages IndexedDB persistence, handles postMessage API, exports JSON+HTML. |
| `editor-registration.ts` | Side-effect import of `@blocksuite/presets` |
| `html-preview.ts` | Injects "Code / Preview" tabs into `affine-code` blocks |
| `latex-renderer.ts` | KaTeX rendering via `MutationObserver` |

---

## `scripts/`

| File | Description |
|---|---|
| `setup-appwrite.ts` | Creates Appwrite database, collections, indexes, storage bucket |
| `migrate-bookmarks-schema.mjs` | Adds bookmarks collection |
| `migrate-news-schema.mjs` | Adds news collection (unused — feature removed) |
| `migrate-chapters-schema.mjs` | Adds chapter content fields |
