import {
  Building2,
  LayoutGrid,
  History,
  CalendarDays,
  Wallet,
  Users,
  ShieldCheck,
  TrendingUp,
  Clock,
  Settings,
  UserCog,
  ShieldAlert,
  LifeBuoy
} from "lucide-react";
import { SearchLink } from "@/types/layout";
import { ROLES } from "@/store/auth.store";

export const quickLinks: SearchLink[] = [
  { 
    title: "My Workspace", 
    description: "Personal dashboard for attendance and daily tasks.",
    path: "/", 
    roles: [ROLES.USER, ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR, ROLES.FINANCE],
    icon: UserCog
  },
  { 
    title: "Attendance Dashboard", 
    description: "Monitor organization-wide real-time attendance logs.",
    path: "/attendances", 
    roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR],
    icon: CalendarDays
  },
  { 
    title: "Payroll Center", 
    description: "Manage salaries, tax compliance, and download payslips.",
    path: "/payroll", 
    roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR, ROLES.FINANCE, ROLES.USER],
    icon: Wallet
  },
  { 
    title: "HR Analytics", 
    description: "Advanced insights into workforce performance and behavior.",
    path: "/analytics", 
    roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR, ROLES.FINANCE],
    icon: TrendingUp
  },
  { 
    title: "Manage Employees", 
    description: "View and edit organization employee directory.",
    path: "/employees", 
    roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR],
    icon: Users
  },
  { 
    title: "Leave Approvals", 
    description: "Review and approve employee time-off and leave requests.",
    path: "/leaves", 
    roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR],
    icon: History
  },
  { 
    title: "Overtime Requests", 
    description: "Monitor and manage employee overtime submissions.",
    path: "/overtime", 
    roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR],
    icon: Clock
  },
  { 
    title: "Tenant Settings", 
    description: "Configure organization rules and geofence radius.",
    path: "/tenant-settings", 
    roles: [ROLES.SUPERADMIN, ROLES.ADMIN],
    icon: Settings
  },
  { 
    title: "Organization Roles", 
    description: "Manage organizational roles, granular permissions, and hierarchy.",
    path: "/tenant-settings/roles", 
    roles: [ROLES.SUPERADMIN, ROLES.ADMIN],
    icon: ShieldAlert
  },
  { 
    title: "Organization Tenants", 
    description: "Manage global platform organization instances.",
    path: "/admin/tenants", 
    roles: [ROLES.SUPERADMIN],
    icon: Building2
  },
  { 
    title: "Menu Management", 
    description: "Configure dynamic navigation ecosystem and role permissions.",
    path: "/admin/menus", 
    roles: [ROLES.SUPERADMIN],
    icon: LayoutGrid
  },
  {
    title: "Platform Accounts",
    description: "System-level administrator account management.",
    path: "/admin/accounts",
    roles: [ROLES.SUPERADMIN],
    icon: ShieldCheck
  },
  {
    title: "Helpdesk Support",
    description: "Submit support tickets and view help history.",
    path: "/support",
    roles: [ROLES.USER, ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR, ROLES.FINANCE],
    icon: LifeBuoy
  },
];
