import { listDocuments, Q, DB_ID, BOOKS_COL, CATEGORIES_COL } from '@/lib/appwrite-rest';
import Link from 'next/link';
import AdminTopbar from '@/components/admin/AdminTopbar';
import BookListTable from '@/components/admin/BookListTable';
import { Plus, BookOpen } from 'lucide-react';

export default async function BooksPage() {
  const [booksRes, catsRes] = await Promise.all([
    listDocuments(DB_ID, BOOKS_COL, {
      queries: [Q.orderDesc('$updatedAt'), Q.limit(100)],
    }),
    listDocuments(DB_ID, CATEGORIES_COL, {
      queries: [Q.orderAsc('name'), Q.limit(100)],
    }),
  ]);

  const totalPublished = booksRes.documents.filter(
    (b) => (b as Record<string, unknown>).status === 'published'
  ).length;
  const totalDraft = booksRes.documents.filter(
    (b) => (b as Record<string, unknown>).status === 'draft'
  ).length;

  return (
    <>
      <AdminTopbar breadcrumbs={[{ label: 'Kelola Buku' }]} />
      <div className="p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Kelola Buku</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Repositori buku simplifikasi hukum — {booksRes.total} total koleksi
            </p>
          </div>
          <Link href="/admin/books/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            Buku Baru
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{booksRes.total}</p>
              <p className="text-xs text-gray-500">Total Buku</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <span className="text-emerald-600 text-lg font-bold">{totalPublished}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{totalPublished}</p>
              <p className="text-xs text-gray-500">Terbit</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <span className="text-amber-600 text-lg font-bold">{totalDraft}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{totalDraft}</p>
              <p className="text-xs text-gray-500">Draft</p>
            </div>
          </div>
        </div>

        {/* Book Table */}
        <BookListTable
          books={booksRes.documents as Record<string, unknown>[]}
          categories={catsRes.documents as Record<string, unknown>[]}
        />
      </div>
    </>
  );
}
