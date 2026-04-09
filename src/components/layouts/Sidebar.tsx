"use client";

import { startTransition, useMemo, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
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
} from "lucide-react";
import { useAuthStore, ROLES, RoleName } from "@/store/auth.store";

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
  children?: MenuItem[];
}

const MENUS: MenuItem[] = [
  // PLATFORM GROUP - SUPERADMIN ONLY
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
        path: "/admin/tenants", // Placeholder
        roles: [ROLES.SUPERADMIN],
      },
      {
        key: "subscriptions",
        label: "Subscriptions",
        icon: CreditCard,
        path: "/admin/subscriptions", // Placeholder
        roles: [ROLES.SUPERADMIN],
      },
      {
        key: "accounts",
        label: "Manage Accounts",
        icon: UserCheck,
        path: "/admin/accounts", // Placeholder
        roles: [ROLES.SUPERADMIN],
      },
    ],
  },

  // COMMON
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
    roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR, ROLES.USER],
  },

  // EMPLOYEE / USER WORKSPACE
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
        label: "My Salary",
        icon: Wallet,
        path: "/payroll",
        roles: [ROLES.USER],
      },
      {
        key: "my-profile-update",
        label: "Update My Data",
        icon: FileText,
        path: "/request-profile-update",
        roles: [ROLES.USER],
      },
    ],
  },

  // HR & ADMIN MANAGEMENT
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
      },
      {
        key: "all-employees",
        label: "Employees",
        icon: Users,
        path: "/employees",
        roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR],
      },
      {
        key: "manage-leaves",
        label: "Leave Approvals",
        icon: CalendarX,
        path: "/leaves",
        roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR],
      },
      {
        key: "manage-overtime",
        label: "Overtime Approvals",
        icon: Clock,
        path: "/overtime",
        roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR],
      },
      {
        key: "data-approvals",
        label: "Update Requests",
        icon: UserCheck,
        path: "/request-profile-update",
        roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR],
      },
    ],
  },

  // PAYROLL GROUP - HR & ADMIN
  {
    key: "payroll-group",
    label: "Payroll Center",
    icon: Wallet,
    roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR],
    children: [
      {
        key: "payroll-list",
        label: "Payroll & Slips",
        icon: FileText,
        path: "/payroll",
        roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR],
      },
      {
        key: "payroll-calc",
        label: "Salary Calculator",
        icon: Calculator,
        path: "/payroll/calculator",
        roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR],
      },
    ],
  },

  // SETTINGS - ADMIN & SUPERADMIN
  {
    key: "tenant-settings",
    label: "Tenant Settings",
    icon: Building2,
    path: "/tenant-settings",
    roles: [ROLES.SUPERADMIN, ROLES.ADMIN],
  },
];

const filterMenuByRole = (menuList: MenuItem[], userRole: RoleName): MenuItem[] => {
  return menuList
    .filter((menu) => menu.roles.includes(userRole))
    .map((menu) => {
      if (menu.children) {
        return {
          ...menu,
          children: filterMenuByRole(menu.children, userRole),
        };
      }
      return menu;
    })
    .filter((menu) => !menu.children || menu.children.length > 0);
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(true);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const { logout, user } = useAuthStore();
  const role = user?.role?.name;

  const filteredMenus = useMemo(() => {
    if (!role) return [];
    return filterMenuByRole(MENUS, role);
  }, [role]);

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
            // FIX: Jika posisi collapse, auto buka sidebar saat diklik
            if (!open) {
              setOpen(true);
              if (hasChildren) {
                setExpandedMenus((prev) => ({ ...prev, [menu.key]: true }));
              } else if (menu.path) {
                router.push(menu.path);
              }
            } else {
              // Perilaku normal saat sidebar sudah terbuka
              if (hasChildren) {
                toggleExpand(menu.key);
              } else if (menu.path) {
                router.push(menu.path);
              }
            }
          }}
          className={`group flex w-full items-center rounded-2xl transition-all duration-300 ${
            isChild ? "py-2 pl-11 pr-3" : `py-3.5 ${open ? "px-3" : "px-0 justify-center"}`
          } ${
            active && !hasChildren
              ? "text-blue-600 md:bg-blue-600 md:text-white md:shadow-md md:shadow-blue-600/20"
              : active && hasChildren
              ? "text-blue-600 md:bg-blue-50"
              : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
          }`}
        >
          <Icon size={isChild ? 18 : 22} strokeWidth={active ? 2.5 : 2.2} className="shrink-0" />

          {/* FIX: Menggunakan overflow & max-width untuk animasi halus, bukan display: hidden */}
          <span
            className={`font-bold whitespace-nowrap overflow-hidden transition-all duration-300 ${
              open ? "opacity-100 ml-3 max-w-37.5" : "opacity-0 max-w-0 ml-0"
            } ${isChild ? "text-[12px]" : "text-[13px]"}`}
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
              className={`shrink-0 rounded-full bg-white hidden md:block transition-all duration-300 ${
                open ? "ml-auto h-1.5 w-1.5 opacity-100" : "h-0 w-0 opacity-0 m-0"
              }`}
            />
          )}
        </button>

        {hasChildren && expanded && open && (
          <div className="mt-1 flex flex-col gap-1">
            {menu.children?.map((child) => renderMenuItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`fixed bottom-0 left-0 z-50 w-full bg-white/95 border-t border-neutral-200 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 px-2 backdrop-blur-md transition-all duration-300 md:static md:flex md:h-dvh md:flex-col md:border-r md:border-t-0 md:bg-white/70 md:py-6 md:pb-6 ${
        open ? "md:w-64 md:px-4" : "md:w-20 md:items-center md:px-2"
      }`}
    >
      {/* FIX: Header Logo menumpuk ke bawah (flex-col) jika collapse agar tidak melebihi lebar 80px */}
      <div
        className={`hidden mb-8 md:flex transition-all duration-300 w-full ${
          open ? "flex-row items-center justify-between" : "flex-col items-center gap-4"
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-blue-600 font-black text-white shadow-lg shadow-blue-600/20">
            A
          </div>
          <div
            className={`flex flex-col transition-all duration-300 overflow-hidden ${
              open ? "opacity-100 max-w-37.5" : "opacity-0 max-w-0"
            }`}
          >
            <p className="text-sm font-bold text-neutral-900 whitespace-nowrap">
              Attendance
            </p>
            <p className="text-[11px] font-semibold text-neutral-400 whitespace-nowrap tracking-wide uppercase mt-0.5">
              Management
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors md:flex"
        >
          {open ? (
            <ChevronLeft size={18} strokeWidth={2.5} />
          ) : (
            <ChevronRight size={18} strokeWidth={2.5} />
          )}
        </button>
      </div>

      <nav className="flex w-full flex-row items-center justify-around gap-1 md:h-full md:flex-col md:justify-start md:gap-2 overflow-y-auto custom-scrollbar">
        <div className="hidden md:flex flex-col w-full gap-2">
          {filteredMenus.map((menu) => renderMenuItem(menu))}
        </div>

        {/* Mobile View Bottom Nav (Tidak berubah) */}
        <div className="flex md:hidden w-full flex-row items-center justify-around">
          {filteredMenus.slice(0, 5).map((menu) => {
            const Icon = menu.icon;
            const path = menu.path || (menu.children && menu.children.length > 0 ? menu.children[0].path : undefined);
            const active = isParentActive(menu);

            return (
              <button
                key={menu.key}
                type="button"
                onClick={() => path && router.push(path)}
                className={`flex flex-col items-center gap-1 p-2 ${
                  active ? "text-blue-600" : "text-neutral-400"
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 2.2} />
                <span className="text-[10px] font-bold">{menu.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Actions Desktop */}
        <div className="hidden md:flex flex-col w-full gap-2 mt-auto border-t border-neutral-100 pt-4">
          <button
            type="button"
            className={`group flex w-full items-center rounded-2xl py-3.5 transition-all text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 ${
              open ? "px-3 justify-start" : "px-0 justify-center"
            }`}
          >
            <Settings size={22} strokeWidth={2.2} className="shrink-0" />
            <span
              className={`text-[13px] font-bold whitespace-nowrap overflow-hidden transition-all duration-300 ${
                open ? "opacity-100 ml-3 max-w-37.5" : "opacity-0 max-w-0 ml-0"
              }`}
            >
              Preferences
            </span>
          </button>

          <button
            onClick={handleLogout}
            type="button"
            className={`group flex w-full items-center rounded-2xl py-3.5 transition-all text-rose-400 hover:bg-rose-50 hover:text-rose-600 ${
              open ? "px-3 justify-start" : "px-0 justify-center"
            }`}
          >
            <LogOut size={22} strokeWidth={2.2} className="shrink-0" />
            <span
              className={`text-[13px] font-bold whitespace-nowrap overflow-hidden transition-all duration-300 ${
                open ? "opacity-100 ml-3 max-w-37.5" : "opacity-0 max-w-0 ml-0"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
