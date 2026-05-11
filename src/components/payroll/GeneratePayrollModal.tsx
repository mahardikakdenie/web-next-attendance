"use client";

import React, { useState } from "react";
import { 
  X, 
  Loader2, 
  Info, 
  CheckCircle2, 
  AlertTriangle 
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Select from "@/components/ui/Select";

interface GeneratePayrollModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: { 
    run_type: string; 
    method: string;
    bonus: number;
    incentives: number;
  }) => void;
  isPending: boolean;
  period: string;
  selectedCount: number;
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
  period,
  selectedCount
}: GeneratePayrollModalProps) {
  const [runType, setRunType] = useState("Regular");
  const [method, setMethod] = useState("Gross");
  const [bonus, setBonus] = useState<number>(0);
  const [incentives, setIncentives] = useState<number>(0);

  const handleNumberInput = (val: string, setter: (v: number) => void) => {
    const num = parseInt(val.replace(/[^0-9]/g, ""), 10);
    setter(isNaN(num) ? 0 : num);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Generate Payroll</h3>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{period}</p>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <p className="text-xs font-black text-blue-600 uppercase tracking-widest">
                {selectedCount > 0 ? `${selectedCount} Selected` : "All Employees"}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-transparent hover:border-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bonus</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">Rp</span>
                  <input 
                    type="text"
                    value={bonus.toLocaleString("id-ID")}
                    onChange={(e) => handleNumberInput(e.target.value, setBonus)}
                    className="w-full h-11 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Incentives</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">Rp</span>
                  <input 
                    type="text"
                    value={incentives.toLocaleString("id-ID")}
                    onChange={(e) => handleNumberInput(e.target.value, setIncentives)}
                    className="w-full h-11 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
                  />
                </div>
              </div>
            </div>
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
              Akan membuat draft slip gaji untuk {selectedCount > 0 ? `${selectedCount} karyawan terpilih` : "seluruh karyawan aktif"} di periode ini.
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
            onClick={() => onConfirm({ run_type: runType, method, bonus, incentives })}
            disabled={isPending}
            className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20"
          >
            {isPending ? (
              <Loader2 className="animate-spin" size={18} />
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
