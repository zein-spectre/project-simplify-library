import AdminTopbar from '@/components/admin/AdminTopbar';
import { ImageIcon, Upload } from 'lucide-react';
import Link from 'next/link';

export default function AdminMediaPage() {
  return (
    <>
      <AdminTopbar breadcrumbs={[{ label: 'Aset & Cover Media' }]} />
      <div className="p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Aset &amp; Cover Media</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola gambar cover buku yang tersimpan di Appwrite Storage</p>
        </div>

        <div className="card p-8 text-center">
          <div className="w-14 h-14 bg-accent-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-7 h-7 text-accent-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Upload Cover via Form Buku</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Upload cover buku dilakukan langsung saat membuat atau mengedit buku.
            Untuk mengelola file secara manual, gunakan Appwrite Storage Console.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/admin/books/new" className="btn-primary inline-flex">
              <Upload className="w-4 h-4" />
              Upload via Form Buku
            </Link>
            <a
              href="https://appwrite.geladisalam.my.id"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex"
            >
              <ImageIcon className="w-4 h-4" />
              Appwrite Storage Console
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
