import { listDocuments, Q, DB_ID, CATEGORIES_COL } from '@/lib/appwrite-rest';
import AdminTopbar from '@/components/admin/AdminTopbar';
import CategoryManager from '@/components/admin/CategoryManager';

export default async function CategoriesPage() {
  const res = await listDocuments(DB_ID, CATEGORIES_COL, { queries: [Q.orderAsc('name'), Q.limit(100)] });

  return (
    <>
      <AdminTopbar breadcrumbs={[{ label: 'Kategori Buku' }]} />
      <div className="p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Kategori Buku</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola pengelompokan buku berdasarkan topik atau bidang ilmunya</p>
        </div>
        <CategoryManager initialCategories={res.documents} />
      </div>
    </>
  );
}
