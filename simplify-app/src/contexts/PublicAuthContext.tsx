'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  $id: string;
  name: string;
  email: string;
}

interface PublicAuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const PublicAuthContext = createContext<PublicAuthContextType | null>(null);

/** Ambil info user yang sedang login via proxy API */
async function getCurrentUser(): Promise<User | null> {
  try {
    const res = await fetch('/api/auth/me'); // Kita bisa reuse endpoint "me" admin
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function PublicAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/public-auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login gagal');

    const u = await getCurrentUser();
    setUser(u);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch('/api/public-auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Pendaftaran gagal');

    const u = await getCurrentUser();
    setUser(u);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'DELETE' }); // Reuse endpoint logout admin
    setUser(null);
  };

  return (
    <PublicAuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </PublicAuthContext.Provider>
  );
}

export function usePublicAuth() {
  const ctx = useContext(PublicAuthContext);
  if (!ctx) throw new Error('usePublicAuth harus digunakan di dalam PublicAuthProvider');
  return ctx;
}
