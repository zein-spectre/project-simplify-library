'use server';

import { listDocuments, Q, DB_ID, BOOKS_COL } from '@/lib/appwrite-rest';

export interface BookSuggestion {
  id: string;
  title: string;
  author: string;
  slug: string;
}

export async function searchBooksSuggestion(query: string): Promise<BookSuggestion[]> {
  if (!query || query.trim().length === 0) return [];
  
  try {
    const res = await listDocuments(DB_ID, BOOKS_COL, {
      queries: [
        Q.equal('status', 'published'),
        Q.orderDesc('$updatedAt'),
        Q.limit(50), // Ambil cukup banyak untuk di-filter secara manual (karena keterbatasan index pencarian default Appwrite)
      ],
    });

    const lowerQuery = query.toLowerCase().trim();
    const books = res.documents as Record<string, unknown>[];

    // Filter manual di server
    const matched = books.filter((b) => {
      const origTitle = String(b.original_title || '').toLowerCase();
      const simpTitle = String(b.simplified_title || '').toLowerCase();
      const author = String(b.original_author || '').toLowerCase();
      
      return origTitle.includes(lowerQuery) || simpTitle.includes(lowerQuery) || author.includes(lowerQuery);
    });

    // Batasi hasilnya menjadi 5
    const suggestions = matched.slice(0, 5).map((b) => ({
      id: String(b.$id),
      title: String(b.simplified_title || b.original_title || 'Tanpa Judul'),
      author: String(b.original_author || 'Tanpa Penulis'),
      slug: String(b.slug || ''),
    }));

    return suggestions;
  } catch (err: any) {
    console.error('Error in searchBooksSuggestion:', err.message);
    return [];
  }
}
