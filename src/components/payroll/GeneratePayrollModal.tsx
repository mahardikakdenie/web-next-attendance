"use client";

import React, { useState } from "react";
import { 
  X, 
  Plus, 
  Info, 
  CheckCircle2, 
  AlertTriangle 
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Select from "@/components/ui/Select";

interface GeneratePayrollModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: { run_type: string; method: string }) => void;
  isPending: boolean;
  period: string;
}

const RUN_TYPES = [
  { label: "Gaji Reguler", value: "Regular" },
  { label: "THR", value: "THR" },
  { label: "Bonus", value: "Bonus" },
  { label: "Gabungan", value: "All" }
];

const METHODS = [
  { label: "Gross (Potong Gaji)", value: "Gross" },
  { label: "Net (Gross Up)", value: "Net" }
];

export default function GeneratePayrollModal({
  open,
  onClose,
  onConfirm,
  isPending,
  period
}: GeneratePayrollModalProps) {
  const [runType, setRunType] = useState("Regular");
  const [method, setMethod] = useState("Gross");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Generate Payroll</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Period: {period}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-transparent hover:border-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <Select
              label="Run Type"
              options={RUN_TYPES}
              value={runType}
              onChange={(val) => setRunType(String(val))}
            />
            
            <Select
              label="Tax Method"
              options={METHODS}
              value={method}
              onChange={(val) => setMethod(String(val))}
            />
          </div>

          {/* Info Card */}
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
            <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-black text-blue-900 uppercase tracking-tight">System Note</p>
              <p className="text-[11px] font-medium text-blue-700 leading-relaxed">
                {runType === 'THR' 
                  ? "Kalkulasi khusus Tunjangan Hari Raya saja. Komponen gaji reguler akan diabaikan." 
                  : method === 'Net'
                  ? "Pajak PPh 21 akan ditanggung perusahaan (Gross-Up System)."
                  : "Kalkulasi payroll standar bulanan dengan pajak dipotong dari gaji."}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle size={16} strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-widest">Confirmation Required</span>
            </div>
            <p className="text-[11px] font-bold text-amber-800 leading-tight">
              Akan membuat draft slip gaji untuk seluruh karyawan aktif di periode ini.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <Button 
            variant="secondary" 
            onClick={onClose}
            className="flex-1 h-12 rounded-2xl font-bold"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => onConfirm({ run_type: runType, method })}
            disabled={isPending}
            className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20"
          >
            {isPending ? (
              <Plus className="animate-spin" size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}
            <span>Generate Now</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
