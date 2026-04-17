"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Coins, 
  Loader2, 
  Save,
  AlertCircle
} from "lucide-react";
import Input from "@/components/ui/Input";
import { updateUserQuota } from "@/service/finance";
import { toast } from "sonner";
import { formatCurrency } from "../finance/CreateExpenseModal";

interface QuotaModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeId: number;
  employeeName: string;
  currentQuota: number;
}

export default function QuotaModal({ 
  open, 
  onClose, 
  onSuccess, 
  employeeId, 
  employeeName,
  currentQuota 
}: QuotaModalProps) {
  const [quota, setQuota] = useState<string>(String(currentQuota));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      Promise.resolve().then(() => {
        setQuota(String(currentQuota));
      });
    }
  }, [open, currentQuota]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateUserQuota(employeeId, Number(quota));
      toast.success(`Expense quota for ${employeeName} updated successfully`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update expense quota");
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
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                  <Coins size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">Expense Quota</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Adjust monthly limit</p>
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
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-xs border border-indigo-50 font-black text-sm">
                  {employeeName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 leading-tight">{employeeName}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">Employee ID: #{employeeId}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Monthly Limit (IDR)</label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm group-focus-within:text-indigo-600 transition-colors">Rp</span>
                  <Input 
                    type="number"
                    required
                    value={quota}
                    onChange={(e) => setQuota(e.target.value)}
                    className="h-14 pl-12 pr-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-base font-black text-slate-900 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                    placeholder="5.000.000"
                  />
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-1.5 ml-1 flex items-center gap-1.5">
                  <AlertCircle size={12} className="text-indigo-500" />
                  Currently: {formatCurrency(currentQuota)}
                </p>
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
              className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin text-white" size={18} />
              ) : (
                <Save size={18} strokeWidth={2.5} />
              )}
              <span>Update Quota</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
