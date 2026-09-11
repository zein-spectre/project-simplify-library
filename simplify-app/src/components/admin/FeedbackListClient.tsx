'use client';

import { useState } from 'react';
import { Check, Trash2, Mail, MailOpen } from 'lucide-react';

interface FeedbackListClientProps {
  initialFeedbacks: Record<string, any>[];
}

export default function FeedbackListClient({ initialFeedbacks }: FeedbackListClientProps) {
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks);

  const handleMarkRead = async (id: string) => {
    // Optimistic UI update
    setFeedbacks(prev => prev.map(f => f.$id === id ? { ...f, read: true } : f));
    try {
      const res = await fetch('/api/feedbacks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error();
      window.dispatchEvent(new Event('feedbacksUpdated'));
    } catch {
      // Revert if failed
      setFeedbacks(prev => prev.map(f => f.$id === id ? { ...f, read: false } : f));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pesan ini secara permanen?')) return;
    
    // Optimistic UI update
    const previous = [...feedbacks];
    setFeedbacks(prev => prev.filter(f => f.$id !== id));
    
    try {
      const res = await fetch(`/api/feedbacks?id=${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error();
      window.dispatchEvent(new Event('feedbacksUpdated'));
    } catch {
      alert('Gagal menghapus pesan.');
      setFeedbacks(previous);
    }
  };

  return (
    <div className="space-y-4">
      {feedbacks.map((f) => (
        <div 
          key={f.$id as string} 
          className={`p-6 rounded-xl border transition-all ${
            f.read 
              ? 'bg-white border-gray-100 shadow-sm' 
              : 'bg-primary-50/50 border-primary-200 shadow-sm ring-1 ring-primary-100'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-4">
              <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${f.read ? 'bg-gray-100 text-gray-400' : 'bg-primary-100 text-primary-600'}`}>
                {f.read ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold text-gray-900">
                    Pengunjung Anonim
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(f.$createdAt as string).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                  {!f.read && (
                    <span className="px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 text-[9px] font-bold uppercase tracking-wider">
                      Baru
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {f.message as string}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {!f.read && (
                <button
                  onClick={() => handleMarkRead(f.$id as string)}
                  title="Tandai Sudah Dibaca"
                  className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleDelete(f.$id as string)}
                title="Hapus Pesan"
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
