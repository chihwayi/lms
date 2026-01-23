'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { useConfigStore } from '@/lib/config-store';
import { jwtDecode } from 'jwt-decode';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { accessToken, logout } = useAuthStore();
  const { instanceUrl, setInstanceUrl } = useConfigStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Sanitize instanceUrl: If it points to the frontend (localhost:3000), reset it to API default
    if (instanceUrl && (instanceUrl.includes('localhost:3000') || instanceUrl === '')) {
        console.warn('Detected incorrect instanceUrl pointing to frontend. Resetting to default API port 3001.');
        setInstanceUrl('http://localhost:3001');
    }

    // 2. Check Token Validity
    const checkToken = () => {
      if (accessToken) {
        try {
          const decoded: any = jwtDecode(accessToken);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            console.log('Session expired, logging out...');
            logout();
            return;
          }
        } catch (error) {
          console.error('Invalid token detected:', error);
          logout();
          return;
        }
      }
      setIsHydrated(true);
    };

    checkToken();
  }, [accessToken, logout, router]);

  if (!isHydrated) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}