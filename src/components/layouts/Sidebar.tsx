"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type MenuKey = "dashboard" | "attendance";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(true);

  const menus: {
    key: MenuKey;
    label: string;
    icon: React.ComponentType<{ size?: number }>;
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
      className={`flex h-screen flex-col bg-white/70 backdrop-blur border-r border-gray-200 py-6 transition-all duration-300 ${
        open ? "w-60 px-4" : "w-20 items-center px-2"
      }`}
    >
      <div
        className={`flex items-center ${
          open ? "justify-between" : "justify-center"
        } mb-8`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold shadow">
            A
          </div>
          {open && (
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Attendance
              </p>
              <p className="text-xs text-gray-400">Management</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition"
        >
          {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <nav className="flex flex-col gap-2">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const active = isActive(menu.path);

          return (
            <button
              key={menu.key}
              type="button"
              onClick={() => router.push(menu.path)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition ${
                active
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Icon size={20} />

              {open && (
                <span className="text-sm font-medium">{menu.label}</span>
              )}

              {active && open && (
                <span className="ml-auto h-2 w-2 rounded-full bg-white" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2">
        <button
          type="button"
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-gray-500 hover:bg-gray-100 transition"
        >
          <Settings size={20} />
          {open && <span className="text-sm font-medium">Settings</span>}
        </button>

        <button
          type="button"
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-red-500 hover:bg-red-50 transition"
        >
          <LogOut size={20} />
          {open && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
