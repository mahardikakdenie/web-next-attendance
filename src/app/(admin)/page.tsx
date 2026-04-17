"use client";

import { useAuthStore } from "@/store/auth.store";
import DashboardRouter from "@/views/dashboard/DashboardRouter";
import { useEffect, useState } from "react";

export default function Page() {
  const { loading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 animate-in fade-in duration-1000">
        <div className="relative">
          <div className="w-20 h-20 rounded-[24px] border-4 border-slate-100 border-t-blue-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-blue-50 animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="font-black text-slate-900 tracking-[0.2em] uppercase text-xs">Initializing Terminal</p>
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-slate-200 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 rounded-full bg-slate-200 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-1 rounded-full bg-slate-200 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-700">
      <DashboardRouter />
    </div>
  );
}
