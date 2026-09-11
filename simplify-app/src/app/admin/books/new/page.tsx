import { listDocuments, Q, DB_ID, CATEGORIES_COL } from '@/lib/appwrite-rest';
import AdminTopbar from '@/components/admin/AdminTopbar';
import BookForm from '@/components/admin/BookForm';

export default async function NewBookPage() {
  const cats = await listDocuments(DB_ID, CATEGORIES_COL, { queries: [Q.orderAsc('name'), Q.limit(50)] });

  return (
    <>
      <AdminTopbar breadcrumbs={[
        { label: 'Kelola Buku', href: '/admin/books' },
        { label: 'Buku Baru' },
      ]} />
      <div className="p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Tambah Buku Baru</h1>
          <p className="text-sm text-gray-500 mt-0.5">Isi metadata buku, lalu lanjutkan ke editor bab.</p>
        </div>
        <BookForm categories={cats.documents} />
      </div>
    </>
  );
}
