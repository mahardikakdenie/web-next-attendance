"use client";

import { useEffect, useState } from "react";
import { LogIn, LogOut, Timer, Activity, ListOrdered, ChevronDown } from "lucide-react";
import { getTodayAttendance } from "@/service/attendance";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/Skeleton";
import dayjs from "dayjs";
import { useAuthStore } from "@/store/auth.store";
import { getTodayAttendanceSummary } from "@/lib/todayAttendance";

const getBadgeClassName = (status: string) => {
  const s = status?.toLowerCase();
  if (s === "on time" || s === "working" || s === "sedang bekerja") return "bg-emerald-50 text-emerald-600 border border-emerald-100/50";
  if (s === "late") return "bg-amber-50 text-amber-600 border border-amber-100/50";
  if (s === "absent") return "bg-rose-50 text-rose-600 border border-rose-100/50";
  if (s === "on leave") return "bg-blue-50 text-blue-600 border border-blue-100/50";
  if (s === "selesai" || s === "done" || s === "completed") return "bg-indigo-50 text-indigo-600 border border-indigo-100/50";
  return "bg-neutral-50 text-neutral-500 border border-neutral-200/50";
};

export default function TodayStatusCard() {
  const [now, setNow] = useState<dayjs.Dayjs | null>(null);
  const [mounted, setMounted] = useState(false);
  const [expandedSessions, setExpandedSessions] = useState<number[]>([]);
  
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

  // Pengelompokan sesi secara manual dari summary.items untuk mempertahankan riwayat lengkap
  let baseSessions: any[] = [];
  if (allowMultipleCheck && summary.items.length > 0) {
    const ascItems = [...summary.items].reverse();
    let currentSession: any = { clock_in_time: null, clock_out_time: null, status: "completed" };
    
    ascItems.forEach((item) => {
      if (item.type === 'clock_in') {
        if (currentSession.clock_in_time !== null) {
          baseSessions.push({ ...currentSession });
          currentSession = { clock_in_time: null, clock_out_time: null, status: "completed" };
        }
        currentSession.clock_in_time = item.time;
      } else if (item.type === 'clock_out') {
        currentSession.clock_out_time = item.time;
        baseSessions.push({ ...currentSession });
        currentSession = { clock_in_time: null, clock_out_time: null, status: "completed" };
      }
    });
    
    if (currentSession.clock_in_time !== null) {
      baseSessions.push(currentSession);
    }
  }

  // Ambil data sessions dari API yang berisi field baru seperti `status` dan `id`
  const apiSessions = allowMultipleCheck && Array.isArray((data as any)?.sessions) ? (data as any).sessions : [];

  // Merge baseSessions (riwayat lengkap) dengan apiSessions (status terbaru dari API)
  let sessions = [...baseSessions];
  
  if (apiSessions.length > 0) {
     if (apiSessions.length >= baseSessions.length) {
         // Jika API sudah mengembalikan seluruh sesi secara lengkap, gunakan API
         sessions = apiSessions;
     } else {
         // Jika API hanya mengembalikan sebagian (misal 1 sesi terakhir), timpa sesi-sesi terakhir di baseSessions
         const startIdx = baseSessions.length - apiSessions.length;
         for (let i = 0; i < apiSessions.length; i++) {
             if (sessions[startIdx + i]) {
                 sessions[startIdx + i] = { ...sessions[startIdx + i], ...apiSessions[i] };
             }
         }
     }
  } else if (sessions.length === 0 && apiSessions.length > 0) {
     sessions = apiSessions;
  }

  useEffect(() => {
    setMounted(true);
    setNow(dayjs());
    
    // Interval untuk menghitung durasi live (update setiap 1 menit)
    const timer = setInterval(() => {
      setNow(dayjs());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (sessions.length > 0 && expandedSessions.length === 0) {
      // Buka sesi terakhir secara default
      setExpandedSessions([sessions.length - 1]);
    }
  }, [sessions.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSession = (index: number) => {
    setExpandedSessions(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  // Logika Kalkulasi Manual
  const calculateDuration = () => {
    return data?.duration;
  };

  // Mapping aman (Robust Extraction)
  const clockInTime = data?.clock_in_time || (data as any)?.clock_in || (data as any)?.clockInTime;
  const clockOutTime = data?.clock_out_time || (data as any)?.clock_out || (data as any)?.clockOutTime;

  const durationText = calculateDuration();
  const isWorking = clockInTime && !clockOutTime;

  // Menentukan Dynamic Overall Status
  let overallStatus = "Belum bekerja";
  
  if (allowMultipleCheck) {
    if (sessions.length === 0) {
      overallStatus = "Belum bekerja";
    } else {
      const allDone = sessions.every((s: any) => s.clock_out_time);
      const isLocked = data?.status?.toLowerCase() === "done" || data?.status?.toLowerCase() === "completed";
      
      if (isLocked) {
        overallStatus = "Selesai";
      } else if (allDone) {
        overallStatus = "Selesai";
      } else {
        const currentActiveSession = sessions.find((s: any) => !s.clock_out_time);
        overallStatus = currentActiveSession?.status || "Sedang Bekerja";
      }
    }
  } else {
    if (!clockInTime) overallStatus = "Belum bekerja";
    else if (clockInTime && !clockOutTime) overallStatus = data?.status || "Sedang Bekerja";
    else overallStatus = "Selesai";
  }

  const displayStatus = overallStatus;

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

  return (
    <div className="w-full max-w-sm rounded-3xl border border-neutral-100 bg-white p-6 flex flex-col shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-semibold text-neutral-800 tracking-tight">Today&apos;s Summary</h2>
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider shadow-sm ${getBadgeClassName(displayStatus)}`}>
          <div className="h-1.5 w-1.5 rounded-full bg-current" />
          {displayStatus}
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
        /* Tampilan Multiple Session dengan Accordion */
        <div className="flex flex-col gap-3 grow max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
          {sessions.map((session: any, index: number) => {
            const isExpanded = expandedSessions.includes(index);
            
            return (
              <div key={session.id || index} className="flex flex-col rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all duration-300 bg-white">
                <button 
                  onClick={() => toggleSession(index)}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100/50">
                      <ListOrdered size={12} className="text-indigo-500" />
                    </div>
                    <span className="text-xs font-black text-slate-700 tracking-wide">SESI {index + 1}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {session.status && (
                      <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getBadgeClassName(session.status)}`}>
                        {session.status}
                      </div>
                    )}
                    <div className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                      <ChevronDown size={16} strokeWidth={2.5} />
                    </div>
                  </div>
                </button>
                
                <div 
                  className={`grid grid-cols-2 divide-x divide-slate-100 bg-white transition-all duration-300 origin-top overflow-hidden ${
                    isExpanded ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-4 hover:bg-slate-50/30 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100/50 shadow-sm">
                        <LogIn size={14} strokeWidth={2.5} />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In</span>
                    </div>
                    <p className="text-xl font-black text-slate-900 leading-none tabular-nums tracking-tighter ml-1">
                      {session.clock_in_time ? session.clock_in_time.substring(0, 5) : "--:--"}
                    </p>
                  </div>
                  <div className="p-4 hover:bg-slate-50/30 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-xl border shadow-sm ${session.clock_out_time ? 'bg-orange-50 text-orange-500 border-orange-100/50' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                        <LogOut size={14} strokeWidth={2.5} />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Out</span>
                    </div>
                    <p className={`text-xl font-black leading-none tabular-nums tracking-tighter ml-1 ${session.clock_out_time ? 'text-slate-900' : 'text-slate-300'}`}>
                      {session.clock_out_time ? session.clock_out_time.substring(0, 5) : "--:--"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          {sessions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Activity className="text-slate-300 mb-2" size={24} />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Belum ada sesi absensi</p>
            </div>
          )}
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
