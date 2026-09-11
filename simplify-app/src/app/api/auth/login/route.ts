import { NextRequest, NextResponse } from 'next/server';

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Login ke Appwrite dari server-side (tidak kena CORS)
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

    // Appwrite mengembalikan cookie dengan domain berbeda (appwrite.geladisalam.my.id)
    // Kita perlu meng-extract nilai cookie asli dan menyimpannya ulang untuk localhost
    const setCookieHeaders = res.headers.getSetCookie ? res.headers.getSetCookie() : [];

    // --- VERIFIKASI LABEL ADMIN ---
    const cookieString = setCookieHeaders.map(c => c.split(';')[0]).join('; ');
    const accountRes = await fetch(`${ENDPOINT}/v1/account`, {
      headers: {
        'X-Appwrite-Project': PROJECT,
        'Cookie': cookieString,
      }
    });

    if (accountRes.ok) {
      const accountData = await accountRes.json();
      if (!accountData.labels?.includes('admin')) {
        // Hapus sesi di Appwrite karena bukan admin
        await fetch(`${ENDPOINT}/v1/account/sessions/current`, {
          method: 'DELETE',
          headers: {
            'X-Appwrite-Project': PROJECT,
            'Cookie': cookieString,
          }
        }).catch(() => {});
        return NextResponse.json({ error: 'Akses Ditolak: Akun Anda belum didaftarkan sebagai Admin.' }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: 'Gagal memverifikasi akun.' }, { status: 403 });
    }
    // ------------------------------

    const response = NextResponse.json({ success: true, userId: data.userId });

    for (const rawCookie of setCookieHeaders) {
      // Ambil nama dan nilai cookie
      const parts = rawCookie.split(';');
      const nameValue = parts[0].trim();
      const eqIdx = nameValue.indexOf('=');
      if (eqIdx < 0) continue;

      const name = nameValue.slice(0, eqIdx).trim();
      const value = nameValue.slice(eqIdx + 1).trim();

      // Simpan ulang dengan domain localhost (tanpa domain restriction)
      // sehingga bisa dibaca kembali oleh /api/auth/me
      response.cookies.set({
        name,
        value,
        httpOnly: false,  // false agar bisa dibaca middleware dan di-clear dari JS jika perlu
        sameSite: 'lax',
        secure: false,   // false untuk localhost (http)
        path: '/',
        maxAge: 365 * 24 * 3600, // 1 tahun
      });
    }

    // Set cookie khusus untuk menandai sesi ini sebagai sesi admin
    response.cookies.set({
      name: 'is_admin',
      value: 'true',
      httpOnly: false,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 365 * 24 * 3600,
    });

    return response;
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
