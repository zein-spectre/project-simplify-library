import { NextResponse } from 'next/server';
import { listDocuments, createDocument, updateDocument, Q, DB_ID, USER_PROGRESS_COL } from '@/lib/appwrite-rest';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const res = await listDocuments(DB_ID, USER_PROGRESS_COL, {
      queries: [
        Q.equal('user_id', userId),
        Q.limit(100)
      ]
    });
    return NextResponse.json(res.documents);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}

const uniqueId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export async function POST(request: Request) {
  try {
    const { userId, bookId, lastChapterSlug, progressPercent } = await request.json();
    if (!USER_PROGRESS_COL || !userId || !bookId) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

    const existing = await listDocuments(DB_ID, USER_PROGRESS_COL, {
      queries: [
        Q.equal('user_id', userId),
        Q.equal('book_id', bookId),
        Q.limit(1)
      ]
    });

    if (existing.documents.length > 0) {
      const doc = existing.documents[0] as Record<string, any>;
      const newProgress = Math.max(doc.progress_percent || 0, progressPercent);
      await updateDocument(DB_ID, USER_PROGRESS_COL, doc.$id, {
        last_chapter_slug: lastChapterSlug,
        progress_percent: newProgress
      });
    } else {
      await createDocument(DB_ID, USER_PROGRESS_COL, uniqueId(), {
        user_id: userId,
        book_id: bookId,
        last_chapter_slug: lastChapterSlug,
        progress_percent: progressPercent
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
