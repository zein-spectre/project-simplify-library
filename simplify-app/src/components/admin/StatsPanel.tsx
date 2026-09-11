/**
 * StatsPanel — Panel statistik ringan untuk dashboard admin (v1.2).
 *
 * Menampilkan:
 * - Top 5 Buku Terpopuler (berdasarkan view_count)
 * - Distribusi buku per kategori (CSS bar chart tanpa library eksternal)
 * - Aktivitas terbaru (buku paling baru di-update)
 */

import { listDocuments, Q, DB_ID, BOOKS_COL, CATEGORIES_COL } from '@/lib/appwrite-rest';
import { TrendingUp, BarChart2, Eye, BookOpen, Tag, Clock2 } from 'lucide-react';
import Link from 'next/link';

// Palet warna untuk bar distribusi kategori
const CATEGORY_COLORS = [
  { bar: 'bg-primary-500', text: 'text-primary-700', bg: 'bg-primary-50' },
  { bar: 'bg-teal-500', text: 'text-teal-700', bg: 'bg-teal-50' },
  { bar: 'bg-accent-500', text: 'text-accent-700', bg: 'bg-accent-50' },
  { bar: 'bg-purple-500', text: 'text-purple-700', bg: 'bg-purple-50' },
  { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  { bar: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50' },
];

async function getStatsData() {
  const [topBooksRes, allBooksRes, categoriesRes] = await Promise.all([
    // Top 5 buku berdasarkan view_count
    listDocuments(DB_ID, BOOKS_COL, {
      queries: [
        Q.equal('status', 'published'),
        Q.orderDesc('view_count'),
        Q.limit(5),
      ],
    }),
    // Semua buku published untuk distribusi kategori
    listDocuments(DB_ID, BOOKS_COL, {
      queries: [Q.equal('status', 'published'), Q.limit(100)],
    }),
    // Semua kategori
    listDocuments(DB_ID, CATEGORIES_COL, {
      queries: [Q.orderAsc('name'), Q.limit(50)],
    }),
  ]);

  const topBooks = topBooksRes.documents as Record<string, unknown>[];
  const allBooks = allBooksRes.documents as Record<string, unknown>[];
  const categories = categoriesRes.documents as Record<string, unknown>[];

  // Hitung jumlah buku per kategori
  const categoryMap: Record<string, { name: string; count: number }> = {};
  for (const cat of categories) {
    const catId = String(cat.$id ?? '');
    const catName = String(cat.name ?? '');
    categoryMap[catId] = { name: catName, count: 0 };
  }
  for (const book of allBooks) {
    const catId = String(book.category_id ?? '');
    if (categoryMap[catId]) {
      categoryMap[catId].count++;
    }
  }

  const categoryStats = Object.values(categoryMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const maxCategoryCount = Math.max(...categoryStats.map((c) => c.count), 1);

  return { topBooks, categoryStats, maxCategoryCount, totalBooks: allBooksRes.total };
}

export default async function StatsPanel() {
  const { topBooks, categoryStats, maxCategoryCount, totalBooks } = await getStatsData();

  // Cek apakah ada data view_count (field mungkin belum ada kalau migrasi belum jalan)
  const hasViewData = topBooks.some(
    (b) => typeof b.view_count === 'number' && (b.view_count as number) > 0
  );

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* ── Top Buku Terpopuler ── */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary-600" />
          <h3 className="font-semibold text-gray-900 text-sm">Top Buku Terpopuler</h3>
          <span className="ml-auto text-[10px] bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-medium">
            Berdasarkan Pembacaan
          </span>
        </div>

        {!hasViewData ? (
          <div className="py-10 text-center px-5">
            <Eye className="w-8 h-8 mx-auto mb-2 text-gray-200" />
            <p className="text-xs text-gray-400 mb-1">Data tampilan belum tersedia.</p>
            <p className="text-[11px] text-gray-400">
              Data akan muncul setelah pembaca mulai membuka bab-bab buku.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {topBooks.map((book, idx) => {
              const title = String(book.simplified_title ?? '—');
              const author = String(book.original_author ?? '');
              const views = typeof book.view_count === 'number' ? book.view_count : 0;
              const bookId = String(book.$id ?? '');
              const medals = ['🥇', '🥈', '🥉'];

              return (
                <div key={bookId} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <span className="text-base w-6 text-center flex-shrink-0">
                    {medals[idx] || `${idx + 1}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
                    {author && (
                      <p className="text-xs text-gray-400 truncate">{author}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-primary-600 font-semibold bg-primary-50 px-2 py-1 rounded-lg flex-shrink-0">
                    <Eye className="w-3 h-3" />
                    {views.toLocaleString('id-ID')}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="px-5 py-3 border-t border-gray-50">
          <Link href="/admin/books" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
            Lihat semua buku →
          </Link>
        </div>
      </div>

      {/* ── Distribusi per Kategori ── */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-teal-600" />
          <h3 className="font-semibold text-gray-900 text-sm">Distribusi per Kategori</h3>
          <span className="ml-auto text-[10px] text-gray-400">
            {totalBooks} buku terbit
          </span>
        </div>

        {categoryStats.length === 0 ? (
          <div className="py-10 text-center px-5">
            <Tag className="w-8 h-8 mx-auto mb-2 text-gray-200" />
            <p className="text-xs text-gray-400">Belum ada kategori dengan buku.</p>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-3">
            {categoryStats.map((cat, idx) => {
              const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
              const pct = totalBooks > 0
                ? Math.round((cat.count / maxCategoryCount) * 100)
                : 0;
              const pctOfTotal = totalBooks > 0
                ? Math.round((cat.count / totalBooks) * 100)
                : 0;

              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${color.text}`}>
                      {cat.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {cat.count} buku · {pctOfTotal}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`${color.bar} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="px-5 py-3 border-t border-gray-50">
          <Link href="/admin/categories" className="text-xs text-teal-600 hover:text-teal-700 font-medium">
            Kelola kategori →
          </Link>
        </div>
      </div>
    </div>
  );
}
