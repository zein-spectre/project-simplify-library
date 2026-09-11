'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, Loader2, CheckCircle2 } from 'lucide-react';
import { account } from '@/lib/appwrite';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');
  
  const router = useRouter();

  useEffect(() => {
    if (!userId || !secret) {
      setError('Tautan pemulihan tidak valid atau sudah kedaluwarsa.');
    }
  }, [userId, secret]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password baru minimal 8 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    if (!userId || !secret) {
      setError('Tautan pemulihan tidak valid.');
      return;
    }

    setIsLoading(true);

    try {
      await account.updateRecovery(userId, secret, password);
      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal mengubah password. Tautan mungkin kedaluwarsa.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card p-6 sm:p-8">
      {isSuccess ? (
        <div className="text-center">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Password Berhasil Diubah!</h3>
          <p className="text-sm text-gray-600 mb-6">
            Akun Anda kini sudah dilindungi dengan kata sandi yang baru.
          </p>
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
            <label className="input-label" htmlFor="password">
              Password Baru
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              className="input-field"
              placeholder="Minimal 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || !userId || !secret}
            />
          </div>

          <div>
            <label className="input-label" htmlFor="confirmPassword">
              Ulangi Password Baru
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              className="input-field"
              placeholder="Ketik ulang password baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading || !userId || !secret}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !password || !confirmPassword || !userId || !secret}
            className="btn-primary w-full justify-center mt-2 disabled:opacity-60"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
            ) : (
              'Simpan Password Baru'
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50/50">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-600 text-white mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Buat Password Baru</h1>
          <p className="text-sm text-gray-500 mt-2">
            Silakan masukkan kata sandi baru untuk akun Anda.
          </p>
        </div>

        <Suspense fallback={
          <div className="card p-8 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mb-2 text-primary-600" />
            <span className="text-sm">Memuat formulir...</span>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
