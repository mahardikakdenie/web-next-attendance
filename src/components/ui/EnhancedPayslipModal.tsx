"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Download, CalendarDays, X, Wallet, ShieldCheck, Printer, Building2, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { PayslipPDFDocument } from "./PayslipPDFDocument";

// --- DYNAMIC IMPORTS TO PREVENT SSR ERRORS ---
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

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
    className={`flex items-end gap-2 py-2 text-[13px] ${
      isBold ? "font-black text-slate-900" : "font-semibold text-slate-500"
    }`}
  >
    <span className="shrink-0">{label}</span>
    <div className="flex-1 border-b border-dashed border-slate-200 mb-1.5" />
    <span
      className={`shrink-0 ${
        isDeduction && value !== "Rp 0" ? "text-rose-500" : "text-slate-900"
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl shadow-slate-900/20 overflow-hidden animate-in zoom-in-95 duration-500 border border-white ring-1 ring-slate-200/50">
        
        {/* TOP BANNER / HEADER */}
        <div className="relative overflow-hidden bg-slate-900 p-8 sm:p-10 text-white">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-blue-500 opacity-20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-indigo-500 opacity-10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black tracking-widest uppercase">
                <ShieldCheck size={14} className="text-blue-400" />
                Confidential Document
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight leading-none">Salary Slip</h2>
                <p className="text-slate-400 font-bold text-sm mt-2 flex items-center gap-2">
                  <CalendarDays size={14} />
                  Period: {selectedPeriod}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowSlipPreview(null)}
              className="p-3 hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* CONTENT BODY */}
        <div className="p-8 sm:p-10 bg-slate-50/30 space-y-8">
          <div className="flex flex-col sm:flex-row gap-6 justify-between">
            <div className="flex items-center gap-5">
              <div className="relative w-16 h-16 shrink-0 shadow-xl shadow-slate-200">
                <Image
                  src={selectedEmployeeSlip.avatar || "https://via.placeholder.com/150"}
                  alt={selectedEmployeeSlip.name}
                  fill
                  className="rounded-[24px] border-4 border-white object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 leading-tight">
                  {selectedEmployeeSlip.name}
                </h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                  {selectedEmployeeSlip.role}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-black px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100 uppercase">
                    PTKP: {selectedEmployeeSlip.ptkp}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right flex flex-col justify-center">
               <div className="flex items-center sm:justify-end gap-2 text-slate-900 font-black">
                  <Building2 size={16} className="text-slate-400" />
                  <span>Attendance Pro</span>
               </div>
               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Enterprise Solutions Ltd.
               </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-200/60" />

            <div className="space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Wallet size={16} strokeWidth={2.5} />
                </div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                  Earnings
                </h4>
              </div>
              <div className="space-y-1">
                <SlipRow label="Basic Salary" value={formatCurrency(selectedEmployeeSlip.basic)} />
                <SlipRow label="Fixed Allowances" value={formatCurrency(selectedEmployeeSlip.allowance)} />
                <SlipRow label="Incentives" value={formatCurrency(0)} />
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <SlipRow
                    label="Gross Income"
                    value={formatCurrency(selectedEmployeeSlip.breakdown.grossIncome)}
                    isBold
                  />
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Printer size={16} strokeWidth={2.5} />
                </div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                  Deductions
                </h4>
              </div>
              <div className="space-y-1">
                <SlipRow label="Income Tax (PPh 21)" value={formatCurrency(selectedEmployeeSlip.breakdown.pph21Amount)} isDeduction />
                <SlipRow label="BPJS Social Security" value={formatCurrency(totalBpjsEmployee)} isDeduction />
                {selectedEmployeeSlip.unpaidLeave > 0 && (
                  <SlipRow
                    label={`Unpaid Leave (${selectedEmployeeSlip.unpaidLeave}d)`}
                    value={formatCurrency(selectedEmployeeSlip.breakdown.unpaidLeaveDeduction)}
                    isDeduction
                  />
                )}
                <div className="pt-4 mt-4 border-t border-slate-100">
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

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative bg-slate-900 rounded-[32px] p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              
              <div className="text-center sm:text-left">
                <p className="text-[11px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">
                  Total Take Home Pay
                </p>
                <h3 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  {formatCurrency(selectedEmployeeSlip.netSalary)}
                </h3>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                {isMounted && (
                  <PDFDownloadLink
                    document={
                      <PayslipPDFDocument 
                        selectedPeriod={selectedPeriod} 
                        selectedEmployeeSlip={selectedEmployeeSlip} 
                      />
                    }
                    fileName={`payslip-${selectedEmployeeSlip.name.replace(/\s+/g, '_')}-${selectedPeriod.replace(/\s+/g, '_')}.pdf`}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-8 h-14 font-black shadow-xl shadow-blue-600/30 transition-all active:scale-95 text-xs uppercase tracking-widest"
                  >
                    {({ loading }) => (
                      <>
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download size={18} strokeWidth={3} />}
                        <span>{loading ? "Preparing..." : "Export PDF"}</span>
                      </>
                    )}
                  </PDFDownloadLink>
                )}
              </div>
            </div>
          </div>

          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            This is an electronically generated document. No signature is required. <br />
            Attendance Management System © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
