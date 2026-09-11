import { NextRequest, NextResponse } from 'next/server';

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const API_KEY = process.env.APPWRITE_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // Buat akun baru via Admin API (menggunakan API key)
    const createRes = await fetch(`${ENDPOINT}/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': PROJECT,
        'X-Appwrite-Key': API_KEY,
      },
      body: JSON.stringify({
        userId: 'unique()',
        email,
        password,
        name,
      }),
    });

    const createData = await createRes.json();
    if (!createRes.ok) {
      return NextResponse.json({ error: createData.message || 'Pendaftaran gagal' }, { status: createRes.status });
    }

    // Setelah terdaftar, langsung login untuk mendapatkan session cookie
    const loginRes = await fetch(`${ENDPOINT}/v1/account/sessions/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': PROJECT,
      },
      body: JSON.stringify({ email, password }),
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      return NextResponse.json({ success: true, message: 'Terdaftar, silakan login' });
    }

    const setCookieHeaders = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [];
    const response = NextResponse.json({ success: true, userId: loginData.userId });

    for (const rawCookie of setCookieHeaders) {
      const parts = rawCookie.split(';');
      const nameValue = parts[0].trim();
      const eqIdx = nameValue.indexOf('=');
      if (eqIdx < 0) continue;

      const cookieName = nameValue.slice(0, eqIdx).trim();
      const cookieValue = nameValue.slice(eqIdx + 1).trim();

      response.cookies.set({
        name: cookieName,
        value: cookieValue,
        httpOnly: false,
        sameSite: 'lax',
        secure: false,
        path: '/',
        maxAge: 365 * 24 * 3600,
      });
    }

    return response;
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
