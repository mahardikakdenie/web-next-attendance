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

/**
 * Maps Base Roles to their corresponding UI colors (Tailwind classes).
 */
export const getRoleBadgeColor = (baseRole?: string): string => {
  const role = baseRole?.toUpperCase();
  switch (role) {
    case 'SUPERADMIN':
    case 'ADMIN':
      return 'bg-rose-50 text-rose-600 border-rose-100';
    case 'HR':
      return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'FINANCE':
      return 'bg-amber-50 text-amber-600 border-amber-100';
    case 'EMPLOYEE':
      return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-100';
  }
};
