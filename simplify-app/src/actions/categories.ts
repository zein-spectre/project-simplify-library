'use server';

import {
  createDocument,
  updateDocument,
  deleteDocument,
  DB_ID,
  CATEGORIES_COL,
} from '@/lib/appwrite-rest';
import { generateSlug } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

function newId() {
  // Generate unique ID tanpa SDK (gunakan crypto)
  return crypto.randomUUID().replace(/-/g, '').slice(0, 20);
}

export async function createCategory(name: string, description?: string) {
  const doc = await createDocument(DB_ID, CATEGORIES_COL, newId(), {
    name: name.trim(),
    slug: generateSlug(name.trim()),
    description: description?.trim() || null,
  });
  revalidatePath('/admin/categories');
  return doc;
}

export async function updateCategory(id: string, name: string, description?: string) {
  const doc = await updateDocument(DB_ID, CATEGORIES_COL, id, {
    name: name.trim(),
    slug: generateSlug(name.trim()),
    description: description?.trim() || null,
  });
  revalidatePath('/admin/categories');
  return doc;
}

export async function deleteCategory(id: string) {
  await deleteDocument(DB_ID, CATEGORIES_COL, id);
  revalidatePath('/admin/categories');
}
