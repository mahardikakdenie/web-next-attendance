"use client";

import { useState } from "react";
import { Clock, MessageSquare, Send, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { submitCorrection } from "@/service/attendance";
import { toast } from "sonner";
import { useRefresh } from "@/lib/RefreshContext";

export function AttendanceRequestCard() {
  const [loading, setLoading] = useState(false);
  const { triggerRefresh } = useRefresh();
  const [formData, setFormData] = useState({
    date: "",
    type: "clock_in" as "clock_in" | "clock_out" | "both",
    clock_in_time: "",
    clock_out_time: "",
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date || !formData.reason) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if ((formData.type === "clock_in" || formData.type === "both") && !formData.clock_in_time) {
      toast.error("Clock In time is required.");
      return;
    }

    if ((formData.type === "clock_out" || formData.type === "both") && !formData.clock_out_time) {
      toast.error("Clock Out time is required.");
      return;
    }

    try {
      setLoading(true);

      // Backend expects HH:mm:ss format, HTML inputs provide HH:mm
      const formatTime = (timeStr: string) => {
        if (!timeStr) return undefined;
        return timeStr.length === 5 ? `${timeStr}:00` : timeStr;
      };

      await submitCorrection({
        date: formData.date,
        type: formData.type,
        clock_in_time: formatTime(formData.clock_in_time),
        clock_out_time: formatTime(formData.clock_out_time),
        reason: formData.reason,
      });

      toast.success("Attendance correction request submitted successfully.");
      setFormData({
        date: "",
        type: "clock_in",
        clock_in_time: "",
        clock_out_time: "",
        reason: "",
      });
      triggerRefresh();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to submit attendance request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full rounded-[2rem] sm:rounded-4xl border border-neutral-200 bg-white p-5 sm:p-8 shadow-sm flex flex-col">
      {/* HEADER */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Manual Attendance Request</h2>
          <p className="text-sm font-medium text-neutral-400">Request attendance corrections or manual clock in/out.</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
          <Clock size={24} />
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
        {/* Date Selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Date</label>
          <div className="relative">
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
            />
          </div>
        </div>

        {/* Type Selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Request Type</label>
          <div className="relative">
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as "clock_in" | "clock_out" | "both",
                  clock_in_time: e.target.value === "clock_out" ? "" : formData.clock_in_time,
                  clock_out_time: e.target.value === "clock_in" ? "" : formData.clock_out_time,
                })
              }
              className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="clock_in">Clock In Only</option>
              <option value="clock_out">Clock Out Only</option>
              <option value="both">Both (Clock In & Out)</option>
            </select>
          </div>
        </div>

        {/* Times Selectors */}
        <div className="flex flex-col sm:flex-row gap-4">
          {(formData.type === "clock_in" || formData.type === "both") && (
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Clock In Time</label>
              <input
                type="time"
                value={formData.clock_in_time}
                onChange={(e) => setFormData({ ...formData, clock_in_time: e.target.value })}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
              />
            </div>
          )}

          {(formData.type === "clock_out" || formData.type === "both") && (
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Clock Out Time</label>
              <input
                type="time"
                value={formData.clock_out_time}
                onChange={(e) => setFormData({ ...formData, clock_out_time: e.target.value })}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
              />
            </div>
          )}
        </div>

        {/* Reason Textarea */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Reason</label>
          <div className="relative">
            <MessageSquare className="absolute left-4 top-4 text-slate-300" size={18} />
            <textarea
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Provide a detailed reason for this manual attendance request..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-neutral-700 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all outline-none resize-none min-h-[100px]"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-auto pt-4">
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-xl w-fit">
            <Info size={14} />
            <span className="text-[10px] font-black uppercase tracking-wider">Subject to Approval</span>
          </div>
          <Button
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all w-full sm:w-auto"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            <span className="font-bold">Submit Request</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
