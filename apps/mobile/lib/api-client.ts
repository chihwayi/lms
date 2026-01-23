import { useConfigStore } from '@/stores/config-store';
import { useAuthStore } from '@/stores/auth-store';

type FetchOptions = RequestInit & {
  params?: Record<string, string>;
};

export async function apiClient(endpoint: string, options: FetchOptions = {}) {
  const { instanceUrl } = useConfigStore.getState();
  const { accessToken, logout } = useAuthStore.getState();

  if (!instanceUrl) {
    throw new Error('No instance URL configured');
  }

  // Remove trailing slash from instanceUrl
  const baseUrl = instanceUrl.replace(/\/$/, '');
  
  // Ensure endpoint starts with /
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Construct URL with params
  const url = new URL(`${baseUrl}/api/v1${path}`);
  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    (headers as any)['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url.toString(), {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired or invalid
    await logout();
    throw new Error('Unauthorized');
  }

  return response;
}
