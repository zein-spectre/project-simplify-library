import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie =
    request.cookies.get('a_session_' + process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) ||
    request.cookies.get('a_session_' + process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID + '_legacy');

  // Login page: /login (dipindah ke root agar tidak kena admin layout)
  if (pathname === '/login') {
    const isAdmin = request.cookies.get('is_admin')?.value === 'true';
    if (sessionCookie && isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // Proteksi semua route /admin
  if (pathname.startsWith('/admin')) {
    const isAdmin = request.cookies.get('is_admin')?.value === 'true';
    if (!sessionCookie || !isAdmin) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
