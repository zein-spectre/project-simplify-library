import { NextResponse } from 'next/server';
import { createDocument, updateDocument, deleteDocument, DB_ID, FEEDBACKS_COL } from '@/lib/appwrite-rest';

const uniqueId = () => crypto.randomUUID().replace(/-/g, '').slice(0, 20);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!FEEDBACKS_COL) {
      return NextResponse.json({ error: 'Feedback collection not configured' }, { status: 500 });
    }
    
    await createDocument(DB_ID, FEEDBACKS_COL, uniqueId(), {
      message: message.trim(),
      read: false,
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to create feedback:', error);
    return NextResponse.json({ error: error.message || 'Gagal mengirim pesan.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    if (!FEEDBACKS_COL) return NextResponse.json({ error: 'Config missing' }, { status: 500 });
    
    await updateDocument(DB_ID, FEEDBACKS_COL, id, { read: true });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    if (!FEEDBACKS_COL) return NextResponse.json({ error: 'Config missing' }, { status: 500 });
    
    await deleteDocument(DB_ID, FEEDBACKS_COL, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
