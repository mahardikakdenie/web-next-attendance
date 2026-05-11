"use client";

import { startTransition, useMemo, useState, useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  LogOut,
  Settings
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { getMyMenus } from "@/service/menu";
import { getDataCurrentTenat } from "@/service/tenantSettings";
import { getIcon } from "@/lib/iconMap";
import Avatar from "@/components/ui/Avatar";
import { useQuery } from "@tanstack/react-query";
import { DynamicMenuItem } from "@/types/api";

const checkIsParentActive = (menu: DynamicMenuItem, pathname: string): boolean => {
  if (menu.path && pathname === menu.path) return true;
  if (menu.children) {
    return menu.children.some((child) => pathname === child.path || (child.children && checkIsParentActive(child, pathname)));
  }
  return false;
};


const getGroupBadge = (key: string) => {
  if (key === "platform-group") return { label: "PLATFORM", color: "bg-indigo-50 text-indigo-500 border-indigo-100" };
  if (key === "intelligence-group") return { label: "CORE", color: "bg-blue-50 text-blue-500 border-blue-100" };
  if (key === "workforce-group") return { label: "HR OPS", color: "bg-emerald-50 text-emerald-600 border-emerald-100" };
  if (key === "performance-group") return { label: "STRATEGY", color: "bg-teal-50 text-teal-600 border-teal-100" };
  if (key === "financial-group") return { label: "FINANCE", color: "bg-amber-50 text-amber-600 border-amber-100" };
  if (key === "governance-group") return { label: "SYSTEM", color: "bg-slate-50 text-slate-500 border-slate-200" };
  if (key === "personal-group") return { label: "SELF", color: "bg-rose-50 text-rose-500 border-rose-100" };
  return null;
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);
  const [open, setOpen] = useState<boolean>(true);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [tenantLogo, setTenantLogo] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState<string>("Attendance");

  const { logout, user } = useAuthStore();
  
  // Task 1: Fetch Dynamic Menus
  const { data: menuResp, refetch: refetchMenus } = useQuery({
    queryKey: ["my-menus"],
    queryFn: getMyMenus,
    enabled: isMounted && !!user,
  });

  const filteredMenus = useMemo(() => menuResp?.data || [], [menuResp]);

  // Task 1.3: Auto-Refresh on SSE notification
  useEffect(() => {
    const handleRefresh = () => {
      refetchMenus();
    };
    window.addEventListener('refresh-sidebar-menus', handleRefresh);
    return () => window.removeEventListener('refresh-sidebar-menus', handleRefresh);
  }, [refetchMenus]);

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
          setTenantName(resp.data.tenant?.name || "Attendance");
        }
      } catch (error) {
        console.error("Failed to fetch tenant settings in sidebar:", error);
      }
    };
    if (isMounted) fetchTenantData();
  }, [isMounted]);

  const isActive = useCallback((path?: string) => (path ? pathname === path : false), [pathname]);

  const autoExpandedMenus = useMemo(() => {
    const newExpanded: Record<string, boolean> = {};
    const checkExpanded = (menus: DynamicMenuItem[]) => {
      menus.forEach((menu) => {
        if (menu.children && menu.children.some((child) => (child.path && pathname === child.path) || (child.children && checkIsParentActive(child, pathname)))) {
          newExpanded[menu.key] = true;
          checkExpanded(menu.children);
        }
      });
    };
    checkExpanded(filteredMenus);
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

  // Task 1.1: Recursive Rendering
  const renderMenuItem = (menu: DynamicMenuItem, isChild = false) => {
    const Icon = getIcon(menu.icon);
    const hasChildren = menu.children && menu.children.length > 0;
    const expanded = isMenuExpanded(menu.key);
    const active = hasChildren ? checkIsParentActive(menu, pathname) : isActive(menu.path);
    
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
          <div className="relative">
            <Icon 
              size={isChild ? 18 : 20} 
              strokeWidth={active ? 2.5 : 2} 
              className={`shrink-0 ${active && !hasChildren && !isChild ? "text-blue-600" : ""}`} 
            />
          </div>

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
        <div className="hidden md:flex flex-col w-full gap-2">
          {isMounted && filteredMenus.map((group) => {
            const badge = getGroupBadge(group.key);

            return (
              <div key={group.key} className={`w-full transition-all duration-300 ${open ? "bg-slate-50/40 rounded-[28px] p-2 border border-slate-100/50 mb-2" : "mb-4"}`}>
                {/* Group Label */}
                <div 
                  className={`transition-all duration-300 mb-2 overflow-hidden flex items-center justify-between gap-3 ${
                    open ? "opacity-100 px-2 h-auto mt-1" : "opacity-0 h-0"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-2.5 bg-slate-200 rounded-full" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
                      {group.label}
                    </span>
                  </div>
                  
                  {badge && (
                    <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-md border ${badge.color} transition-all`}>
                      {badge.label}
                    </span>
                  )}
                </div>

                {/* Group Items / Children */}
                <div className="space-y-0.5">
                  {group.children ? (
                    group.children.map((item) => renderMenuItem(item))
                  ) : (
                    renderMenuItem(group)
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex md:hidden w-full flex-row items-center justify-around">
          {isMounted && filteredMenus.slice(0, 5).map((menu) => {
            const Icon = getIcon(menu.icon);
            const path = menu.path || (menu.children && menu.children.length > 0 ? menu.children[0].path : undefined);
            const active = checkIsParentActive(menu, pathname);

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
