"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Bell, 
  CheckCircle2, 
  Info,
  ArrowRight,
  Zap,
  Clock 
} from "lucide-react";
import { getRecentActivities } from "@/service/activity";
import { RecentActivity } from "@/types/api";
import { useRefresh } from "@/lib/RefreshContext";
import { Skeleton } from "@/components/ui/Skeleton";
import dayjs from "dayjs";

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

  // Loading State
  if (loading) {
    return (
      <div className="w-full h-full rounded-3xl border border-neutral-100 bg-white/80 backdrop-blur-xl p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-7 w-40 rounded-lg" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="grid grid-cols-1 gap-4 grow">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl border border-neutral-50 bg-neutral-50/30">
              <Skeleton className="w-11 h-11 rounded-2xl shrink-0" />
              <div className="space-y-2.5 flex-1 pt-1">
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-full rounded-md" />
                <Skeleton className="h-3 w-1/3 rounded-md mt-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-3xl border border-neutral-100/80 bg-white/90 backdrop-blur-xl p-6 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group/card">
      
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-linear-to-br from-amber-100 to-amber-50 rounded-xl shadow-sm border border-amber-100/50">
            <Zap className="text-amber-500 fill-amber-500" size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight leading-none">Activity</h2>
            <p className="text-xs text-neutral-500 mt-1 font-medium">Your latest updates</p>
          </div>
        </div>
        <button className="text-xs font-semibold text-neutral-600 hover:text-blue-600 transition-all flex items-center gap-1.5 group/btn px-3.5 py-2 rounded-full border border-neutral-200/60 hover:border-blue-200 hover:bg-blue-50/50 shadow-sm hover:shadow">
          <span>View All</span>
          <ArrowRight size={14} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
        </button>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 gap-3 grow content-start">
        {activities.length === 0 ? (
          /* Empty State */
          <div className="h-full min-h-50 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-neutral-100 rounded-2xl bg-neutral-50/50">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-neutral-300 mb-4 shadow-sm border border-neutral-100">
              <Bell size={28} strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-neutral-700">All caught up!</p>
            <p className="text-xs font-medium text-neutral-400 mt-1 leading-relaxed">
              No new activities or<br/>announcements yet.
            </p>
          </div>
        ) : (
          /* Activity List */
          activities.map((activity) => (
            <div 
              key={activity.id} 
              className="group relative flex items-start gap-4 p-4 rounded-2xl border border-transparent bg-transparent hover:bg-white hover:border-neutral-100 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Highlight bar on hover (Left edge) */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-blue-500 rounded-r-full transition-all duration-300 opacity-0 group-hover:h-3/4 group-hover:opacity-100" />

              {/* Icon Box */}
              <div className={`mt-0.5 w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center shadow-sm border transition-all duration-300 group-hover:scale-105 group-hover:shadow ${
                activity.type === 'announcement' ? 'bg-linear-to-br from-blue-50 to-blue-100/50 text-blue-600 border-blue-100' :
                activity.type === 'approval' ? 'bg-linear-to-br from-emerald-50 to-emerald-100/50 text-emerald-600 border-emerald-100' :
                'bg-linear-to-br from-neutral-50 to-neutral-100/50 text-neutral-600 border-neutral-200/60'
              }`}>
                {activity.type === 'announcement' ? <Info size={20} strokeWidth={2.2} /> : 
                 activity.type === 'approval' ? <CheckCircle2 size={20} strokeWidth={2.2} /> : 
                 <Bell size={20} strokeWidth={2.2} />}
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0 flex flex-col gap-1.5 transition-transform duration-300 group-hover:translate-x-0.5">
                <h4 className="text-[15px] font-semibold text-neutral-800 leading-snug transition-colors group-hover:text-blue-950">
                  {activity.title}
                </h4>
                
                {activity.description && (
                  <p className="text-[13px] text-neutral-500 leading-relaxed line-clamp-2 group-hover:text-neutral-600 transition-colors">
                    {activity.description}
                  </p>
                )}

                {/* Date / Time Label */}
                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-semibold text-neutral-400 bg-neutral-50/80 w-max px-2 py-1 rounded-md border border-neutral-100 group-hover:bg-neutral-100/50 transition-colors">
                  <Clock size={12} strokeWidth={2.5} className="text-neutral-400" />
                  <span>{dayjs(activity.created_at).format("DD MMM YYYY • HH:mm")}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
