"use client";

import { History, CheckCircle2, Clock } from "lucide-react";

export function RecentActivityCard() {
  const data = [
    { time: "09:02", label: "Clock In", status: "On Time", icon: <CheckCircle2 size={14} className="text-emerald-500" /> },
    { time: "12:00", label: "Break Start", status: "", icon: <Clock size={14} className="text-amber-500" /> },
    { time: "13:00", label: "Break End", status: "", icon: <Clock size={14} className="text-amber-500" /> },
  ];

  return (
    <div className="w-full h-full rounded-4xl border border-neutral-200 bg-white p-6 shadow-sm overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-neutral-800">Recent Activity</h2>
          <p className="text-xs font-medium text-neutral-500">Your latest logs</p>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-500 border border-neutral-100">
          <History size={18} strokeWidth={2.5} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {data.map((item, i) => (
          <div 
            key={i} 
            className="group flex items-center justify-between p-3 rounded-2xl border border-neutral-50 bg-neutral-50/50 transition-all hover:bg-neutral-50 hover:border-neutral-200"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-neutral-100 shadow-xs group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-neutral-800">{item.label}</span>
                {item.status && <span className="text-[10px] font-medium text-neutral-400">{item.status}</span>}
              </div>
            </div>
            <div className="text-sm font-black text-neutral-900 tracking-tight bg-white px-3 py-1 rounded-lg border border-neutral-100">
              {item.time}
            </div>
          </div>
        ))}
      </div>

      <button className="mt-auto pt-4 text-xs font-bold text-neutral-400 hover:text-neutral-900 transition-colors flex items-center justify-center gap-1">
        View all logs
      </button>
    </div>
  );
}
