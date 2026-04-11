import { LucideIcon } from "lucide-react";
import { RoleName } from "@/store/auth.store";

/**
 * Represents a navigable link in the Global Search (Command Palette)
 */
export interface SearchLink {
  /** The display title of the page */
  title: string;
  /** A brief explanation of what the user can do on this page */
  description: string;
  /** The internal application route */
  path: string;
  /** List of roles authorized to see/access this link */
  roles: RoleName[];
  /** Lucide icon component to display next to the link */
  icon: LucideIcon;
}

/**
 * Represents a single segment in the breadcrumb trail
 */
export interface BreadcrumbSegment {
  /** The display label (e.g., "Tenants") */
  label: string;
  /** Is this the currently active page? */
  isLast: boolean;
}
