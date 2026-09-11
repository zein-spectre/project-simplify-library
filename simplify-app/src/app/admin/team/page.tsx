import AdminTopbar from '@/components/admin/AdminTopbar';
import { Users, Mail, Shield } from 'lucide-react';

export default function AdminTeamPage() {
  return (
    <>
      <AdminTopbar breadcrumbs={[{ label: 'Tim & Reviewer' }]} />
      <div className="p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Tim &amp; Reviewer</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Kelola akun editor dan reviewer konten hukum
          </p>
        </div>

        <div className="card p-8 text-center">
          <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-primary-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Manajemen Tim</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Fitur manajemen tim akan dikelola langsung melalui Appwrite Console.
            Buat akun untuk editor baru, atur label (super_admin / editor),
            dan aktifkan hak akses melalui dashboard Appwrite.
          </p>
          <a
            href="https://appwrite.geladisalam.my.id"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex"
          >
            <Shield className="w-4 h-4" />
            Buka Appwrite Console
          </a>
          <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-gray-400 space-y-1">
            <p>Untuk menambah editor baru:</p>
            <ol className="text-left list-decimal list-inside space-y-1 max-w-sm mx-auto text-gray-500">
              <li>Buka Appwrite Console → Auth → Users</li>
              <li>Klik &quot;Create User&quot; dan isi email &amp; password</li>
              <li>Pada user yang dibuat, tambahkan label: <code className="bg-gray-100 px-1 rounded">editor</code> atau <code className="bg-gray-100 px-1 rounded">super_admin</code></li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
