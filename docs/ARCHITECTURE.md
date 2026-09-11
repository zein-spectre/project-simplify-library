# System Architecture (How It Works)

This document explains how the different parts of Simplify Library talk to each other.

## The Big Picture
Simplify Library consists of three main pieces:
1. **The Next.js App:** The website you see (both the public pages and the admin dashboard).
2. **Appwrite (The Database):** Where all the books, chapters, and user information are saved securely.
3. **BlockSuite (The Editor):** A specialized text editor used by admins to write book chapters.

## Data Flow (How information moves)
* **Viewing a Book (Public):**
  1. A visitor goes to the catalog or a book's page.
  2. The Next.js App asks Appwrite for the book's details and chapters.
  3. Appwrite sends the data back, and Next.js shows it to the visitor.
* **Writing a Chapter (Admin):**
  1. An admin logs in and opens the chapter editor.
  2. The Next.js App loads the **BlockSuite Editor** inside a special window (iframe).
  3. As the admin types, the BlockSuite Editor sends invisible "messages" back to the Next.js App.
  4. The Next.js App takes those messages and saves the new text to Appwrite.

## Why BlockSuite is Separate
BlockSuite is a very complex editor. Running it separately makes the main Next.js app faster and prevents the two systems from causing errors with each other. They communicate securely using a method called `postMessage`.
