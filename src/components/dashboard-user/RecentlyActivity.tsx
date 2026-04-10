"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Bell, 
  CheckCircle2, 
  Info,
  ArrowRight,
  Zap,
  Clock // Ditambahkan untuk ikon waktu
} from "lucide-react";
import { getRecentActivities } from "@/service/activity";
import { RecentActivity } from "@/types/api";
import { useRefresh } from "@/lib/RefreshContext";
import { Skeleton } from "@/components/ui/Skeleton";

export function RecentActivityCard() {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshKey } = useRefresh();

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getRecentActivities();
      setActivities(res.data);
    } catch (error) {
      console.error("Failed to fetch recent activities", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities, refreshKey]);

  if (loading) {
    return (
      <div className="w-full h-full rounded-[28px] border border-neutral-100 bg-white p-6 shadow-sm flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-6 w-36 rounded-md" />
          <Skeleton className="h-4 w-20 rounded-md" />
        </div>
        <div className="grid grid-cols-1 gap-4 grow">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl border border-neutral-50">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="space-y-3 flex-1 pt-1">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-3 w-5/6 rounded-md" />
                <Skeleton className="h-3 w-1/3 rounded-md mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-[28px] border border-neutral-100 bg-white p-6 flex flex-col shadow-sm transition-all duration-300 hover:shadow-md group/card">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-amber-50 rounded-xl">
            <Zap className="text-amber-500 fill-amber-500" size={18} />
          </div>
          <h2 className="text-base font-semibold text-neutral-800 tracking-tight">Recent Activity</h2>
        </div>
        <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-all flex items-center gap-1.5 group/btn px-3 py-1.5 rounded-full hover:bg-blue-50">
          <span>Explore All</span>
          <ArrowRight size={14} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
        </button>
      </div>

      {/* Content - Menggunakan Grid System untuk jarak yang konsisten */}
      <div className="grid grid-cols-1 gap-3 grow content-start">
        {activities.length === 0 ? (
          <div className="h-full min-h-50 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-300 mb-4 ring-1 ring-neutral-100">
              <Bell size={24} strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium text-neutral-500 leading-relaxed">
              No new activities or<br/>announcements yet.
            </p>
          </div>
        ) : (
          activities.map((activity) => (
            <div 
              key={activity.id} 
              className="group relative flex items-start gap-4 p-4 rounded-2xl border border-transparent hover:border-neutral-100 bg-white hover:bg-neutral-50/50 transition-all duration-300 cursor-pointer"
            >
              {/* Icon Box - Disejajarkan ke atas (items-start) agar rapi dengan teks multi-baris */}
              <div className={`mt-0.5 w-10 h-10 shrink-0 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110 ${
                activity.type === 'announcement' ? 'bg-blue-50 text-blue-600' :
                activity.type === 'approval' ? 'bg-emerald-50 text-emerald-600' :
                'bg-neutral-100 text-neutral-600'
              }`}>
                {activity.type === 'announcement' ? <Info size={18} strokeWidth={2.5} /> : 
                 activity.type === 'approval' ? <CheckCircle2 size={18} strokeWidth={2.5} /> : 
                 <Bell size={18} strokeWidth={2.5} />}
              </div>

              {/* Text Content - Teks dibiarkan wrap secara natural */}
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <h4 className="text-sm font-semibold text-neutral-800 leading-snug transition-colors group-hover:text-neutral-950">
                  {activity.title}
                </h4>
                
                {activity.description && (
                  <p className="text-[13px] text-neutral-500 leading-relaxed">
                    {activity.description}
                  </p>
                )}

                {/* Date / Time - Dipindah ke bawah agar tidak memakan ruang judul */}
                <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-neutral-400">
                  <Clock size={12} strokeWidth={2.5} />
                  <span>{activity.created_at}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
