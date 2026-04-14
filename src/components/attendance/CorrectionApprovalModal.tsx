"use client";

import { useState } from "react";
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Loader2, 
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { approveCorrection, rejectCorrection } from "@/service/attendance";
import { AttendanceCorrectionData } from "@/types/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correction: AttendanceCorrectionData;
  mode: 'APPROVE' | 'REJECT';
}

export default function CorrectionApprovalModal({ open, onClose, onSuccess, correction, mode }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const payload = { admin_notes: adminNotes };
      const resp = mode === 'APPROVE' 
        ? await approveCorrection(correction.id, payload)
        : await rejectCorrection(correction.id, payload);

      if (resp.success) {
        toast.success(`Request ${mode.toLowerCase()}d successfully`);
        onSuccess();
        onClose();
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { meta?: { message?: string } } } };
      const msg = axiosError?.response?.data?.meta?.message || `Failed to ${mode.toLowerCase()} request`;
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  const isApprove = mode === 'APPROVE';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-500 border border-white ring-1 ring-slate-200/60">
        
        {/* Header */}
        <div className={`relative overflow-hidden p-8 text-white shrink-0 ${isApprove ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg">
                {isApprove ? <CheckCircle2 size={24} strokeWidth={2.5} /> : <XCircle size={24} strokeWidth={2.5} />}
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight leading-none">{isApprove ? 'Approve' : 'Reject'} Request</h2>
                <p className="text-white/70 font-bold text-xs mt-2 uppercase tracking-widest">Attendance Correction Review</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-white/10 rounded-2xl transition-all text-white/50 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="space-y-6">
            
            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400">Employee</span>
                <span className="text-sm font-bold text-slate-900">{correction.user?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400">Date</span>
                <span className="text-sm font-bold text-slate-900">{correction.date}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/60">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">New Clock In</span>
                  <span className="text-sm font-black text-emerald-600">{correction.clock_in_time}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">New Clock Out</span>
                  <span className="text-sm font-black text-orange-600">{correction.clock_out_time}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Employee Reason</span>
                <p className="text-xs font-medium text-slate-600 leading-relaxed italic">&quot;{correction.reason}&quot;</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={14} className="text-blue-600" />
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin Notes (Optional)</label>
              </div>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 text-slate-400 w-4 h-4" />
                <textarea 
                  className="w-full min-h-[100px] pl-12 pr-5 py-4 rounded-2xl text-[15px] font-medium transition-all duration-300 ease-out outline-none placeholder:text-neutral-400 bg-white border border-neutral-200 shadow-sm hover:border-neutral-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:shadow-md text-neutral-900"
                  placeholder="Provide feedback or justification for this decision..."
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex gap-4 mt-8">
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
              className={`flex-1 h-14 rounded-2xl text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 border-none
                ${isApprove ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {isApprove ? <CheckCircle2 size={20} strokeWidth={2.5} /> : <XCircle size={20} strokeWidth={2.5} />}
                  <span className="font-black uppercase tracking-widest text-xs">Confirm {isApprove ? 'Approval' : 'Rejection'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
