'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";

export function TopNav() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const hasRole = (roleName: string) => {
    return user?.roles?.some(r => r.name === roleName) || user?.role === roleName;
  };

  const isAdmin = hasRole('admin') || hasRole('super_admin');
  const isInstructor = hasRole('instructor');

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  return (
    <nav className="relative bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="mr-2">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <SheetTitle className="text-left mb-4">Navigation Menu</SheetTitle>
                  <SheetDescription className="sr-only">
                    Main navigation menu for mobile devices
                  </SheetDescription>
                  <div className="flex flex-col space-y-4 mt-6">
                    <SheetClose asChild>
                      <Link href="/dashboard" className="text-lg font-medium hover:text-blue-600">
                        Dashboard
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/courses" className="text-lg font-medium hover:text-blue-600">
                        Courses
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/innovations" className="text-lg font-medium hover:text-blue-600">
                        Innovations
                      </Link>
                    </SheetClose>
                    {isInstructor && (
                      <SheetClose asChild>
                        <Link href="/innovations/review" className="text-lg font-medium hover:text-blue-600 pl-4 border-l-2 border-blue-100">
                          Review Innovations
                        </Link>
                      </SheetClose>
                    )}
                    {isAdmin && (
                      <SheetClose asChild>
                        <Link href="/admin" className="text-lg font-medium hover:text-blue-600">
                          Admin
                        </Link>
                      </SheetClose>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EduFlow
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link 
                href="/dashboard" 
                className={`${isActive('/dashboard') ? 'text-blue-600 font-medium border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600'} transition-colors py-5`}
              >
                Dashboard
              </Link>
              <Link 
                href="/courses" 
                className={`${isActive('/courses') ? 'text-blue-600 font-medium border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600'} transition-colors py-5`}
              >
                Courses
              </Link>
              <Link 
                href="/innovations" 
                className={`${isActive('/innovations') ? 'text-blue-600 font-medium border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600'} transition-colors py-5`}
              >
                Innovations
              </Link>
              {isAdmin && (
                <Link 
                  href="/admin" 
                  className={`${isActive('/admin') ? 'text-blue-600 font-medium border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600'} transition-colors py-5`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/profile" className="hidden sm:flex items-center space-x-2 bg-white/50 rounded-full px-4 py-2 hover:bg-white/80 transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden relative">
                {user?.avatar ? (
                  <Image src={`http://localhost:3001/uploads/${user.avatar}`} alt="Avatar" fill className="object-cover" unoptimized />
                ) : (
                  <span className="text-white text-sm font-bold">{user?.firstName?.[0] || 'U'}</span>
                )}
              </div>
              <span className="text-gray-700 font-medium">{user?.firstName || 'User'}</span>
            </Link>
            <div onClick={handleLogout} className="bg-white/50 hover:bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
              <span className="text-gray-700 font-semibold">Logout</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
