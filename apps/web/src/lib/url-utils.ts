export function getCleanBaseUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  let cleanUrl = url;
  // Remove trailing slash
  if (cleanUrl.endsWith('/')) {
    cleanUrl = cleanUrl.slice(0, -1);
  }
  // Remove trailing /api/v1
  if (cleanUrl.endsWith('/api/v1')) {
    cleanUrl = cleanUrl.slice(0, -7);
  }
  // Double check in case of /api/v1/
  if (cleanUrl.endsWith('/')) {
    cleanUrl = cleanUrl.slice(0, -1);
  }
  
  return cleanUrl;
}
