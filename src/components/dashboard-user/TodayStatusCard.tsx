"use client";

import { useEffect, useState } from "react";
import { LogIn, LogOut, Timer, Activity, ListOrdered } from "lucide-react";
import { getTodayAttendance } from "@/service/attendance";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/Skeleton";
import dayjs from "dayjs";
import { useAuthStore } from "@/store/auth.store";
import { getTodayAttendanceSummary } from "@/lib/todayAttendance";

const getBadgeClassName = (status: string) => {
  if (status === "On Time") return "bg-emerald-50 text-emerald-600 border border-emerald-100/50";
  if (status === "Late") return "bg-amber-50 text-amber-600 border border-amber-100/50";
  if (status === "Absent") return "bg-rose-50 text-rose-600 border border-rose-100/50";
  if (status === "On Leave") return "bg-blue-50 text-blue-600 border border-blue-100/50";
  return "bg-neutral-50 text-neutral-500 border border-neutral-200/50";
};

export default function TodayStatusCard() {
  const [now, setNow] = useState<dayjs.Dayjs | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const { user } = useAuthStore();
  const allowMultipleCheck = user?.tenant_setting?.allow_multiple_check || false;

  const { data: responseData, isLoading } = useQuery({
    queryKey: ['today-attendance'],
    queryFn: async () => {
      const res = await getTodayAttendance();
      return res.data;
    },
    refetchInterval: 60000,
  });

  const data = responseData;
  const summary = getTodayAttendanceSummary(user);

  useEffect(() => {
    setMounted(true);
    setNow(dayjs());
    
    // Interval untuk menghitung durasi live (update setiap 1 menit)
    const timer = setInterval(() => {
      setNow(dayjs());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Logika Kalkulasi Manual
  const calculateDuration = () => {
    return data?.duration;
  };

  // Mapping aman (Robust Extraction)
  const clockInTime = data?.clock_in_time || (data as any)?.clock_in || (data as any)?.clockInTime;
  const clockOutTime = data?.clock_out_time || (data as any)?.clock_out || (data as any)?.clockOutTime;

  const durationText = calculateDuration();
  const status = data?.status || "No Record";
  const isWorking = clockInTime && !clockOutTime;

  if (isLoading || !mounted || !now) {
    return (
      <div className="w-full max-w-sm rounded-3xl border border-neutral-100 bg-white p-6 space-y-5 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-5 w-32 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-30 rounded-2xl" />
          <Skeleton className="h-30 rounded-2xl" />
        </div>
        <Skeleton className="h-18 rounded-2xl mt-4" />
      </div>
    );
  }

  // Pengelompokan sesi apabila allowMultipleCheck aktif
  const sessions: { in: string | null; out: string | null; in_image: string | null; out_image: string | null }[] = [];
  
  if (allowMultipleCheck && summary.items.length > 0) {
    const ascItems = [...summary.items].reverse();
    let currentSession: { in: string | null; out: string | null; in_image: string | null; out_image: string | null } = { in: null, out: null, in_image: null, out_image: null };
    
    ascItems.forEach((item) => {
      if (item.type === 'clock_in') {
        if (currentSession.in !== null) {
          sessions.push({ ...currentSession });
          currentSession = { in: null, out: null, in_image: null, out_image: null };
        }
        currentSession.in = item.time;
        currentSession.in_image = item.image;
      } else if (item.type === 'clock_out') {
        currentSession.out = item.time;
        currentSession.out_image = item.image;
        sessions.push({ ...currentSession });
        currentSession = { in: null, out: null, in_image: null, out_image: null };
      }
    });
    
    if (currentSession.in !== null) {
      sessions.push(currentSession);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-3xl border border-neutral-100 bg-white p-6 flex flex-col shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-semibold text-neutral-800 tracking-tight">Today&apos;s Summary</h2>
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider shadow-sm ${getBadgeClassName(status)}`}>
          <div className="h-1.5 w-1.5 rounded-full bg-current" />
          {status}
        </div>
      </div>

      {!allowMultipleCheck || sessions.length === 0 ? (
        /* Tampilan Single Session (Original) */
        <div className="grid grid-cols-2 gap-3.5 grow">
          <div className="flex flex-col justify-between rounded-[20px] border border-blue-100/60 bg-linear-to-br from-blue-50/80 to-blue-100/30 p-4 transition-all hover:bg-blue-50">
            <div className="flex items-start justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm border border-blue-100/50">
                <LogIn size={18} strokeWidth={2.5} />
              </div>
              {clockInTime && (
                <span className="rounded-md bg-blue-100/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  Done
                </span>
              )}
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold tracking-tight text-neutral-900">
                {clockInTime ? clockInTime : "--:--"}
              </p>
              <p className="mt-0.5 text-xs font-medium text-neutral-500">Clock In</p>
            </div>
          </div>

          <div className={`flex flex-col justify-between rounded-[20px] border p-4 transition-all ${
            clockOutTime 
              ? "border-orange-100/60 bg-linear-to-br from-orange-50/80 to-orange-100/30 hover:bg-orange-50" 
              : "border-neutral-100 bg-neutral-50/50"
          }`}>
            <div className="flex items-start justify-between">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-sm border ${
                clockOutTime
                  ? "bg-white text-orange-500 border-orange-100/50"
                  : "bg-white text-neutral-400 border-neutral-100"
              }`}>
                <LogOut size={18} strokeWidth={2.5} />
              </div>
              {clockOutTime && (
                <span className="rounded-md bg-orange-100/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-600">
                  Done
                </span>
              )}
            </div>
            <div className="mt-4">
              <p className={`text-2xl font-bold tracking-tight ${
                  clockOutTime ? "text-neutral-900" : "text-neutral-300"
                }`}
              >
                {clockOutTime ? clockOutTime : "--:--"}
              </p>
              <p className={`mt-0.5 text-xs font-medium ${
                  clockOutTime ? "text-neutral-500" : "text-neutral-400"
                }`}
              >
                Clock Out
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Tampilan Multiple Session */
        <div className="flex flex-col gap-3 grow max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          {sessions.map((session, index) => (
            <div key={index} className="flex flex-col rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex items-center gap-2">
                <ListOrdered size={14} className="text-slate-500" />
                <span className="text-xs font-bold text-slate-700">Sesi {index + 1}</span>
              </div>
              <div className="grid grid-cols-2 divide-x divide-slate-100 bg-white">
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <LogIn size={12} strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">In</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900 leading-none">
                    {session.in ? session.in.substring(0, 5) : "--:--"}
                  </p>
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${session.out ? 'bg-orange-50 text-orange-500' : 'bg-slate-50 text-slate-400'}`}>
                      <LogOut size={12} strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Out</span>
                  </div>
                  <p className={`text-lg font-bold leading-none ${session.out ? 'text-slate-900' : 'text-slate-300'}`}>
                    {session.out ? session.out.substring(0, 5) : "--:--"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Duration Bar */}
      <div className="mt-4 flex items-center justify-between rounded-[20px] border border-neutral-100 bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3.5">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${
            isWorking ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-neutral-100 bg-neutral-50 text-neutral-600'
          }`}>
            {isWorking ? <Activity size={18} strokeWidth={2.5} /> : <Timer size={18} strokeWidth={2.5} />}
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-0.5">Working Duration</p>
            <p className="text-lg font-bold tracking-tight text-neutral-900 leading-none">
              {durationText}
            </p>
          </div>
        </div>
        
        {/* Status Label dengan Animasi Pulse jika sedang bekerja */}
        <div className="flex items-center gap-2 rounded-lg border border-neutral-100 bg-neutral-50 px-2.5 py-1.5">
          {isWorking && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
          <span className={`text-[11px] font-bold uppercase tracking-wider ${
            clockOutTime ? "text-neutral-500" : isWorking ? "text-emerald-600" : "text-neutral-400"
          }`}>
            {clockOutTime ? "Finished" : isWorking ? "Working" : "Not Started"}
          </span>
        </div>
      </div>
    </div>
  );
}
