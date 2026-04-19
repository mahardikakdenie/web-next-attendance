"use client";

import { startTransition, useMemo, useState, useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  CalendarDays,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCog,
  Building2,
  CalendarX,
  Clock,
  Wallet,
  Users,
  Calculator,
  ChevronDown,
  ShieldCheck,
  CreditCard,
  UserCheck,
  FileText,
  TrendingUp,
  ShieldAlert,
  Coins,
  Landmark,
  Receipt,
  MessageSquare,
  Calendar,
  ListChecks,
  Target,
  Star,
  Briefcase,
  History as ActivityIcon
} from "lucide-react";
import { useAuthStore, ROLES, RoleName } from "@/store/auth.store";
import { getDataCurrentTenat } from "@/service/tenantSettings";
import Avatar from "@/components/ui/Avatar";

interface MenuItem {
  key: string;
  label: string;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
    strokeWidth?: number;
  }>;
  path?: string;
  roles: RoleName[];
  permission?: string;
  children?: MenuItem[];
}

const MENUS: MenuItem[] = [
  // PLATFORM LEVEL - SUPERADMIN (Owner of SaaS)
  {
    key: "platform-group",
    label: "Platform Admin",
    icon: ShieldCheck,
    roles: [ROLES.SUPERADMIN],
    children: [
      {
        key: "manage-tenants",
        label: "Manage Tenants",
        icon: Building2,
        path: "/admin/tenants",
        roles: [ROLES.SUPERADMIN],
      },
      {
        key: "subscriptions",
        label: "Subscriptions",
        icon: CreditCard,
        path: "/admin/subscriptions",
        roles: [ROLES.SUPERADMIN],
      },
      {
        key: "accounts",
        label: "Platform Admins",
        icon: UserCheck,
        path: "/admin/accounts",
        roles: [ROLES.SUPERADMIN],
      },
      {
        key: "platform-roles",
        label: "System Governance",
        icon: ShieldAlert,
        path: "/admin/roles",
        roles: [ROLES.SUPERADMIN],
        permission: "platform.roles.view",
      },
      {
        key: "support-desk",
        label: "Support Desk",
        icon: MessageSquare,
        path: "/admin/support",
        roles: [ROLES.SUPERADMIN],
        permission: "support.manage",
      },
    ],
  },

  // COMMON - CORE INSIGHTS & DASHBOARD
  {
    key: "core-group",
    label: "Core Insights",
    icon: LayoutDashboard,
    roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR, ROLES.FINANCE, ROLES.USER],
    children: [
      {
        key: "dashboard",
        label: "Attendance",
        icon: LayoutDashboard,
        path: "/",
        roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR, ROLES.FINANCE, ROLES.USER],
      },
      {
        key: "analytics",
        label: "Analytics",
        icon: TrendingUp,
        path: "/analytics",
        roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR, ROLES.FINANCE],
        permission: "analytics.view",
      },
    ],
  },

  // TENANT LEVEL - MANAGEMENT
  {
    key: "management-group",
    label: "Management",
    icon: Users,
    roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR],
    children: [
      {
        key: "all-attendance",
        label: "Attendance List",
        icon: CalendarDays,
        path: "/attendances",
        roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR],
        permission: "attendance.view",
      },
      {
        key: "all-employees",
        label: "Employees",
        icon: Users,
        path: "/employees",
        roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR],
        permission: "user.view",
      },
      {
        key: "work-schedules",
        label: "Work Schedules",
        icon: Clock,
        path: "/schedules",
        roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR],
        permission: "schedule.view",
      },
      {
        key: "manage-leaves",
        label: "Leave Approvals",
        icon: CalendarX,
        path: "/leaves",
        roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR],
        permission: "leave.view",
      },
      {
        key: "manage-overtime",
        label: "Overtime Approvals",
        icon: Clock,
        path: "/overtime",
        roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR],
        permission: "overtime.view",
      },
      {
        key: "performance-goals",
        label: "Goal Management",
        icon: Target,
        path: "/performance/goals",
        roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR],
        permission: "performance.manage",
      },
      {
        key: "performance-appraisals",
        label: "Appraisals",
        icon: Star,
        path: "/performance/appraisals",
        roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR, ROLES.USER],
        permission: "performance.view",
      },
      {
        key: "projects",
        label: "Projects",
        icon: Briefcase,
        path: "/projects",
        roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR],
        permission: "project.manage",
      },
    ],
  },

  // TENANT LEVEL - PAYROLL
  {
    key: "payroll-group",
    label: "Payroll Center",
    icon: Wallet,
    roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.FINANCE],
    children: [
      {
        key: "payroll-list",
        label: "Payroll & Slips",
        icon: FileText,
        path: "/payroll",
        roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.FINANCE],
        permission: "payroll.view",
      },
      {
        key: "payroll-calc",
        label: "Salary Calculator",
        icon: Calculator,
        path: "/payroll/calculator",
        roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.FINANCE],
        permission: "payroll.calculate",
      },
    ],
  },

  // TENANT LEVEL - FINANCE OPERATIONS
  {
    key: "finance-ops-group",
    label: "Finance Operations",
    icon: Coins,
    roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.FINANCE],
    children: [
      {
        key: "expenses",
        label: "Expenses & Claims",
        icon: Receipt,
        path: "/finance/expenses",
        roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.FINANCE],
        permission: "expense.view",
      },
      {
        key: "loans",
        label: "Loans & Advances",
        icon: Landmark,
        path: "/finance/loans",
        roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.FINANCE],
        permission: "loan.view",
      },
    ],
  },

  // ORGANIZATION SETTINGS - ACCESSIBLE BY TENANT OWNER (ADMIN) & SUPERADMIN
  {
    key: "tenant-settings-group",
    label: "Organization Settings",
    icon: Settings,
    roles: [ROLES.SUPERADMIN, ROLES.ADMIN],
    children: [
      {
        key: "tenant-settings-general",
        label: "General Rules",
        icon: Building2,
        path: "/tenant-settings",
        roles: [ROLES.SUPERADMIN, ROLES.ADMIN],
        permission: "tenant.settings.view",
      },
      {
        key: "tenant-settings-billing",
        label: "Billing & Plan",
        icon: CreditCard,
        path: "/tenant-settings/billing",
        roles: [ROLES.SUPERADMIN, ROLES.ADMIN],
        permission: "billing.manage",
      },
      {
        key: "company-calendar",
        label: "Holiday Calendar",
        icon: Calendar,
        path: "/tenant-settings/calendar",
        roles: [ROLES.SUPERADMIN, ROLES.ADMIN],
        permission: "calendar.manage",
      },
      {
        key: "employee-lifecycle",
        label: "Lifecycle Master",
        icon: ListChecks,
        path: "/tenant-settings/lifecycle",
        roles: [ROLES.SUPERADMIN, ROLES.ADMIN],
        permission: "lifecycle.manage",
      },
      {
        key: "tenant-roles",
        label: "Roles & Permissions",
        icon: ShieldAlert,
        path: "/tenant-settings/roles",
        roles: [ROLES.SUPERADMIN, ROLES.ADMIN],
        permission: "role.view",
      },
    ],
  },

  // PERSONAL WORKSPACE - FOR ALL EMPLOYEES
  {
    key: "my-workspace",
    label: "My Workspace",
    icon: UserCog,
    roles: [ROLES.USER],
    children: [
      {
        key: "my-leaves",
        label: "Leave Request",
        icon: CalendarX,
        path: "/leaves",
        roles: [ROLES.USER],
      },
      {
        key: "my-overtime",
        label: "Overtime Request",
        icon: Clock,
        path: "/overtime",
        roles: [ROLES.USER],
      },
      {
        key: "my-payroll",
        label: "My Salary & Slips",
        icon: Wallet,
        path: "/payroll",
        roles: [ROLES.USER],
      },
      {
        key: "my-timesheet",
        label: "My Timesheet",
        icon: ActivityIcon,
        path: "/timesheet",
        roles: [ROLES.USER],
      },
    ],
  },
];

const filterMenuByRole = (
  menuList: MenuItem[], 
  userRole: RoleName, 
  hasPermission: (id: string) => boolean
): MenuItem[] => {
  const normalizedRole = userRole.toLowerCase();
  return menuList
    .filter((menu) => {
      const roleAllowed = menu.roles.map(r => r.toLowerCase()).includes(normalizedRole);
      const permissionAllowed = menu.permission ? hasPermission(menu.permission) : true;
      return roleAllowed && permissionAllowed;
    })
    .map((menu) => {
      if (menu.children) {
        return {
          ...menu,
          children: filterMenuByRole(menu.children, userRole, hasPermission),
        };
      }
      return menu;
    })
    .filter((menu) => !menu.children || menu.children.length > 0);
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);
  const [open, setOpen] = useState<boolean>(true);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [tenantLogo, setTenantLogo] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState<string>("Attendance");

  const { logout, user, hasPermission } = useAuthStore();
  const role = user?.role?.name as RoleName | undefined;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        const resp = await getDataCurrentTenat();
        if (resp?.data) {
          setTenantLogo(resp.data.tenant_logo || null);
          setTenantName(resp.data.tenant?.Name || "Attendance");
        }
      } catch (error) {
        console.error("Failed to fetch tenant settings in sidebar:", error);
      }
    };
    if (isMounted) fetchTenantData();
  }, [isMounted]);

  const filteredMenus = useMemo(() => {
    if (!isMounted || !role) return [];
    return filterMenuByRole(MENUS, role, hasPermission);
  }, [role, isMounted, hasPermission]);

  const isActive = useCallback((path?: string) => (path ? pathname === path : false), [pathname]);

  const isParentActive = useCallback(
    (menu: MenuItem) => {
      if (menu.path && isActive(menu.path)) return true;
      if (menu.children) {
        return menu.children.some((child) => isActive(child.path));
      }
      return false;
    },
    [isActive]
  );

  const autoExpandedMenus = useMemo(() => {
    const newExpanded: Record<string, boolean> = {};
    filteredMenus.forEach((menu) => {
      if (menu.children && menu.children.some((child) => child.path && pathname === child.path)) {
        newExpanded[menu.key] = true;
      }
    });
    return newExpanded;
  }, [pathname, filteredMenus]);

  const isMenuExpanded = useCallback(
    (key: string) => {
      return expandedMenus[key] !== undefined ? expandedMenus[key] : !!autoExpandedMenus[key];
    },
    [expandedMenus, autoExpandedMenus]
  );

  const toggleExpand = (key: string) => {
    setExpandedMenus((prev) => {
      const isCurrentlyExpanded = prev[key] !== undefined ? prev[key] : !!autoExpandedMenus[key];
      return { ...prev, [key]: !isCurrentlyExpanded };
    });
  };

  const handleLogout = async () => {
    await logout();
    startTransition(() => {
      router.replace("/login");
      router.refresh();
    });
  };

  const renderMenuItem = (menu: MenuItem, isChild = false) => {
    const Icon = menu.icon;
    const hasChildren = menu.children && menu.children.length > 0;
    const expanded = isMenuExpanded(menu.key);
    const active = hasChildren ? isParentActive(menu) : isActive(menu.path);

    return (
      <div key={menu.key} className="w-full">
        <button
          type="button"
          onClick={() => {
            if (!open) {
              setOpen(true);
              if (hasChildren) {
                setExpandedMenus((prev) => ({ ...prev, [menu.key]: true }));
              } else if (menu.path) {
                router.push(menu.path);
              }
            } else {
              if (hasChildren) {
                toggleExpand(menu.key);
              } else if (menu.path) {
                router.push(menu.path);
              }
            }
          }}
          className={`group flex w-full items-center transition-all duration-300 ${
            isChild ? "py-2.5 pl-11 pr-3 rounded-2xl my-0.5" : `py-3 rounded-2xl my-1 ${open ? "px-3" : "px-0 justify-center"}`
          } ${
            active && !hasChildren
              ? "bg-white text-slate-900 shadow-[0_2px_10px_rgba(0,0,0,0.04)] ring-1 ring-slate-200/50"
              : active && hasChildren
              ? "text-blue-600 font-black"
              : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-900"
          }`}
        >
          <Icon 
            size={isChild ? 18 : 20} 
            strokeWidth={active ? 2.5 : 2} 
            className={`shrink-0 ${active && !hasChildren && !isChild ? "text-blue-600" : ""}`} 
          />

          <span
            className={`font-bold whitespace-nowrap overflow-hidden transition-all duration-300 ${
              open ? "opacity-100 ml-3 max-w-[140px]" : "opacity-0 max-w-0 ml-0"
            } ${isChild ? "text-[13px]" : "text-[13.5px]"} ${active && !hasChildren ? "text-slate-900" : ""}`}
          >
            {menu.label}
          </span>

          {hasChildren && (
            <ChevronDown
              size={16}
              className={`shrink-0 transition-all duration-300 overflow-hidden ${
                open ? "ml-auto opacity-100 max-w-4" : "opacity-0 max-w-0 m-0"
              } ${expanded ? "rotate-180" : ""}`}
            />
          )}

          {active && !hasChildren && !isChild && (
            <span
              className={`shrink-0 rounded-full bg-blue-600 hidden md:block transition-all duration-300 ${
                open ? "ml-auto h-1.5 w-1.5 opacity-100" : "h-0 w-0 opacity-0 m-0"
              }`}
            />
          )}
        </button>

        {hasChildren && expanded && open && (
          <div className="mt-1 flex flex-col relative">
            {/* Indent line for children */}
            <div className="absolute left-[21px] top-2 bottom-2 w-px bg-slate-200" />
            {menu.children?.map((child) => renderMenuItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`fixed bottom-0 left-0 z-50 w-full bg-white/90 border-t border-slate-200/60 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 px-2 backdrop-blur-xl transition-all duration-300 md:static md:flex md:h-full md:flex-col md:bg-transparent md:border-none md:py-4 md:pb-6 ${
        open ? "md:w-[260px] md:px-3" : "md:w-[88px] md:items-center md:px-2"
      }`}
    >
      <div
        className={`hidden mb-8 md:flex transition-all duration-300 w-full ${
          open ? "flex-row items-center justify-between px-3" : "flex-col items-center gap-4"
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden cursor-pointer group" onClick={() => router.push('/')}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 font-black text-white shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform overflow-hidden relative text-lg">
            <Avatar 
              src={tenantLogo} 
              name={tenantName}
              className="w-full h-full rounded-2xl"
              alt="Logo"
            />
          </div>
          <div
            className={`flex flex-col transition-all duration-300 overflow-hidden ${
              open ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0"
            }`}
          >
            <p className="text-[15px] font-black text-slate-900 whitespace-nowrap tracking-tight truncate">
              {tenantName}
            </p>
            <p className="text-[10px] font-bold text-slate-400 whitespace-nowrap tracking-[0.15em] uppercase">
              Workspace
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200/50 hover:text-slate-900 transition-colors md:flex"
        >
          {open ? (
            <ChevronLeft size={18} strokeWidth={2.5} />
          ) : (
            <ChevronRight size={18} strokeWidth={2.5} />
          )}
        </button>
      </div>

      <nav className="flex w-full flex-row items-center justify-around gap-1 md:h-full md:flex-col md:justify-start md:gap-1.5 overflow-y-auto custom-scrollbar md:px-1">
        <div className="hidden md:flex flex-col w-full">
          {isMounted && filteredMenus.map((menu) => renderMenuItem(menu))}
        </div>

        <div className="flex md:hidden w-full flex-row items-center justify-around">
          {isMounted && filteredMenus.slice(0, 5).map((menu) => {
            const Icon = menu.icon;
            const path = menu.path || (menu.children && menu.children.length > 0 ? menu.children[0].path : undefined);
            const active = isParentActive(menu);

            return (
              <button
                key={menu.key}
                type="button"
                onClick={() => path && router.push(path)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                  active ? "text-blue-600" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                <span className={`text-[10px] ${active ? "font-black" : "font-bold"}`}>{menu.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden md:flex flex-col w-full gap-1 mt-auto pt-6">
          <button
            onClick={() => router.push("/request-profile-update")}
            type="button"
            className={`group flex w-full items-center rounded-2xl py-3 transition-all text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 ${
              open ? "px-3 justify-start" : "px-0 justify-center"
            }`}
          >
            <Settings size={20} strokeWidth={2} className="shrink-0" />
            <span
              className={`text-[13.5px] font-bold whitespace-nowrap overflow-hidden transition-all duration-300 ${
                open ? "opacity-100 ml-3 max-w-[140px]" : "opacity-0 max-w-0 ml-0"
              }`}
            >
              Settings
            </span>
          </button>

          <button
            onClick={handleLogout}
            type="button"
            className={`group flex w-full items-center rounded-2xl py-3 transition-all text-rose-400 hover:bg-rose-100/50 hover:text-rose-600 ${
              open ? "px-3 justify-start" : "px-0 justify-center"
            }`}
          >
            <LogOut size={20} strokeWidth={2} className="shrink-0" />
            <span
              className={`text-[13.5px] font-black whitespace-nowrap overflow-hidden transition-all duration-300 ${
                open ? "opacity-100 ml-3 max-w-[140px]" : "opacity-0 max-w-0 ml-0"
              }`}
            >
              Sign out
            </span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
