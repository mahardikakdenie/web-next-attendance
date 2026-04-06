/**
 * Helper to get user profile image URL.
 * Proxies external URLs through /api/image to avoid CORS issues.
 */
export const getProfileImage = (url?: string | null): string => {
  if (!url) return "/profile.jpg";
  
  // If it's a data URL or already proxied, return as is
  if (url.startsWith("data:") || url.startsWith("/api/image")) return url;
  
  // Proxy through our internal API
  return `/api/image?url=${encodeURIComponent(url)}`;
};
