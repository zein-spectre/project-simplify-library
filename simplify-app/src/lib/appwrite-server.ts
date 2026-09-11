import { Client, Databases, Storage, Users } from 'node-appwrite';

// Server-side Appwrite client (API Key — hanya di Server Components / API Routes)
// Compatible dengan Appwrite Server 1.5.x (node-appwrite SDK v12)
export function createAdminClient() {
  let endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
  if (endpoint && !endpoint.endsWith('/v1')) {
    endpoint += '/v1';
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

  return {
    databases: new Databases(client),
    storage: new Storage(client),
    users: new Users(client),
  };
}

export const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const BOOKS_COL = process.env.NEXT_PUBLIC_APPWRITE_BOOKS_COLLECTION_ID!;
export const CHAPTERS_COL = process.env.NEXT_PUBLIC_APPWRITE_CHAPTERS_COLLECTION_ID!;
export const SUBCHAPTERS_COL = process.env.NEXT_PUBLIC_APPWRITE_SUBCHAPTERS_COLLECTION_ID!;
export const CATEGORIES_COL = process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID!;
export const STORAGE_BUCKET = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!;
