import { listDocuments, Q, DB_ID, BOOKS_COL, CHAPTERS_COL, getCoverUrl } from '@/lib/appwrite-rest';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronLeft, ChevronRight, Clock, Calendar, BookOpen } from 'lucide-react';
import ChapterContentRenderer, { estimateReadingTime } from '@/components/public/ChapterContentRenderer';
import ChapterSidebarNav from '@/components/public/ChapterSidebarNav';
import ViewTracker from '@/components/public/ViewTracker';
import ProgressTracker from '@/components/public/ProgressTracker';

interface PageProps {
  params: Promise<{ slug: string; chapterSlug: string }>;
}

interface AppwriteBook {
  $id: string;
  simplified_title: string;
  original_author: string;
  slug: string;
  description?: string;
  category_id?: string;
  cover_image_id?: string;
}

interface AppwriteChapter {
  $id: string;
  title: string;
  slug: string;
  order_index: number;
  status: string;
  content?: string;
  content_json?: string;
  content_html?: string;
  renderer_version?: string;
}

async function getData(bookSlug: string, chapterSlug: string) {
  const bookRes = await listDocuments(DB_ID, BOOKS_COL, {
    queries: [Q.equal('slug', bookSlug), Q.equal('status', 'published'), Q.limit(1)],
  });
  const book = bookRes.documents[0] as Record<string, unknown>;
  if (!book) return null;

  const chaptersRes = await listDocuments(DB_ID, CHAPTERS_COL, {
    queries: [Q.equal('book_id', book.$id as string), Q.equal('status', 'published'), Q.orderAsc('order_index'), Q.limit(100)],
  });
  const chapters = chaptersRes.documents as Record<string, unknown>[];

  const chapterIndex = chapters.findIndex((c) => c.slug === chapterSlug);
  if (chapterIndex === -1) return null;

  const chapter = chapters[chapterIndex];
  const prevChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : null;
  const nextChapter = chapterIndex < chapters.length - 1 ? chapters[chapterIndex + 1] : null;

  return { book, chapters, chapter, prevChapter, nextChapter, chapterIndex };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, chapterSlug } = await params;
  const data = await getData(slug, chapterSlug);
  if (!data) return { title: 'Bab tidak ditemukan' };
  return {
    title: `${data.chapter.title} — ${data.book.simplified_title}`,
    description: `Baca bab "${data.chapter.title}" dari ringkasan ${data.book.simplified_title}`,
  };
}

export default async function ChapterReadPage({ params }: PageProps) {
  const { slug, chapterSlug } = await params;
  const data = await getData(slug, chapterSlug);
  if (!data) notFound();

  const { book: rawBook, chapters: rawChapters, chapter: rawChapter, prevChapter: rawPrev, nextChapter: rawNext, chapterIndex } = data;

  // Cast ke typed interfaces
  const book = rawBook as unknown as AppwriteBook;
  const chapters = rawChapters as unknown as AppwriteChapter[];
  const chapter = rawChapter as unknown as AppwriteChapter;
  const prevChapter = rawPrev as unknown as AppwriteChapter | null;
  const nextChapter = rawNext as unknown as AppwriteChapter | null;

  const progressPercent = Math.round(((chapterIndex + 1) / chapters.length) * 100);
  const contentHtml = chapter.content_html || '';
  const readingMinutes = contentHtml ? estimateReadingTime(contentHtml) : 5;

  // Format tanggal update terakhir bab
  const updatedAt = (chapter as unknown as { $updatedAt?: string }).$updatedAt;
  const lastUpdated = updatedAt
    ? new Date(updatedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  const coverUrl = book.cover_image_id ? getCoverUrl(book.cover_image_id as string) : null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Fire-and-forget view tracker (invisible) */}
      <ViewTracker bookId={book.$id} />
      <ProgressTracker bookId={book.$id} chapterSlug={chapter.slug} progressPercent={progressPercent} />
      {/* Left Sidebar: Chapter Navigation */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-gray-100 bg-gray-50/60 flex-shrink-0">
        <div className="p-5 border-b border-gray-100 flex flex-col items-center text-center">
          <Link href={`/buku/${book.slug}`} className="self-start flex items-center gap-2 text-xs text-gray-500 hover:text-primary-600 mb-5">
            <ChevronLeft className="w-3.5 h-3.5" />
            Detail Buku
          </Link>
          
          <div className="w-40 aspect-[3/4] flex-shrink-0 bg-gradient-to-br from-primary-100 to-purple-100 rounded-lg shadow-md overflow-hidden flex items-center justify-center mb-4 transition-transform hover:scale-105 duration-300">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt={book.simplified_title as string} className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="w-10 h-10 text-primary-300" />
            )}
          </div>
          
          <div className="w-full">
            <p className="font-bold text-sm text-gray-800 leading-snug mb-1" title={book.simplified_title as string}>{book.simplified_title}</p>
            <p className="text-xs text-gray-500">{book.original_author}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1.5">
            <span>Progres Baca</span>
            <span className="font-semibold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-primary-500 h-1.5 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            {chapterIndex + 1} dari {chapters.length} bab dibaca
          </p>
        </div>

        {/* Chapter List */}
        <ChapterSidebarNav
          chapters={chapters as any}
          bookSlug={book.slug as string}
          currentChapterId={chapter.$id as string}
        />
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 overflow-x-hidden">
        <div className="w-full px-6 sm:px-12 py-8 pr-12 lg:pr-24">
          {/* Chapter Header */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="badge bg-primary-100 text-primary-700 text-xs">
                BAB {chapterIndex + 1} · SUB-BAB {chapterIndex + 1}.{chapterIndex + 1 < 10 ? '1' : ''}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-4">
              {chapter.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Estimasi {readingMinutes} menit baca
              </span>
              {lastUpdated && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Diperbarui {lastUpdated}
                </span>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mb-8 p-4 bg-accent-50 border border-accent-100 rounded-xl flex gap-3 text-sm text-accent-800 leading-relaxed shadow-sm">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <span className="font-bold">Catatan:</span> Tulisan ini adalah Panduan Pendamping Belajar (Unofficial Study Guide) hasil penyelarasan bahasa dan elaborasi konsep. Tulisan ini BUKAN pengganti buku asli. Pembaca tetap diwajibkan merujuk pada teks asli untuk konteks akademik yang utuh dan gambar detailnya.
            </div>
          </div>

          {/* Chapter Content */}
          <ChapterContentRenderer
            contentHtml={contentHtml}
            content={chapter.content as string | undefined}
          />

          {/* Prev / Next Navigation */}
          <div className="mt-12 pt-8 border-t border-gray-100 grid grid-cols-2 gap-4">
            {prevChapter ? (
              <Link
                href={`/buku/${book.slug}/bab/${prevChapter.slug}`}
                className="flex items-start gap-3 p-4 card-hover group"
              >
                <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-primary-600 flex-shrink-0 mt-0.5 transition-colors" />
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Sebelumnya</p>
                  <p className="text-sm font-semibold text-gray-700 group-hover:text-primary-700 line-clamp-2 transition-colors">
                    {prevChapter.title}
                  </p>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextChapter ? (
              <Link
                href={`/buku/${book.slug}/bab/${nextChapter.slug}`}
                className="flex items-start justify-end gap-3 p-4 card-hover group text-right"
              >
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Selanjutnya</p>
                  <p className="text-sm font-semibold text-gray-700 group-hover:text-primary-700 line-clamp-2 transition-colors">
                    {nextChapter.title}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 flex-shrink-0 mt-0.5 transition-colors" />
              </Link>
            ) : (
              <div className="p-4 card-hover text-center">
                <p className="text-xs text-gray-400 mb-2">Selesai membaca semua bab!</p>
                <Link href={`/buku/${book.slug}`} className="text-sm font-semibold text-primary-600 hover:underline">
                  Kembali ke Daftar Bab →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
