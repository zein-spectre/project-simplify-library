'use client';

import { useState, useRef, useTransition, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createBook, updateBook } from '@/actions/books';
import { uploadCoverFile } from '@/actions/storage';
import { generateSlug } from '@/lib/utils';
import { Upload, X, AlertCircle, Loader2 } from 'lucide-react';

interface Category {
  $id: string;
  name: string;
}

interface Book {
  $id: string;
  $updatedAt: string;
  original_title?: string;
  simplified_title?: string;
  original_author?: string;
  description?: string;
  category_id?: string;
  status?: string;
  slug?: string;
  cover_image_id?: string;
  level?: string;
}

interface BookFormProps {
  categories: Record<string, unknown>[];
  book?: Record<string, unknown>;
}

export default function BookForm({ categories, book }: BookFormProps) {
  const router = useRouter();
  const typedBook = book as unknown as Book | undefined;
  const typedCategories = categories as unknown as Category[];
  const isEdit = !!typedBook;

  const [form, setForm] = useState({
    original_title: typedBook?.original_title || '',
    simplified_title: typedBook?.simplified_title || '',
    original_author: typedBook?.original_author || '',
    description: typedBook?.description || '',
    category_id: typedBook?.category_id || '',
    status: typedBook?.status || 'draft',
    slug: typedBook?.slug || '',
    level: typedBook?.level || '',
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>(
    typedBook?.cover_image_id
      ? `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID}/files/${typedBook.cover_image_id}/preview?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&width=600&output=webp`
      : ''
  );
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleField = (field: string, value: string) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'simplified_title' && !isEdit) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran gambar maksimal 5MB.');
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.original_title || !form.simplified_title || !form.category_id) {
      setError('Judul asli, judul simplifikasi, dan kategori wajib diisi.');
      return;
    }

    startTransition(async () => {
      try {
        let cover_image_id = typedBook?.cover_image_id;

        // Upload cover baru jika ada
        if (coverFile) {
          const fd = new FormData();
          fd.append('file', coverFile);
          cover_image_id = await uploadCoverFile(fd);
        }

        const payload = {
          ...form,
          ...(cover_image_id ? { cover_image_id } : {}),
        };

        if (isEdit) {
          await updateBook(typedBook!.$id, payload);
        } else {
          await createBook(payload);
        }

        router.push('/admin/books');
        router.refresh();
      } catch (err: unknown) {
        setError((err as { message?: string }).message || 'Terjadi kesalahan. Silakan coba lagi.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      {error && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form Fields */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-5 space-y-5">
            <h2 className="font-semibold text-gray-900 text-sm border-b border-gray-100 pb-3">Informasi Buku</h2>

            <div>
              <label className="input-label">Judul Buku Asli <span className="text-red-500">*</span></label>
              <input
                className="input-field"
                value={form.original_title}
                onChange={(e) => handleField('original_title', e.target.value)}
                placeholder="contoh: Asas-Asas Hukum Pidana Indonesia"
                required
                disabled={isPending}
              />
            </div>

            <div>
              <label className="input-label">Judul Versi Simplifikasi <span className="text-red-500">*</span></label>
              <input
                className="input-field"
                value={form.simplified_title}
                onChange={(e) => handleField('simplified_title', e.target.value)}
                placeholder="contoh: Asas-Asas Hukum Pidana Indonesia"
                required
                disabled={isPending}
              />
              {form.slug && (
                <p className="text-xs text-gray-400 mt-1">Slug: <code className="text-primary-500">{form.slug}</code></p>
              )}
            </div>

            <div>
              <label className="input-label">Penulis Asli</label>
              <input
                className="input-field"
                value={form.original_author}
                onChange={(e) => handleField('original_author', e.target.value)}
                placeholder="contoh: Prof. Moeljatno, S.H."
                disabled={isPending}
              />
            </div>

            <div>
              <label className="input-label">Deskripsi / Sinopsis Ringkas</label>
              <textarea
                className="input-field min-h-[120px] resize-none"
                value={form.description}
                onChange={(e) => handleField('description', e.target.value)}
                placeholder="Gambaran singkat tentang buku dan mengapa penting untuk disederhanakan..."
                disabled={isPending}
              />
            </div>
          </div>

          <div className="card p-5 space-y-5">
            <h2 className="font-semibold text-gray-900 text-sm border-b border-gray-100 pb-3">Klasifikasi &amp; Publikasi</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Kategori <span className="text-red-500">*</span></label>
                <select
                  className="input-field"
                  value={form.category_id}
                  onChange={(e) => handleField('category_id', e.target.value)}
                  required
                  disabled={isPending}
                >
                  <option value="">— Pilih Kategori —</option>
                  {typedCategories.map((c) => (
                    <option key={c.$id} value={c.$id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Status Publikasi</label>
                <select
                  className="input-field"
                  value={form.status}
                  onChange={(e) => handleField('status', e.target.value)}
                  disabled={isPending}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Terbitkan</option>
                  <option value="archived">Arsip</option>
                </select>
              </div>
            </div>

            <div>
              <label className="input-label">Tingkat Buku</label>
              <select
                className="input-field"
                value={form.level}
                onChange={(e) => handleField('level', e.target.value)}
                disabled={isPending}
              >
                <option value="">Tidak Ada (None)</option>
                <option value="Dasar">Dasar</option>
                <option value="Menengah">Menengah</option>
                <option value="Lanjutan">Lanjutan</option>
              </select>
            </div>

            <div>
              <label className="input-label">Slug URL</label>
              <input
                className="input-field font-mono text-sm"
                value={form.slug}
                onChange={(e) => handleField('slug', e.target.value)}
                placeholder="asas-asas-hukum-pidana-indonesia"
                disabled={isPending}
              />
            </div>
          </div>
        </div>

        {/* Right: Cover Upload */}
        <div>
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 text-sm border-b border-gray-100 pb-3 mb-4">Cover Buku</h2>

            {coverPreview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverPreview}
                  alt="Preview cover"
                  className="w-full aspect-[3/4] object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => { setCoverPreview(''); setCoverFile(null); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  disabled={isPending}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[3/4] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-colors"
                disabled={isPending}
              >
                <Upload className="w-8 h-8" />
                <div className="text-center">
                  <p className="text-sm font-medium">Upload Cover</p>
                  <p className="text-xs">JPG, PNG, WebP · maks 5MB</p>
                </div>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleCoverChange}
            />

            {!coverPreview && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary w-full mt-3 justify-center text-xs"
                disabled={isPending}
              >
                Pilih File
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-100">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary disabled:opacity-60"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Menyimpan...
            </span>
          ) : isEdit ? 'Simpan Perubahan' : 'Buat Buku'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
          disabled={isPending}
        >
          Batal
        </button>
        {isEdit && (
          <span className="text-xs text-gray-400 ml-auto">
            Terakhir diperbarui: {new Date(typedBook!.$updatedAt).toLocaleDateString('id-ID')}
          </span>
        )}
      </div>
    </form>
  );
}
