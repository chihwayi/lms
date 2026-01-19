'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}