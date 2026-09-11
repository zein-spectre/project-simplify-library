# Project Structure Map

This document explains what each folder does in simple terms.

## Root Folders
* `simplify-app/`: This is the main application folder containing the website and the admin panel (Next.js).
* `blocksuite/`: This folder contains the rich text editor system that runs separately.
* `dokumentasi/`: Contains old or original documentation files.
* `docs/`: (This folder) Contains the new, simplified guides for understanding the project.

## Inside `simplify-app/` (The Main App)
* `src/app/`: The core of the website. Every folder here becomes a web page link (e.g., the `katalog` folder becomes `website.com/katalog`).
  * `(public)/`: Pages that anyone can see.
    * `page.tsx`: The Homepage.
    * `katalog/`: The book search and filtering page.
    * `kategori/`: The category listing page.
    * `buku/[slug]/`: The book detail and chapter reader pages.
  * `admin/`: The dashboard area only accessible to logged-in admins. Includes sections for `books`, `chapters`, `categories`, and `media`.
  * `login/`: The page where admins log in.
  * `api/`: Backend API routes used as proxies. Includes authentication (`/api/auth/*`), search autocomplete (`/api/search`), view tracking (`/api/track-view`), and reading progress (`/api/progress`).
* `src/components/`: Reusable building blocks for the website (like buttons, navigation bars, or book cards).
  * `public/HomeSearchBar.tsx`: Interactive search bar with real-time autocomplete dropdown, used on the Homepage.
* `src/actions/`: Server Actions. These are secure, backend-only functions (like saving a book or deleting a chapter) that the frontend calls directly without exposing database secrets. Also includes `search.ts` for book title suggestions.
* `src/lib/`: Essential helper tools. Most importantly, it contains `appwrite-rest.ts` which connects the website to our database.
* `src/proxy.ts`: A gatekeeper that checks if someone is logged in before letting them enter the `/admin` area.
* `scripts/`: Tools used by developers to set up the database initially (like creating tables).
