// Root app page — homepage
import Link from 'next/link';
import { listDocuments, Q, DB_ID, BOOKS_COL, CATEGORIES_COL } from '@/lib/appwrite-rest';
import { Search, BookOpen, ChevronRight, Star } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import BookCard from '@/components/public/BookCard';
import HomeSearchBar from '@/components/public/HomeSearchBar';

async function getHomeData() {
  try {
    const [booksRes, allCategoriesRes, featuredRes, topViewedBooksRes] = await Promise.all([
      listDocuments(DB_ID, BOOKS_COL, { queries: [Q.equal('status', 'published'), Q.limit(1)] }),
      listDocuments(DB_ID, CATEGORIES_COL, { queries: [Q.limit(100)] }),
      listDocuments(DB_ID, BOOKS_COL, { queries: [Q.equal('status', 'published'), Q.orderDesc('$updatedAt'), Q.limit(6)] }),
      listDocuments(DB_ID, BOOKS_COL, { queries: [Q.equal('status', 'published'), Q.orderDesc('view_count'), Q.limit(50)] }),
    ]);

    // Aggregate view_counts by category_id
    const viewCountMap: Record<string, number> = {};
    const topBooks = topViewedBooksRes.documents as Record<string, unknown>[];
    for (const book of topBooks) {
      const catId = book.category_id as string | undefined;
      const views = typeof book.view_count === 'number' ? book.view_count : 0;
      if (catId) {
        viewCountMap[catId] = (viewCountMap[catId] || 0) + views;
      }
    }

    // Sort categories by aggregated view_count
    const categories = allCategoriesRes.documents as Record<string, unknown>[];
    const topCategories = categories
      .map(cat => ({
        id: cat.$id as string,
        name: String(cat.name || ''),
        views: viewCountMap[cat.$id as string] || 0
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map(cat => cat.name);

    return {
      totalBooks: booksRes.total,
      totalCategories: allCategoriesRes.total,
      featuredBooks: featuredRes.documents,
      topCategories: topCategories.length > 0 ? topCategories : ['Hukum Pidana', 'Hukum Perdata', 'Hukum Tata Negara'],
    };
  } catch {
    return { 
      totalBooks: 0, 
      totalCategories: 0, 
      featuredBooks: [], 
      topCategories: ['Hukum Pidana', 'Hukum Perdata', 'Hukum Tata Negara'] 
    };
  }
}

export default async function HomePage() {
  const { totalBooks, totalCategories, featuredBooks, topCategories } = await getHomeData();

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-primary-50/40 to-white pt-16 pb-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/50 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent-50/60 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl pointer-events-none" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white border border-primary-100 text-primary-700 text-xs px-4 py-1.5 rounded-full mb-6 shadow-sm font-medium">
              <Star className="w-3.5 h-3.5 text-primary-500" />
              Project by salammzein — Islamic Family Law Lecturer
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-gray-900 leading-tight mb-5">
              Simpel dibaca,{' '}
              <span className="text-accent-500">Simpel dicerna</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Membaca teks akademik menjadi lebih mengalir.
            </p>
            <div className="max-w-xl mx-auto mb-6">
              <HomeSearchBar />
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-white border-y border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: `${totalBooks}+`, label: 'Ringkasan Buku', color: 'text-primary-600' },
                { value: `${totalCategories}`, label: 'Kategori', color: 'text-gray-900' },
                { value: '100%', label: 'Bebas Akses Terbuka', color: 'text-accent-500' },
                { value: '≈15 mnt', label: 'Rata-rata Baca / Bab', color: 'text-teal-600' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className={`text-3xl md:text-4xl font-extrabold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mt-1 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Books */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-semibold text-accent-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Pustaka Rangkuman Digital
              </p>
              <h2 className="text-2xl font-bold text-gray-900">Koleksi Rangkuman</h2>
              <p className="text-sm text-gray-500 mt-1">Pilih buku untuk membaca rekonstruksi bab demi bab.</p>
            </div>
            <Link href="/katalog" className="btn-secondary text-sm hidden sm:inline-flex">
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {featuredBooks.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Belum ada buku yang diterbitkan.</p>
              <Link href="/admin" className="mt-4 inline-flex text-sm text-primary-600 hover:underline">
                Tambah buku pertama via Admin →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {featuredBooks.map((book) => (
                <BookCard key={book.$id as string} book={book as Record<string, unknown>} />
              ))}
            </div>
          )}
        </section>


      </main>
      <Footer />
    </>
  );
}
