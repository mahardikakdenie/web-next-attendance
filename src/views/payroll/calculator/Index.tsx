"use client";

import { useState, useMemo, useCallback } from "react";
import { 
  Info, 
  Building2,
  Receipt,
  Wallet,
  Clock,
  UserCheck,
  MinusCircle,
  PlusCircle,
  Scale
} from "lucide-react";
import { 
  calculatePayroll, 
  PayrollInput 
} from "@/lib/payrollCalculator";
import Input from "@/components/ui/Input";

export default function SalaryCalculatorView() {
  const [baseSalary, setBaseSalary] = useState<number>(8000000);
  const [allowance, setAllowance] = useState<number>(1000000);
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const [ptkpStatus, setPtkpStatus] = useState<PayrollInput["ptkpStatus"]>("TK/0");
  const [unpaidLeaveDays, setUnpaidLeaveDays] = useState<number>(0);

  const result = useMemo(() => {
    return calculatePayroll({
      basicSalary: baseSalary,
      allowances: allowance,
      attendanceDays: 22 - unpaidLeaveDays,
      workingDaysInMonth: 22,
      overtimeHours: overtimeHours,
      unpaidLeaveDays: unpaidLeaveDays,
      ptkpStatus: ptkpStatus
    });
  }, [baseSalary, allowance, overtimeHours, ptkpStatus, unpaidLeaveDays]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }, []);

  const formatInputCurrency = (value: number) => {
    if (!value) return '';
    return value.toLocaleString('id-ID');
  };

  const handleNumberInput = (value: string, setter: (val: number) => void) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setter(numericValue ? parseInt(numericValue, 10) : 0);
  };

  const grossSalary = result.breakdown.grossIncome;
  const netPercentage = grossSalary > 0 ? (result.netSalary / grossSalary) * 100 : 0;
  
  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in zoom-in-95 duration-700 font-sans">
      <div className="mb-12 flex flex-col items-center text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold tracking-widest uppercase">
          <Scale size={14} />
          <span>TER 2024 Compliant</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight">
          Smart Payroll Engine
        </h1>
        <p className="text-neutral-500 font-medium max-w-xl text-lg">
          Simulasi kalkulasi gaji bersih dengan implementasi Tarif Efektif Rata-rata (TER) 2024 secara presisi.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-8">
            <section className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
                  <PlusCircle size={18} strokeWidth={2.5} />
                </div>
                <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">
                  Earnings Configuration
                </h3>
              </div>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">Base Salary (Monthly)</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-semibold group-focus-within:text-blue-600 transition-colors">Rp</span>
                    <Input 
                      type="text"
                      inputMode="numeric"
                      value={formatInputCurrency(baseSalary)}
                      onChange={(e) => handleNumberInput(e.target.value, setBaseSalary)}
                      className="w-full h-14 pl-12 pr-4 bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all rounded-xl text-lg font-bold text-neutral-900 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">Fixed Allowances</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-semibold group-focus-within:text-blue-600 transition-colors">Rp</span>
                    <Input 
                      type="text"
                      inputMode="numeric"
                      value={formatInputCurrency(allowance)}
                      onChange={(e) => handleNumberInput(e.target.value, setAllowance)}
                      className="w-full h-14 pl-12 pr-4 bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all rounded-xl text-lg font-bold text-neutral-900 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">Overtime (Hrs)</label>
                    <div className="relative group">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <Input 
                        type="number"
                        value={overtimeHours || ''}
                        onChange={(e) => setOvertimeHours(Number(e.target.value))}
                        className="w-full h-14 pl-11 pr-4 bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all rounded-xl text-lg font-bold text-neutral-900 outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">PTKP Status</label>
                    <div className="relative group">
                      <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <select 
                        value={ptkpStatus}
                        onChange={(e) => setPtkpStatus(e.target.value as PayrollInput["ptkpStatus"])}
                        className="w-full h-14 pl-11 pr-4 bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none rounded-xl text-lg font-bold text-neutral-900 transition-all appearance-none cursor-pointer"
                      >
                        {["TK/0", "TK/1", "TK/2", "TK/3", "K/0", "K/1", "K/2", "K/3"].map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                <div className="p-1.5 bg-rose-50 text-rose-600 rounded-md">
                  <MinusCircle size={18} strokeWidth={2.5} />
                </div>
                <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">
                  Deductions
                </h3>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">Unpaid Leave (Days)</label>
                <div className="relative group">
                  <Input 
                    type="number"
                    value={unpaidLeaveDays || ''}
                    onChange={(e) => setUnpaidLeaveDays(Number(e.target.value))}
                    className="w-full h-14 px-4 bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all rounded-xl text-lg font-bold text-neutral-900 outline-none"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="xl:col-span-7 space-y-6">
          <div className="bg-linear-to-br from-neutral-900 to-neutral-950 p-8 md:p-10 rounded-3xl border border-neutral-800 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-100 h-100 bg-blue-600/10 rounded-full blur-[100px] -mr-32 -mt-32 transition-all duration-700 group-hover:bg-blue-500/20" />
            
            <div className="relative z-10 space-y-10">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">Net Take Home Pay</p>
                  <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
                    {formatCurrency(result.netSalary)}
                  </h2>
                </div>
                <div className="w-14 h-14 bg-neutral-800 border border-neutral-700 rounded-2xl flex items-center justify-center shrink-0">
                  <Wallet className="text-blue-400" size={28} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Efficiency Rate</p>
                    <p className="text-xl font-bold text-white">{netPercentage.toFixed(1)}%</p>
                  </div>
                  <p className="text-sm font-semibold text-neutral-400">Gross: {formatCurrency(grossSalary)}</p>
                </div>
                <div className="h-4 w-full bg-neutral-800 rounded-full flex overflow-hidden p-0.5 border border-neutral-700">
                  <div 
                    className="h-full bg-linear-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out relative" 
                    style={{ width: `${netPercentage}%` }}
                  >
                    <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 w-full animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-neutral-800">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-wrap">PPh 21 ({result.breakdown.terRate.toFixed(2)}%)</p>
                  <p className="text-sm font-bold text-rose-400">{formatCurrency(result.breakdown.pph21Amount)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">BPJS Health</p>
                  <p className="text-sm font-bold text-amber-400">{formatCurrency(result.breakdown.bpjs.health.employee)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">BPJS TK (JHT+JP)</p>
                  <p className="text-sm font-bold text-amber-400">{formatCurrency(result.breakdown.bpjs.jht.employee + result.breakdown.bpjs.jp.employee)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Total Cut</p>
                  <p className="text-sm font-bold text-white">{formatCurrency(result.totalDeductions)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center text-rose-600">
                  <Receipt size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm tracking-wide">Personal Deductions</h4>
                  <p className="text-xs text-neutral-500 font-medium">Employee payroll cuts</p>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {[
                  { label: `PPh 21 (TER ${result.breakdown.terRate.toFixed(2)}%)`, value: result.breakdown.pph21Amount },
                  { label: "BPJS Kesehatan (1%)", value: result.breakdown.bpjs.health.employee },
                  { label: "BPJS TK JHT (2%)", value: result.breakdown.bpjs.jht.employee },
                  { label: "BPJS TK JP (1%)", value: result.breakdown.bpjs.jp.employee },
                  { label: "Unpaid Leave Deduction", value: result.breakdown.unpaidLeaveDeduction },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-neutral-600">{item.label}</span>
                    <span className="text-sm font-bold text-neutral-900">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 mt-6 border-t border-neutral-100 flex justify-between items-center">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Cut</span>
                <span className="text-lg font-bold text-rose-600">{formatCurrency(result.totalDeductions)}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 border border-blue-200 rounded-xl flex items-center justify-center text-blue-700">
                  <Building2 size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm tracking-wide">Company Cost</h4>
                  <p className="text-xs text-neutral-500 font-medium">Employer benefits & taxes</p>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {[
                  { label: "BPJS Kesehatan (4%)", value: result.breakdown.bpjs.health.company },
                  { label: "BPJS TK JHT (3.7%)", value: result.breakdown.bpjs.jht.company },
                  { label: "BPJS TK JP (2%)", value: result.breakdown.bpjs.jp.company },
                  { label: "BPJS TK JKK (0.24%)", value: result.breakdown.bpjs.jkk },
                  { label: "BPJS TK JKM (0.3%)", value: result.breakdown.bpjs.jkm },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-neutral-600">{item.label}</span>
                    <span className="text-sm font-bold text-neutral-900">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 mt-6 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Employer Cost</span>
                <span className="text-lg font-bold text-blue-700">{formatCurrency(result.totalCompanyCost)}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-3xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
              <Info size={20} />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-bold text-blue-900">Regulatory Compliance Notice (Update 2024)</p>
              <p className="text-xs text-blue-800/70 leading-relaxed font-medium">
                Kalkulasi ini menggunakan <strong>Tarif Efektif Rata-rata (TER)</strong> sesuai PP 58/2023 yang berlaku mulai 1 Januari 2024. 
                Termasuk iuran <strong>Jaminan Pensiun (JP)</strong> dengan batas atas gaji Rp 10.042.300 dan <strong>BPJS Kesehatan</strong> dengan batas atas Rp 12.000.000.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
