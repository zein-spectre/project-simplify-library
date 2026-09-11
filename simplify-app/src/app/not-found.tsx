import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-extrabold text-primary-100 mb-2 select-none">404</div>
        <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-5 -mt-4">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Halaman Tidak Ditemukan</h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Halaman yang Anda cari tidak ada atau sudah dipindahkan.
          Mungkin buku yang Anda cari ada di katalog kami!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">
            Kembali ke Beranda
          </Link>
          <Link href="/katalog" className="btn-secondary">
            Lihat Katalog Buku
          </Link>
        </div>
      </div>
    </div>
  );
}
