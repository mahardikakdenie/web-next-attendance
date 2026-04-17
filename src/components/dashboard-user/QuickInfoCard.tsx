"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Calendar, 
  Clock, 
  Bell, 
  ShieldCheck,
  Zap
} from "lucide-react";
import { getQuickInfo } from "@/service/activity";
import { QuickInfo } from "@/types/api";
import { useRefresh } from "@/lib/RefreshContext";
import { Skeleton } from "@/components/ui/Skeleton";

export function QuickInfoCard() {
  const [info, setInfo] = useState<QuickInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { refreshKey } = useRefresh();

  const fetchQuickInfo = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getQuickInfo();
      setInfo(res.data);
    } catch (error) {
      console.error("Failed to fetch quick info", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchQuickInfo();
    });
  }, [fetchQuickInfo, refreshKey]);

  if (loading) {
    return (
      <div className="w-full h-full rounded-[28px] border border-neutral-200 bg-white p-6 space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-4">
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
        </div>
      </div>
    );
  }

  const items = [
    {
      label: "Pending Leaves",
      value: info?.pending_leaves || 0,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      label: "Pending Overtime",
      value: info?.pending_overtimes || 0,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      label: "Notifications",
      value: info?.notifications_count || 0,
      icon: Bell,
      color: "text-rose-600",
      bgColor: "bg-rose-50"
    }
  ];

  return (
    <div className="w-full h-full rounded-[28px] border border-neutral-200 bg-white p-6 flex flex-col shadow-sm transition-all hover:shadow-md">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-emerald-600" size={20} />
          <h2 className="text-base font-bold text-neutral-800">Quick Insights</h2>
        </div>
      </div>

      <div className="space-y-4 grow">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 border border-neutral-100 transition-all hover:bg-white hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bgColor} ${item.color}`}>
                <item.icon size={20} />
              </div>
              <span className="text-sm font-bold text-neutral-600">{item.label}</span>
            </div>
            <span className="text-lg font-black text-neutral-900">{item.value}</span>
          </div>
        ))}
      </div>

      <button className="mt-6 w-full py-3 rounded-xl bg-neutral-900 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-neutral-800 active:scale-95">
        <span>Refresh Insights</span>
        <Zap size={14} className="fill-white" />
      </button>
    </div>
  );
}
