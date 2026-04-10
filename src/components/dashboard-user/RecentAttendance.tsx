"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Calendar, 
  ArrowRight, 
  History,
  MoreHorizontal
} from "lucide-react";
import { getAttendanceHistory } from "@/service/attendance";
import { AttendanceHistory } from "@/types/api";
import { useRefresh } from "@/lib/RefreshContext";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";

export function RecentAttendance() {
  const [history, setHistory] = useState<AttendanceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshKey } = useRefresh();

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAttendanceHistory(5);
      setHistory(res.data);
    } catch (error) {
      console.error("Failed to fetch attendance history", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshKey]);

  if (loading) {
    return (
      <div className="w-full bg-white rounded-4xl border border-neutral-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-48 bg-neutral-100 animate-pulse rounded-lg" />
          <div className="h-8 w-24 bg-neutral-100 animate-pulse rounded-lg" />
        </div>
        <TableSkeleton rows={5} cols={4} />
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-4xl border border-neutral-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="p-6 sm:p-8 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <History size={20} />
          </div>
          <h2 className="text-xl font-black text-neutral-900 tracking-tight">Recent Attendance</h2>
        </div>
        <button className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-blue-600 hover:text-blue-700 transition-colors">
          <span>View Full Logs</span>
          <ArrowRight size={14} strokeWidth={3} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-neutral-50/50 border-b border-neutral-100">
              <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Date</th>
              <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Clock In</th>
              <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Clock Out</th>
              <th className="px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {history.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center text-sm font-medium text-neutral-400">
                  No attendance records found.
                </td>
              </tr>
            ) : (
              history.map((row) => (
                <tr key={row.id} className="hover:bg-neutral-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-sm font-bold text-neutral-700">
                      <Calendar size={14} className="text-neutral-300" />
                      {row.date}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-sm font-black text-neutral-900">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {row.clock_in || "--:--"}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-sm font-black text-neutral-900">
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                      {row.clock_out || "--:--"}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <Badge className={`border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      row.status === "On Time" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {row.status}
                    </Badge>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-neutral-300 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
