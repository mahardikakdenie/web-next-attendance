"use client";

import React, { useState } from "react";
import { 
  X, 
  Ban, 
  Loader2,
  ShieldAlert,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SuspendTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isSubmitting: boolean;
  tenantName: string;
}

export default function SuspendTenantModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isSubmitting,
  tenantName 
}: SuspendTenantModalProps) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl border border-white ring-1 ring-slate-200/50 overflow-hidden animate-in zoom-in-95 duration-300">
        <form onSubmit={handleSubmit} className="flex flex-col">
          
          {/* Header - Danger Theme */}
          <div className="p-8 border-b border-rose-50 flex items-center justify-between bg-rose-50/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-200">
                <Ban size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight text-rose-600">Suspend Organization</h3>
                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-1">Restrict Platform Access</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white hover:shadow-md rounded-xl text-slate-400 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6">
            
            <div className="p-5 bg-rose-50 rounded-3xl border border-rose-100 flex gap-4">
               <div className="shrink-0 w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-rose-500 shadow-sm">
                  <ShieldAlert size={20} />
               </div>
               <div className="space-y-1">
                  <p className="text-sm font-bold text-rose-700 leading-tight">Critical Action Required</p>
                  <p className="text-xs font-medium text-rose-600/80 leading-relaxed">
                    You are about to suspend <span className="font-black text-rose-700 underline underline-offset-2">{tenantName}</span>. 
                    All employees and admins will be blocked from logging in immediately.
                  </p>
               </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Official Reason for Suspension</label>
              <textarea 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full min-h-[120px] bg-slate-50 border border-slate-200 rounded-[28px] p-5 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-rose-500/5 focus:border-rose-200 outline-none transition-all placeholder:text-slate-300"
                placeholder="Ex: Continuous non-payment of subscription for 60 days, violation of terms, etc."
                required
              />
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 ml-1">
                 <Info size={12} className="text-blue-500" />
                 This reason will be displayed to the tenant on their login screen.
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-3">
            <Button 
              type="button"
              variant="secondary" 
              className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest bg-white border-slate-200 text-slate-500"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1 h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-600/20 font-black text-xs uppercase tracking-widest transition-all active:scale-95 text-white"
              disabled={isSubmitting || !reason.trim()}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Suspend Access"
              )}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
