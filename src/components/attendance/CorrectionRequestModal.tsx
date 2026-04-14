"use client";

import { useState } from "react";
import { 
  X, 
  Clock, 
  Calendar as CalendarIcon, 
  FileEdit, 
  MessageSquare, 
  Loader2, 
  Send,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { toast } from "sonner";
import { submitCorrection } from "@/service/attendance";
import { AttendanceCorrectionPayload } from "@/types/api";
import dayjs from "dayjs";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    attendance_id?: string;
    date?: string;
    clock_in_time?: string;
    clock_out_time?: string;
  };
}

export default function CorrectionRequestModal({ open, onClose, onSuccess, initialData }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AttendanceCorrectionPayload>({
    attendance_id: initialData?.attendance_id || "",
    date: initialData?.date || dayjs().format("YYYY-MM-DD"),
    clock_in_time: initialData?.clock_in_time || "08:00:00",
    clock_out_time: initialData?.clock_out_time || "17:00:00",
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Future date validation
    if (dayjs(formData.date).isAfter(dayjs(), 'day')) {
      toast.error("You cannot request correction for a future date.");
      return;
    }

    try {
      setIsLoading(true);
      const resp = await submitCorrection(formData);
      if (resp.success) {
        toast.success("Correction request submitted successfully");
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          attendance_id: "",
          date: dayjs().format("YYYY-MM-DD"),
          clock_in_time: "08:00:00",
          clock_out_time: "17:00:00",
          reason: "",
        });
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { meta?: { message?: string } } } };
      const msg = axiosError?.response?.data?.meta?.message || "Failed to submit correction request";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-500 border border-white ring-1 ring-slate-200/50">
        
        {/* Header */}
        <div className="relative overflow-hidden bg-slate-900 p-8 text-white shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <FileEdit size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight leading-none">Correction</h2>
                <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-widest">Adjust your attendance logs</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="space-y-6">
            
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Request Details</span>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Attendance Date</label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input 
                  required
                  type="date"
                  max={dayjs().format("YYYY-MM-DD")}
                  className="pl-12"
                  value={formData.date}
                  onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">New Clock In</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input 
                    required
                    type="time"
                    step="1"
                    className="pl-12"
                    value={formData.clock_in_time}
                    onChange={e => setFormData(prev => ({ ...prev, clock_in_time: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">New Clock Out</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input 
                    required
                    type="time"
                    step="1"
                    className="pl-12"
                    value={formData.clock_out_time}
                    onChange={e => setFormData(prev => ({ ...prev, clock_out_time: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Reason for Correction</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 text-slate-400 w-4 h-4" />
                <textarea 
                  required
                  className="w-full min-h-[120px] pl-12 pr-5 py-4 rounded-2xl text-[15px] font-medium transition-all duration-300 ease-out outline-none placeholder:text-neutral-400 bg-white border border-neutral-200 shadow-sm hover:border-neutral-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:shadow-md text-neutral-900"
                  placeholder="Explain why you need this correction (e.g., forgot to clock out, system error)..."
                  value={formData.reason}
                  onChange={e => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex gap-4 mt-10">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 h-14 rounded-2xl font-black text-sm text-slate-500 hover:bg-slate-100 transition-all uppercase tracking-widest"
            >
              Cancel
            </button>
            <Button 
              disabled={isLoading}
              type="submit"
              className="flex-1 h-14 rounded-2xl bg-amber-500 text-white hover:bg-amber-600 transition-all shadow-xl shadow-amber-200 active:scale-95 flex items-center justify-center gap-2 border-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send size={20} strokeWidth={2.5} />
                  <span className="font-black uppercase tracking-widest text-xs">Submit Request</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
