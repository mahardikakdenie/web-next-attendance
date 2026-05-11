import * as LucideIcons from "lucide-react";

export const ICON_MAP: Record<string, LucideIcons.LucideIcon> = {
  LayoutDashboard: LucideIcons.LayoutDashboard,
  CalendarDays: LucideIcons.CalendarDays,
  Settings: LucideIcons.Settings,
  LogOut: LucideIcons.LogOut,
  ChevronLeft: LucideIcons.ChevronLeft,
  ChevronRight: LucideIcons.ChevronRight,
  UserCog: LucideIcons.UserCog,
  Building2: LucideIcons.Building2,
  CalendarX: LucideIcons.CalendarX,
  Clock: LucideIcons.Clock,
  Wallet: LucideIcons.Wallet,
  Users: LucideIcons.Users,
  Calculator: LucideIcons.Calculator,
  ChevronDown: LucideIcons.ChevronDown,
  ShieldCheck: LucideIcons.ShieldCheck,
  CreditCard: LucideIcons.CreditCard,
  UserCheck: LucideIcons.UserCheck,
  FileText: LucideIcons.FileText,
  TrendingUp: LucideIcons.TrendingUp,
  ShieldAlert: LucideIcons.ShieldAlert,
  Coins: LucideIcons.Coins,
  Landmark: LucideIcons.Landmark,
  Receipt: LucideIcons.Receipt,
  MessageSquare: LucideIcons.MessageSquare,
  Calendar: LucideIcons.Calendar,
  ListChecks: LucideIcons.ListChecks,
  Target: LucideIcons.Target,
  Star: LucideIcons.Star,
  Briefcase: LucideIcons.Briefcase,
  Activity: LucideIcons.Activity,
  History: LucideIcons.History,
  Lock: LucideIcons.Lock,
  // Add common aliases or fallback
  User: LucideIcons.User,
  Shield: LucideIcons.Shield,
  File: LucideIcons.File,
};

export const getIcon = (name: string) => {
  return ICON_MAP[name] || LucideIcons.HelpCircle;
};
