import { listDocuments, getDocument, Q, DB_ID, BOOKS_COL, CHAPTERS_COL } from '@/lib/appwrite-rest';
import { notFound } from 'next/navigation';
import AdminTopbar from '@/components/admin/AdminTopbar';
import ChapterManager from '@/components/admin/ChapterManager';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookChaptersPage({ params }: PageProps) {
  const { id } = await params;

  const [book, chaptersRes] = await Promise.all([
    getDocument(DB_ID, BOOKS_COL, id).catch(() => null),
    listDocuments(DB_ID, CHAPTERS_COL, {
      queries: [Q.equal('book_id', id), Q.orderAsc('order_index'), Q.limit(100)],
    }),
  ]);

  if (!book) notFound();
  const typedBook = book as Record<string, unknown>;

  return (
    <>
      <AdminTopbar breadcrumbs={[
        { label: 'Kelola Buku', href: '/admin/books' },
        { label: typedBook.simplified_title as string },
        { label: 'Kelola Bab & Hierarki' },
      ]} />
      <div className="p-6 max-w-6xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Kelola Bab &amp; Hierarki</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {typedBook.simplified_title as string} · {chaptersRes.total} bab
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge ${typedBook.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {typedBook.status === 'published' ? 'Terbit' : 'Draft'}
            </span>
          </div>
        </div>

        <ChapterManager book={typedBook} initialChapters={chaptersRes.documents as Record<string, unknown>[]} />
      </div>
    </>
  );
}
