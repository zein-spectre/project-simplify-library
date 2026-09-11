'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteBook } from '@/actions/books';
import { BookOpen, Clock, Trash2, Edit, Layers, Loader2 } from 'lucide-react';
import { getStatusColor, getStatusLabel, getCoverUrl } from '@/lib/utils';

interface Book {
  $id: string;
  $updatedAt: string;
  simplified_title: string;
  original_author: string;
  category_id: string;
  status: string;
  cover_image_id?: string;
}

interface Category {
  $id: string;
  name: string;
}

interface BookListTableProps {
  books: Record<string, unknown>[];
  categories: Record<string, unknown>[];
}

export default function BookListTable({ books, categories }: BookListTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const typedBooks = books as unknown as Book[];
  const typedCategories = categories as unknown as Category[];

  const getCategoryName = (catId: string) =>
    typedCategories.find((c) => c.$id === catId)?.name || '—';

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Hapus buku "${title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteBook(id);
        router.refresh();
      } catch {
        alert('Gagal menghapus buku. Silakan coba lagi.');
      } finally {
        setDeletingId(null);
      }
    });
  };

  if (typedBooks.length === 0) {
    return (
      <div className="card py-20 text-center text-gray-400">
        <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Belum ada buku di koleksi ini.</p>
        <Link href="/admin/books/new" className="btn-primary mt-4 inline-flex">
          + Tambah Buku Baru
        </Link>
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Table Header */}
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <span className="w-10" />
          <span>Koleksi &amp; Doktrin Rujukan</span>
          <span className="w-32 text-center">Kategori</span>
          <span className="w-24 text-center">Struktur</span>
          <span className="w-20 text-center">Status</span>
          <span className="w-20 text-center">Aksi</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-50">
        {typedBooks.map((book) => (
          <div
            key={book.$id}
            className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-4 items-center hover:bg-gray-50/60 transition-colors"
          >
            {/* Cover */}
            <div className="w-10 h-12 rounded-lg flex-shrink-0 overflow-hidden bg-gradient-to-br from-primary-100 to-purple-100">
              {book.cover_image_id ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getCoverUrl(book.cover_image_id as string) || undefined}
                  alt={String(book.simplified_title)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-primary-400" />
                </div>
              )}
            </div>

            {/* Title */}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{book.simplified_title}</p>
              <p className="text-xs text-gray-400 truncate">{book.original_author}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Clock className="w-3 h-3 text-gray-300" />
                <span className="text-[11px] text-gray-400">
                  {new Date(book.$updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Category */}
            <div className="w-32 text-center">
              <span className="badge bg-primary-50 text-primary-700 text-[11px]">
                {getCategoryName(book.category_id)}
              </span>
            </div>

            {/* Chapter count placeholder */}
            <div className="w-24 text-center text-xs text-gray-400">
              <Layers className="w-3.5 h-3.5 inline mr-1" />
              — Bab
            </div>

            {/* Status */}
            <div className="w-20 text-center">
              <span className={`badge ${getStatusColor(book.status)}`}>
                {getStatusLabel(book.status)}
              </span>
            </div>

            {/* Actions */}
            <div className="w-20 flex items-center justify-center gap-1">
              <Link
                href={`/admin/books/${book.$id}/chapters`}
                className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                title="Kelola Bab"
              >
                <Layers className="w-4 h-4" />
              </Link>
              <Link
                href={`/admin/books/${book.$id}/edit`}
                className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                title="Edit Buku"
              >
                <Edit className="w-4 h-4" />
              </Link>
              <button
                onClick={() => handleDelete(book.$id, book.simplified_title)}
                disabled={isPending && deletingId === book.$id}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                title="Hapus Buku"
              >
                {isPending && deletingId === book.$id
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Trash2 className="w-4 h-4" />
                }
              </button>
            </div>
          </div>
        ))}
      </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
        <span>Menampilkan {typedBooks.length} buku dalam repositori</span>
      </div>
    </div>
  );
}
