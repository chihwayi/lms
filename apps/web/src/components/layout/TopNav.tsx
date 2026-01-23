'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useConfigStore } from '@/lib/config-store';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { Menu, LayoutDashboard, BookOpen, Lightbulb, Users, Shield, FileCheck, LogOut, User, BarChart, Map, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useOnlineStatus } from '@/hooks/use-online-status';

import { NotificationsDrawer } from '@/components/notifications/NotificationsDrawer';

export function TopNav() {
  const { user, logout } = useAuthStore();
  const { instanceUrl } = useConfigStore();
  const router = useRouter();
  const pathname = usePathname();
  const isOnline = useOnlineStatus();

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
    <>
      {!isOnline && (
        <div className="bg-amber-500 text-white text-xs font-bold text-center py-1 flex items-center justify-center gap-2 relative z-[60]">
          <WifiOff className="w-3 h-3" />
          You are currently offline. Some features may be unavailable.
        </div>
      )}
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
                <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
                  <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <SheetTitle className="text-white text-xl font-bold">EduFlow</SheetTitle>
                    <SheetDescription className="text-blue-100 mt-1">
                      Next-Gen Learning Platform
                    </SheetDescription>
                  </div>
                  
                  <div className="flex flex-col py-4">
                    <SheetClose asChild>
                      <Link href="/dashboard" className="flex items-center gap-3 px-6 py-3 text-sm font-medium hover:bg-slate-50 text-slate-700 hover:text-blue-600 transition-colors">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/courses" className="flex items-center gap-3 px-6 py-3 text-sm font-medium hover:bg-slate-50 text-slate-700 hover:text-blue-600 transition-colors">
                        <BookOpen className="w-5 h-5" />
                        Courses
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/learning-paths" className="flex items-center gap-3 px-6 py-3 text-sm font-medium hover:bg-slate-50 text-slate-700 hover:text-blue-600 transition-colors">
                        <Map className="w-5 h-5" />
                        Learning Paths
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/innovations" className="flex items-center gap-3 px-6 py-3 text-sm font-medium hover:bg-slate-50 text-slate-700 hover:text-blue-600 transition-colors">
                        <Lightbulb className="w-5 h-5" />
                        Innovations
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/mentorship" className="flex items-center gap-3 px-6 py-3 text-sm font-medium hover:bg-slate-50 text-slate-700 hover:text-blue-600 transition-colors">
                        <Users className="w-5 h-5" />
                        Mentorship
                      </Link>
                    </SheetClose>

                    {isInstructor && (
                      <>
                        <Separator className="my-2" />
                        <div className="px-6 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Instructor
                        </div>
                        <SheetClose asChild>
                          <Link href="/instructor/dashboard" className="flex items-center gap-3 px-6 py-3 text-sm font-medium hover:bg-slate-50 text-slate-700 hover:text-blue-600 transition-colors">
                            <BarChart className="w-5 h-5" />
                            Instructor Dashboard
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/innovations/review" className="flex items-center gap-3 px-6 py-3 text-sm font-medium hover:bg-slate-50 text-slate-700 hover:text-blue-600 transition-colors">
                            <FileCheck className="w-5 h-5" />
                            Review Innovations
                          </Link>
                        </SheetClose>
                      </>
                    )}

                    {isAdmin && (
                      <>
                        <Separator className="my-2" />
                        <div className="px-6 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Admin
                        </div>
                        <SheetClose asChild>
                          <Link href="/admin" className="flex items-center gap-3 px-6 py-3 text-sm font-medium hover:bg-slate-50 text-slate-700 hover:text-blue-600 transition-colors">
                            <Shield className="w-5 h-5" />
                            Admin Dashboard
                          </Link>
                        </SheetClose>
                      </>
                    )}

                    <Separator className="my-2" />
                    
                    <div className="px-6 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Account
                    </div>
                    
                    <SheetClose asChild>
                      <Link href="/profile" className="flex items-center gap-3 px-6 py-3 text-sm font-medium hover:bg-slate-50 text-slate-700 hover:text-blue-600 transition-colors">
                        <User className="w-5 h-5" />
                        Profile
                      </Link>
                    </SheetClose>
                    
                    <button 
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-6 py-3 text-sm font-medium hover:bg-red-50 text-red-600 transition-colors text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
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
                href="/learning-paths" 
                className={`${isActive('/learning-paths') ? 'text-blue-600 font-medium border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600'} transition-colors py-5`}
              >
                Learning Paths
              </Link>
              <Link 
                href="/innovations" 
                className={`${isActive('/innovations') ? 'text-blue-600 font-medium border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600'} transition-colors py-5`}
              >
                Innovations
              </Link>
              <Link 
                href="/mentorship" 
                className={`${isActive('/mentorship') ? 'text-blue-600 font-medium border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600'} transition-colors py-5`}
              >
                Mentorship
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
            <NotificationsDrawer />
            <Link href="/profile" className="hidden sm:flex items-center space-x-2 bg-white/50 rounded-full px-4 py-2 hover:bg-white/80 transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden relative">
                {user?.avatar ? (
                  <Image src={`${instanceUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/${user.avatar}`} alt="Avatar" fill className="object-cover" unoptimized />
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
    </>
  );
}
