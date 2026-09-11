import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { listDocuments, DB_ID, CATEGORIES_COL } from '@/lib/appwrite-rest';
import FeedbackForm from './FeedbackForm';

export default async function PublicFooter() {
  const categoryRes = await listDocuments(DB_ID, CATEGORIES_COL).catch(() => null);
  const categories = categoryRes?.documents || [];
  return (
    <footer className="bg-primary-950 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="md:col-span-12 lg:col-span-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white text-sm">Simplify Library</span>
            </div>
            <p className="text-xs text-gray-200 leading-relaxed">
              Merupakan rangkuman sederhana dari buku-buku akademik yang formal, dibuat untuk mahasiswa Hukum Keluarga Islam atau lannya yang ingin memahami materi kuliah di tengah waktu yang terbatas. Fokusnya bukan meringkas untuk membaca cepat, tapi menyederhanakan agar lebih mudah dipahami.
            </p>
            <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
              <span className="font-semibold text-white">Pernyataan Non-Komersial:</span> Seluruh ringkasan disajikan secara gratis
              untuk tujuan edukasi, penelitian, dan literasi hukum masyarakat umum tanpa mengambil hak cipta komersial penerbit asli.
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-4 lg:col-span-3 lg:col-start-7">
            <p className="text-xs font-semibold text-white uppercase tracking-wide mb-3">Kategori</p>
            <ul className="space-y-2">
              {categories.slice(0, 4).map((c: any) => (
                <li key={c.$id}>
                  <Link href={`/katalog?kategori=${encodeURIComponent(c.name)}`} className="text-xs text-gray-300 hover:text-white transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
              {categories.length > 4 && (
                <li>
                  <Link href="/katalog" className="text-xs text-gray-300 hover:text-white transition-colors italic">
                    dll.
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Feedback & Suggestions */}
          <div className="md:col-span-8 lg:col-span-3">
            <p className="text-xs font-semibold text-white uppercase tracking-wide mb-3">Kritik, Saran dan Request</p>
            <p className="text-xs text-gray-200 leading-relaxed mb-3">
              Punya masukan atau menemukan kesalahan materi? Beri tahu saya agar ringkasan ini bisa terus diperbaiki dan semakin bermanfaat.
            </p>
            <FeedbackForm />
            <p className="text-[11px] text-gray-400 mt-4">
              Masukan Anda 100% anonim dan rahasia.
            </p>
          </div>
        </div>

        <div className="border-t border-primary-900 mt-8 pt-6 flex items-center justify-center">
          <p className="text-xs text-gray-400 text-center">
            © 2026 Simplify Library. by Salammzein
          </p>
        </div>
      </div>
    </footer>
  );
}
