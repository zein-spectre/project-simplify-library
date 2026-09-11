import { NextRequest, NextResponse } from 'next/server';
import { getDocument, updateDocument, DB_ID, BOOKS_COL } from '@/lib/appwrite-rest';

/**
 * POST /api/track-view
 * Body: { bookId: string }
 *
 * Mengincrementasi view_count buku saat halaman bab dibuka.
 * Dipanggil secara fire-and-forget dari client-side.
 * Menggunakan API key server — aman karena ini API route Next.js.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId } = body as { bookId?: string };

    if (!bookId || typeof bookId !== 'string') {
      return NextResponse.json({ ok: false, error: 'Missing bookId' }, { status: 400 });
    }

    // Ambil view_count saat ini
    const book = await getDocument(DB_ID, BOOKS_COL, bookId) as Record<string, unknown>;
    const currentCount = typeof book.view_count === 'number' ? book.view_count : 0;

    // Increment
    await updateDocument(DB_ID, BOOKS_COL, bookId, {
      view_count: currentCount + 1,
    });

    return NextResponse.json({ ok: true, view_count: currentCount + 1 });
  } catch (err) {
    // Jangan throw error ke client — view tracking tidak boleh crash halaman
    console.error('[/api/track-view] Error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
