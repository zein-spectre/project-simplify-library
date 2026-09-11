import { getFeedbacks } from '@/actions/feedbacks';
import FeedbackListClient from '@/components/admin/FeedbackListClient';

export const metadata = {
  title: 'Kritik & Saran - Admin Simplify',
};

export default async function FeedbacksPage() {
  const feedbacks = await getFeedbacks();

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kritik &amp; Saran</h1>
          <p className="text-sm text-gray-500 mt-1">
            Masukan dari pengunjung untuk pengembangan aplikasi.
          </p>
        </div>
        <div className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-semibold border border-primary-100">
          Total: {feedbacks.length}
        </div>
      </div>

      {feedbacks.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-xl shadow-sm">
          <p className="text-gray-500 text-sm">Belum ada masukan yang diterima.</p>
        </div>
      ) : (
        <FeedbackListClient initialFeedbacks={feedbacks} />
      )}
    </div>
  );
}
