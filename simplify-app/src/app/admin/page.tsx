import { listDocuments, Q, DB_ID, BOOKS_COL, CHAPTERS_COL, CATEGORIES_COL, FEEDBACKS_COL, USER_PROGRESS_COL } from '@/lib/appwrite-rest';
import { BookOpen, Layers, Users, MessageSquare, Plus, ExternalLink, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import StatsPanel from '@/components/admin/StatsPanel';

async function getDashboardStats() {
  const [books, chapters, categories, draftBooks, publishedBooks, feedbacks, userProgress] = await Promise.all([
    listDocuments(DB_ID, BOOKS_COL, { queries: [Q.limit(1)] }),
    listDocuments(DB_ID, CHAPTERS_COL, { queries: [Q.limit(1)] }),
    listDocuments(DB_ID, CATEGORIES_COL, { queries: [Q.limit(1)] }),
    listDocuments(DB_ID, BOOKS_COL, { queries: [Q.equal('status', 'draft'), Q.limit(1)] }),
    listDocuments(DB_ID, BOOKS_COL, { queries: [Q.equal('status', 'published'), Q.limit(1)] }),
    listDocuments(DB_ID, FEEDBACKS_COL, { queries: [Q.limit(1)] }),
    listDocuments(DB_ID, USER_PROGRESS_COL, { queries: [Q.limit(1)] }),
  ]);
  return {
    totalBooks: books.total,
    totalChapters: chapters.total,
    totalCategories: categories.total,
    draftBooks: draftBooks.total,
    publishedBooks: publishedBooks.total,
    totalFeedbacks: feedbacks.total,
    totalProgress: userProgress.total,
  };
}

async function getRecentBooks() {
  const res = await listDocuments(DB_ID, BOOKS_COL, { queries: [Q.orderDesc('$updatedAt'), Q.limit(5)] });
  return res.documents as Record<string, unknown>[];
}

export default async function AdminDashboard() {
  const [stats, recentBooks] = await Promise.all([
    getDashboardStats(),
    getRecentBooks(),
  ]);

  const statCards = [
    {
      label: 'Total Koleksi',
      value: stats.totalBooks,
      unit: 'Buku',
      sub: `● ${stats.publishedBooks} Terbit  ● ${stats.draftBooks} Draft`,
      icon: BookOpen,
      color: 'text-primary-600 bg-primary-50',
    },
    {
      label: 'Bab Tersarikan',
      value: stats.totalChapters,
      unit: 'Bab',
      sub: 'Validasi Kurator Hukum',
      icon: Layers,
      color: 'text-teal-600 bg-teal-50',
    },
    {
      label: 'Jejak Pembaca',
      value: stats.totalProgress,
      unit: 'Data',
      sub: 'Total aktivitas membaca buku',
      icon: Users,
      color: 'text-accent-600 bg-accent-50',
    },
    {
      label: 'Kritik & Saran',
      value: stats.totalFeedbacks,
      unit: 'Pesan',
      sub: 'Masukan dari pengunjung web',
      icon: MessageSquare,
      color: 'text-emerald-600 bg-emerald-50',
    },
  ];

  return (
    <div className="p-6 max-w-7xl">
      {/* Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary-700 via-primary-600 to-purple-700 p-8 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs px-3 py-1 rounded-full mb-3 font-medium">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              PUSAT KURASI RELAWAN AKTIF
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Selamat bertugas, Editor! 👋
            </h1>
            <p className="text-primary-200 text-sm max-w-lg">
              Platform Kurasi &amp; Simplifikasi Literatur Hukum Terbuka. Seluruh materi doktrin dan anotasi pasal diverifikasi secara berjenjang sebelum disebarluaskan.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 flex-shrink-0">
            <Link href="/admin/books/new" className="btn-primary bg-accent-500 hover:bg-accent-600 whitespace-nowrap">
              <Plus className="w-4 h-4" />
              + Tambah Buku Baru
            </Link>
            <Link href="/" target="_blank" className="btn-secondary whitespace-nowrap">
              <ExternalLink className="w-4 h-4" />
              Lihat Katalog Publik
            </Link>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">{s.label}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-gray-900">{s.value}</span>
                  {s.unit && <span className="text-sm text-gray-500">{s.unit}</span>}
                </div>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-gray-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent Books */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Koleksi Terbaru</h2>
          <Link href="/admin/books" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Lihat Semua →
          </Link>
        </div>

        {recentBooks.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Belum ada buku. Mulai dengan menambahkan buku pertama!</p>
            <Link href="/admin/books/new" className="btn-primary mt-4 inline-flex">
              + Tambah Buku Baru
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentBooks.map((book) => {
              const bookId = book.$id as string;
              const bookTitle = String(book.simplified_title ?? '');
              const bookAuthor = String(book.original_author ?? '');
              const bookStatus = String(book.status ?? '');
              const bookUpdatedAt = String(book.$updatedAt ?? '');
              return (
                <div key={bookId} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  {/* Cover placeholder */}
                  <div className="w-10 h-12 bg-gradient-to-br from-primary-100 to-purple-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{bookTitle}</p>
                    <p className="text-xs text-gray-400 truncate">{bookAuthor}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${bookStatus === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {bookStatus === 'published' ? 'Terbit' : 'Draft'}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {bookUpdatedAt ? new Date(bookUpdatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '—'}
                    </div>
                  </div>
                  <Link href={`/admin/books/${bookId}/chapters`} className="btn-ghost text-xs px-3 py-1.5">
                    Kelola →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SOP Panel */}
      <div className="mt-6 card p-5">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-4 h-4 text-primary-600" />
          <h3 className="font-semibold text-gray-900 text-sm">Alur Kurasi Terbuka</h3>
          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-medium">SOP V2.1</span>
        </div>
        <p className="text-xs text-gray-500 mb-4">Setiap ringkasan wajib melalui 3 tahap telaah sebelum tombol publikasi dapat diaktifkan oleh Ketua Editor.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { num: '1', title: 'Validasi Doktrin Asli', desc: 'Memastikan keselarasan kutipan dengan buku babon asli.' },
            { num: '2', title: 'Tautan Rujukan Peraturan', desc: 'Menghubungkan pasal dan undang-undang terbaru yang relevan.' },
            { num: '3', title: 'Cek Doktrin Fair Use', desc: 'Format penyederhanaan non-komersial untuk edukasi publik.' },
          ].map((step) => (
            <div key={step.num} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
              <div className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                {step.num}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800 mb-0.5">{step.title}</p>
                <p className="text-[11px] text-gray-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Stats Panel (v1.2) */}
      <StatsPanel />
    </div>
  );
}
