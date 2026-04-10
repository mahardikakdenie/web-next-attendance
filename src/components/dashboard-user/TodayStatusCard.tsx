"use client";

import { useEffect, useState, useCallback } from "react";
import { LogIn, LogOut, Timer, Activity } from "lucide-react";
import { getTodayAttendance } from "@/service/attendance";
import { AttendanceToday } from "@/types/api";
import { useRefresh } from "@/lib/RefreshContext";
import { Skeleton } from "@/components/ui/Skeleton";
import dayjs from "dayjs";

const getBadgeClassName = (status: string) => {
  if (status === "On Time") return "bg-emerald-50 text-emerald-600 border border-emerald-100/50";
  if (status === "Late") return "bg-amber-50 text-amber-600 border border-amber-100/50";
  if (status === "Absent") return "bg-rose-50 text-rose-600 border border-rose-100/50";
  return "bg-neutral-50 text-neutral-500 border border-neutral-200/50";
};

export default function TodayStatusCard() {
  const [data, setData] = useState<AttendanceToday | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<dayjs.Dayjs | null>(null);
  const { refreshKey } = useRefresh();

  // Fetch API
  const fetchTodayStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTodayAttendance();
      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch today attendance", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    setNow(dayjs());
    fetchTodayStatus();
  }, [fetchTodayStatus, refreshKey]);

  // Interval untuk menghitung durasi live (update setiap 1 menit)
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(dayjs());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Logika Kalkulasi Manual
  const calculateDuration = () => {
    return data?.duration;
  };

  const durationText = calculateDuration();
  const status = data?.status || "No Record";
  const isWorking = data?.clock_in_time && !data?.clock_out_time;

  if (loading || !mounted || !now) {
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
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider shadow-sm ${getBadgeClassName(status)}`}>
          <div className="h-1.5 w-1.5 rounded-full bg-current" />
          {status}
        </div>
      </div>

      {/* Grid Clock In & Out */}
      <div className="grid grid-cols-2 gap-3.5 grow">
        {/* Clock In Card */}
        <div className="flex flex-col justify-between rounded-[20px] border border-blue-100/60 bg-linear-to-br from-blue-50/80 to-blue-100/30 p-4 transition-all hover:bg-blue-50">
          <div className="flex items-start justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm border border-blue-100/50">
              <LogIn size={18} strokeWidth={2.5} />
            </div>
            {data?.clock_in_time && (
              <span className="rounded-md bg-blue-100/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Done
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold tracking-tight text-neutral-900">
              {data?.clock_in_time ? data.clock_in_time : "--:--"}
            </p>
            <p className="mt-0.5 text-xs font-medium text-neutral-500">Clock In</p>
          </div>
        </div>

        {/* Clock Out Card */}
        <div className={`flex flex-col justify-between rounded-[20px] border p-4 transition-all ${
          data?.clock_out_time 
            ? "border-orange-100/60 bg-linear-to-br from-orange-50/80 to-orange-100/30 hover:bg-orange-50" 
            : "border-neutral-100 bg-neutral-50/50"
        }`}>
          <div className="flex items-start justify-between">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-sm border ${
              data?.clock_out_time
                ? "bg-white text-orange-500 border-orange-100/50"
                : "bg-white text-neutral-400 border-neutral-100"
            }`}>
              <LogOut size={18} strokeWidth={2.5} />
            </div>
            {data?.clock_out_time && (
              <span className="rounded-md bg-orange-100/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-600">
                Done
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className={`text-2xl font-bold tracking-tight ${
                data?.clock_out_time ? "text-neutral-900" : "text-neutral-300"
              }`}
            >
              {data?.clock_out_time ? data.clock_out_time : "--:--"}
            </p>
            <p className={`mt-0.5 text-xs font-medium ${
                data?.clock_out_time ? "text-neutral-500" : "text-neutral-400"
              }`}
            >
              Clock Out
            </p>
          </div>
        </div>
      </div>

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
            data?.clock_out_time ? "text-neutral-500" : isWorking ? "text-emerald-600" : "text-neutral-400"
          }`}>
            {data?.clock_out_time ? "Finished" : isWorking ? "Working" : "Not Started"}
          </span>
        </div>
      </div>
    </div>
  );
}
