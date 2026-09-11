import { listDocuments, getDocument, Q, DB_ID, BOOKS_COL, CHAPTERS_COL, CATEGORIES_COL } from '@/lib/appwrite-rest';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { BookOpen, Clock, Layers, ChevronRight, Share2, User } from 'lucide-react';
import { getCoverUrl } from '@/lib/appwrite-rest';

export const revalidate = 3600;

export async function generateStaticParams() {
  const res = await listDocuments(DB_ID, BOOKS_COL, {
    queries: [Q.equal('status', 'published'), Q.limit(500)],
  });
  return res.documents.map((doc: any) => ({
    slug: doc.slug,
  }));
}
import BookmarkButton from '@/components/public/BookmarkButton';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getBook(slug: string) {
  const res = await listDocuments(DB_ID, BOOKS_COL, {
    queries: [Q.equal('slug', slug), Q.equal('status', 'published'), Q.limit(1)],
  });
  return (res.documents[0] as Record<string, unknown>) || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBook(slug);
  if (!book) return { title: 'Buku tidak ditemukan' };
  return {
    title: book.simplified_title as string,
    description: (book.description as string) || `Ringkasan dari ${book.original_title} karya ${book.original_author}`,
  };
}

export default async function BookDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const book = await getBook(slug);
  if (!book) notFound();

  const [chaptersRes, categoryResult] = await Promise.all([
    listDocuments(DB_ID, CHAPTERS_COL, {
      queries: [Q.equal('book_id', book.$id as string), Q.equal('status', 'published'), Q.orderAsc('order_index'), Q.limit(100)],
    }),
    book.category_id
      ? listDocuments(DB_ID, CATEGORIES_COL, { queries: [Q.equal('$id', book.category_id as string), Q.limit(1)] }).catch(() => null)
      : Promise.resolve(null),
  ]);

  const chapters = chaptersRes.documents as Record<string, unknown>[];
  const category = categoryResult?.documents?.[0] as Record<string, unknown> | undefined;
  const coverUrl = book.cover_image_id ? getCoverUrl(book.cover_image_id as string) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-primary-600">Beranda</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/katalog" className="hover:text-primary-600">Katalog</Link>
        <ChevronRight className="w-3 h-3" />
        {category && (
          <>
            <Link href={`/katalog?kategori=${encodeURIComponent(category.name as string)}`} className="hover:text-primary-600">
              {category.name as string}
            </Link>
            <ChevronRight className="w-3 h-3" />
          </>
        )}
        <span className="text-gray-600 truncate max-w-xs">{book.simplified_title as string}</span>
      </nav>

      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap gap-2 mb-4">
            {category && <span className="badge bg-primary-100 text-primary-700">{category.name as string}</span>}
            {!!book.level && <span className="badge bg-accent-100 text-accent-700">Tingkat {String(book.level)}</span>}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
            {book.simplified_title as string}
          </h1>
          <div className="flex items-center gap-4 mb-5 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-primary-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400">PENULIS BUKU ASLI</p>
                <p className="font-semibold text-gray-800">{book.original_author as string}</p>
              </div>
            </div>
          </div>
          {/* Deskripsi Buku */}
          <div className="mb-6">
            <h2 className="font-bold text-gray-900 mb-2">Deskripsi Buku:</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              {book.description ? String(book.description) : '-'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-8">
            {chapters.length > 0 ? (
              <Link href={`/buku/${book.slug}/bab/${chapters[0].slug}`} className="btn-primary py-3 px-6 text-sm">
                <BookOpen className="w-4 h-4" />
                Mulai Baca dari Bab 1 (Gratis) →
              </Link>
            ) : (
              <button disabled className="btn-primary py-3 px-6 text-sm opacity-50 cursor-not-allowed">
                Belum Ada Bab Tersedia
              </button>
            )}
            <BookmarkButton bookId={book.$id as string} />
          </div>

          {/* Panduan Membaca Accordion */}
          <details className="group mb-3 border border-primary-100 bg-primary-50 rounded-xl overflow-hidden shadow-sm">
            <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-bold text-primary-800 outline-none">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Panduan Membaca [+]
              </div>
              <span className="transition-transform group-open:rotate-180 text-primary-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" className="block group-open:hidden" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" className="hidden group-open:block" />
                </svg>
              </span>
            </summary>
            <div className="p-4 pt-0 text-sm text-primary-800 leading-relaxed border-t border-primary-100/50 mt-1 pt-3 space-y-2">
              <p>
                Teks dengan format normal (tanpa tanda apa pun di awalnya) merupakan isi yang bersumber langsung dari buku yang sedang dibahas.
              </p>
              <p>
                Sementara itu, teks yang diawali tanda <span className="font-semibold px-1 py-0.5 bg-primary-100 rounded text-primary-700">[+]</span> merupakan tambahan di luar buku tersebut. Bagian ini terbuka untuk dieksplorasi lebih lanjut dari sumber lain—baik artikel, berita, maupun referensi lainnya—guna memperkuat pemahaman.
              </p>
            </div>
          </details>

          {/* Catatan Penting Accordion */}
          <details className="group mb-6 border border-accent-100 bg-accent-50 rounded-xl overflow-hidden shadow-sm">
            <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-bold text-accent-800 outline-none">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Catatan Penting [+]
              </div>
              <span className="transition-transform group-open:rotate-180 text-accent-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" className="block group-open:hidden" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" className="hidden group-open:block" />
                </svg>
              </span>
            </summary>
            <div className="p-4 pt-0 text-sm text-accent-800 leading-relaxed border-t border-accent-100/50 mt-1 pt-3">
              Tulisan ini adalah Panduan Pendamping Belajar (Unofficial Study Guide) hasil penyelarasan bahasa dan elaborasi konsep. Tulisan ini BUKAN pengganti buku asli. Pembaca tetap diwajibkan merujuk pada teks asli untuk konteks akademik yang utuh dan gambar detailnya.
            </div>
          </details>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Struktur Materi', value: `${chapters.length} Bab Inti` },
            ].map((m) => (
              <div key={m.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">{m.label}</p>
                <p className="text-xs font-semibold text-gray-800 mt-0.5">{m.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cover */}
        <div>
          <div className="card overflow-hidden mb-4">
            <div className="aspect-[3/4] bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center">
              {coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverUrl} alt={book.simplified_title as string} className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="w-16 h-16 text-primary-300" />
              )}
            </div>
            <div className="p-4 space-y-2">
              {[
                { label: 'Menit Baca', value: `${chapters.length * 15}+` },
                { label: 'Akses Terbuka', value: '100%' },
                { label: 'Bab & Sub-bab', value: `${chapters.length} Bab` },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{s.label}</span>
                  <span className="font-bold text-gray-800">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chapter List */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-primary-500" />
          Daftar Isi &amp; Hierarki Rekonstruksi Bab
        </h2>
        {chapters.length === 0 ? (
          <div className="py-12 text-center text-gray-400 card">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Belum ada bab yang diterbitkan.</p>
          </div>
        ) : (
          <div className="space-y-3 border-l-2 border-gray-100 pl-4 ml-2">
            {buildTree(chapters).map((node, i) => (
              <ChapterNodeRender key={node.$id} node={node} index={i} depth={0} bookSlug={book.slug as string} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// -- Helper & Komponen Render Hierarki --
interface ChapterNode {
  $id: string;
  title: string;
  slug: string;
  parent_id?: string | null;
  children: ChapterNode[];
}

function buildTree(flatList: Record<string, any>[]): ChapterNode[] {
  const map = new Map<string, ChapterNode>();
  flatList.forEach(item => map.set(item.$id, { $id: item.$id, title: item.title, slug: item.slug, parent_id: item.parent_id, children: [] }));
  
  const roots: ChapterNode[] = [];
  flatList.forEach(item => {
    const node = map.get(item.$id)!;
    if (item.parent_id && map.has(item.parent_id)) {
      map.get(item.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function ChapterNodeRender({ node, index, depth, bookSlug }: { node: ChapterNode; index: number; depth: number; bookSlug: string }) {
  const isRoot = depth === 0;
  return (
    <div className="relative">
      {/* Garis penghubung tree */}
      <div className="absolute -left-[18px] top-6 w-4 border-t-2 border-gray-100" />
      
      <div className={`card-hover p-4 sm:p-5 mb-3 flex flex-col sm:flex-row sm:items-center gap-4 relative z-10 ${isRoot ? 'bg-white' : 'bg-gray-50/50'}`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${isRoot ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
          {isRoot ? String(index + 1).padStart(2, '0') : '-'}
        </div>
        
        <div className="flex-1 min-w-0">
          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-medium uppercase">
            {isRoot ? `BAB ${index + 1}` : 'SUB-BAB'}
          </span>
          <h3 className={`font-bold text-gray-900 mt-1 ${isRoot ? 'text-sm' : 'text-sm text-gray-700'}`}>
            {node.title}
          </h3>
        </div>
        
        <Link href={`/buku/${bookSlug}/bab/${node.slug}`} className="btn-primary text-xs px-4 py-2 flex-shrink-0 mt-3 sm:mt-0">
          Baca {isRoot ? 'Bab' : 'Sub-bab'} →
        </Link>
      </div>

      {node.children.length > 0 && (
        <div className="border-l-2 border-gray-100 pl-4 ml-4 mt-2">
          {node.children.map((child, i) => (
            <ChapterNodeRender key={child.$id} node={child} index={i} depth={depth + 1} bookSlug={bookSlug} />
          ))}
        </div>
      )}
    </div>
  );
}
