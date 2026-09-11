'use client';

import { useEffect, useRef } from 'react';
import { usePublicAuth } from '@/contexts/PublicAuthContext';

interface ProgressTrackerProps {
  bookId: string;
  chapterSlug: string;
  progressPercent: number;
}

export default function ProgressTracker({ bookId, chapterSlug, progressPercent }: ProgressTrackerProps) {
  const { user } = usePublicAuth();
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current || !user || !bookId) return;
    tracked.current = true;

    // Fire and forget via API
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.$id,
        bookId,
        lastChapterSlug: chapterSlug,
        progressPercent
      })
    }).catch(() => {});
  }, [user, bookId, chapterSlug, progressPercent]);

  return null;
}
