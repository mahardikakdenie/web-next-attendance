"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Calendar, 
  ArrowRight, 
  History,
  Clock} from "lucide-react";
import { getAttendanceHistory } from "@/service/attendance";
import { AttendanceHistory } from "@/types/api";
import { useRefresh } from "@/lib/RefreshContext";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { useIsMobile } from "@/hooks/useIsMobile";

export function RecentAttendance() {
  const [history, setHistory] = useState<AttendanceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshKey } = useRefresh();
  const isMobile = useIsMobile();

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAttendanceHistory(5);
      setHistory(res.data.splice(0, 5));
    } catch (error) {
      console.error("Failed to fetch attendance history", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchHistory();
    });
  }, [fetchHistory, refreshKey]);

  if (loading) {
    return (
      <div className="w-full bg-white rounded-3xl md:rounded-[40px] border border-slate-100 p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-48 bg-slate-50 animate-pulse rounded-lg" />
          <div className="h-8 w-24 bg-slate-50 animate-pulse rounded-lg" />
        </div>
        <TableSkeleton rows={5} cols={4} />
      </div>
    );
  }

  const renderMobileView = () => (
    <div className="flex flex-col gap-4 p-2">
      {history?.length === 0 ? (
        <div className="py-12 text-center text-sm font-medium text-slate-400">
          No records found.
        </div>
      ) : (
        history?.map((row) => (
          <div key={row.id} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                <Calendar size={14} className="text-blue-500" />
                {row.date}
              </div>
              <Badge className={`border-none px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                row.status === "On Time" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
              }`}>
                {row.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                   <Clock size={10} className="text-emerald-500" /> In
                </p>
                <p className="text-sm font-black text-slate-900">{row.clock_in || "--:--"}</p>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                   <Clock size={10} className="text-orange-500" /> Out
                </p>
                <p className="text-sm font-black text-slate-900">{row.clock_out || "--:--"}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="w-full bg-white rounded-3xl md:rounded-[40px] border border-slate-100 shadow-sm overflow-hidden transition-all">
      <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <History size={20} />
          </div>
          <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Recent Attendance</h2>
        </div>
        <button className="flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-wider text-blue-600 hover:text-blue-700 transition-colors">
          <span className="hidden sm:inline">View Full Logs</span>
          <span className="sm:hidden">Full Logs</span>
          <ArrowRight size={14} strokeWidth={3} />
        </button>
      </div>

      {isMobile ? renderMobileView() : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Clock In</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Clock Out</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {history?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-sm font-medium text-slate-400">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                history?.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <Calendar size={14} className="text-slate-300" />
                        {row.date}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {row.clock_in || "--:--"}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm font-black text-slate-900">
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
