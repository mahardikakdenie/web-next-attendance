"use client";

import React from "react";
import Image from "next/image";
import { Plus, Download, FileText, CalendarDays } from "lucide-react";
// Sesuaikan path import di bawah dengan struktur folder Anda
// import Avatar from "@/components/ui/Avatar";
// import { Button } from "@/components/ui/Button";

interface SlipBreakdown {
  grossIncome: number;
  pph21Amount: number;
  unpaidLeaveDeduction: number;
  bpjs: {
    health: { employee: number };
    jht: { employee: number };
  };
}

interface SelectedEmployeeSlip {
  id: number;
  avatar?: string;
  name: string;
  role: string;
  ptkp: string;
  basic: number;
  allowance: number;
  unpaidLeave: number;
  netSalary: number;
  breakdown: SlipBreakdown;
}

interface PayslipModalProps {
  showSlipPreview: number | null;
  setShowSlipPreview: (id: number | null) => void;
  selectedPeriod: string;
  selectedEmployeeSlip: SelectedEmployeeSlip | null;
}

// 1. PINDAHKAN KOMPONEN INI KE LUAR
const SlipRow = ({
  label,
  value,
  isDeduction = false,
  isBold = false,
}: {
  label: string;
  value: string;
  isDeduction?: boolean;
  isBold?: boolean;
}) => (
  <div
    className={`flex items-end gap-2 py-1 text-[13px] ${
      isBold ? "font-bold text-neutral-950" : "font-medium text-neutral-600"
    }`}
  >
    <span className="shrink-0">{label}</span>
    <div className="flex-1 border-b border-dotted border-neutral-300 mb-1" />
    <span
      className={`shrink-0 ${
        isDeduction ? "text-rose-600" : "text-neutral-950"
      } ${isBold ? "text-sm" : ""}`}
    >
      {isDeduction && value !== "Rp 0" ? "-" : ""}
      {value}
    </span>
  </div>
);

export default function EnhancedPayslipModal({
  showSlipPreview,
  setShowSlipPreview,
  selectedPeriod,
  selectedEmployeeSlip,
}: PayslipModalProps) {
  if (!showSlipPreview || !selectedEmployeeSlip) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalBpjsEmployee =
    selectedEmployeeSlip.breakdown.bpjs.health.employee +
    selectedEmployeeSlip.breakdown.bpjs.jht.employee;

  const totalDeductions =
    selectedEmployeeSlip.breakdown.pph21Amount +
    totalBpjsEmployee +
    (selectedEmployeeSlip.unpaidLeave > 0
      ? selectedEmployeeSlip.breakdown.unpaidLeaveDeduction
      : 0);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-neutral-950/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-neutral-100">
        {/* HEADER */}
        <div className="bg-neutral-950 p-6 sm:p-8 text-white flex justify-between items-center border-b border-neutral-800">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white border border-white/10">
              <FileText size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">
                Confidential Payslip
              </h2>
              <div className="flex items-center gap-2 text-neutral-400 font-semibold text-sm mt-1">
                <CalendarDays size={14} />
                <span>Payroll Period: {selectedPeriod}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowSlipPreview(null)}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors"
          >
            <Plus size={20} className="rotate-45" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 sm:p-8 bg-neutral-50/50">
          {/* Employee Info */}
          <div className="flex items-center gap-5 p-5 bg-white rounded-2xl border border-neutral-100 mb-8 shadow-sm">
            <Image
              src={selectedEmployeeSlip.avatar || "https://via.placeholder.com/150"}
              alt={selectedEmployeeSlip.name}
              width={64}
              height={64}
              className="rounded-2xl border-4 border-white shadow-md bg-neutral-100 object-cover"
            />
            <div>
              <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-0.5">
                Employee Details
              </p>
              <h3 className="text-xl font-black text-neutral-950">
                {selectedEmployeeSlip.name}
              </h3>
              <p className="text-sm font-semibold text-neutral-500 mt-0.5">
                {selectedEmployeeSlip.role} • PTKP:{" "}
                <span className="text-neutral-700 font-bold">
                  {selectedEmployeeSlip.ptkp}
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* EARNINGS */}
            <div className="space-y-4 bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
              <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-neutral-100">
                <div className="w-1.5 h-6 rounded-full bg-emerald-500" />
                <h4 className="text-sm font-bold text-neutral-900 tracking-tight">
                  Earnings
                </h4>
              </div>
              <div className="space-y-1">
                <SlipRow
                  label="Basic Salary"
                  value={formatCurrency(selectedEmployeeSlip.basic)}
                />
                <SlipRow
                  label="Allowances"
                  value={formatCurrency(selectedEmployeeSlip.allowance)}
                />
                <div className="pt-2 mt-2 border-t border-neutral-100">
                  <SlipRow
                    label="Gross Salary"
                    value={formatCurrency(selectedEmployeeSlip.breakdown.grossIncome)}
                    isBold
                  />
                </div>
              </div>
            </div>

            {/* DEDUCTIONS */}
            <div className="space-y-4 bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
              <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-neutral-100">
                <div className="w-1.5 h-6 rounded-full bg-rose-500" />
                <h4 className="text-sm font-bold text-neutral-900 tracking-tight">
                  Deductions
                </h4>
              </div>
              <div className="space-y-1">
                <SlipRow
                  label="PPh 21 (TER)"
                  value={formatCurrency(selectedEmployeeSlip.breakdown.pph21Amount)}
                  isDeduction
                />
                <SlipRow
                  label="BPJS (Health & JHT)"
                  value={formatCurrency(totalBpjsEmployee)}
                  isDeduction
                />
                {selectedEmployeeSlip.unpaidLeave > 0 && (
                  <SlipRow
                    label={`Unpaid Leave (${selectedEmployeeSlip.unpaidLeave} Days)`}
                    value={formatCurrency(
                      selectedEmployeeSlip.breakdown.unpaidLeaveDeduction
                    )}
                    isDeduction
                  />
                )}
                <div className="pt-2 mt-2 border-t border-neutral-100">
                  <SlipRow
                    label="Total Deductions"
                    value={formatCurrency(totalDeductions)}
                    isDeduction
                    isBold
                  />
                </div>
              </div>
            </div>
          </div>

          {/* NET SALARY */}
          <div className="bg-blue-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-blue-500/20 border border-blue-700">
            <div>
              <p className="text-[11px] font-bold text-blue-100 uppercase tracking-widest mb-1.5 shadow-sm">
                Take Home Pay
              </p>
              <h3 className="text-3xl font-extrabold tracking-tight">
                {formatCurrency(selectedEmployeeSlip.netSalary)}
              </h3>
            </div>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-white text-blue-600 hover:bg-blue-50 rounded-xl px-6 h-12 font-bold shadow-md transition-colors text-sm shrink-0">
              <Download size={18} />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
