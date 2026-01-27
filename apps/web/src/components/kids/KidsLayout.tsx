import React from 'react';
import { cn } from '@/lib/utils';
import { LogOut, Home, Star, Settings } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import Link from 'next/link';

interface KidsLayoutProps {
  children: React.ReactNode;
}

export function KidsLayout({ children }: KidsLayoutProps) {
  const { logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#FFF5F7] font-sans selection:bg-pink-200">
      {/* Fun Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b-4 border-b-pink-200 z-50 flex items-center justify-between px-6 shadow-sm">
        <Link href="/kids" className="flex items-center gap-2 hover:scale-105 transition-transform">
          <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center shadow-md rotate-3">
            <span className="text-2xl">🎓</span>
          </div>
          <span className="text-2xl font-black text-purple-600 tracking-tight">KidsLearn</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/kids">
            <button className="w-12 h-12 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center text-blue-600 transition-colors">
              <Home className="w-6 h-6" />
            </button>
          </Link>
          <button className="w-12 h-12 rounded-full bg-yellow-100 hover:bg-yellow-200 flex items-center justify-center text-yellow-600 transition-colors">
            <Star className="w-6 h-6" />
          </button>
          <button 
            onClick={() => logout()}
            className="w-12 h-12 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 transition-colors"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
        {children}
      </main>

      {/* Decorative Background Elements */}
      <div className="fixed top-24 left-10 w-32 h-32 bg-yellow-300 rounded-full blur-[80px] opacity-40 pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-40 h-40 bg-purple-300 rounded-full blur-[80px] opacity-40 pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 rounded-full blur-[120px] opacity-20 pointer-events-none" />
    </div>
  );
}
