"use client";

import { useMemo } from "react";
import { LogIn, LogOut, Timer } from "lucide-react";
import {
  formatSummaryTime,
  formatWorkingDuration,
  getTodayAttendanceSummary,
} from "@/lib/todayAttendance";
import { useAuthStore } from "@/store/auth.store";

const getBadgeClassName = (badgeLabel: string) => {
  if (badgeLabel === "Completed") {
    return "bg-emerald-50 text-emerald-600";
  }

  if (badgeLabel === "In Progress") {
    return "bg-blue-50 text-blue-600";
  }

  return "bg-neutral-100 text-neutral-500";
};

export default function TodayStatusCard() {
  const user = useAuthStore((state) => state.user);
  const summary = useMemo(() => getTodayAttendanceSummary(user), [user]);
  const clockInTime = formatSummaryTime(summary.clockIn?.time);
  const clockOutTime = formatSummaryTime(summary.clockOut?.time);

  return (
    <div className="w-full max-w-sm rounded-[28px] border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-bold text-neutral-800">Today&apos;s Summary</h2>
        <div
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${getBadgeClassName(summary.badgeLabel)}`}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-current" />
          {summary.badgeLabel}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex min-h-27.5 flex-col justify-between rounded-[20px] border border-blue-100 bg-blue-50/50 p-4">
          <div className="flex items-start justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <LogIn size={16} strokeWidth={2.5} />
            </div>
            {summary.clockIn ? (
              <span className="rounded-md bg-blue-100/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-500">
                Done
              </span>
            ) : null}
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black tracking-tight text-neutral-900">
              {clockInTime.value}{" "}
              {clockInTime.meridiem ? (
                <span className="text-xs font-bold text-neutral-500">{clockInTime.meridiem}</span>
              ) : null}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-neutral-500">Clock In</p>
          </div>
        </div>

        <div className="flex min-h-27.5 flex-col justify-between rounded-[20px] border border-neutral-100 bg-neutral-50 p-4">
          <div className="flex items-start justify-between">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                summary.clockOut
                  ? "bg-orange-100 text-orange-500"
                  : "bg-neutral-200/60 text-neutral-500"
              }`}
            >
              <LogOut size={16} strokeWidth={2.5} />
            </div>
            {summary.clockOut ? (
              <span className="rounded-md bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-500">
                Done
              </span>
            ) : null}
          </div>
          <div className="mt-3">
            <p
              className={`text-2xl font-black tracking-tight ${
                summary.clockOut ? "text-neutral-900" : "text-neutral-300"
              }`}
            >
              {clockOutTime.value}{" "}
              {clockOutTime.meridiem ? (
                <span className="text-xs font-bold text-neutral-500">{clockOutTime.meridiem}</span>
              ) : null}
            </p>
            <p
              className={`mt-0.5 text-xs font-semibold ${
                summary.clockOut ? "text-neutral-500" : "text-neutral-400"
              }`}
            >
              Clock Out
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-[20px] border border-neutral-100 bg-neutral-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700">
            <Timer size={18} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500">Working Duration</p>
            <p className="text-lg font-black tracking-tight text-neutral-900">
              {formatWorkingDuration(summary.workingMinutes)}
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-[11px] font-bold text-neutral-400">
          {summary.progressLabel}
        </div>
      </div>
    </div>
  );
}
