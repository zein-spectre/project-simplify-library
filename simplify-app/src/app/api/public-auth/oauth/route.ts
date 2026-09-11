import { NextRequest, NextResponse } from 'next/server';

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const secret = url.searchParams.get('secret');
    const error = url.searchParams.get('error');

    if (error) {
      return NextResponse.redirect(new URL(`/masuk?error=${encodeURIComponent(error)}`, req.url));
    }

    if (!userId || !secret) {
      return NextResponse.redirect(new URL('/masuk?error=Parameter+hilang', req.url));
    }

    // Tukar token dengan session menggunakan Appwrite Server SDK secara manual (REST)
    // Supaya kita bisa mengekstrak cookie-nya
    let endpoint = ENDPOINT;
    if (!endpoint.endsWith('/v1')) {
      endpoint += '/v1';
    }

    const res = await fetch(`${endpoint}/account/sessions/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': PROJECT,
      },
      body: JSON.stringify({ userId, secret }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.redirect(new URL(`/masuk?error=${encodeURIComponent(data.message || 'Gagal membuat sesi')}`, req.url));
    }

    const setCookieHeaders = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    
    // Redirect langsung ke halaman profil
    const response = NextResponse.redirect(new URL('/profil', req.url));

    // Pasang cookie di response agar browser bisa membaca cookie session tersebut
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
    return NextResponse.redirect(new URL(`/masuk?error=${encodeURIComponent(e.message || 'Server error')}`, req.url));
  }
}
