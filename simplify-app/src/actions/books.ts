'use server';

import {
  createDocument,
  updateDocument,
  deleteDocument,
  DB_ID,
  BOOKS_COL,
} from '@/lib/appwrite-rest';
import { revalidatePath } from 'next/cache';

function newId() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 20);
}

export interface BookPayload {
  [key: string]: unknown;
  original_title: string;
  simplified_title: string;
  original_author: string;
  description: string;
  category_id: string;
  status: string;
  slug: string;
  cover_image_id?: string;
}

export async function createBook(payload: BookPayload) {
  const doc = await createDocument(DB_ID, BOOKS_COL, newId(), payload);
  revalidatePath('/admin/books');
  revalidatePath('/katalog');
  return doc;
}

export async function updateBook(id: string, payload: Partial<BookPayload>) {
  const doc = await updateDocument(DB_ID, BOOKS_COL, id, payload);
  revalidatePath('/admin/books');
  revalidatePath(`/admin/books/${id}/edit`);
  revalidatePath('/katalog');
  return doc;
}

export async function deleteBook(id: string) {
  await deleteDocument(DB_ID, BOOKS_COL, id);
  revalidatePath('/admin/books');
  revalidatePath('/katalog');
}
