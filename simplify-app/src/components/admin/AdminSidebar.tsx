'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, BookOpen, FolderOpen, Tag,
  ImageIcon, Users, LogOut, BookMarked, ChevronRight,
  Layers, Newspaper, MessageSquare
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard & Metrik', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Kelola Buku', href: '/admin/books', icon: BookOpen },
  { label: 'Kategori Buku', href: '/admin/categories', icon: Tag },
  { label: 'Aset & Cover Media', href: '/admin/media', icon: ImageIcon },
  { label: 'Tim & Reviewer', href: '/admin/team', icon: Users },
  { label: 'Kritik & Saran', href: '/admin/feedbacks', icon: MessageSquare },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [unreadFeedbacks, setUnreadFeedbacks] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/feedbacks/unread-count');
        const data = await res.json();
        setUnreadFeedbacks(data.unreadCount || 0);
      } catch (err) {}
    };

    fetchUnread();
    
    const handleUpdate = () => fetchUnread();
    window.addEventListener('feedbacksUpdated', handleUpdate);
    return () => window.removeEventListener('feedbacksUpdated', handleUpdate);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm leading-tight">Simplify</div>
            <div className="text-[10px] text-gray-400 leading-tight">Pustaka Digital</div>
          </div>
        </div>
        <div className="text-[10px] text-gray-400 mt-1 ml-10.5">V1.2</div>
      </div>

      {/* Admin Mode Badge */}
      <div className="px-5 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Mode Admin Relawan</span>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">AKTIF</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 pb-2">Kurasi & Editor</p>
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 group ${
                active
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center flex-1">
                <item.icon className={`w-4 h-4 mr-3 flex-shrink-0 ${active ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              
              {item.href === '/admin/feedbacks' && unreadFeedbacks > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-white bg-red-500 rounded-full flex-shrink-0">
                  {unreadFeedbacks > 99 ? '99+' : unreadFeedbacks}
                </span>
              )}
            </Link>
          );
        })}
      </nav>


      {/* User + Logout */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary-700">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">{user?.name || 'Admin'}</p>
            <p className="text-[10px] text-gray-400 truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-red-500 hover:text-red-700 transition-colors w-full px-1"
        >
          <LogOut className="w-3.5 h-3.5" />
          Keluar Portal
          <ChevronRight className="w-3 h-3 ml-auto" />
        </button>
      </div>
    </aside>
  );
}
