'use client';

import { useEffect, useRef } from 'react';

interface ViewTrackerProps {
  bookId: string;
}

/**
 * ViewTracker — Client component fire-and-forget.
 * Dipanggil sekali saat halaman bab dimuat untuk mengincrementasi view_count buku.
 * Tidak merender apapun — murni side effect.
 */
export default function ViewTracker({ bookId }: ViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current || !bookId) return;
    tracked.current = true;

    // Fire and forget — tidak perlu await
    fetch('/api/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId }),
    }).catch(() => {
      // Abaikan error — view tracking tidak kritis
    });
  }, [bookId]);

  return null;
}
