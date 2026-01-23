'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, requiredPermissions, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push('/dashboard'); // Redirect unauthorized access to student dashboard
    }
  }, [isAuthenticated, user, router, allowedRoles]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null; // Or a "Access Denied" component
  }

  return <>{children}</>;
}