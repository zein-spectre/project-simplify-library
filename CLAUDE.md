# Simplify Library MVP - Quick Overview

## Tech Stack
* **Frontend/Backend:** Next.js (App Router) with React
* **Styling:** Tailwind CSS
* **Database/Backend-as-a-Service:** Appwrite (using direct REST API calls, version 1.5.x)
* **Text Editor:** BlockSuite (runs via iframe)

## How to Run the Project
1. **Start the Next.js App:**
   - Open a terminal and navigate to `simplify-app` folder.
   - Run `npm install` (first time only).
   - Run `npm run dev`.
   - The app will run on `http://localhost:3000`.
2. **Start the BlockSuite Editor Server:**
   - Open another terminal and navigate to the `blocksuite` folder.
   - Run `npm install` (first time only).
   - Run `npm run dev`.
   - The editor server will run on `http://localhost:5173`.

## Important Rules to Follow
* **Appwrite Connection:** ALWAYS use the custom REST API helper in `simplify-app/src/lib/appwrite-rest.ts`. DO NOT use the official `node-appwrite` SDK because it has compatibility issues with the Appwrite Server version 1.5.x we are using.
* **Appwrite Queries:** When making database queries, use the exact JSON format required by Appwrite 1.5.x (e.g., `{"method": "equal", "attribute": "status", "values": ["published"]}`). This is handled by the `Q` helper in `appwrite-rest.ts`.
* **Login & Admin:** The login page is at `/login` (separate from the `/admin` layout). Do not put the login page inside the admin folder to avoid infinite redirect loops with the authentication checker.
