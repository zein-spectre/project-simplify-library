'use client';

import { useState, useTransition } from 'react';
import { createCategory, updateCategory, deleteCategory } from '@/actions/categories';
import { generateSlug } from '@/lib/utils';
import { Plus, Pencil, Trash2, Tag, Check, X, Loader2 } from 'lucide-react';

interface Category {
  $id: string;
  name: string;
  slug: string;
  description?: string;
}

interface CategoryManagerProps {
  initialCategories: Record<string, unknown>[];
}

export default function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories as unknown as Category[]);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    if (!newName.trim()) return;
    setError('');
    startTransition(async () => {
      try {
        const doc = await createCategory(newName, newDesc);
        setCategories((prev) => [...prev, doc as unknown as Category]);
        setNewName('');
        setNewDesc('');
        setShowAddForm(false);
      } catch (err: unknown) {
        setError((err as { message?: string }).message || 'Gagal menambah kategori.');
      }
    });
  };

  const handleEdit = (id: string) => {
    if (!editName.trim()) return;
    setError('');
    startTransition(async () => {
      try {
        const updated = await updateCategory(id, editName, editDesc);
        setCategories((prev) =>
          prev.map((c) => (c.$id === id ? (updated as unknown as Category) : c))
        );
        setEditingId(null);
      } catch (err: unknown) {
        setError((err as { message?: string }).message || 'Gagal menyimpan kategori.');
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Hapus kategori "${name}"? Buku yang menggunakan kategori ini perlu dikategorikan ulang.`)) return;
    setError('');
    startTransition(async () => {
      try {
        await deleteCategory(id);
        setCategories((prev) => prev.filter((c) => c.$id !== id));
      } catch (err: unknown) {
        setError((err as { message?: string }).message || 'Gagal menghapus kategori.');
      }
    });
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.$id);
    setEditName(cat.name);
    setEditDesc(cat.description || '');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* List */}
      <div className="lg:col-span-2">
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary-600" />
              <h2 className="font-semibold text-sm text-gray-900">
                Daftar Kategori ({categories.length})
              </h2>
            </div>
            <button onClick={() => setShowAddForm(true)} className="btn-primary text-xs px-3 py-1.5">
              <Plus className="w-3.5 h-3.5" />
              Tambah Kategori
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="px-5 py-3 bg-red-50 border-b border-red-100 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Add Form */}
          {showAddForm && (
            <div className="px-5 py-4 bg-primary-50 border-b border-primary-100 space-y-3">
              <h3 className="text-sm font-semibold text-primary-800">Kategori Baru</h3>
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Nama kategori (contoh: Bisnis & Keuangan)"
                className="input-field text-sm"
                disabled={isPending}
              />
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Deskripsi singkat (opsional)"
                className="input-field text-sm"
                disabled={isPending}
              />
              {newName && (
                <p className="text-xs text-gray-400">
                  Slug: <code className="text-primary-500">{generateSlug(newName)}</code>
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={isPending || !newName.trim()}
                  className="btn-primary text-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isPending ? 'Menyimpan...' : 'Simpan Kategori'}
                </button>
                <button
                  onClick={() => { setShowAddForm(false); setNewName(''); setNewDesc(''); }}
                  className="btn-secondary text-sm"
                  disabled={isPending}
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Category List */}
          {categories.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Tag className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Belum ada kategori. Tambahkan yang pertama!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {categories.map((cat) => (
                <div key={cat.$id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                  {editingId === cat.$id ? (
                    <div className="space-y-2">
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleEdit(cat.$id)}
                        className="input-field text-sm"
                        disabled={isPending}
                      />
                      <input
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Deskripsi (opsional)"
                        className="input-field text-sm"
                        disabled={isPending}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(cat.$id)}
                          disabled={isPending}
                          className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                        >
                          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          Simpan
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="btn-secondary text-xs px-3 py-1.5"
                          disabled={isPending}
                        >
                          <X className="w-3.5 h-3.5" /> Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Tag className="w-3.5 h-3.5 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            <code className="text-primary-400">/kategori/{cat.slug}</code>
                          </p>
                          {cat.description && (
                            <p className="text-xs text-gray-500 mt-1">{cat.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => startEdit(cat)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          disabled={isPending}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.$id, cat.name)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          disabled={isPending}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div>
        <div className="card p-5">
          <h3 className="font-semibold text-sm text-gray-900 mb-3">Panduan Kategori</h3>
          <div className="space-y-3 text-xs text-gray-500">
            <p>Kategori digunakan untuk mengelompokkan buku di katalog publik dan memudahkan pembaca menemukan topik yang relevan.</p>
            <p>Contoh kategori yang direkomendasikan:</p>
            <ul className="space-y-1 list-disc list-inside text-primary-600">
              {['Bisnis & Keuangan', 'Sains & Teknologi', 'Fiksi & Sastra', 'Pengembangan Diri', 'Sejarah', 'Biografi'].map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
