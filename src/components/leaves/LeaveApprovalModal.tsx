"use client";

import React, { useState } from "react";
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  MessageSquare,
  Calendar,
  User,
  FileText
} from "lucide-react";
import { approveLeave, rejectLeave, LeaveRequestData } from "@/service/leave";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  leaveRequest: LeaveRequestData;
  onSuccess: () => void;
}

export default function LeaveApprovalModal({ open, onClose, leaveRequest, onSuccess }: Props) {
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: "approve" | "reject") => {
    try {
      setIsLoading(true);
      const resp = action === "approve" 
        ? await approveLeave(leaveRequest.id, notes)
        : await rejectLeave(leaveRequest.id, notes);

      if (resp.success) {
        toast.success(`Leave request ${action === "approve" ? "approved" : "rejected"} successfully`);
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error(`Failed to ${action} leave:`, error);
      toast.error(`Failed to ${action} leave request`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_0_100px_rgba(0,0,0,0.2)] border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-50 bg-slate-50/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                leaveRequest.status === 'PENDING' ? 'bg-amber-500' : 
                leaveRequest.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-rose-500'
              }`}>
                <FileText size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">Review Request</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                  ID: LV-{leaveRequest.id.toString().padStart(4, '0')}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all text-slate-400 shadow-sm border border-transparent hover:border-slate-100">
              <X size={20} />
            </button>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <User size={12} className="text-blue-500" />
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Employee</span>
              </div>
              <p className="text-sm font-black text-slate-900 truncate">{leaveRequest.user?.name || 'Unknown'}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={12} className="text-indigo-500" />
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Duration</span>
              </div>
              <p className="text-sm font-black text-slate-900">{leaveRequest.total_days} Working Days</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Submission Reason</label>
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-600 italic leading-relaxed">
              &quot;{leaveRequest.reason}&quot;
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Decision Notes (Optional)</label>
            <div className="relative">
              <MessageSquare className="absolute left-4 top-4 text-slate-400" size={18} />
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Write your feedback here..." 
                className="w-full h-28 bg-white border-2 border-slate-100 rounded-[24px] pl-12 pr-5 py-4 text-sm font-bold text-slate-900 focus:border-blue-600 transition-all outline-none resize-none" 
              />
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-8 pt-0 flex gap-4">
          <button 
            disabled={isLoading}
            onClick={() => handleAction("reject")}
            className="flex-1 h-14 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
            Reject
          </button>
          <button 
            disabled={isLoading}
            onClick={() => handleAction("approve")}
            className="flex-1 h-14 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}
