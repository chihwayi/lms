import { useConfigStore } from './config-store';
import { useAuthStore } from './auth-store';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

export async function apiClient(endpoint: string, options: FetchOptions = {}) {
  const { instanceUrl } = useConfigStore.getState();
  const { accessToken } = useAuthStore.getState();

  // Construct full URL
  let fullUrl = endpoint;
  if (!endpoint.startsWith('http')) {
    const baseUrl = instanceUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Clean up endpoint leading slash
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    
    // Check if endpoint already has api/v1
    if (cleanEndpoint.startsWith('api/v1')) {
        fullUrl = `${baseUrl}/${cleanEndpoint}`;
    } else {
        fullUrl = `${baseUrl}/api/v1/${cleanEndpoint}`;
    }
  }

  const headers: Record<string, string> = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (accessToken && !options.skipAuth) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const isGet = !options.method || options.method === 'GET';

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (response.status === 401 && !options.skipAuth) {
      useAuthStore.getState().logout();
      throw new Error('Unauthorized');
    }

    // Cache successful GET requests
    if (response.ok && isGet && typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cache = await caches.open('api-cache-v1');
        // We need to clone the response because it can only be consumed once
        cache.put(fullUrl, response.clone());
      } catch (e) {
        console.warn('Failed to cache response', e);
      }
    }

    return response;
  } catch (error) {
    // If offline and GET request, try to find in cache
    if (isGet && typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cache = await caches.open('api-cache-v1');
        const cachedResponse = await cache.match(fullUrl);
        if (cachedResponse) {
          return cachedResponse;
        }
      } catch (e) {
        console.warn('Failed to retrieve from cache', e);
      }
    }
    throw error;
  }
}
