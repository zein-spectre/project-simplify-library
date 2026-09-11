import { NextRequest, NextResponse } from 'next/server';

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;

export async function GET(req: NextRequest) {
  try {
    // Cari cookie session Appwrite
    const sessionCookie =
      req.cookies.get(`a_session_${PROJECT}`) ||
      req.cookies.get(`a_session_${PROJECT}_legacy`);

    if (!sessionCookie) {
      return NextResponse.json(null, { status: 401 });
    }

    // Kirim cookie asli ke Appwrite — Appwrite membaca cookie session dari header Cookie
    const res = await fetch(`${ENDPOINT}/v1/account`, {
      headers: {
        'X-Appwrite-Project': PROJECT,
        // Kirim cookie persis seperti yang Appwrite harapkan
        'Cookie': `${sessionCookie.name}=${sessionCookie.value}`,
      },
    });

    if (!res.ok) return NextResponse.json(null, { status: 401 });
    const user = await res.json();
    return NextResponse.json(user);
  } catch {
    return NextResponse.json(null, { status: 500 });
  }
}
