'use server';

import {
  createDocument,
  updateDocument,
  deleteDocument,
  DB_ID,
  CHAPTERS_COL,
} from '@/lib/appwrite-rest';
import { generateSlug } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

// Versi renderer saat ini — naikkan ini jika ada perubahan format HTML
const CURRENT_RENDERER_VERSION = '1.0';

function newId() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 20);
}

export interface ChapterPayload {
  [key: string]: unknown;
  book_id: string;
  title: string;
  order_index: number;
  status: string;
  slug: string;
  /** JSON snapshot dari BlockSuite (source of truth, disimpan saat autosave) */
  content_json?: string;
  /** HTML yang di-generate dari content_json saat publish (build artifact untuk pembaca) */
  content_html?: string;
  /** Versi renderer yang digunakan saat generate HTML */
  renderer_version?: string;
}

export async function createChapter(payload: ChapterPayload) {
  const doc = await createDocument(DB_ID, CHAPTERS_COL, newId(), payload);
  revalidatePath(`/admin/books/${payload.book_id}/chapters`);
  return doc;
}

export async function updateChapter(id: string, bookId: string, data: Partial<ChapterPayload>) {
  const doc = await updateDocument(DB_ID, CHAPTERS_COL, id, data);
  revalidatePath(`/admin/books/${bookId}/chapters`);
  return doc;
}

export async function updateChapterOrder(chapters: { id: string; order_index: number }[]) {
  await Promise.all(
    chapters.map((c) => updateDocument(DB_ID, CHAPTERS_COL, c.id, { order_index: c.order_index }))
  );
}

export async function renameChapter(id: string, bookId: string, title: string) {
  const doc = await updateDocument(DB_ID, CHAPTERS_COL, id, {
    title,
    slug: generateSlug(title),
  });
  revalidatePath(`/admin/books/${bookId}/chapters`);
  return doc;
}

export async function deleteChapter(id: string, bookId: string) {
  await deleteDocument(DB_ID, CHAPTERS_COL, id);
  revalidatePath(`/admin/books/${bookId}/chapters`);
}

export interface HierarchyItem {
  id: string;
  parent_id: string | null;
  order_index: number;
  title: string;
  is_new?: boolean;
}

export async function publishHierarchy(bookId: string, hierarchy: HierarchyItem[], deletedIds: string[]) {
  // 1. Hapus yang dihapus
  for (const id of deletedIds) {
    await deleteDocument(DB_ID, CHAPTERS_COL, id).catch(() => {});
  }

  // 2. Tambah/Update berdasarkan hierarchy
  for (const item of hierarchy) {
    const slug = generateSlug(item.title);
    
    if (item.is_new) {
      await createDocument(DB_ID, CHAPTERS_COL, item.id, {
        book_id: bookId,
        title: item.title,
        order_index: item.order_index,
        parent_id: item.parent_id,
        status: 'draft',
        slug,
      });
    } else {
      await updateDocument(DB_ID, CHAPTERS_COL, item.id, {
        title: item.title,
        order_index: item.order_index,
        parent_id: item.parent_id,
        slug,
      });
    }
  }

  revalidatePath(`/admin/books/${bookId}/chapters`);
  revalidatePath(`/buku`);
}

/**
 * Autosave: Simpan JSON snapshot dari BlockSuite ke Appwrite.
 * JSON adalah source of truth — dipanggil setiap kali editor berubah (sudah di-debounce sisi client).
 */
export async function saveChapterContent(id: string, bookId: string, contentJson: string) {
  const doc = await updateDocument(DB_ID, CHAPTERS_COL, id, {
    content_json: contentJson,
  });
  revalidatePath(`/admin/books/${bookId}/chapters`);
  return doc;
}

/**
 * Publish: Simpan HTML (build artifact) + update status ke published.
 * Dipanggil saat admin klik tombol Publish/Terbitkan.
 * HTML di-generate dari BlockSuite sisi client dan dikirim bersama aksi ini.
 */
export async function publishChapterContent(
  id: string,
  bookId: string,
  contentHtml: string,
  contentJson: string
) {
  const doc = await updateDocument(DB_ID, CHAPTERS_COL, id, {
    content_html: contentHtml,
    content_json: contentJson,
    renderer_version: CURRENT_RENDERER_VERSION,
    status: 'published',
  });
  revalidatePath(`/buku`);
  revalidatePath(`/admin/books/${bookId}/chapters`);
  return doc;
}


