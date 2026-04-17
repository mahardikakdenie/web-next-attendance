"use client";

import { useState, useMemo } from "react";
import { 
  Building2, 
  CreditCard, 
  FileText, 
  Download, 
  PlusCircle, 
  MinusCircle, 
  ShieldCheck, 
  Info,
  Calendar,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { PayslipPDFDocument } from "@/components/ui/PayslipPDFDocument";
import { Button } from "@/components/ui/Button";
import dayjs from "dayjs";
import Image from "next/image";

export default function MyPayrollTab() {
  const { user } = useAuthStore();
  const [selectedPeriod, setSelectedPeriod] = useState(dayjs().format("YYYY-MM"));

  // MOCK DATA for Preview (Since BE is not ready)
  const mockResult = useMemo(() => ({
    net_salary: 8500000,
    breakdown: {
      earnings: {
        basic_salary: 7000000,
        fixed_allowances: 1500000,
        variable_allowances: 500000,
        overtime_pay: 250000,
        gross_income: 9250000,
      },
      deductions: {
        pph21_amount: 350000,
        bpjs_health_employee: 120000,
        bpjs_jht_employee: 180000,
        bpjs_jp_employee: 100000,
        unpaid_leave_deduction: 0,
        total_deductions: 750000
      },
      employer_contributions: {
        total_employer_cost: 10500000,
        bpjs_health_company: 480000,
        bpjs_jht_company: 370000,
        bpjs_jp_company: 200000,
        bpjs_jkk: 50000,
        bpjs_jkm: 30000,
      }
    }
  }), []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 px-4 md:px-0">
      
      {/* 1. FINANCIAL INFORMATION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bank Account */}
        <div className="bg-white p-6 rounded-4xl border border-neutral-200 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Bank Account</p>
            <h4 className="text-lg font-black text-neutral-900 mt-1">Bank Central Asia</h4>
            <p className="text-sm font-bold text-neutral-500 mt-0.5">8830-1234-5678</p>
            <p className="text-[10px] font-bold text-neutral-400 uppercase mt-2">A/N {user?.name}</p>
          </div>
        </div>

        {/* Social Security */}
        <div className="bg-white p-6 rounded-4xl border border-neutral-200 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Social Security (BPJS)</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-neutral-400">Health:</span>
                <span className="text-neutral-900">0001234567890</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-neutral-400">Pension:</span>
                <span className="text-neutral-900">190234567891</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tax Information */}
        <div className="bg-white p-6 rounded-4xl border border-neutral-200 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Tax Information</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-neutral-400">NPWP:</span>
                <span className="text-neutral-900">01.234.567.8-901.000</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-neutral-400">PTKP Status:</span>
                <span className="text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded text-[10px]">{user?.ptkp_status || "TK/0"}</span>
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

          <PDFDownloadLink
            document={
              <PayslipPDFDocument 
                data={{
                  grossIncome: mockResult.breakdown.earnings.gross_income,
                  pph21Amount: mockResult.breakdown.deductions.pph21_amount,
                  netSalary: mockResult.net_salary,
                  totalDeductions: mockResult.breakdown.deductions.total_deductions,
                  totalCompanyCost: mockResult.breakdown.employer_contributions.total_employer_cost,
                  breakdown: {
                    proratedBasic: mockResult.breakdown.earnings.basic_salary,
                    fixedAllowances: mockResult.breakdown.earnings.fixed_allowances,
                    variableAllowances: mockResult.breakdown.earnings.variable_allowances,
                    unpaidLeaveDeduction: mockResult.breakdown.deductions.unpaid_leave_deduction,
                    overtimePay: mockResult.breakdown.earnings.overtime_pay,
                    grossIncome: mockResult.breakdown.earnings.gross_income,
                    pph21Amount: mockResult.breakdown.deductions.pph21_amount,
                    terRate: 0,
                    bpjs: {
                      health: {
                        employee: mockResult.breakdown.deductions.bpjs_health_employee,
                        company: mockResult.breakdown.employer_contributions.bpjs_health_company
                      },
                      jht: {
                        employee: mockResult.breakdown.deductions.bpjs_jht_employee,
                        company: mockResult.breakdown.employer_contributions.bpjs_jht_company
                      },
                      jp: {
                        employee: mockResult.breakdown.deductions.bpjs_jp_employee,
                        company: mockResult.breakdown.employer_contributions.bpjs_jp_company
                      },
                      jkk: mockResult.breakdown.employer_contributions.bpjs_jkk,
                      jkm: mockResult.breakdown.employer_contributions.bpjs_jkm
                    }
                  }
                }} 
                companyName={user?.tenant?.name || "Company Organization"} 
                logo={user?.tenant?.tenant_settings?.tenant_logo}
                ptkp={user?.ptkp_status || "TK/0"}
                period={dayjs(selectedPeriod).format("MMMM YYYY")}
                employeeName={user?.name}
                employeeRole={user?.department}
              />
            }
            fileName={`payslip-${user?.name?.replace(/\s+/g, '_')}-${selectedPeriod}.pdf`}
          >
            {({ loading }) => (
              <Button disabled={loading} className="w-full bg-indigo-600 text-white h-14 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20">
                <Download size={20} />
                <span>{loading ? "Preparing PDF..." : "Export Official Slip"}</span>
              </Button>
            )}
          </PDFDownloadLink>
        </div>

        {/* RIGHT: DIGITAL PREVIEW */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden relative">
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
                  {user?.tenant?.tenant_settings?.tenant_logo ? (
                    <div className="relative h-12 w-32">
                      <Image
                        src={user.tenant.tenant_settings.tenant_logo} 
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
                    <h2 className="text-xl font-black text-slate-900">{user?.tenant?.name || "Company Organization"}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Monthly Earnings Statement</p>
                  </div>
                </div>
                <div className="text-left sm:text-right space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Statement Date</p>
                  <p className="text-sm font-bold text-slate-900">{dayjs().format('D MMMM YYYY')}</p>
                  <p className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block uppercase mt-2">Status: {user?.ptkp_status || 'TK/0'}</p>
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
                      <span className="text-sm font-bold text-slate-900">{formatCurrency(mockResult.breakdown.earnings.basic_salary)}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-slate-700">Allowances (Fixed)</p>
                      <span className="text-sm font-bold text-slate-900">{formatCurrency(mockResult.breakdown.earnings.fixed_allowances)}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-700">Allowances (Daily)</p>
                        <p className="text-[10px] text-slate-400 font-medium italic">Meal & Transport</p>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{formatCurrency(mockResult.breakdown.earnings.variable_allowances)}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-700">Overtime Pay</p>
                        <p className="text-[10px] text-slate-400 font-medium italic">Approved hours</p>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{formatCurrency(mockResult.breakdown.earnings.overtime_pay)}</span>
                    </div>
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
                      <span className="text-sm font-bold text-rose-600">-{formatCurrency(mockResult.breakdown.deductions.pph21_amount)}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-700">BPJS Social Security</p>
                        <p className="text-[10px] text-slate-400 font-medium italic">Employee Share</p>
                      </div>
                      <span className="text-sm font-bold text-rose-600">
                        -{formatCurrency(
                          mockResult.breakdown.deductions.bpjs_health_employee + 
                          mockResult.breakdown.deductions.bpjs_jht_employee + 
                          mockResult.breakdown.deductions.bpjs_jp_employee
                        )}
                      </span>
                    </div>
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
                    {formatCurrency(mockResult.net_salary)}
                  </h3>
                </div>
              </div>

              <div className="pt-4 text-center">
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">Computer Generated Document • Confidential</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
