import { NextResponse } from 'next/server';
import { updateDocument, DB_ID, CHAPTERS_COL } from '@/lib/appwrite-rest';

const CURRENT_RENDERER_VERSION = '1.0';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, id, contentJson, contentHtml } = body;

    if (!id) {
      return NextResponse.json({ error: 'Chapter ID is required' }, { status: 400 });
    }

    if (action === 'save') {
      // Autosave: Simpan JSON snapshot
      await updateDocument(DB_ID, CHAPTERS_COL, id, {
        content_json: contentJson,
      });
      return NextResponse.json({ success: true });
    } 
    
    if (action === 'publish') {
      // Publish: Simpan HTML + JSON + set status published
      await updateDocument(DB_ID, CHAPTERS_COL, id, {
        content_html: contentHtml,
        content_json: contentJson,
        renderer_version: CURRENT_RENDERER_VERSION,
        status: 'published',
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Failed to save chapter:', error);
    return NextResponse.json({ error: error.message || 'Gagal menyimpan' }, { status: 500 });
  }
}
