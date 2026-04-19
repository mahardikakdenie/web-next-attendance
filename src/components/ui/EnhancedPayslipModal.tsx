"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Download, X, PlusCircle, MinusCircle, Building2, Loader2, Receipt } from "lucide-react";
import dynamic from "next/dynamic";
import { PayslipPDFDocument } from "./PayslipPDFDocument";
import { PayrollRecord } from "@/types/api";
import { useAuthStore } from "@/store/auth.store";

// --- DYNAMIC IMPORTS TO PREVENT SSR ERRORS ---
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

interface PayslipModalProps {
  showSlipPreview: boolean;
  setShowSlipPreview: (show: boolean) => void;
  selectedPeriod: string;
  selectedEmployeeSlip: PayrollRecord | null;
}

export default function EnhancedPayslipModal({
  showSlipPreview,
  setShowSlipPreview,
  selectedPeriod,
  selectedEmployeeSlip,
}: PayslipModalProps) {
  const { user } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!showSlipPreview || !selectedEmployeeSlip) return null;

  const formatCurrency = (amount: number | undefined) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const totalBpjsEmployee =
    (selectedEmployeeSlip.breakdown?.deductions?.bpjs_health_employee || 0) +
    (selectedEmployeeSlip.breakdown?.deductions?.bpjs_jht_employee || 0) +
    (selectedEmployeeSlip.breakdown?.deductions?.bpjs_jp_employee || 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-slate-100 shadow-2xl shadow-slate-900/20 animate-in zoom-in-95 duration-500 hide-scrollbar">
        
        <button
          onClick={() => setShowSlipPreview(false)}
          className="absolute top-4 right-4 z-50 p-2 bg-slate-200/50 hover:bg-slate-200 rounded-full transition-all text-slate-500 hover:text-slate-700 backdrop-blur-sm"
        >
          <X size={20} />
        </button>

        <div className="p-4 sm:p-8 space-y-6">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative">
            
            {/* Perforated Edge Effect */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-slate-50 flex items-center justify-around px-4">
              {[...Array(40)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-slate-200 -mt-1" />
              ))}
            </div>

            <div className="p-8 sm:p-12 space-y-12">
              {/* Slip Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mt-2">
                <div className="space-y-4">
                  {selectedEmployeeSlip.company_context?.logo_url || user?.tenant?.tenant_settings?.tenant_logo ? (
                    <div className="relative h-12 w-32">
                      <Image
                        src={selectedEmployeeSlip.company_context?.logo_url || user?.tenant?.tenant_settings?.tenant_logo || ""} 
                        alt="Logo" 
                        fill
                        className="object-contain object-left" 
                        sizes="128px"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                      <Building2 size={24} />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-black text-slate-900">{selectedEmployeeSlip.company_context?.name || user?.tenant?.name || "Company"}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Monthly Earnings Statement</p>
                  </div>
                </div>
                <div className="text-left sm:text-right space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee Info</p>
                  <p className="text-sm font-bold text-slate-900">{selectedEmployeeSlip.user?.full_name}</p>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{selectedEmployeeSlip.user?.position}</p>
                  <p className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block uppercase mt-2">
                    Status: {selectedEmployeeSlip.user?.ptkp_status || '-'} • Period: {selectedEmployeeSlip.period_text || selectedPeriod}
                  </p>
                </div>
              </div>

              {/* Slip Body */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative">
                {/* Vertical Separator */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-100 -translate-x-1/2 border-dashed border-l" />

                {/* Earnings */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <div className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                      <PlusCircle size={14} />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Earnings</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-700">Basic Salary</p>
                        <p className="text-[10px] text-slate-400 font-medium italic">Prorated for attendance</p>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{formatCurrency(selectedEmployeeSlip.breakdown?.earnings?.basic_salary)}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-slate-700">Allowances (Fixed)</p>
                      <span className="text-sm font-bold text-slate-900">{formatCurrency(selectedEmployeeSlip.breakdown?.earnings?.fixed_allowances)}</span>
                    </div>
                    {selectedEmployeeSlip.breakdown?.earnings?.variable_allowances > 0 && (
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-slate-700">Allowances (Daily)</p>
                          <p className="text-[10px] text-slate-400 font-medium italic">Meal & Transport</p>
                        </div>
                        <span className="text-sm font-bold text-slate-900">{formatCurrency(selectedEmployeeSlip.breakdown?.earnings?.variable_allowances)}</span>
                      </div>
                    )}
                    {selectedEmployeeSlip.breakdown?.earnings?.overtime_pay > 0 && (
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-slate-700">Overtime Pay</p>
                          <p className="text-[10px] text-slate-400 font-medium italic">Extra hours calculated</p>
                        </div>
                        <span className="text-sm font-bold text-slate-900">{formatCurrency(selectedEmployeeSlip.breakdown?.earnings?.overtime_pay)}</span>
                      </div>
                    )}
                     {selectedEmployeeSlip.breakdown?.earnings?.incentives > 0 && (
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-slate-700">Incentives</p>
                        <span className="text-sm font-bold text-slate-900">{formatCurrency(selectedEmployeeSlip.breakdown?.earnings?.incentives)}</span>
                      </div>
                    )}
                    {selectedEmployeeSlip.breakdown?.earnings?.bonus > 0 && (
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-slate-700">Bonus</p>
                        <span className="text-sm font-bold text-slate-900">{formatCurrency(selectedEmployeeSlip.breakdown?.earnings?.bonus)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <div className="w-6 h-6 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600">
                      <MinusCircle size={14} />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Deductions</h4>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-700">Income Tax (PPh 21)</p>
                        <p className="text-[10px] text-slate-400 font-medium italic">Calculated from TER bracket</p>
                      </div>
                      <span className="text-sm font-bold text-rose-600">-{formatCurrency(selectedEmployeeSlip.breakdown?.deductions?.pph21_amount)}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-700">BPJS Social Security</p>
                        <p className="text-[10px] text-slate-400 font-medium italic">JHT, JP & Health Share</p>
                      </div>
                      <span className="text-sm font-bold text-rose-600">-{formatCurrency(totalBpjsEmployee)}</span>
                    </div>
                    {selectedEmployeeSlip.breakdown?.deductions?.unpaid_leave_deduction > 0 && (
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-slate-700">Unpaid Leave</p>
                          <p className="text-[10px] text-slate-400 font-medium italic">Attendance adjustment</p>
                        </div>
                        <span className="text-sm font-bold text-rose-600">-{formatCurrency(selectedEmployeeSlip.breakdown?.deductions?.unpaid_leave_deduction)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Perforated Divider */}
              <div className="border-t-2 border-dashed border-slate-100 relative mt-4">
                <div className="absolute -left-12 -top-3 w-6 h-6 rounded-full bg-slate-50 border border-slate-100" />
                <div className="absolute -right-12 -top-3 w-6 h-6 rounded-full bg-slate-50 border border-slate-100" />
              </div>

              {/* Total Section */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-slate-50/50 p-6 sm:p-8 rounded-[2rem] border border-slate-100">
                <div className="space-y-1 text-center md:text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Net Take Home Pay</p>
                  <p className="text-sm font-medium text-slate-500 italic">Transferred to registered account</p>
                </div>
                <div className="text-center md:text-right flex-1 flex flex-col md:items-end w-full">
                  <h3 className="text-4xl sm:text-5xl font-black text-indigo-600 tracking-tighter tabular-nums mb-4">
                    {formatCurrency(selectedEmployeeSlip.net_salary)}
                  </h3>
                  
                  {isMounted && (
                  <PDFDownloadLink
                    document={
                      <PayslipPDFDocument 
                        data={{
                          grossIncome: selectedEmployeeSlip.breakdown?.earnings?.gross_income,
                          pph21Amount: selectedEmployeeSlip.breakdown?.deductions?.pph21_amount,
                          netSalary: selectedEmployeeSlip.net_salary,
                          totalDeductions: selectedEmployeeSlip.breakdown?.deductions?.total_deductions,
                          totalCompanyCost: selectedEmployeeSlip.breakdown?.employer_contributions?.total_employer_cost,
                          breakdown: {
                            proratedBasic: selectedEmployeeSlip.breakdown?.earnings?.basic_salary,
                            fixedAllowances: selectedEmployeeSlip.breakdown?.earnings?.fixed_allowances,
                            variableAllowances: selectedEmployeeSlip.breakdown?.earnings?.variable_allowances,
                            unpaidLeaveDeduction: selectedEmployeeSlip.breakdown?.deductions?.unpaid_leave_deduction,
                            overtimePay: selectedEmployeeSlip.breakdown?.earnings?.overtime_pay,
                            grossIncome: selectedEmployeeSlip.breakdown?.earnings?.gross_income,
                            pph21Amount: selectedEmployeeSlip.breakdown?.deductions?.pph21_amount,
                            terRate: 0,
                            bpjs: {
                              health: { 
                                employee: selectedEmployeeSlip.breakdown?.deductions?.bpjs_health_employee, 
                                company: selectedEmployeeSlip.breakdown?.employer_contributions?.bpjs_health_company 
                              },
                              jht: { 
                                employee: selectedEmployeeSlip.breakdown?.deductions?.bpjs_jht_employee, 
                                company: selectedEmployeeSlip.breakdown?.employer_contributions?.bpjs_jht_company 
                              },
                              jp: { 
                                employee: selectedEmployeeSlip.breakdown?.deductions?.bpjs_jp_employee, 
                                company: selectedEmployeeSlip.breakdown?.employer_contributions?.bpjs_jp_company 
                              },
                              jkk: selectedEmployeeSlip.breakdown?.employer_contributions?.bpjs_jkk,
                              jkm: selectedEmployeeSlip.breakdown?.employer_contributions?.bpjs_jkm
                            }
                          }
                        }}
                        companyName={selectedEmployeeSlip.company_context?.name || user?.tenant?.name || "Attendance Pro"}
                        logo={selectedEmployeeSlip.company_context?.logo_url || user?.tenant?.tenant_settings?.tenant_logo}
                        ptkp={selectedEmployeeSlip.user?.ptkp_status || '-'}
                        period={selectedEmployeeSlip.period_text || selectedPeriod}
                        employeeName={selectedEmployeeSlip.user?.full_name}
                        employeeRole={selectedEmployeeSlip.user?.position}
                      />
                    }
                    fileName={`payslip-${selectedEmployeeSlip.user?.full_name?.replace(/\s+/g, '_')}-${selectedPeriod.replace(/\s+/g, '_')}.pdf`}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-bold shadow-md shadow-indigo-600/20 transition-all w-full md:w-auto"
                  >
                    {({ loading }) => (
                      <>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download size={18} strokeWidth={2.5} />}
                        <span>{loading ? "Preparing PDF..." : "Download PDF"}</span>
                      </>
                    )}
                  </PDFDownloadLink>
                )}
                </div>
              </div>

              <div className="pt-2 text-center">
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">Computer Generated Document • Confidential</p>
              </div>
            </div>
          </div>

          {/* Secondary Info Layout */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-2">
              <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <Building2 size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employer Cost</p>
                <p className="text-base font-black text-slate-900">{formatCurrency(selectedEmployeeSlip.breakdown?.employer_contributions?.total_employer_cost)}</p>
              </div>
            </div>
            <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-2">
              <div className="w-8 h-8 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                <Receipt size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Deductions</p>
                <p className="text-base font-black text-slate-900">{formatCurrency(selectedEmployeeSlip.breakdown?.deductions?.total_deductions)}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

