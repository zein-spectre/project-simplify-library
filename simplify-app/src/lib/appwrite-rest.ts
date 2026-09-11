/**
 * appwrite-rest.ts
 *
 * Helper REST API langsung untuk Appwrite Server 1.5.x
 * Digunakan di Server Components karena node-appwrite SDK
 * tidak kompatibel dengan endpoint Appwrite yang di-deploy.
 *
 * Untuk client-side, gunakan appwrite.ts (browser SDK appwrite v14)
 */

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const API_KEY = process.env.APPWRITE_API_KEY!;
export const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const BOOKS_COL = process.env.NEXT_PUBLIC_APPWRITE_BOOKS_COLLECTION_ID!;
export const CHAPTERS_COL = process.env.NEXT_PUBLIC_APPWRITE_CHAPTERS_COLLECTION_ID!;
export const SUBCHAPTERS_COL = process.env.NEXT_PUBLIC_APPWRITE_SUBCHAPTERS_COLLECTION_ID!;
export const CATEGORIES_COL = process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID!;
export const STORAGE_BUCKET = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!;
export const BOOKMARKS_COL = process.env.NEXT_PUBLIC_APPWRITE_BOOKMARKS_COLLECTION_ID!;
export const USER_PROGRESS_COL = process.env.NEXT_PUBLIC_APPWRITE_USER_PROGRESS_COLLECTION_ID || 'user_progress';
export const FEEDBACKS_COL = process.env.NEXT_PUBLIC_APPWRITE_FEEDBACKS_COLLECTION_ID || 'feedbacks';

// ── Query builder (Appwrite 1.5.x JSON format) ────────────────────────────

export const Q = {
  equal: (attr: string, value: unknown) =>
    JSON.stringify({ method: 'equal', attribute: attr, values: Array.isArray(value) ? value : [value] }),
  notEqual: (attr: string, value: unknown) =>
    JSON.stringify({ method: 'notEqual', attribute: attr, values: [value] }),
  orderAsc: (attr: string) =>
    JSON.stringify({ method: 'orderAsc', attribute: attr }),
  orderDesc: (attr: string) =>
    JSON.stringify({ method: 'orderDesc', attribute: attr }),
  limit: (n: number) =>
    JSON.stringify({ method: 'limit', values: [n] }),
  offset: (n: number) =>
    JSON.stringify({ method: 'offset', values: [n] }),
  search: (attr: string, value: string) =>
    JSON.stringify({ method: 'search', attribute: attr, values: [value] }),
  isNull: (attr: string) =>
    JSON.stringify({ method: 'isNull', attribute: attr }),
  isNotNull: (attr: string) =>
    JSON.stringify({ method: 'isNotNull', attribute: attr }),
};

// ── HTTP helpers ───────────────────────────────────────────────────────────

type AnyRecord = Record<string, unknown>;

async function appwriteFetch(
  method: string,
  path: string,
  body?: AnyRecord,
  queryParams?: Record<string, string | string[]>
): Promise<AnyRecord> {
  if (!ENDPOINT) {
    console.warn(`[Build Warning] Missing NEXT_PUBLIC_APPWRITE_ENDPOINT. Skipping fetch for ${path}`);
    return { total: 0, documents: [] } as AnyRecord;
  }

  const url = new URL(`/v1${path}`, ENDPOINT);

  if (queryParams) {
    for (const [key, val] of Object.entries(queryParams)) {
      if (Array.isArray(val)) {
        val.forEach((v) => url.searchParams.append(key + '[]', v));
      } else {
        url.searchParams.set(key, val);
      }
    }
  }

  const headers: Record<string, string> = {
    'X-Appwrite-Project': PROJECT,
    'X-Appwrite-Key': API_KEY,
    'Content-Type': 'application/json',
  };

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  let data: AnyRecord = {};
  if (res.status !== 204) {
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        // Not JSON
      }
    }
  }

  if (!res.ok) {
    const err = data as { message?: string; code?: number };
    throw new Error(err.message || `Appwrite error ${res.status}`);
  }
  return data;
}

// ── Database API ───────────────────────────────────────────────────────────

export interface ListOptions {
  queries?: string[];
}

export interface AppwriteList<T> {
  total: number;
  documents: T[];
}

export async function listDocuments<T = AnyRecord>(
  databaseId: string,
  collectionId: string,
  options: ListOptions = {}
): Promise<AppwriteList<T>> {
  const params: Record<string, string | string[]> = {};
  if (options.queries?.length) {
    params['queries'] = options.queries;
  }
  const res = await appwriteFetch('GET', `/databases/${databaseId}/collections/${collectionId}/documents`, undefined, params);
  return res as unknown as AppwriteList<T>;
}

export async function getDocument<T = AnyRecord>(
  databaseId: string,
  collectionId: string,
  documentId: string
): Promise<T> {
  const res = await appwriteFetch('GET', `/databases/${databaseId}/collections/${collectionId}/documents/${documentId}`);
  return res as unknown as T;
}

export async function createDocument<T = AnyRecord>(
  databaseId: string,
  collectionId: string,
  documentId: string,
  data: AnyRecord
): Promise<T> {
  const res = await appwriteFetch('POST', `/databases/${databaseId}/collections/${collectionId}/documents`, {
    documentId,
    data,
  });
  return res as unknown as T;
}

export async function updateDocument<T = AnyRecord>(
  databaseId: string,
  collectionId: string,
  documentId: string,
  data: AnyRecord
): Promise<T> {
  const res = await appwriteFetch('PATCH', `/databases/${databaseId}/collections/${collectionId}/documents/${documentId}`, {
    data,
  });
  return res as unknown as T;
}

export async function deleteDocument(
  databaseId: string,
  collectionId: string,
  documentId: string
): Promise<void> {
  await appwriteFetch('DELETE', `/databases/${databaseId}/collections/${collectionId}/documents/${documentId}`);
}

// ── Storage API ────────────────────────────────────────────────────────────

export function getCoverUrl(fileId: string, width = 600): string {
  return `${ENDPOINT}/v1/storage/buckets/${STORAGE_BUCKET}/files/${fileId}/preview?project=${PROJECT}&width=${width}&output=webp`;
}
