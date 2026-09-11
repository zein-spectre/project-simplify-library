'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { account } from '@/lib/appwrite';

export default function LupaPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Mengirimkan email pemulihan
      const resetUrl = window.location.origin + '/reset-password';
      await account.createRecovery(email, resetUrl);
      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      if (err.message === 'User with the requested ID could not be found.') {
        setError('Alamat email ini belum terdaftar di sistem kami.');
      } else {
        setError(err.message || 'Gagal mengirimkan instruksi ke email tersebut.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50/50">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-600 text-white mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pemulihan Akun</h1>
          <p className="text-sm text-gray-500 mt-2">
            Kami akan mengirimkan instruksi untuk membuat kata sandi baru.
          </p>
        </div>

        <div className="card p-6 sm:p-8">
          {isSuccess ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Email Terkirim!</h3>
              <p className="text-sm text-gray-600 mb-4">
                Silakan periksa kotak masuk (atau folder spam) untuk alamat <b>{email}</b> dan klik tautan di dalamnya untuk mengatur ulang kata sandi Anda.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-left">
                <p className="text-xs text-amber-800">
                  <span className="font-semibold block mb-1">Catatan Penting:</span>
                  Pesan pemulihan ini dikirimkan melalui sistem. Pastikan untuk membuka pesan dari alamat <b>Simplify Library</b> (melalui email yang didaftarkan pada server) agar Anda bisa melanjutkan proses pergantian kata sandi.
                </p>
              </div>
              <Link href="/masuk" className="btn-primary w-full justify-center">
                Kembali ke Halaman Masuk
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="input-label" htmlFor="email">
                  Alamat Email Anda
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="input-field"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="btn-primary w-full justify-center mt-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</>
                ) : (
                  'Kirim Instruksi'
                )}
              </button>

              <div className="text-center pt-2">
                <Link href="/masuk" className="text-sm text-gray-500 hover:text-primary-600 flex items-center justify-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Kembali masuk
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
