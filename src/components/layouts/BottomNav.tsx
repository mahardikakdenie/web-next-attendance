"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  Clock, 
  CalendarX, 
  Wallet, 
  User 
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();

  const navItems = [
    { label: "Home", icon: Home, path: "/" },
    { label: "History", icon: Clock, path: "/attendances" },
    { label: "Leaves", icon: CalendarX, path: "/leaves" },
    { label: "Payroll", icon: Wallet, path: "/payroll" },
    { label: "Profile", icon: User, path: "/request-profile-update" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-slate-200/60 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 px-4 z-[100] md:hidden shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center gap-1 min-w-[64px] transition-all duration-300 relative group"
            >
              <div className={`p-1.5 rounded-2xl transition-all duration-300 ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-110 -translate-y-1" : "text-slate-400 group-active:scale-95"}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] tracking-tight transition-colors ${isActive ? "text-blue-600 font-black" : "text-slate-400 font-bold"}`}>
                {item.label}
              </span>
              
              {isActive && (
                <span className="absolute -top-1 right-1/2 translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full animate-pulse md:hidden" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
