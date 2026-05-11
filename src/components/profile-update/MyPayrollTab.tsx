"use client";

import { useState } from "react";
import { 
  Wallet, 
  Download, 
  History, 
  AlertCircle, 
  Loader2,
  Calendar,
  FileText,
  Building2,
  Receipt,
  Banknote,
  Percent,
  PlusCircle,
  MinusCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useQuery } from "@tanstack/react-query";
import { getMyPayrollSlip, getMyPayrollHistory } from "@/service/payroll";
import { PayrollRecord, PayrollCalculationResult } from "@/types/api";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import { PayslipPDFDocument } from "@/components/ui/PayslipPDFDocument";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/store/auth.store";

// --- DYNAMIC PDF DOWNLOAD LINK ---
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

export default function MyPayrollTab() {
  const { user } = useAuthStore();
  const [selectedPeriod, setSelectedPeriod] = useState(dayjs().format("YYYY-MM"));

  const { data: slipResponse, isLoading: isSlipLoading, isError: isSlipError } = useQuery({
    queryKey: ["my-payroll-slip", selectedPeriod],
    queryFn: () => getMyPayrollSlip(selectedPeriod),
    retry: false,
  });

  const slip = slipResponse?.data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Helper to map record breakdown to PDF document format (v2 snake_case)
  const getPdfData = (): PayrollCalculationResult | null => {
    if (!slip) return null;
    return {
      gross_income: slip.breakdown.earnings.gross_income,
      pph21_amount: slip.breakdown.deductions.pph21_amount,
      net_salary: slip.net_salary,
      total_deductions: slip.breakdown.deductions.total_deductions,
      total_employer_cost: slip.breakdown.employer_contributions?.total_employer_cost || 0,
      run_type: slip.run_type,
      method: slip.method,
      breakdown: {
        prorated_basic: slip.breakdown.earnings.basic_salary,
        fixed_allowances: slip.breakdown.earnings.fixed_allowances,
        variable_allowances: slip.breakdown.earnings.variable_allowances,
        unpaid_leave_deduction: slip.breakdown.deductions.unpaid_leave_deduction,
        overtime_pay: slip.breakdown.earnings.overtime_pay,
        incentives: slip.breakdown.earnings.incentives,
        gross_income: slip.breakdown.earnings.gross_income,
        pph21_amount: slip.breakdown.deductions.pph21_amount,
        tax_allowance: slip.breakdown.earnings.tax_allowance,
        bpjs_allowance: slip.breakdown.earnings.bpjs_allowance,
        thr: slip.breakdown.earnings.thr,
        bonus: slip.breakdown.earnings.bonus,
        ter_rate: 0,
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

  const { data: historyResp } = useQuery({
    queryKey: ["my-payroll-history"],
    queryFn: () => getMyPayrollHistory({ limit: 5 }),
  });

  const history = historyResp?.data || [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500 pb-20">
      
      {/* Left side: Current Month Focus */}
      <div className="xl:col-span-8 space-y-8">
        
        {/* Period Header */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                 <Calendar size={24} />
              </div>
              <div>
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Statement Period</h3>
                 <p className="text-xl font-black text-slate-700">{dayjs(selectedPeriod).format("MMMM YYYY")}</p>
              </div>
           </div>

           <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl">
              <Button 
                variant="ghost" 
                className="h-10 w-10 p-0 rounded-xl"
                onClick={() => setSelectedPeriod(prev => dayjs(prev).subtract(1, 'month').format("YYYY-MM"))}
              >
                <ChevronLeft size={18} />
              </Button>
              <span className="text-xs font-black text-slate-500 min-w-[100px] text-center uppercase tracking-tighter">Switch Month</span>
              <Button 
                variant="ghost" 
                className="h-10 w-10 p-0 rounded-xl"
                onClick={() => setSelectedPeriod(prev => dayjs(prev).add(1, 'month').format("YYYY-MM"))}
              >
                <ChevronRight size={18} />
              </Button>
           </div>
        </div>

        {isSlipLoading ? (
           <div className="bg-white rounded-[2.5rem] p-20 flex flex-col items-center justify-center space-y-6 border border-slate-100 shadow-sm">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
              <div className="text-center">
                 <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Fetching Secure Data</p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Verifying your identification...</p>
              </div>
           </div>
        ) : isSlipError || !slip ? (
           <div className="bg-white rounded-[2.5rem] p-20 flex flex-col items-center justify-center space-y-6 border border-slate-100 shadow-sm grayscale opacity-60">
              <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-300">
                 <AlertCircle size={40} />
              </div>
              <div className="text-center max-w-xs">
                 <h4 className="text-lg font-black text-slate-900 uppercase">No Slip Found</h4>
                 <p className="text-xs font-medium text-slate-500 mt-2">Payroll for this period hasn&apos;t been published yet or is still being processed.</p>
              </div>
              <Button variant="secondary" className="rounded-xl px-8" onClick={() => setSelectedPeriod(dayjs().format("YYYY-MM"))}>Current Month</Button>
           </div>
        ) : (
           <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              {/* Premium Slip Preview */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-900/5 overflow-hidden">
                 
                 {/* Decorative Header */}
                 <div className="h-2 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600" />

                 <div className="p-8 sm:p-12 space-y-12">
                    {/* Slip Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
                       <div className="space-y-4">
                          <div className="relative h-10 w-24 grayscale opacity-80">
                             {slip.company_context.logo_url ? (
                               <img src={slip.company_context.logo_url} alt="Logo" className="h-full object-contain object-left" />
                             ) : <Building2 size={24} className="text-slate-300" />}
                          </div>
                          <div>
                             <h2 className="text-xl font-black text-slate-900">{slip.company_context.name}</h2>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Monthly E-Statement</p>
                          </div>
                       </div>
                       <div className="text-left sm:text-right">
                          <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase px-3 py-1 mb-3">Published</Badge>
                          <p className="text-sm font-black text-slate-900">{slip.user.full_name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{slip.user.position}</p>
                       </div>
                    </div>

                    {/* Breakdown Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative">
                       <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-100 -translate-x-1/2 border-dashed border-l" />

                       {/* Earnings */}
                       <div className="space-y-6">
                          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                             <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                                <PlusCircle size={18} strokeWidth={2.5} />
                             </div>
                             <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Earnings</h4>
                          </div>
                          <div className="space-y-4">
                             <div className="flex justify-between items-start">
                                <p className="text-sm font-bold text-slate-700">Basic Salary</p>
                                <span className="text-sm font-black text-slate-900">{formatCurrency(slip.breakdown.earnings.basic_salary)}</span>
                             </div>
                             <div className="flex justify-between items-start">
                                <p className="text-sm font-bold text-slate-700">Fixed Allowances</p>
                                <span className="text-sm font-black text-slate-900">{formatCurrency(slip.breakdown.earnings.fixed_allowances)}</span>
                             </div>
                             {slip.breakdown.earnings.overtime_pay > 0 && (
                                <div className="flex justify-between items-start">
                                   <p className="text-sm font-bold text-slate-700">Overtime Pay</p>
                                   <span className="text-sm font-black text-slate-900">{formatCurrency(slip.breakdown.earnings.overtime_pay)}</span>
                                </div>
                             )}
                             {slip.breakdown.earnings.incentives > 0 && (
                                <div className="flex justify-between items-start">
                                   <p className="text-sm font-bold text-slate-700">Incentives</p>
                                   <span className="text-sm font-black text-slate-900">{formatCurrency(slip.breakdown.earnings.incentives)}</span>
                                </div>
                             )}
                          </div>
                       </div>

                       {/* Deductions */}
                       <div className="space-y-6">
                          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                             <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-sm">
                                <MinusCircle size={18} strokeWidth={2.5} />
                             </div>
                             <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Deductions</h4>
                          </div>
                          <div className="space-y-4">
                             <div className="flex justify-between items-start text-rose-600 font-bold">
                                <p className="text-sm">Income Tax (PPh 21)</p>
                                <span className="text-sm">-{formatCurrency(slip.breakdown.deductions.pph21_amount)}</span>
                             </div>
                             <div className="flex justify-between items-start text-rose-600 font-bold">
                                <p className="text-sm">BPJS Security</p>
                                <span className="text-sm">-{formatCurrency(
                                   slip.breakdown.deductions.bpjs_health_employee + 
                                   slip.breakdown.deductions.bpjs_jht_employee + 
                                   slip.breakdown.deductions.bpjs_jp_employee
                                )}</span>
                             </div>
                             {slip.breakdown.deductions.unpaid_leave_deduction > 0 && (
                                <div className="flex justify-between items-start text-rose-600 font-bold">
                                   <p className="text-sm">Unpaid Leave</p>
                                   <span className="text-sm">-{formatCurrency(slip.breakdown.deductions.unpaid_leave_deduction)}</span>
                                </div>
                             )}
                          </div>
                       </div>
                    </div>

                    {/* Net Total */}
                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                       <div className="text-center md:text-left space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Take Home Pay</p>
                          <p className="text-xs font-medium text-slate-400">Sent to {slip.user.bank_name} • {slip.user.bank_account_number}</p>
                       </div>
                       <div className="flex flex-col items-center md:items-end">
                          <h3 className="text-4xl font-black text-indigo-600 tracking-tighter tabular-nums mb-4">{formatCurrency(slip.net_salary)}</h3>
                          <PDFDownloadLink
                             document={<PayslipPDFDocument data={getPdfData()!} companyName={slip.company_context.name} logo={slip.company_context.logo_url} ptkp={slip.user.ptkp_status} period={slip.period_text} employeeName={slip.user.full_name} employeeRole={slip.user.position} />}
                             fileName={`payslip-${selectedPeriod}.pdf`}
                          >
                             {({ loading }) => (
                               <Button disabled={loading} className="rounded-xl h-11 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-200">
                                  {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Download size={16} className="mr-2" />}
                                  {loading ? "Generating..." : "Download PDF Slip"}
                               </Button>
                             )}
                          </PDFDownloadLink>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>

      {/* Right side: History & Profile Overview */}
      <div className="xl:col-span-4 space-y-6">
         <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
               <History size={16} className="text-indigo-600" />
               Recent History
            </h3>
            <div className="space-y-3">
               {history.map((record) => (
                  <button 
                    key={record.id}
                    onClick={() => setSelectedPeriod(dayjs(record.period_text).format("YYYY-MM"))}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-all text-left group"
                  >
                     <div className="space-y-0.5">
                        <p className="text-xs font-black text-slate-900">{dayjs(record.period_text).format("MMMM YYYY")}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{record.net_salary > 0 ? formatCurrency(record.net_salary) : "N/A"}</p>
                     </div>
                     <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                        <ChevronRight size={14} strokeWidth={3} />
                     </div>
                  </button>
               ))}
               {history.length === 0 && (
                  <p className="text-xs font-medium text-slate-400 text-center py-4 italic">No history available</p>
               )}
            </div>
         </section>

         <section className="bg-slate-950 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 opacity-20 rounded-full blur-3xl" />
            <div className="relative z-10 space-y-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                     <ShieldCheck className="text-blue-400" size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight">Tax Compliance</h3>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Employee Verification</p>
                  </div>
               </div>
               <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black text-slate-500 uppercase">PTKP Status</span>
                     <span className="text-xs font-black text-blue-400">{user?.ptkp_status || "TK/0"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black text-slate-500 uppercase">NPWP Registered</span>
                     <CheckCircle2 size={14} className="text-emerald-500" />
                  </div>
               </div>
               <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                  Your calculations follow the latest PP 58/2023 (TER) regulations.
               </p>
            </div>
         </section>
      </div>

    </div>
  );
}
