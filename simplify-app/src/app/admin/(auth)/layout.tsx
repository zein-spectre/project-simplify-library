// Layout kosong untuk halaman auth admin (login, dll.)
// Login page TIDAK boleh dibungkus AdminLayout karena akan menyebabkan redirect loop
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
