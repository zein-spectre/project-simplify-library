import { listDocuments, getDocument, Q, DB_ID, BOOKS_COL, CATEGORIES_COL } from '@/lib/appwrite-rest';
import { notFound } from 'next/navigation';
import AdminTopbar from '@/components/admin/AdminTopbar';
import BookForm from '@/components/admin/BookForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBookPage({ params }: PageProps) {
  const { id } = await params;

  const [book, cats] = await Promise.all([
    getDocument(DB_ID, BOOKS_COL, id).catch(() => null),
    listDocuments(DB_ID, CATEGORIES_COL, { queries: [Q.orderAsc('name'), Q.limit(50)] }),
  ]);

  if (!book) notFound();
  const typedBook = book as Record<string, unknown>;

  return (
    <>
      <AdminTopbar breadcrumbs={[
        { label: 'Kelola Buku', href: '/admin/books' },
        { label: String(book.simplified_title ?? '') },
        { label: 'Edit' },
      ]} />
      <div className="p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Edit Buku</h1>
          <p className="text-sm text-gray-500 mt-0.5">Perbarui metadata buku — perubahan slug dapat mempengaruhi URL yang sudah beredar.</p>
        </div>
        <BookForm categories={cats.documents as Record<string, unknown>[]} book={typedBook} />
      </div>
    </>
  );
}
