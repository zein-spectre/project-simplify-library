'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  $id: string;
  name: string;
  email: string;
  labels: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

/** Ambil info user yang sedang login (via server proxy untuk hindari CORS) */
async function getCurrentUser(): Promise<User | null> {
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    // Login via proxy API route (menghindari CORS browser → Appwrite)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login gagal');

    // Setelah login, ambil data user lewat API route
    const u = await getCurrentUser();
    setUser(u);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'DELETE' });
    setUser(null);
  };

  // Semua user Appwrite yang berhasil login adalah admin
  const isAdmin = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus digunakan di dalam AuthProvider');
  return ctx;
}
