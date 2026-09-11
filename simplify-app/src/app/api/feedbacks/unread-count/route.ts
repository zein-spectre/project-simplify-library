import { NextResponse } from 'next/server';
import { listDocuments, Q, DB_ID, FEEDBACKS_COL } from '@/lib/appwrite-rest';

export async function GET() {
  try {
    if (!FEEDBACKS_COL) {
      return NextResponse.json({ unreadCount: 0 });
    }
    
    const res = await listDocuments(DB_ID, FEEDBACKS_COL, {
      queries: [
        Q.equal('read', false),
        Q.limit(1) // We could limit 1 and check total if appwrite returns total, yes Appwrite listDocuments returns total!
      ]
    });
    
    return NextResponse.json({ unreadCount: res.total || 0 });
  } catch (error) {
    return NextResponse.json({ unreadCount: 0 });
  }
}
