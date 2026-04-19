"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { 
  CalendarX, 
  Clock, 
  Wallet, 
  FileText, 
  UserCircle, 
  MessageCircle,
  TrendingUp,
  MapPin
} from "lucide-react";

export default function MobileQuickActions() {
  const router = useRouter();

  const actions = [
    { label: "Cuti", icon: CalendarX, path: "/leaves", color: "text-rose-500", bg: "bg-rose-50" },
    { label: "Lembur", icon: Clock, path: "/overtime", color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Gaji", icon: Wallet, path: "/payroll", color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Klaim", icon: FileText, path: "/finance/expenses", color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Profil", icon: UserCircle, path: "/request-profile-update", color: "text-indigo-500", bg: "bg-indigo-50" },
    { label: "Bantuan", icon: MessageCircle, path: "/support", color: "text-teal-500", bg: "bg-teal-50" },
    { label: "Kinerja", icon: TrendingUp, path: "/performance/appraisals", color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Lokasi", icon: MapPin, path: "/attendances", color: "text-cyan-500", bg: "bg-cyan-50" },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 md:hidden py-4">
      {actions.map((action, idx) => {
        const Icon = action.icon;
        return (
          <button
            key={idx}
            onClick={() => router.push(action.path)}
            className="flex flex-col items-center gap-2 group active:scale-90 transition-transform"
          >
            <div className={`w-12 h-12 rounded-2xl ${action.bg} ${action.color} flex items-center justify-center shadow-sm border border-white ring-1 ring-slate-100`}>
              <Icon size={24} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">
              {action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
