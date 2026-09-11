import { NextRequest, NextResponse } from 'next/server';

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Login ke Appwrite
    const res = await fetch(`${ENDPOINT}/v1/account/sessions/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': PROJECT,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.message || 'Login gagal' }, { status: res.status });
    }

    const setCookieHeaders = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    const response = NextResponse.json({ success: true, userId: data.userId });

    for (const rawCookie of setCookieHeaders) {
      const parts = rawCookie.split(';');
      const nameValue = parts[0].trim();
      const eqIdx = nameValue.indexOf('=');
      if (eqIdx < 0) continue;

      const name = nameValue.slice(0, eqIdx).trim();
      const value = nameValue.slice(eqIdx + 1).trim();

      response.cookies.set({
        name,
        value,
        httpOnly: false,
        sameSite: 'lax',
        secure: false,
        path: '/',
        maxAge: 365 * 24 * 3600,
      });
    }

    // Catatan: Route publik ini TIDAK menset cookie 'is_admin'

    return response;
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
