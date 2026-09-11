# Project Rules & Style Guide

This document lists the rules for adding new code or files to ensure everything stays neat and organized.

## File Naming Rules
* **Web Pages:** Always use lowercase (e.g., `page.tsx`, `layout.tsx`). If the folder has brackets like `[id]`, it means it changes dynamically (like a specific book's ID).
* **Components (Building Blocks):** Always start with a capital letter (e.g., `BookCard.tsx`, `AdminTopbar.tsx`).
* **Helper Files:** Always use lowercase with dashes if needed (e.g., `appwrite-rest.ts`).

## Coding Style
* **Database Connections:** Only use the `appwrite-rest.ts` file to talk to the database. Never try to connect directly using other methods.
* **Styling (Colors & Layout):** We use Tailwind CSS. This means styling is written directly inside the HTML using specific keywords (like `text-blue-500` or `flex`). Do not create separate `.css` files unless absolutely necessary.
* **Simplicity:** Keep the code simple and readable. If a component becomes too long, split it into smaller, named components.

## Adding Features
* If adding a new page for visitors, put it inside `src/app/(public)/`.
* If adding a new page for admins, put it inside `src/app/admin/`.
