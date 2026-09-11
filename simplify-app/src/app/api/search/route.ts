import { NextRequest, NextResponse } from 'next/server';
import { listDocuments, DB_ID, BOOKS_COL, Q } from '@/lib/appwrite-rest';

/**
 * GET /api/search?q=...
 *
 * Mengembalikan saran buku berdasarkan query pencarian.
 * Menggunakan Q.search pada field simplified_title dan original_title.
 * Maks 6 hasil untuk autocomplete dropdown.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Cari di simplified_title
    const [bySimplified, byAuthor] = await Promise.allSettled([
      listDocuments(DB_ID, BOOKS_COL, {
        queries: [
          Q.equal('status', 'published'),
          Q.search('simplified_title', q),
          Q.limit(5),
        ],
      }),
      listDocuments(DB_ID, BOOKS_COL, {
        queries: [
          Q.equal('status', 'published'),
          Q.search('original_author', q),
          Q.limit(3),
        ],
      }),
    ]);

    const results: Record<string, unknown>[] = [];
    const seen = new Set<string>();

    const addUnique = (doc: Record<string, unknown>) => {
      const id = String(doc.$id ?? '');
      if (!seen.has(id)) {
        seen.add(id);
        results.push(doc);
      }
    };

    if (bySimplified.status === 'fulfilled') {
      bySimplified.value.documents.forEach(addUnique);
    }
    if (byAuthor.status === 'fulfilled') {
      byAuthor.value.documents.forEach(addUnique);
    }

    // Ambil maks 6, kembalikan hanya field yang dibutuhkan
    const slim = results.slice(0, 6).map((doc) => ({
      $id: doc.$id,
      simplified_title: doc.simplified_title,
      original_author: doc.original_author,
      slug: doc.slug,
      cover_image_id: doc.cover_image_id ?? null,
    }));

    return NextResponse.json({ results: slim });
  } catch (err) {
    console.error('[/api/search] Error:', err);
    return NextResponse.json({ results: [] });
  }
}
