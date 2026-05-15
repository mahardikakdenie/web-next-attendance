"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  CalendarDays, 
  Loader2, 
  Save,
  AlertCircle,
  Sparkles,
  Calendar
} from "lucide-react";
import Input from "@/components/ui/Input";
import { updateLeaveQuota } from "@/service/leave";
import { toast } from "sonner";

interface LeaveQuotaModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeId: number;
  employeeName: string;
}

export default function LeaveQuotaModal({ 
  open, 
  onClose, 
  onSuccess, 
  employeeId, 
  employeeName 
}: LeaveQuotaModalProps) {
  const [annualQuota, setAnnualQuota] = useState<string>("12");
  const [specialQuota, setSpecialQuota] = useState<string>("0");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Update Annual Leave
      await updateLeaveQuota(employeeId, {
        balance: Number(annualQuota),
        is_special: false
      });

      // Update Special Leave if set
      if (Number(specialQuota) > 0) {
        await updateLeaveQuota(employeeId, {
          balance: Number(specialQuota),
          is_special: true
        });
      }

      toast.success(`Leave quotas for ${employeeName} updated successfully`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update leave quotas");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
        <form onSubmit={handleSubmit}>
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-sm">
                  <CalendarDays size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">Leave Quota</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Management System</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={onClose} 
                className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-rose-600 shadow-xs border border-rose-50 font-black text-sm">
                  {employeeName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 leading-tight">{employeeName}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">Employee ID: #{employeeId}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* Annual Leave */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                    <Calendar size={12} /> Annual Cuti Quota (Days)
                  </label>
                  <div className="relative group">
                    <Input 
                      type="number"
                      required
                      value={annualQuota}
                      onChange={(e) => setAnnualQuota(e.target.value)}
                      className="h-14 px-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-base font-black text-slate-900 focus:border-rose-600 focus:bg-white transition-all outline-none"
                      placeholder="12"
                    />
                  </div>
                </div>

                {/* Special Leave */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2 text-indigo-500">
                    <Sparkles size={12} /> Special Cuti Quota (Days)
                  </label>
                  <div className="relative group">
                    <Input 
                      type="number"
                      required
                      value={specialQuota}
                      onChange={(e) => setSpecialQuota(e.target.value)}
                      className="h-14 px-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-base font-black text-slate-900 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight ml-1 italic">
                    * Special quota for pilgrimage, marriage, etc.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-50 flex gap-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all bg-white border border-slate-200"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin text-white" size={18} />
              ) : (
                <Save size={18} strokeWidth={2.5} />
              )}
              <span>Update Quotas</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
