import { NextResponse } from 'next/server';
import { listDocuments, DB_ID, CHAPTERS_COL } from '@/lib/appwrite-rest';

export async function GET() {
  try {
    const res = await listDocuments(DB_ID, CHAPTERS_COL, {});
    const chap = res.documents.find((c: any) => c.title && c.title.includes('Pembahasan'));
    return NextResponse.json({
      title: chap?.title,
      html: chap?.content_html,
      json: chap?.content_json
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
