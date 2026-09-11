import { listDocuments, Q, DB_ID, BOOKS_COL, CATEGORIES_COL } from '@/lib/appwrite-rest';
import type { Metadata } from 'next';
import CatalogClient from '@/components/public/CatalogClient';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Katalog Buku',
  description: 'Jelajahi koleksi lengkap ringkasan buku hukum Indonesia. Filter berdasarkan kategori, cari berdasarkan judul atau penulis.',
};

interface PageProps {
  searchParams: Promise<{ q?: string; kategori?: string; view?: string }>;
}

async function getData(q?: string, kategori?: string) {
  const queries = [Q.equal('status', 'published'), Q.orderDesc('$updatedAt'), Q.limit(50)];

  let categoryFilter: string | undefined;
  if (kategori) {
    const catRes = await listDocuments(DB_ID, CATEGORIES_COL, { queries: [Q.equal('name', kategori), Q.limit(1)] });
    if (catRes.documents.length > 0) {
      categoryFilter = (catRes.documents[0] as Record<string, unknown>).$id as string;
      queries.push(Q.equal('category_id', categoryFilter));
    }
  }

  const [booksRes, catsRes] = await Promise.all([
    listDocuments(DB_ID, BOOKS_COL, { queries }),
    listDocuments(DB_ID, CATEGORIES_COL, { queries: [Q.orderAsc('name'), Q.limit(50)] }),
  ]);

  let books = booksRes.documents as Record<string, unknown>[];
  if (q) {
    const lowerQ = q.toLowerCase();
    books = books.filter((b) => {
      const origTitle = String(b.original_title || '').toLowerCase();
      const simpTitle = String(b.simplified_title || '').toLowerCase();
      const author = String(b.original_author || '').toLowerCase();
      return origTitle.includes(lowerQ) || simpTitle.includes(lowerQ) || author.includes(lowerQ);
    });
  }

  return { books, total: books.length, categories: catsRes.documents };
}

export default async function KatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { books, total, categories } = await getData(params.q, params.kategori);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <CatalogClient
        books={books as Record<string, unknown>[]}
        categories={categories as Record<string, unknown>[]}
        total={total}
        initialQuery={params.q || ''}
        initialKategori={params.kategori || ''}
        initialView={(params.view as 'grid' | 'list') || 'grid'}
      />
    </div>
  );
}
