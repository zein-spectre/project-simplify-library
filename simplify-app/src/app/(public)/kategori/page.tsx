import { listDocuments, Q, DB_ID, CATEGORIES_COL, BOOKS_COL } from '@/lib/appwrite-rest';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, ChevronRight, Tag } from 'lucide-react';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Kategori Buku Hukum',
  description:
    'Jelajahi koleksi ringkasan buku hukum Indonesia berdasarkan kategori. Dari Hukum Pidana, Perdata, Tata Negara hingga Hukum Internasional.',
};

async function getData() {
  const [catsRes, booksRes] = await Promise.all([
    listDocuments(DB_ID, CATEGORIES_COL, {
      queries: [Q.orderAsc('name'), Q.limit(50)],
    }),
    listDocuments(DB_ID, BOOKS_COL, {
      queries: [Q.equal('status', 'published'), Q.limit(100)],
    }),
  ]);

  const categories = catsRes.documents as Record<string, unknown>[];
  const books = booksRes.documents as Record<string, unknown>[];

  // Hitung jumlah buku per kategori
  const countMap: Record<string, number> = {};
  for (const book of books) {
    const catId = book.category_id as string | undefined;
    if (catId) {
      countMap[catId] = (countMap[catId] || 0) + 1;
    }
  }

  return { categories, countMap, totalBooks: booksRes.total };
}

// Warna badge per indeks (siklus)
const BADGE_COLORS = [
  { bg: 'bg-primary-50', border: 'border-primary-200', text: 'text-primary-700', icon: 'text-primary-500', badge: 'bg-primary-600' },
  { bg: 'bg-accent-50', border: 'border-accent-200', text: 'text-accent-700', icon: 'text-accent-500', badge: 'bg-accent-500' },
  { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', icon: 'text-teal-500', badge: 'bg-teal-600' },
  { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-500', badge: 'bg-purple-600' },
  { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', icon: 'text-rose-500', badge: 'bg-rose-500' },
  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-500', badge: 'bg-amber-500' },
];

export default async function KategoriPage() {
  const { categories, countMap, totalBooks } = await getData();

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-50 via-primary-50/30 to-white pt-12 pb-10 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
            <Link href="/" className="hover:text-primary-600">
              Beranda
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-600">Kategori</span>
          </nav>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Kategori Buku Hukum
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {categories.length} kategori · {totalBooks} buku tersedia gratis
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
            Pilih bidang hukum yang ingin kamu pelajari. Setiap kategori berisi ringkasan
            terstruktur dari literatur akademis terpilih.
          </p>
        </div>
      </section>

      {/* Category Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {categories.length === 0 ? (
          <div className="py-24 text-center text-gray-400">
            <Tag className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm">Belum ada kategori yang dibuat.</p>
            <p className="text-xs mt-1 text-gray-300">
              Admin dapat menambahkan kategori melalui dashboard.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat, i) => {
              const color = BADGE_COLORS[i % BADGE_COLORS.length];
              const bookCount = countMap[cat.$id as string] || 0;
              const catId = cat.$id as string;
              const catName = String(cat.name ?? '');
              const catDesc = cat.description ? String(cat.description) : null;

              return (
                <Link
                  key={catId}
                  href={`/katalog?kategori=${encodeURIComponent(catName)}`}
                  className={`group card-hover p-6 border ${color.border} ${color.bg} flex flex-col gap-4 transition-all hover:shadow-md`}
                >
                  {/* Icon & Badge */}
                  <div className="flex items-start justify-between">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-white shadow-sm`}>
                      <BookOpen className={`w-5 h-5 ${color.icon}`} />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${color.badge} text-white`}>
                      {bookCount} Buku
                    </span>
                  </div>

                  {/* Name */}
                  <div>
                    <h2 className={`font-bold text-base ${color.text} group-hover:underline underline-offset-2`}>
                      {catName}
                    </h2>
                    {catDesc && (
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
                        {catDesc}
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  <div className={`flex items-center gap-1 text-xs font-semibold mt-auto ${color.text}`}>
                    Lihat Koleksi
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="bg-gray-50 border-t border-gray-100 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Tidak menemukan kategori yang dicari?
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Coba cari langsung dari katalog lengkap kami menggunakan kata kunci judul atau penulis.
          </p>
          <Link href="/katalog" className="btn-primary">
            <BookOpen className="w-4 h-4" />
            Jelajahi Katalog Lengkap
          </Link>
        </div>
      </section>
    </>
  );
}
