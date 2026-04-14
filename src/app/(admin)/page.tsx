"use client";

import { useAuthStore } from "@/store/auth.store";
import DashboardRouter from "@/views/dashboard/DashboardRouter";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="font-bold text-slate-400 tracking-widest uppercase text-xs">Preparing Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-700">
      <DashboardRouter />
    </div>
  );
}
