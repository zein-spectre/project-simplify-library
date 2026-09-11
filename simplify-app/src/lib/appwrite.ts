import { Client, Databases, Storage, Account, OAuthProvider } from 'appwrite';
export { OAuthProvider };

let endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
if (endpoint && !endpoint.endsWith('/v1')) {
  endpoint += '/v1';
}

const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;

// Client-side Appwrite client
// Compatible dengan Appwrite Server 1.5.x (appwrite SDK v13)
export const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Collection & Database IDs
export const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const BOOKS_COL = process.env.NEXT_PUBLIC_APPWRITE_BOOKS_COLLECTION_ID!;
export const CHAPTERS_COL = process.env.NEXT_PUBLIC_APPWRITE_CHAPTERS_COLLECTION_ID!;
export const SUBCHAPTERS_COL = process.env.NEXT_PUBLIC_APPWRITE_SUBCHAPTERS_COLLECTION_ID!;
export const CATEGORIES_COL = process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID!;
export const STORAGE_BUCKET = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!;
export const USER_PROGRESS_COL = process.env.NEXT_PUBLIC_APPWRITE_USER_PROGRESS_COLLECTION_ID || 'user_progress';
export const FEEDBACKS_COL = process.env.NEXT_PUBLIC_APPWRITE_FEEDBACKS_COLLECTION_ID || 'feedbacks';
