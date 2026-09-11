'use server';

import { listDocuments, createDocument, updateDocument, Q, DB_ID, USER_PROGRESS_COL } from '@/lib/appwrite-rest';

// Simple fallback for unique ID generation
const uniqueId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

/**
 * Memperbarui progress baca seorang pengguna pada buku tertentu.
 */
export async function updateProgress(userId: string, bookId: string, lastChapterSlug: string, progressPercent: number) {
  try {
    if (!USER_PROGRESS_COL) return;

    // Cek apakah progress sudah ada
    const existing = await listDocuments(DB_ID, USER_PROGRESS_COL, {
      queries: [
        Q.equal('user_id', userId),
        Q.equal('book_id', bookId),
        Q.limit(1)
      ]
    });

    if (existing.documents.length > 0) {
      // Update jika progres baru lebih besar atau kita ingin update slug terakhir
      const doc = existing.documents[0] as Record<string, any>;
      // Opsional: Hanya update jika progress lebih besar (mencegah mundur jika buka bab awal lagi)
      // Tapi untuk simplicity, kita update last_chapter_slug dan max progress_percent
      const newProgress = Math.max(doc.progress_percent, progressPercent);
      
      await updateDocument(DB_ID, USER_PROGRESS_COL, doc.$id, {
        last_chapter_slug: lastChapterSlug,
        progress_percent: newProgress
      });
    } else {
      // Create baru
      await createDocument(DB_ID, USER_PROGRESS_COL, uniqueId(), {
        user_id: userId,
        book_id: bookId,
        last_chapter_slug: lastChapterSlug,
        progress_percent: progressPercent
      });
    }
  } catch (error) {
    console.error('Failed to update progress:', error);
  }
}

/**
 * Mengambil progress pengguna untuk sebuah buku.
 */
export async function getProgress(userId: string, bookId: string) {
  try {
    if (!USER_PROGRESS_COL) return null;
    const existing = await listDocuments(DB_ID, USER_PROGRESS_COL, {
      queries: [
        Q.equal('user_id', userId),
        Q.equal('book_id', bookId),
        Q.limit(1)
      ]
    });
    if (existing.documents.length > 0) {
      return existing.documents[0];
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Mengambil semua progress milik seorang pengguna.
 */
export async function getUserProgresses(userId: string) {
  try {
    if (!USER_PROGRESS_COL) return [];
    const res = await listDocuments(DB_ID, USER_PROGRESS_COL, {
      queries: [
        Q.equal('user_id', userId),
        Q.limit(100)
      ]
    });
    return res.documents;
  } catch (error) {
    return [];
  }
}
