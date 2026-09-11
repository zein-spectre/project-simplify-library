'use client';

import { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle2 } from 'lucide-react';

export default function FeedbackForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      setIsSubmitting(false);

      if (!response.ok || data.error) {
        setError(data.error || 'Gagal mengirim pesan.');
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setIsSuccess(false);
          setMessage('');
        }, 3000);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Gagal mengirim pesan.');
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-500 hover:text-accent-600 transition-colors"
      >
        Kirim Saran / Masukan →
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2 text-gray-800">
              <MessageSquare className="w-4 h-4 text-primary-600" />
              <h3 className="font-bold text-sm">Kritik &amp; Saran</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5">
            {isSuccess ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Pesan Terkirim!</h4>
                <p className="text-xs text-gray-500">
                  Terima kasih atas masukan Anda. Kami akan menggunakan saran ini untuk meningkatkan kualitas ringkasan.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  Beri tahu kami apa yang bisa diperbaiki atau masukan terkait fitur aplikasi ini. Masukan Anda sepenuhnya anonim.
                </p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ketik saran atau masukan Anda di sini..."
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors resize-none mb-3"
                  required
                />
                {error && (
                  <p className="text-xs text-red-500 mb-3">{error}</p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      'Mengirim...'
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Kirim Pesan
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
