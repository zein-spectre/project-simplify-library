import Link from 'next/link';
import { BookOpen, Clock, Layers, ArrowRight } from 'lucide-react';
import BookCardBookmarkButton from './BookCardBookmarkButton';

interface BookCardProps {
  book: Record<string, unknown>;
  view?: 'grid' | 'list';
  progress?: number;
}

/**
 * Build cover image URL using NEXT_PUBLIC_ env vars — safe for Client Components.
 */
function buildCoverUrl(fileId: string): string {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID;
  if (!endpoint || !projectId || !bucketId) return '';
  return `${endpoint}/v1/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
}

export default function BookCard({ book, view = 'grid', progress }: BookCardProps) {
  const coverImageId = book.cover_image_id as string | undefined;
  const coverUrl = coverImageId ? buildCoverUrl(coverImageId) : null;

  const title = String(book.simplified_title ?? '');
  const author = String(book.original_author ?? '');
  const description = book.description ? String(book.description) : null;
  const slug = String(book.slug ?? '');
  const categoryName = book.category_name ? String(book.category_name) : null;
  const chapterCount = typeof book.chapter_count === 'number' ? book.chapter_count : null;

  if (view === 'list') {
    return (
      <div className="card-hover p-4 flex items-center gap-4">
        {/* Cover */}
        <div
          className="w-14 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center"
          style={{ height: '4.5rem' }}
        >
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <BookOpen className="w-5 h-5 text-primary-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{title}</p>
          <p className="text-xs text-gray-500 truncate">{author}</p>
          {description && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{description}</p>
          )}
          {progress !== undefined && (
            <div className="flex items-center gap-2 mt-2 w-full max-w-[200px]">
              <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full transition-all" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="text-[10px] font-bold text-teal-600">{progress}%</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
          <BookCardBookmarkButton bookId={String(book.$id)} />
          <Link href={`/buku/${slug}`} className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
            Baca <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card-hover flex flex-col overflow-hidden group bg-[#fdfaf5] border-[#f0ebe1]">
      {/* Cover Image Wrapper with Padding */}
      <div className="p-3 pb-0">
        <div className="relative aspect-[2/3] bg-gradient-to-br from-primary-100 via-purple-50 to-primary-50 overflow-hidden rounded-md shadow-sm">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-primary-300" />
          </div>
        )}

          {/* Category Badge */}
          {categoryName && (
            <div className="absolute top-2 left-2">
              <span className="badge bg-primary-600 text-white text-[9px] px-1.5 py-0.5">{categoryName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col text-center">
        {/* Title */}
        <h3 className="font-extrabold text-gray-900 text-sm leading-tight mb-1 line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
          {title}
        </h3>
        
        {/* Description / Subtitle */}
        {description && (
          <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2 mb-3">
            {description}
          </p>
        )}

        {/* Author */}
        <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase mb-4 mt-auto truncate">
          {author}
        </p>

        {/* Meta — only show if chapter_count is available */}
        {chapterCount !== null && (
          <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-4">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {chapterCount} Bab
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              ~{chapterCount * 15} mnt baca
            </span>
          </div>
        )}

        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="flex items-center gap-2 mt-2 mb-2 w-full">
            <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-teal-500 h-full rounded-full transition-all" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="text-[10px] font-bold text-teal-600">{progress}%</span>
          </div>
        )}

        {/* CTA */}
        <div className="flex items-center gap-2 mt-2 w-full">
          <BookCardBookmarkButton bookId={String(book.$id)} />
          <Link href={`/buku/${slug}`} className="flex-1 flex justify-center items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-semibold py-2 rounded-md transition-colors shadow-sm text-center block">
            Baca <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
