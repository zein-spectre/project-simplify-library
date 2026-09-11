'use server';

import {
  createDocument,
  deleteDocument,
  listDocuments,
  DB_ID,
  BOOKMARKS_COL,
  BOOKS_COL,
  Q,
} from '@/lib/appwrite-rest';
import { revalidatePath } from 'next/cache';

function newId() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 20);
}

/**
 * Toggle bookmark untuk user tertentu pada buku tertentu.
 * Jika belum ada, buat bookmark. Jika sudah ada, hapus.
 */
export async function toggleBookmark(userId: string, bookId: string) {
  try {
    if (!userId || !bookId) return { error: 'Missing parameters' };

    // Cek apakah sudah ada bookmark
    const res = await listDocuments(DB_ID, BOOKMARKS_COL, {
      queries: [
        Q.equal('user_id', userId),
        Q.equal('book_id', bookId),
        Q.limit(1),
      ],
    });

    const existing = res.documents[0] as Record<string, unknown> | undefined;

    if (existing) {
      // Hapus bookmark
      await deleteDocument(DB_ID, BOOKMARKS_COL, String(existing.$id));
      revalidatePath('/profil');
      revalidatePath(`/buku`);
      return { bookmarked: false };
    } else {
      // Tambah bookmark
      await createDocument(DB_ID, BOOKMARKS_COL, newId(), {
        user_id: userId,
        book_id: bookId,
      });
      revalidatePath('/profil');
      revalidatePath(`/buku`);
      return { bookmarked: true };
    }
  } catch (err: any) {
    return { error: err.message || 'Unknown error in action' };
  }
}

/**
 * Cek apakah sebuah buku di-bookmark oleh user tertentu
 */
export async function checkBookmark(userId: string, bookId: string) {
  if (!userId || !bookId) return false;
  
  const res = await listDocuments(DB_ID, BOOKMARKS_COL, {
    queries: [
      Q.equal('user_id', userId),
      Q.equal('book_id', bookId),
      Q.limit(1),
    ],
  });
  
  return res.documents.length > 0;
}

export async function getUserBookmarkBookIds(userId: string) {
  if (!userId) return [];
  
  try {
    const res = await listDocuments(DB_ID, BOOKMARKS_COL, {
      queries: [
        Q.equal('user_id', userId),
        Q.limit(100), // Max 100 bookmark untuk MVP
      ],
    });
    
    return res.documents.map(doc => String((doc as Record<string, unknown>).book_id));
  } catch (err: any) {
    console.error('Error in getUserBookmarkBookIds:', err.message);
    return [];
  }
}

/**
 * Dapatkan data buku yang di-bookmark oleh user
 */
export async function getBookmarkedBooks(userId: string) {
  try {
    const bookIds = await getUserBookmarkBookIds(userId);
    if (bookIds.length === 0) return [];

    const res = await listDocuments(DB_ID, BOOKS_COL, {
      queries: [
        Q.equal('$id', bookIds),
        Q.equal('status', 'published'),
        Q.limit(100)
      ]
    });

    return res.documents;
  } catch (err: any) {
    console.error('Error in getBookmarkedBooks:', err.message);
    return [];
  }
}
