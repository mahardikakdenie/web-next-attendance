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
          <div key={row.id} className="bg-slate-50/50 rounded-3xl p-4 border border-slate-100 flex flex-col gap-4 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Calendar size={12} />
                </div>
                {row.date}
              </div>
              <Badge className={`border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                row.status === "On Time" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              }`}>
                {row.status}
              </Badge>
            </div>
            
            <div className="flex flex-col gap-2 relative">
              {row.sessions && row.sessions.length > 0 ? (
                row.sessions.map((session, idx) => (
                  <div key={session.id || idx} className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:border-blue-100 transition-colors">
                    {row.sessions!.length > 1 && (
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-500 opacity-50" />
                    )}
                    <div className="flex items-center justify-between mb-3 pl-1">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{row.sessions!.length > 1 ? `Session ${idx + 1}` : 'Attendance Log'}</span>
                    </div>
                    <div className="flex items-center gap-3 pl-1">
                      <div className="flex-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> In
                        </p>
                        <p className="text-sm font-black text-slate-900">{session.clock_in_time || "--:--"}</p>
                      </div>
                      <div className="w-[1px] h-8 bg-slate-100" />
                      <div className="flex-1 pl-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" /> Out
                        </p>
                        <p className="text-sm font-black text-slate-900">{session.clock_out_time || "--:--"}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:border-blue-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> In
                      </p>
                      <p className="text-sm font-black text-slate-900">{row.clock_in || "--:--"}</p>
                    </div>
                    <div className="w-[1px] h-8 bg-slate-100" />
                    <div className="flex-1 pl-3">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" /> Out
                      </p>
                      <p className="text-sm font-black text-slate-900">{row.clock_out || "--:--"}</p>
                    </div>
                  </div>
                </div>
              )}
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
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 rounded-l-2xl">Date</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">Attendance Logs</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 rounded-r-2xl">Status</th>
              </tr>
            </thead>
            <tbody className="">
              {history?.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-12 text-center text-sm font-medium text-slate-400 bg-white rounded-2xl">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                history?.map((row) => (
                  <tr key={row.id} className="group transition-all duration-300 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)]">
                    <td className="px-8 py-5 bg-white rounded-l-2xl border-y border-l border-slate-100 group-hover:border-blue-100 transition-colors">
                      <div className="flex items-center gap-3 text-sm font-black text-slate-700">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                          <Calendar size={14} />
                        </div>
                        {row.date}
                      </div>
                    </td>
                    <td className="px-8 py-5 bg-white border-y border-slate-100 group-hover:border-y-blue-100 transition-colors">
                      <div className="flex flex-wrap items-center gap-2">
                        {row.sessions && row.sessions.length > 0 ? (
                          row.sessions.map((session, idx) => (
                            <div key={session.id || idx} className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-full px-3 py-1.5 transition-colors">
                              <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[11px] font-black text-slate-700">{session.clock_in_time || "--:--"}</span>
                              </div>
                              <ArrowRight size={10} strokeWidth={3} className="text-slate-300" />
                              <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                                <span className="text-[11px] font-black text-slate-700">{session.clock_out_time || "--:--"}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full px-3 py-1.5">
                            <div className="flex items-center gap-1.5">
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                              <span className="text-[11px] font-black text-slate-700">{row.clock_in || "--:--"}</span>
                            </div>
                            <ArrowRight size={10} strokeWidth={3} className="text-slate-300" />
                            <div className="flex items-center gap-1.5">
                              <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                              <span className="text-[11px] font-black text-slate-700">{row.clock_out || "--:--"}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 bg-white rounded-r-2xl border-y border-r border-slate-100 group-hover:border-blue-100 transition-colors">
                      <Badge className={`border-none px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
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
