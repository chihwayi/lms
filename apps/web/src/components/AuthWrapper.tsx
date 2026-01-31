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
    // Also sanitize if it points to localhost:3001 but we are not on localhost (e.g. production)
    if (instanceUrl) {
      const isLocalhostDomain = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const pointsToLocalhost = instanceUrl.includes('localhost');
      
      if (
        (instanceUrl.includes('localhost:3000')) || 
        (instanceUrl === '') ||
        (pointsToLocalhost && !isLocalhostDomain)
      ) {
          console.warn('Detected incorrect instanceUrl. Resetting to default API.');
          setInstanceUrl(process.env.NEXT_PUBLIC_API_URL || '');
      }
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