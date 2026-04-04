"use client";

import { startTransition, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

type MenuKey = "dashboard" | "attendance";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(true);

  const { logout } = useAuthStore();

  const menus: {
    key: MenuKey;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
    path: string;
  }[] = [
      { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
      {
        key: "attendance",
        label: "Attendance",
        icon: CalendarDays,
        path: "/attendances",
      },
    ];

  const isActive = (path: string) => pathname === path;

  return (
    <aside
      className={`fixed bottom-0 left-0 z-50 w-full bg-white/95 border-t border-neutral-200 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 px-2 backdrop-blur-md transition-all duration-300 md:static md:flex md:h-dvh md:flex-col md:border-r md:border-t-0 md:bg-white/70 md:py-6 md:pb-6 ${open ? "md:w-60 md:px-4" : "md:w-20 md:items-center md:px-2"
        }`}
    >
      <div
        className={`hidden items-center mb-8 md:flex ${open ? "justify-between" : "justify-center"
          }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-blue-600 font-black text-white shadow-lg shadow-blue-600/20">
            A
          </div>
          {open && (
            <div className="flex flex-col">
              <p className="text-sm font-bold text-neutral-900 whitespace-nowrap">
                Attendance
              </p>
              <p className="text-[11px] font-semibold text-neutral-400 whitespace-nowrap tracking-wide uppercase mt-0.5">
                Management
              </p>
            </div>
          )}
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

      <nav className="flex w-full flex-row items-center justify-around gap-1 md:h-full md:flex-col md:justify-start md:gap-2">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const active = isActive(menu.path);

          return (
            <button
              key={menu.key}
              type="button"
              onClick={() => router.push(menu.path)}
              className={`group flex w-full flex-col items-center justify-center gap-1.5 rounded-2xl p-2 transition-all md:flex-row md:justify-start md:gap-3 md:px-3 md:py-3.5 ${active
                  ? "text-blue-600 md:bg-blue-600 md:text-white md:shadow-md md:shadow-blue-600/20"
                  : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 2.2}
                className="shrink-0 md:h-5.5 md:w-5.5"
              />

              <span
                className={`text-[10px] font-bold md:text-[13px] md:whitespace-nowrap ${open ? "md:block" : "md:hidden"
                  }`}
              >
                {menu.label}
              </span>

              {active && open && (
                <span className="hidden ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-white md:block" />
              )}
            </button>
          );
        })}

        <button
          type="button"
          className="group flex w-full flex-col items-center justify-center gap-1.5 rounded-2xl p-2 transition-all text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 md:mt-auto md:flex-row md:justify-start md:gap-3 md:px-3 md:py-3.5"
        >
          <Settings
            size={22}
            strokeWidth={2.2}
            className="shrink-0 md:h-5.5 md:w-5.5"
          />
          <span
            className={`text-[10px] font-bold md:text-[13px] md:whitespace-nowrap ${open ? "md:block" : "md:hidden"
              }`}
          >
            Settings
          </span>
        </button>

        <button
          onClick={async () => {
            await logout();

            startTransition(() => {
              router.replace("/login");
              router.refresh();
            });
          }}
          type="button"
          className="group flex w-full flex-col items-center justify-center gap-1.5 rounded-2xl p-2 transition-all text-rose-400 hover:bg-rose-50 hover:text-rose-600 md:flex-row md:justify-start md:gap-3 md:px-3 md:py-3.5"
        >
          <LogOut
            size={22}
            strokeWidth={2.2}
            className="shrink-0 md:h-5.5 md:w-5.5"
          />
          <span
            className={`text-[10px] font-bold md:text-[13px] md:whitespace-nowrap ${open ? "md:block" : "md:hidden"
              }`}
          >
            Logout
          </span>
        </button>
      </nav>
    </aside>
  );
}
