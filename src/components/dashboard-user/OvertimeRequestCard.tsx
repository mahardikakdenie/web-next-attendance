"use client";

import { useState } from "react";
import { Clock, MessageSquare, Send, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { requestOvertime } from "@/service/overtime";
import { toast } from "sonner";
import { useRefresh } from "@/lib/RefreshContext";

export function OvertimeRequestCard() {
  const [loading, setLoading] = useState(false);
  const { triggerRefresh } = useRefresh();
  const [formData, setFormData] = useState({
    date: "",
    start_time: "",
    end_time: "",
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.start_time || !formData.end_time || !formData.reason) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      await requestOvertime(formData);
      toast.success("Overtime request submitted successfully.");
      setFormData({
        date: "",
        start_time: "",
        end_time: "",
        reason: "",
      });
      triggerRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit overtime request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full rounded-[32px] border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-neutral-900 tracking-tight">Claim Overtime</h2>
          <p className="text-sm font-medium text-neutral-400">Record your extra working hours.</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <Clock size={24} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Date</label>
          <input 
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full h-12 px-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-900 focus:bg-white transition-all outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Start Time</label>
            <input 
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              className="w-full h-12 px-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-900 focus:bg-white transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">End Time</label>
            <input 
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              className="w-full h-12 px-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-900 focus:bg-white transition-all outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Work Description</label>
          <div className="relative">
            <MessageSquare className="absolute left-4 top-4 text-neutral-300" size={18} />
            <textarea 
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="What tasks did you complete during these hours?"
              className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-medium text-neutral-700 focus:bg-white focus:border-blue-500/20 transition-all outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
            <Info size={14} />
            <span className="text-[10px] font-bold uppercase">Auto-calculated</span>
          </div>
          <Button 
            disabled={loading}
            className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 h-12 rounded-xl flex items-center gap-2 shadow-lg active:scale-95 transition-all"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            <span className="font-bold">Claim Hours</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
