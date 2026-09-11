import { NextRequest, NextResponse } from 'next/server';

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;

export async function DELETE(req: NextRequest) {
  try {
    // Ambil cookie session dari request browser dan teruskan ke Appwrite
    const cookieHeader = req.headers.get('cookie') || '';

    const res = await fetch(`${ENDPOINT}/v1/account/sessions/current`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': PROJECT,
        'Cookie': cookieHeader,
      },
    });

    // Hapus cookie session di browser dengan mengatur cookie expired
    const response = NextResponse.json({ success: true });
    response.cookies.delete(`a_session_${PROJECT}`);
    response.cookies.delete(`a_session_${PROJECT}_legacy`);
    response.cookies.delete('is_admin');

    return response;
  } catch {
    return NextResponse.json({ error: 'Logout gagal' }, { status: 500 });
  }
}
