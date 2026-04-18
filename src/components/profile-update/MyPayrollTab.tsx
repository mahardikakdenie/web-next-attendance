"use client";

import { useState } from "react";
import { 
  Building2, 
  CreditCard, 
  FileText, 
  PlusCircle, 
  MinusCircle, 
  ShieldCheck, 
  Info,
  Calendar,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import dayjs from "dayjs";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getMyPayrollProfile, getMyPayrollSlip } from "@/service/payroll";
import { PayrollCalculationResult } from "@/types/api";

const DynamicPDFDownload = dynamic(() => import("@/components/payroll/DynamicPDFDownload"), {
  ssr: false,
  loading: () => (
    <Button disabled className="w-full bg-slate-100 text-slate-400 h-14 rounded-2xl font-black flex items-center justify-center gap-2">
      <Loader2 className="animate-spin" size={20} />
      <span>Loading PDF Engine...</span>
    </Button>
  )
});

export default function MyPayrollTab() {
  const { user } = useAuthStore();
  const [selectedPeriod, setSelectedPeriod] = useState(dayjs().format("YYYY-MM"));

  // 1. Fetch Payroll Profile (Bank, BPJS, NPWP)
  const { data: profileResponse, isLoading: profileLoading } = useQuery({
    queryKey: ["my-payroll-profile"],
    queryFn: getMyPayrollProfile,
  });

  const profile = profileResponse?.data;

  // 2. Fetch Slip for Selected Period
  const { data: slipResponse, isLoading: slipLoading, isError: slipError } = useQuery({
    queryKey: ["my-payroll-slip", selectedPeriod],
    queryFn: () => getMyPayrollSlip(selectedPeriod),
    retry: false, // Don't retry if slip not found for that period
  });

  const slip = slipResponse?.data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Helper to map record breakdown to PDF document format
  const getPdfData = (): PayrollCalculationResult | null => {
    if (!slip) return null;
    return {
      grossIncome: slip.breakdown.earnings.gross_income,
      pph21Amount: slip.breakdown.deductions.pph21_amount,
      netSalary: slip.net_salary,
      totalDeductions: slip.breakdown.deductions.total_deductions,
      totalCompanyCost: slip.breakdown.employer_contributions?.total_employer_cost || 0,
      breakdown: {
        proratedBasic: slip.breakdown.earnings.basic_salary,
        fixedAllowances: slip.breakdown.earnings.fixed_allowances,
        variableAllowances: slip.breakdown.earnings.variable_allowances,
        unpaidLeaveDeduction: slip.breakdown.deductions.unpaid_leave_deduction,
        overtimePay: slip.breakdown.earnings.overtime_pay,
        grossIncome: slip.breakdown.earnings.gross_income,
        pph21Amount: slip.breakdown.deductions.pph21_amount,
        terRate: 0, // Not provided in detail breakdown currently
        bpjs: {
          health: {
            employee: slip.breakdown.deductions.bpjs_health_employee,
            company: slip.breakdown.employer_contributions?.bpjs_health_company || 0
          },
          jht: {
            employee: slip.breakdown.deductions.bpjs_jht_employee,
            company: slip.breakdown.employer_contributions?.bpjs_jht_company || 0
          },
          jp: {
            employee: slip.breakdown.deductions.bpjs_jp_employee,
            company: slip.breakdown.employer_contributions?.bpjs_jp_company || 0
          },
          jkk: slip.breakdown.employer_contributions?.bpjs_jkk || 0,
          jkm: slip.breakdown.employer_contributions?.bpjs_jkm || 0
        }
      }
    };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 px-4 md:px-0">
      
      {/* 1. FINANCIAL INFORMATION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bank Account */}
        <div className="bg-white p-6 rounded-4xl border border-neutral-200 shadow-sm space-y-4 relative overflow-hidden">
          {profileLoading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10"><Loader2 className="animate-spin text-blue-600" /></div>}
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Bank Account</p>
            <h4 className="text-lg font-black text-neutral-900 mt-1">{profile?.bank_name || "N/A"}</h4>
            <p className="text-sm font-bold text-neutral-500 mt-0.5">{profile?.bank_account_number || "No account linked"}</p>
            <p className="text-[10px] font-bold text-neutral-400 uppercase mt-2">A/N {profile?.bank_account_holder || user?.name}</p>
          </div>
        </div>

        {/* Social Security */}
        <div className="bg-white p-6 rounded-4xl border border-neutral-200 shadow-sm space-y-4 relative overflow-hidden">
          {profileLoading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10"><Loader2 className="animate-spin text-emerald-600" /></div>}
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Social Security (BPJS)</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-neutral-400">Health:</span>
                <span className="text-neutral-900">{profile?.bpjs_health_number || "-"}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-neutral-400">Pension:</span>
                <span className="text-neutral-900">{profile?.bpjs_employment_number || "-"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tax Information */}
        <div className="bg-white p-6 rounded-4xl border border-neutral-200 shadow-sm space-y-4 relative overflow-hidden">
          {profileLoading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10"><Loader2 className="animate-spin text-amber-600" /></div>}
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Tax Information</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-neutral-400">NPWP:</span>
                <span className="text-neutral-900">{profile?.npwp_number || "-"}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-neutral-400">PTKP Status:</span>
                <span className="text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded text-[10px]">{profile?.ptkp_status || user?.ptkp_status || "TK/0"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SLIP PREVIEW SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: PERIOD SELECTOR & SUMMARY */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-blue-400" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Select Period</h3>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Viewing Month</label>
                <input 
                  type="month" 
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full h-14 px-5 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white focus:bg-white/10 focus:border-blue-500/50 transition-all outline-none cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Slips are generated every 25th of the month. If you don&#39;t see your slip, please contact Finance.
              </p>
            </div>
          </div>

          <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex gap-4">
            <Info className="text-blue-600 shrink-0" size={20} />
            <div className="space-y-1">
              <p className="text-xs font-black text-blue-900 uppercase tracking-tight">Need a correction?</p>
              <p className="text-[11px] text-blue-800/70 font-medium leading-relaxed">
                If you find any discrepancy in your earnings or deductions, please use the &#34;Request Profile Update&ldquo; tab to update your financial data.
              </p>
            </div>
          </div>

          {slip && (
            <DynamicPDFDownload 
              data={getPdfData()!} 
              companyName={slip.company_context?.name || user?.tenant?.name || "Company Organization"} 
              logo={slip.company_context?.logo_url || user?.tenant?.tenant_settings?.tenant_logo}
              ptkp={slip.user.ptkp_status || "TK/0"}
              period={slip.period_text || dayjs(selectedPeriod).format("MMMM YYYY")}
              employeeName={slip.user.full_name || user?.name}
              employeeRole={slip.user.position || user?.department}
              fileName={`payslip-${slip.user.full_name?.replace(/\s+/g, '_') || user?.name?.replace(/\s+/g, '_')}-${selectedPeriod}.pdf`}
            />
          )}
        </div>

        {/* RIGHT: DIGITAL PREVIEW */}
        <div className="lg:col-span-8">
          {slipLoading ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 h-[600px] flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Retrieving Statement...</p>
            </div>
          ) : slipError || !slip ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 h-[600px] flex flex-col items-center justify-center p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300">
                <AlertCircle size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">Statement Not Found</h3>
                <p className="text-sm font-medium text-slate-400 max-w-xs mx-auto">
                  We couldn&#39;t find a payroll record for {dayjs(selectedPeriod).format("MMMM YYYY")}. Slips are usually published after the 25th.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden relative animate-in zoom-in-95 duration-500">
              {/* Perforated Edge Effect */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-50 flex items-center justify-around px-4">
                {[...Array(40)].map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-slate-200 -mt-1" />
                ))}
              </div>

              <div className="p-10 sm:p-16 space-y-12">
                {/* Slip Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
                  <div className="space-y-4">
                    {slip.company_context?.logo_url || user?.tenant?.tenant_settings?.tenant_logo ? (
                      <div className="relative h-12 w-32">
                        <Image
                          src={slip.company_context?.logo_url || user?.tenant?.tenant_settings?.tenant_logo || ""} 
                          alt="Logo" 
                          fill
                          className="object-contain object-left" 
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                        <Building2 size={24} />
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-black text-slate-900">{slip.company_context?.name || user?.tenant?.name || "Company Organization"}</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Monthly Earnings Statement</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Statement Date</p>
                    <p className="text-sm font-bold text-slate-900">{slip.period_text || dayjs().format('D MMMM YYYY')}</p>
                    <p className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block uppercase mt-2">Status: {slip.user.ptkp_status || 'TK/0'}</p>
                  </div>
                </div>

                {/* Slip Body */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative">
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
                          <p className="text-[10px] text-slate-400 font-medium italic">Fixed Monthly</p>
                        </div>
                        <span className="text-sm font-bold text-slate-900">{formatCurrency(slip.breakdown.earnings.basic_salary)}</span>
                      </div>
                      {slip.breakdown.earnings.fixed_allowances > 0 && (
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-bold text-slate-700">Allowances (Fixed)</p>
                          <span className="text-sm font-bold text-slate-900">{formatCurrency(slip.breakdown.earnings.fixed_allowances)}</span>
                        </div>
                      )}
                      {slip.breakdown.earnings.variable_allowances > 0 && (
                        <div className="flex justify-between items-start">
                          <div className="space-y-0.5">
                            <p className="text-sm font-bold text-slate-700">Allowances (Daily)</p>
                            <p className="text-[10px] text-slate-400 font-medium italic">Meal & Transport</p>
                          </div>
                          <span className="text-sm font-bold text-slate-900">{formatCurrency(slip.breakdown.earnings.variable_allowances)}</span>
                        </div>
                      )}
                      {slip.breakdown.earnings.overtime_pay > 0 && (
                        <div className="flex justify-between items-start">
                          <div className="space-y-0.5">
                            <p className="text-sm font-bold text-slate-700">Overtime Pay</p>
                            <p className="text-[10px] text-slate-400 font-medium italic">Approved hours</p>
                          </div>
                          <span className="text-sm font-bold text-slate-900">{formatCurrency(slip.breakdown.earnings.overtime_pay)}</span>
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
                          <p className="text-[10px] text-slate-400 font-medium italic">TER Scheme</p>
                        </div>
                        <span className="text-sm font-bold text-rose-600">-{formatCurrency(slip.breakdown.deductions.pph21_amount)}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-slate-700">BPJS Social Security</p>
                          <p className="text-[10px] text-slate-400 font-medium italic">Employee Share</p>
                        </div>
                        <span className="text-sm font-bold text-rose-600">
                          -{formatCurrency(
                            slip.breakdown.deductions.bpjs_health_employee + 
                            slip.breakdown.deductions.bpjs_jht_employee + 
                            slip.breakdown.deductions.bpjs_jp_employee
                          )}
                        </span>
                      </div>
                      {slip.breakdown.deductions.unpaid_leave_deduction > 0 && (
                         <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                              <p className="text-sm font-bold text-slate-700">Unpaid Leave</p>
                              <p className="text-[10px] text-slate-400 font-medium italic">Absence deduction</p>
                            </div>
                            <span className="text-sm font-bold text-rose-600">-{formatCurrency(slip.breakdown.deductions.unpaid_leave_deduction)}</span>
                          </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Perforated Divider */}
                <div className="border-t-2 border-dashed border-slate-100 relative">
                  <div className="absolute -left-12 -top-3 w-6 h-6 rounded-full bg-slate-50 border border-slate-100" />
                  <div className="absolute -right-12 -top-3 w-6 h-6 rounded-full bg-slate-50 border border-slate-100" />
                </div>

                {/* Total Section */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-8 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Net Take Home Pay</p>
                    <p className="text-sm font-medium text-slate-500 italic">Transferred to account</p>
                  </div>
                  <div className="text-center sm:text-right">
                    <h3 className="text-4xl sm:text-5xl font-black text-indigo-600 tracking-tighter tabular-nums">
                      {formatCurrency(slip.net_salary)}
                    </h3>
                  </div>
                </div>

                <div className="pt-4 text-center">
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">Computer Generated Document • Confidential</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
