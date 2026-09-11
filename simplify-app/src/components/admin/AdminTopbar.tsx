'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Bell, HelpCircle, Search } from 'lucide-react';

interface AdminTopbarProps {
  breadcrumbs?: { label: string; href?: string }[];
}

export default function AdminTopbar({ breadcrumbs = [] }: AdminTopbarProps) {
  const { user } = useAuth();

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-6 gap-4 flex-shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500 flex-1">
        <span className="text-gray-400 text-xs uppercase tracking-wide font-medium">Simplify CMS</span>
        {breadcrumbs.map((b, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span className="text-gray-300">/</span>
            <span className={i === breadcrumbs.length - 1 ? 'text-primary-600 font-semibold' : 'text-gray-500'}>
              {b.label}
            </span>
          </span>
        ))}
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Cari entri buku, pasal rujukan, atau bab..."
          className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg w-72
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button className="btn-ghost p-2 rounded-lg">
          <Bell className="w-4 h-4" />
        </button>
        <button className="btn-ghost p-2 rounded-lg">
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* User */}
      <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-gray-800 leading-tight">{user?.name || 'Admin'}</p>
          <p className="text-[10px] text-gray-400 leading-tight">
            {user?.labels?.includes('super_admin') ? 'Super Admin' : 'Editor Konten Legal'}
          </p>
        </div>
        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-white">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </span>
        </div>
      </div>
    </header>
  );
}
