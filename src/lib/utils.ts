import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Helper to get user profile image URL.
 * Proxies external URLs through /api/image to avoid CORS issues.
 */
export const getProfileImage = (url?: string | null): string | null => {
  if (!url) return null;
  
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

/**
 * Formats duration in hours to a human-readable string.
 * Converts to seconds/minutes if small, rounds hours if large.
 */
export const formatDuration = (hours: number): string => {
  if (typeof hours !== 'number' || isNaN(hours)) return "0s";
  
  // Convert hours to seconds for easier threshold checks
  const totalSeconds = hours * 3600;

  if (totalSeconds < 60) {
    return `${Math.round(totalSeconds)}s`;
  }
  
  if (totalSeconds < 3600) {
    return `${Math.round(totalSeconds / 60)}m`;
  }
  
  // For hours, use 1 decimal place if not a whole number, otherwise integer
  const h = Math.round(hours * 10) / 10;
  return `${h % 1 === 0 ? Math.round(h) : h}h`;
};
