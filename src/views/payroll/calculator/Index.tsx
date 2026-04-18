"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Building2,
  Receipt,
  Clock,
  UserCheck,
  MinusCircle,
  PlusCircle,
  Scale,
  Printer,
  AlertCircle,
  Calendar,
  Users,
  Save,
  Loader2,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  calculatePayrollAPI, 
  getEmployeeBaseline, 
  getEmployeeAttendanceSync,
  saveEmployeePayroll
} from "@/service/payroll";
import { calculatePayroll, PayrollInput } from "@/lib/payrollCalculator";
import { getDataUserslist } from "@/service/users";
import { useAuthStore, ROLES } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Input from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import dayjs from "dayjs";
import { UserData, PayrollCalculationResult } from "@/types/api";
import Image from "next/image";

const DynamicPDFDownload = dynamic(() => import("@/components/payroll/DynamicPDFDownload"), {
  ssr: false,
  loading: () => (
    <Button disabled className="w-full bg-slate-100 text-slate-400 h-14 rounded-2xl font-black flex items-center justify-center gap-2">
      <Loader2 className="animate-spin" size={20} />
      <span>Loading PDF Engine...</span>
    </Button>
  )
});

export default function SalaryCalculatorView() {
  const { user, loading: authLoading } = useAuthStore();
  const router = useRouter();

  // Access Control
  useEffect(() => {
    if (!authLoading && user) {
      const allowedRoles = [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR, ROLES.FINANCE];
      if (!allowedRoles.includes(user.role?.name as ('superadmin' | 'hr' | 'finance' | 'admin'))) {
        router.replace("/");
        toast.error("You do not have permission to access the Payroll Calculator.");
      }
    }
  }, [user, authLoading, router]);

  // Period State
  const [selectedPeriod, setSelectedPeriod] = useState(dayjs().format("YYYY-MM"));

  // Employee Selection State
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [employees, setEmployees] = useState<UserData[]>([]);

  // PDF Filename Memo
  const pdfFilename = useMemo(() => `payslip-simulation.pdf`, []);

  const navigatePeriod = (direction: 'next' | 'prev') => {
    setSelectedPeriod(prev => 
      dayjs(prev).add(direction === 'next' ? 1 : -1, 'month').format("YYYY-MM")
    );
  };

  // Input State
  const [inputs, setInputs] = useState<PayrollInput>({
    basicSalary: 0,
    fixedAllowances: 0,
    dailyMealAllowance: 0,
    dailyTransportAllowance: 0,
    attendanceDays: 0,
    workingDaysInMonth: 22,
    overtimeHours: 0,
    unpaidLeaveDays: 0,
    ptkpStatus: "TK/0"
  });

  const [debouncedInputs, setDebouncedInputs] = useState(inputs);

  // Fetch Employees for dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        if (!user?.id) return;
        const resp = await getDataUserslist({ user_id: user.id, limit: 100 });
        if (resp.data) {
          setEmployees(resp.data);
        }
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      }
    };
    if (user && !authLoading) fetchEmployees();
  }, [user, authLoading]);

  // Sync Data when employee or period changes
  useEffect(() => {
    const syncEmployeeData = async () => {
      if (!selectedUserId) return;
      
      try {
        toast.loading("Syncing employee data...", { id: "sync-payroll" });
        
        // 1. Fetch Baseline
        const baselineResp = await getEmployeeBaseline(selectedUserId);
        
        // 2. Fetch Attendance Variables
        const syncResp = await getEmployeeAttendanceSync(selectedUserId, selectedPeriod);

        if (baselineResp.data && syncResp.data) {
          const baseline = baselineResp.data;
          const sync = syncResp.data;

          setInputs({
            basicSalary: baseline.basic_salary,
            fixedAllowances: baseline.fixed_allowances,
            dailyMealAllowance: 0, // Manual input for simulation
            dailyTransportAllowance: 0, // Manual input for simulation
            attendanceDays: sync.attendance_days,
            workingDaysInMonth: sync.working_days_in_month,
            overtimeHours: sync.overtime_hours,
            unpaidLeaveDays: sync.unpaid_leave_days,
            ptkpStatus: baseline.ptkp_status as "TK/0" | "TK/1" | "TK/2" | "TK/3" | "K/0" | "K/1" | "K/2" | "K/3",
          });
          
          toast.success(`Data synced for ${baseline.employee_name}`, { id: "sync-payroll" });
        }
      } catch (error) {
        console.error("Sync failed:", error);
        toast.error("Failed to sync employee data", { id: "sync-payroll" });
      }
    };

    syncEmployeeData();
  }, [selectedUserId, selectedPeriod]);

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(inputs);
    }, 500);
    const setDebouncedSearch = (val: typeof inputs) => setDebouncedInputs(val);
    return () => clearTimeout(handler);
  }, [inputs]);

  // Real-time Calculation Query
  const { data: calcResp, isLoading: isCalculating } = useQuery({
    queryKey: ["payroll-calc", debouncedInputs],
    queryFn: () => calculatePayrollAPI(debouncedInputs),
    enabled: !!user,
  });

  // Local fallback engine for immediate sync and if API fails (404/Network)
  const localResult = useMemo(() => calculatePayroll(inputs), [inputs]);
  
  // Use API result if available, otherwise fallback to local calculation
  const result = useMemo(() => {
    if (calcResp?.data) {
       return calcResp.data;
    }
    // Fallback structure
    return {
      net_salary: localResult.netSalary,
      breakdown: {
        earnings: {
          basic_salary: localResult.breakdown.proratedBasic,
          fixed_allowances: localResult.breakdown.fixedAllowances,
          variable_allowances: localResult.breakdown.variableAllowances,
          overtime_pay: localResult.breakdown.overtimePay,
          gross_income: localResult.breakdown.grossIncome,
        },
        deductions: {
          pph21_amount: localResult.breakdown.pph21Amount,
          bpjs_health_employee: localResult.breakdown.bpjs.health.employee,
          bpjs_jht_employee: localResult.breakdown.bpjs.jht.employee,
          bpjs_jp_employee: localResult.breakdown.bpjs.jp.employee,
          unpaid_leave_deduction: localResult.breakdown.unpaidLeaveDeduction,
          total_deductions: localResult.totalDeductions
        },
        employer_contributions: {
          total_employer_cost: localResult.totalCompanyCost,
          bpjs_health_company: localResult.breakdown.bpjs.health.company,
          bpjs_jht_company: localResult.breakdown.bpjs.jht.company,
          bpjs_jp_company: localResult.breakdown.bpjs.jp.company,
          bpjs_jkk: localResult.breakdown.bpjs.jkk,
          bpjs_jkm: localResult.breakdown.bpjs.jkm,
        }
      }
    };
  }, [calcResp, localResult]);

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: () => {
      if (!selectedUserId) throw new Error("Select an employee first");
      return saveEmployeePayroll(selectedUserId, {
        period: selectedPeriod,
        basic_salary: inputs.basicSalary,
        fixed_allowances: inputs.fixedAllowances,
        daily_meal_allowance: inputs.dailyMealAllowance,
        daily_transport_allowance: inputs.dailyTransportAllowance,
        attendance_days: inputs.attendanceDays,
        working_days_in_month: inputs.workingDaysInMonth,
        overtime_hours: inputs.overtimeHours,
        unpaid_leave_days: inputs.unpaidLeaveDays,
        ptkp_status: inputs.ptkpStatus,
        status: 'Draft'
      });
    },
    onSuccess: () => {
      toast.success("Payroll successfully saved to dashboard");
      router.push("/payroll");
    },
    onError: (err) => {
      console.log(err);
      toast.error("Failed to save payroll");
    }
  });

  const formatCurrency = useCallback((amount: number | undefined) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  }, []);

  const handleNumberInput = (key: keyof typeof inputs, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setInputs(prev => ({
      ...prev,
      [key]: numericValue ? parseInt(numericValue, 10) : 0
    }));
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Verifying Authority</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600">
            <Scale size={18} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Finance Operations</span>
          </div>
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Payroll Calculator</h1>
          <p className="text-slate-500 font-medium">Stateless interactive engine for THP estimation & tax simulations.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            disabled={saveMutation.isPending || !selectedUserId}
            onClick={() => saveMutation.mutate()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-12 shadow-md flex items-center gap-2"
          >
            {saveMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span className="font-bold">Save to Dashboard</span>
          </Button>

          {result && (
            <DynamicPDFDownload 
              data={{
                grossIncome: result?.breakdown?.earnings?.gross_income,
                pph21Amount: result?.breakdown?.deductions?.pph21_amount,
                netSalary: result?.net_salary,
                totalDeductions: result?.breakdown?.deductions?.total_deductions,
                totalCompanyCost: result?.breakdown?.employer_contributions?.total_employer_cost,
                breakdown: {
                  proratedBasic: result?.breakdown?.earnings?.basic_salary,
                  unpaidLeaveDeduction: result?.breakdown?.deductions?.unpaid_leave_deduction,
                  overtimePay: result?.breakdown?.earnings?.overtime_pay,
                  grossIncome: result?.breakdown?.earnings?.gross_income,
                  pph21Amount: result?.breakdown?.deductions?.pph21_amount,
                  terRate: 0,
                  bpjs: {
                    health: {
                      employee: result?.breakdown?.deductions?.bpjs_health_employee,
                      company: result?.breakdown?.employer_contributions?.bpjs_health_company
                    },
                    jht: {
                      employee: result?.breakdown?.deductions?.bpjs_jht_employee,
                      company: result?.breakdown?.employer_contributions?.bpjs_jht_company
                    },
                    jp: {
                      employee: result?.breakdown?.deductions?.bpjs_jp_employee,
                      company: result?.breakdown?.employer_contributions?.bpjs_jp_company
                    },
                    jkk: result?.breakdown?.employer_contributions?.bpjs_jkk,
                    jkm: result?.breakdown?.employer_contributions?.bpjs_jkm
                  },
                  fixedAllowances: result?.breakdown?.earnings?.fixed_allowances,
                  variableAllowances: result?.breakdown?.earnings?.variable_allowances,
                }
              } as PayrollCalculationResult} 
              companyName={user.tenant?.name || "AttendancePro Organization"} 
              logo={user.tenant?.tenant_settings?.tenant_logo}
              ptkp={inputs.ptkpStatus}
              period={dayjs(selectedPeriod).format("MMMM YYYY")}
              employeeName={employees.find(e => e.id === selectedUserId)?.name || "Simulation User"}
              employeeRole={employees.find(e => e.id === selectedUserId)?.department || "Personnel"}
              fileName={pdfFilename}
            />
          )}
          <Button onClick={() => window.print()} variant="secondary" className="rounded-2xl h-12 shadow-sm">
            <Printer size={18} />
            <span className="font-bold">Print</span>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: Control Panel */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Employee Selection Section */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-blue-400" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Employee Sync</h3>
                </div>
                
                {/* Island Date Filter */}
                <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/10 shadow-lg backdrop-blur-sm">
                  <button 
                    onClick={() => navigatePeriod('prev')}
                    className="p-1.5 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white"
                  >
                    <ChevronLeft size={14} strokeWidth={3} />
                  </button>
                  
                  <div className="px-3 flex flex-col items-center min-w-[100px]">
                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest leading-none mb-0.5">Period</span>
                    <span className="text-[11px] font-black text-white leading-none">
                      {dayjs(selectedPeriod).format("MMM YYYY")}
                    </span>
                  </div>

                  <button 
                    onClick={() => navigatePeriod('next')}
                    className="p-1.5 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white"
                  >
                    <ChevronRight size={14} strokeWidth={3} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Personnel</label>
                <div className="relative">
                  <select 
                    value={selectedUserId || ""}
                    onChange={(e) => setSelectedUserId(Number(e.target.value) || null)}
                    className="w-full h-14 pl-5 pr-12 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white focus:bg-white/10 focus:border-blue-500/50 transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="" className="text-slate-900">Choose an employee...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id} className="text-slate-900">{emp.name} ({emp.employee_id})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 space-y-8">
              
              {/* Fixed Components */}
              <section className="space-y-5">
                <div className="flex items-center gap-2 text-slate-400">
                  <PlusCircle size={16} />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Fixed Components</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Basic Salary</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</div>
                      <Input 
                        value={inputs.basicSalary.toLocaleString('id-ID')}
                        onChange={(e) => handleNumberInput('basicSalary', e.target.value)}
                        className="pl-11 font-bold text-lg"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Fixed Allowances (Position, etc)</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</div>
                      <Input 
                        value={inputs.fixedAllowances.toLocaleString('id-ID')}
                        onChange={(e) => handleNumberInput('fixedAllowances', e.target.value)}
                        className="pl-11 font-bold text-lg"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Daily Allowances */}
              <section className="space-y-5 pt-8 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-400">
                  <Receipt size={16} />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Daily Allowances (Variable)</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Meal / Day</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</div>
                      <Input 
                        value={inputs.dailyMealAllowance.toLocaleString('id-ID')}
                        onChange={(e) => handleNumberInput('dailyMealAllowance', e.target.value)}
                        className="pl-11 font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Transport / Day</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</div>
                      <Input 
                        value={inputs.dailyTransportAllowance.toLocaleString('id-ID')}
                        onChange={(e) => handleNumberInput('dailyTransportAllowance', e.target.value)}
                        className="pl-11 font-bold"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 italic">Calculated automatically: (Meal + Transport) × Attendance Days</p>
              </section>

              {/* Monthly Variables */}
              <section className="space-y-5 pt-8 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar size={16} />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Monthly Variables</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Working Days</label>
                    <Input 
                      type="number"
                      value={inputs.workingDaysInMonth}
                      onChange={(e) => setInputs(p => ({ ...p, workingDaysInMonth: Number(e.target.value) }))}
                      className="font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Attendance</label>
                    <Input 
                      type="number"
                      value={inputs.attendanceDays}
                      onChange={(e) => setInputs(p => ({ ...p, attendanceDays: Number(e.target.value) }))}
                      className="font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">OT Hours</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <Input 
                        type="number"
                        value={inputs.overtimeHours}
                        onChange={(e) => setInputs(p => ({ ...p, overtimeHours: Number(e.target.value) }))}
                        className="pl-11 font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Unpaid Leave</label>
                    <div className="relative">
                      <MinusCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300" size={16} />
                      <Input 
                        type="number"
                        value={inputs.unpaidLeaveDays}
                        onChange={(e) => setInputs(p => ({ ...p, unpaidLeaveDays: Number(e.target.value) }))}
                        className="pl-11 font-bold text-rose-600"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Tax & PTKP */}
              <section className="space-y-5 pt-8 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-400">
                  <UserCheck size={16} />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Tax Information</h3>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">PTKP Status (Effective 2024)</label>
                  <select 
                    value={inputs.ptkpStatus}
                    onChange={(e) => setInputs(p => ({ ...p, ptkpStatus: e.target.value as "TK/0" | "TK/1" | "TK/2" | "TK/3" | "K/0" | "K/1" | "K/2" | "K/3" }))}
                    className="w-full h-14 px-5 bg-white border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-900 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all outline-none appearance-none cursor-pointer"
                  >
                    {["TK/0", "TK/1", "TK/2", "TK/3", "K/0", "K/1", "K/2", "K/3"].map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </section>
            </div>
          </div>

          <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
            <AlertCircle className="text-amber-600 shrink-0" size={20} />
            <div className="space-y-1">
              <p className="text-xs font-black text-amber-900 uppercase tracking-tight">Regulatory Update</p>
              <p className="text-[11px] text-amber-800/70 font-medium leading-relaxed">
                Calculations based on <strong>PP No. 58/2023 (TER PPh 21)</strong> and latest BPJS thresholds effective 2024.
              </p>
            </div>
          </div>

          <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex gap-4 mt-4">
            <Building2 className="text-blue-600 shrink-0" size={20} />
            <div className="space-y-1">
              <p className="text-xs font-black text-blue-900 uppercase tracking-tight">BPJS Maximum Basis</p>
              <p className="text-[11px] text-blue-800/70 font-medium leading-relaxed">
                Health basis capped at <strong>Rp 12.000.000</strong>. Pension (JP) basis capped at <strong>Rp 10.042.300</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: Digital Payslip Preview */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden relative">
            
            {/* Perforated Edge Effect */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-slate-50 flex items-center justify-around px-4">
              {[...Array(30)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-slate-200 -mt-1" />
              ))}
            </div>

            {/* Loading Overlay */}
            {isCalculating && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Recalculating...</p>
              </div>
            )}

            <div className="p-10 sm:p-16 space-y-12">
              {/* Slip Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
                <div className="space-y-4">
                  {user.tenant?.tenant_settings?.tenant_logo ? (
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
                    <h2 className="text-xl font-black text-slate-900">{user.tenant?.name || "AttendancePro Organization"}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Monthly Earnings Statement</p>
                  </div>
                </div>
                <div className="text-left sm:text-right space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Statement Date</p>
                  <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block uppercase mt-2">Status: {inputs.ptkpStatus}</p>
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
                        <p className="text-[10px] text-slate-400 font-medium italic">Prorated for attendance</p>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{formatCurrency(result?.breakdown?.earnings?.basic_salary)}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-slate-700">Allowances (Fixed)</p>
                      <span className="text-sm font-bold text-slate-900">{formatCurrency(result?.breakdown?.earnings?.fixed_allowances)}</span>
                    </div>
                    {result?.breakdown?.earnings?.variable_allowances > 0 && (
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-slate-700">Allowances (Daily)</p>
                          <p className="text-[10px] text-slate-400 font-medium italic">Meal & Transport</p>
                        </div>
                        <span className="text-sm font-bold text-slate-900">{formatCurrency(result?.breakdown?.earnings?.variable_allowances)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-700">Overtime Pay</p>
                        <p className="text-[10px] text-slate-400 font-medium italic">{inputs.overtimeHours} hours calculated</p>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{formatCurrency(result?.breakdown?.earnings?.overtime_pay)}</span>
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
                        <p className="text-[10px] text-slate-400 font-medium italic">Calculated from TER bracket</p>
                      </div>
                      <span className="text-sm font-bold text-rose-600">-{formatCurrency(result?.breakdown?.deductions?.pph21_amount)}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-700">BPJS Health</p>
                        <p className="text-[10px] text-slate-400 font-medium italic">1% Employee Share</p>
                      </div>
                      <span className="text-sm font-bold text-rose-600">-{formatCurrency(result?.breakdown?.deductions?.bpjs_health_employee)}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-700">BPJS Ketenagakerjaan</p>
                        <p className="text-[10px] text-slate-400 font-medium italic">JHT 2% + JP 1%</p>
                      </div>
                      <span className="text-sm font-bold text-rose-600">
                        -{formatCurrency((result?.breakdown?.deductions?.bpjs_jht_employee || 0) + (result?.breakdown?.deductions?.bpjs_jp_employee || 0))}
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
                  <p className="text-sm font-medium text-slate-500 italic">Simulated for current parameters</p>
                </div>
                <div className="text-center sm:text-right">
                  <h3 className="text-4xl sm:text-5xl font-black text-indigo-600 tracking-tighter tabular-nums">
                    {formatCurrency(result?.net_salary)}
                  </h3>
                </div>
              </div>

              <div className="pt-4 text-center">
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">Computer Generated Document • Confidential</p>
              </div>
            </div>
          </div>

          {/* Secondary Info */}
          <div className="mt-8 grid grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <Building2 size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employer Cost</p>
                <p className="text-lg font-black text-slate-900">{formatCurrency(result?.breakdown?.employer_contributions?.total_employer_cost)}</p>
              </div>
            </div>
            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                <Receipt size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Deductions</p>
                <p className="text-lg font-black text-slate-900">{formatCurrency(result?.breakdown?.deductions?.total_deductions)}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
