"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Calculator, 
  Users, 
  Loader2, 
  AlertCircle,
  Building2,
  TrendingUp,
  FileText,
  Banknote,
  PlusCircle,
  MinusCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Save,
  Printer,
  Coins,
  Plus,
  Trash2,
  ChevronDown,
  LayoutGrid,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import CurrencyInput from "@/components/ui/CurrencyInput";
import { Badge } from "@/components/ui/Badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  calculatePayrollAPI, 
  saveEmployeePayroll, 
  getEmployeeAttendanceSync
} from "@/service/payroll";
import { getDataUserslist } from "@/service/users";
import { CustomApiError, PayrollCalculatePayload, CustomAllowance } from "@/types/api";
import { toast } from "sonner";
import dayjs from "dayjs";
import { useAuthStore, ROLES } from "@/store/auth.store";
import EnhancedPayslipModal from "@/components/ui/EnhancedPayslipModal";
import Select from "@/components/ui/Select";

export default function SalaryCalculatorView({ isStateless = false }: { isStateless?: boolean }) {
  const { user, loading: authLoading } = useAuthStore();
  const router = useRouter();

  // Collapsible Sections State
  const [expandedSections, setExpandedSections] = useState({
    salary: true,
    config: true,
    attendance: true,
    allowances: true,
  });

  // Access Control
  useEffect(() => {
    if (!authLoading && user) {
      const allowedRoles = [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR, ROLES.FINANCE];
      if (!allowedRoles.includes(user.role?.name as ('superadmin' | 'hr' | 'finance' | 'admin'))) {
        router.replace("/");
        toast.error("Access denied. HR/Finance permissions required.");
      }
    }
  }, [user, authLoading, router]);

  const [selectedPeriod, setSelectedPeriod] = useState(dayjs().format("YYYY-MM"));
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showSlipPreview, setShowSlipPreview] = useState(false);
  const [customAllowances, setCustomAllowances] = useState<CustomAllowance[]>([]);
  const totalVariable = useMemo(() => customAllowances.reduce((s, a) => s + (a.amount || 0), 0), [customAllowances]);

  // Input State
  const [inputs, setInputs] = useState<PayrollCalculatePayload>({
    user_id: 0,
    run_type: 'Regular',
    method: 'Gross',
    working_days_in_month: 22,
    attendance_days: 0,
    overtime_hours: 0,
    unpaid_leave_days: 0,
    basic_salary: 0,
    fixed_allowance: 0,
    variable_allowance: 0,
    bonus: 0,
    incentives: 0
  });

  const [debouncedInputs, setDebouncedInputs] = useState(inputs);

  const { data: employeesResp } = useQuery({
    queryKey: ["employees-list-calc"],
    queryFn: () => getDataUserslist({ limit: 100 }),
    enabled: !!user && !authLoading
  });

  const employeeOptions = useMemo(() => {
    return (employeesResp?.data || []).map(emp => ({
      label: `${emp.name} (${emp.employee_id})`,
      value: emp.id,
      icon: <Users size={14} />
    }));
  }, [employeesResp]);

  useEffect(() => {
    const syncAttendance = async () => {
      if (!selectedUserId) return;
      try {
        toast.loading("Syncing attendance variables...", { id: "sync-payroll" });
        const syncResp = await getEmployeeAttendanceSync(selectedUserId, selectedPeriod);
        if (syncResp.data) {
          const sync = syncResp.data;
          setInputs(prev => ({
            ...prev,
            user_id: selectedUserId,
            attendance_days: sync.attendance_days,
            working_days_in_month: sync.working_days_in_month,
            overtime_hours: sync.overtime_hours,
            unpaid_leave_days: sync.unpaid_leave_days,
          }));
          toast.success("Sync complete", { id: "sync-payroll" });
        }
      } catch {
        toast.error("Sync failed", { id: "sync-payroll" });
      }
    };
    syncAttendance();
  }, [selectedUserId, selectedPeriod]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if ((inputs.user_id || 0) > 0) {
        setDebouncedInputs({
          ...inputs,
          variable_allowance: totalVariable,
          custom_variable_allowances: customAllowances
        });
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [inputs, totalVariable, customAllowances]);

  const { data: calcResp, isLoading: isCalculating } = useQuery({
    queryKey: ["payroll-calc-v2", debouncedInputs],
    queryFn: () => calculatePayrollAPI(debouncedInputs),
    enabled: (debouncedInputs.user_id || 0) > 0,
    placeholderData: (previousData) => previousData,
  });

  const result = calcResp?.data;

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!selectedUserId || !result) throw new Error("Complete calculation first");
      return saveEmployeePayroll(selectedUserId, {
        period: selectedPeriod,
        run_type: inputs.run_type,
        method: inputs.method,
        basic_salary: result.breakdown.earnings.basic_salary,
        fixed_allowances: result.breakdown.earnings.fixed_allowances,
        incentives: inputs.incentives || 0,
        daily_meal_allowance: 0,
        daily_transport_allowance: 0,
        attendance_days: inputs.attendance_days,
        working_days_in_month: inputs.working_days_in_month,
        overtime_hours: inputs.overtime_hours || 0,
        unpaid_leave_days: inputs.unpaid_leave_days || 0,
        ptkp_status: result.user.ptkp_status,
        status: 'Published',
      });
    },
    onSuccess: () => {
      toast.success("Payroll record saved to ledger!");
      router.push("/payroll");
    },
    onError: (error: CustomApiError) => {
      toast.error(error.response?.data?.meta?.message || "Failed to save record.");
    }
  });

  const formatCurrency = (amount: number | undefined) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const addAllowance = () => setCustomAllowances([...customAllowances, { name: "", amount: 0 }]);
  const removeAllowance = (i: number) => setCustomAllowances(customAllowances.filter((_, idx) => idx !== i));
  const updateAllowance = (i: number, f: keyof CustomAllowance, v: string | number) => {
    const updated = [...customAllowances];
    updated[i] = { ...updated[i], [f]: v };
    setCustomAllowances(updated);
  };

  const isTHR = inputs.run_type === 'THR';

  return (
    <div className="relative flex flex-col gap-8 pb-20 animate-in fade-in duration-700">
      {/* Background Decorative Blur Meshes */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-blue-100/20 rounded-full blur-[150px] pointer-events-none -z-10" />
      
      {/* ELITE HEADER (Premium Dark Glassmorphism) */}
      <header className="relative overflow-hidden bg-slate-900/95 backdrop-blur-xl rounded-[32px] p-8 sm:p-10 border border-slate-800/80 shadow-2xl text-white">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-wider text-indigo-300">
               <Sparkles size={14} className="fill-indigo-400/20 text-indigo-400" /> Next-Gen Payroll Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none text-slate-100">
              Payroll <span className="text-indigo-400">Intelligence</span>
            </h1>
            <p className="text-slate-400 font-normal max-w-xl text-sm leading-relaxed">
              Automated Indonesian compliance with Smart Profile Lookup. Precision tax and benefit calculation conforming to TER regulations.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 shadow-inner">
            <button 
              onClick={() => setSelectedPeriod(p => dayjs(p).subtract(1,'month').format("YYYY-MM"))} 
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white"
              aria-label="Previous Month"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            <div className="px-5 flex flex-col items-center min-w-[130px]">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-0.5">Process Period</span>
              <span className="text-sm font-bold text-white leading-none">{dayjs(selectedPeriod).format("MMMM YYYY")}</span>
            </div>
            <button 
              onClick={() => setSelectedPeriod(p => dayjs(p).add(1,'month').format("YYYY-MM"))} 
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white"
              aria-label="Next Month"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: WORKSPACE PANEL */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* Staff Focus Card */}
          <section className="bg-white/80 backdrop-blur-xl rounded-[40px] p-8 border border-slate-100/80 shadow-xl shadow-slate-200/20 space-y-6 relative z-50 overflow-visible">
            <div className="flex items-center justify-between">
               <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Users className="text-indigo-500" size={18} /> Staff Focus
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">Employee identity synchronization</p>
               </div>
               <Badge className="bg-indigo-50/50 text-indigo-600 border border-indigo-100/50 font-bold text-[10px] uppercase px-3 py-1 rounded-full">Automated</Badge>
            </div>
            
            <Select 
              options={employeeOptions}
              value={selectedUserId || ""}
              onChange={(val) => { setSelectedUserId(val); setInputs(p => ({ ...p, user_id: val })); }}
              placeholder="Search employee directory..."
              searchable
              className="z-50"
            />

            {selectedUserId && (
              <div className="p-6 bg-slate-900/95 backdrop-blur-xl rounded-3xl space-y-4 animate-in slide-in-from-top-4 duration-500 text-white shadow-xl relative overflow-hidden border border-white/5">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none" />
                 <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-lg text-white shadow-md">
                       {result?.user.full_name.charAt(0) || "?"}
                    </div>
                    <div className="space-y-0.5">
                       <p className="text-sm font-bold tracking-tight">{result?.user.full_name || "Synchronizing..."}</p>
                       <p className="text-xs font-medium text-slate-400">{result?.user.position || "Processing Position"}</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-3 relative z-10 pt-2 border-t border-white/5">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                       <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Settlement Bank</p>
                       <p className="text-xs font-bold text-indigo-300">{result?.user.bank_name || "N/A"}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                       <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Account Number</p>
                       <p className="text-xs font-bold text-indigo-300">{result?.user.bank_account_number || "N/A"}</p>
                    </div>
                 </div>
              </div>
            )}
          </section>

          {/* Configuration Master Section */}
          <section className="bg-white/80 backdrop-blur-xl rounded-[40px] border border-slate-100/80 shadow-xl shadow-slate-200/20 overflow-hidden">
            
            {/* Section 0: Base Compensation */}
            <div className="group">
               <button 
                 onClick={() => toggleSection('salary')} 
                 className={`w-full p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all text-left ${expandedSections.salary ? 'bg-slate-50/30' : ''}`}
               >
                  <div className="flex items-center gap-3">
                     <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${expandedSections.salary ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-50 text-blue-600'}`}>
                        <Banknote size={18} />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-slate-800">Base Compensation</h4>
                        <p className="text-xs text-slate-400">Core monthly salaries</p>
                     </div>
                  </div>
                  <ChevronDown className={`text-slate-400 transition-transform duration-300 ${expandedSections.salary ? 'rotate-180 text-blue-600' : 'group-hover:text-slate-600'}`} size={16} strokeWidth={2.5} />
               </button>
               {expandedSections.salary && (
                 <div className="px-6 pb-6 pt-3 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-1.5">
                       <CurrencyInput 
                        label="Basic Salary Override"
                        placeholder="Leave zero to use profile value" 
                        value={inputs.basic_salary || 0} 
                        onChange={(v) => setInputs(p => ({ ...p, basic_salary: v }))} 
                       />
                       {(inputs.basic_salary || 0) > 0 && (
                         <div className="text-xs font-medium text-amber-600 flex items-center gap-1.5 bg-amber-50/70 border border-amber-100/50 px-3 py-2 rounded-xl w-fit">
                           <AlertCircle size={14} className="shrink-0" />
                           <span>Override Active: Manual entry will take precedence.</span>
                         </div>
                       )}
                    </div>
                 </div>
               )}
            </div>

            {/* Section 1: Logic Configuration */}
            <div className="group border-t border-slate-100/50">
               <button 
                 onClick={() => toggleSection('config')} 
                 className={`w-full p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all text-left ${expandedSections.config ? 'bg-slate-50/30' : ''}`}
               >
                  <div className="flex items-center gap-3">
                     <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${expandedSections.config ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600'}`}>
                        <LayoutGrid size={18} />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-slate-800">Logic & Tax</h4>
                        <p className="text-xs text-slate-400">Calculation methodology</p>
                     </div>
                  </div>
                  <ChevronDown className={`text-slate-400 transition-transform duration-300 ${expandedSections.config ? 'rotate-180 text-slate-900' : 'group-hover:text-slate-600'}`} size={16} strokeWidth={2.5} />
               </button>
               {expandedSections.config && (
                 <div className="px-6 pb-6 pt-3 grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-1">
                       <label className="text-xs font-semibold text-slate-500 ml-1">Run Type</label>
                       <Select value={inputs.run_type} onChange={(v) => setInputs(p => ({ ...p, run_type: v }))} options={[{label:"Regular Payroll", value:"Regular"},{label:"THR Payment", value:"THR"},{label:"Bonus Only", value:"Bonus"},{label:"Consolidated All", value:"All"}]} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs font-semibold text-slate-500 ml-1">Methodology</label>
                       <Select value={inputs.method} onChange={(v) => setInputs(p => ({ ...p, method: v }))} options={[{label:"Gross (Ded. Tax)", value:"Gross"},{label:"Net (Cover Tax)", value:"Net"}]} />
                    </div>
                 </div>
               )}
            </div>

            {/* Section 2: Attendance Variables */}
            <div className="group border-t border-slate-100/50">
               <button 
                 onClick={() => toggleSection('attendance')} 
                 className={`w-full p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all text-left ${expandedSections.attendance ? 'bg-slate-50/30' : ''}`}
               >
                  <div className="flex items-center gap-3">
                     <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${expandedSections.attendance ? 'bg-indigo-600 text-white shadow-md' : 'bg-indigo-50 text-indigo-600'}`}>
                        <TrendingUp size={18} />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-slate-800">Attendance Stats</h4>
                        <p className="text-xs text-slate-400">Variable effort component parameters</p>
                     </div>
                  </div>
                  <ChevronDown className={`text-slate-400 transition-transform duration-300 ${expandedSections.attendance ? 'rotate-180 text-indigo-600' : 'group-hover:text-slate-600'}`} size={16} strokeWidth={2.5} />
               </button>
               {expandedSections.attendance && (
                 <div className="px-6 pb-6 pt-3 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    {isTHR && (
                      <div className="p-3 bg-amber-50/70 border border-amber-100/50 rounded-2xl flex gap-3 text-xs font-medium text-amber-700 leading-relaxed shadow-sm">
                         <AlertCircle size={18} className="shrink-0 text-amber-500" />
                         <span>Attendance factors are legally ignored during THR computation. Inputs locked.</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-500 ml-1">Working Days</label>
                          <Input type="number" value={inputs.working_days_in_month} onChange={(e) => setInputs(p => ({ ...p, working_days_in_month: Number(e.target.value) }))} className="h-11 font-medium rounded-xl border-slate-200" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-500 ml-1">Presence Days</label>
                          <Input type="number" disabled={isTHR} className={`h-11 font-medium rounded-xl border-slate-200 ${isTHR ? "opacity-40 grayscale bg-slate-50" : ""}`} value={inputs.attendance_days} onChange={(e) => setInputs(p => ({ ...p, attendance_days: Number(e.target.value) }))} />
                       </div>
                       <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-500 ml-1">Overtime (Hrs)</label>
                          <Input type="number" disabled={isTHR} className={`h-11 font-medium rounded-xl border-slate-200 ${isTHR ? "opacity-40 grayscale bg-slate-50" : ""}`} value={inputs.overtime_hours || 0} onChange={(e) => setInputs(p => ({ ...p, overtime_hours: Number(e.target.value) }))} />
                       </div>
                       <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-500 ml-1">Unpaid Leave</label>
                          <Input type="number" disabled={isTHR} className={`h-11 font-medium rounded-xl border-slate-200 ${isTHR ? "opacity-40 grayscale bg-slate-50" : ""}`} value={inputs.unpaid_leave_days || 0} onChange={(e) => setInputs(p => ({ ...p, unpaid_leave_days: Number(e.target.value) }))} />
                       </div>
                    </div>
                 </div>
               )}
            </div>

            {/* Section 3: Financial Benefits */}
            <div className="group border-t border-slate-100/50">
               <button 
                 onClick={() => toggleSection('allowances')} 
                 className={`w-full p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all text-left ${expandedSections.allowances ? 'bg-slate-50/30' : ''}`}
               >
                  <div className="flex items-center gap-3">
                     <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${expandedSections.allowances ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-50 text-emerald-600'}`}>
                        <Coins size={18} />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-slate-800">Financial Benefits</h4>
                        <p className="text-xs text-slate-400">Allowances, incentives & bonuses</p>
                     </div>
                  </div>
                  <ChevronDown className={`text-slate-400 transition-transform duration-300 ${expandedSections.allowances ? 'rotate-180 text-emerald-600' : 'group-hover:text-slate-600'}`} size={16} strokeWidth={2.5} />
               </button>
               {expandedSections.allowances && (
                 <div className="px-6 pb-6 pt-3 space-y-6 animate-in slide-in-from-top-2 duration-200">
                    
                    {/* Fixed Allowance Override */}
                    <div className="space-y-1.5">
                       <CurrencyInput 
                         label="Fixed Allowance Override (Tetap)" 
                         value={inputs.fixed_allowance || 0} 
                         onChange={(v) => setInputs(p => ({ ...p, fixed_allowance: v }))} 
                       />
                       {(inputs.fixed_allowance || 0) > 0 && <span className="text-[10px] font-bold text-amber-600 uppercase bg-amber-50 px-2 py-0.5 rounded border border-amber-100/50">Override Active</span>}
                    </div>

                    {/* Dynamic Variables */}
                    <div className="space-y-3.5">
                       <div className="flex items-center justify-between border-b border-slate-100/60 pb-2">
                          <p className="text-xs font-bold text-slate-500">Variable Allowance (Tidak Tetap)</p>
                          <Button 
                            onClick={addAllowance} 
                            variant="ghost" 
                            className="h-7 px-3 rounded-lg text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white transition-all"
                          >
                            <Plus size={14} className="mr-1" /> Add Line
                          </Button>
                       </div>
                       
                       <div className="space-y-3">
                          {customAllowances.map((a, i) => (
                            <div key={i} className="flex items-center gap-2 animate-in slide-in-from-left-4 duration-300">
                               <div className="flex-[2]">
                                  <Input placeholder="Component Label (e.g. WiFi)" value={a.name} onChange={(e) => updateAllowance(i, 'name', e.target.value)} className="h-10 text-xs font-medium bg-slate-50/50 border-slate-200 rounded-xl" />
                               </div>
                               <div className="flex-[1.5]">
                                  <CurrencyInput value={a.amount} onChange={(v) => updateAllowance(i, 'amount', v)} className="h-10 bg-slate-50/50 border-slate-200 rounded-xl text-xs" />
                               </div>
                               <button 
                                 onClick={() => removeAllowance(i)} 
                                 className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm shrink-0"
                               >
                                  <Trash2 size={16} />
                               </button>
                            </div>
                          ))}
                          
                          {customAllowances.length > 0 ? (
                            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/30 flex justify-between items-center animate-in zoom-in-95 duration-300">
                               <p className="text-xs font-semibold text-emerald-800">Total Variable Sum</p>
                               <p className="text-sm font-bold text-emerald-800 tabular-nums">{formatCurrency(totalVariable)}</p>
                            </div>
                          ) : (
                            <div className="p-6 border border-dashed border-slate-200 rounded-2xl text-center opacity-80">
                               <p className="text-xs text-slate-400 font-medium">No custom variables defined. Profile defaults will apply.</p>
                            </div>
                          )}
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100/60">
                       <CurrencyInput label="Performance Incentives" value={inputs.incentives || 0} onChange={(v) => setInputs(p => ({ ...p, incentives: v }))} />
                       <CurrencyInput label="One-time Bonus" value={inputs.bonus || 0} onChange={(v) => setInputs(p => ({ ...p, bonus: v }))} />
                    </div>
                 </div>
               )}
            </div>

            {/* Action Bar */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100/80">
               <Button 
                className="w-full h-12 rounded-2xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 hover:shadow-indigo-500/30 transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                onClick={() => saveMutation.mutate()}
                disabled={!result || saveMutation.isPending}
              >
                {saveMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : (
                  <div className="flex items-center justify-center gap-2">
                     <Save size={16} />
                     <span>Finalize Payroll Record</span>
                  </div>
                )}
               </Button>
            </div>
          </section>
        </div>

        {/* RIGHT: LIVE PREMIUM PREVIEW */}
        <div className="xl:col-span-7 space-y-6 sticky top-8">
           <div className="bg-white/80 backdrop-blur-xl rounded-[40px] border border-slate-100/80 shadow-2xl shadow-slate-200/20 overflow-hidden min-h-[850px] flex flex-col group transition-all">
              
              <div className="p-6 border-b border-slate-100/80 flex items-center justify-between bg-slate-50/30 backdrop-blur-md">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md"><Printer size={18} strokeWidth={2} /></div>
                    <div>
                       <h3 className="text-sm font-bold text-slate-800 tracking-tight">Draft Statement</h3>
                       <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" /> Real-time Calculation Sync
                       </p>
                    </div>
                 </div>
                 <Button 
                   onClick={() => setShowSlipPreview(true)} 
                   variant="outline" 
                   className="h-10 rounded-xl px-4 text-xs font-semibold border-slate-200 hover:bg-slate-900 hover:text-white transition-all shadow-sm" 
                   disabled={!result}
                 >
                    <FileText size={16} className="mr-1.5" /> Detailed View
                 </Button>
              </div>

              <div className="flex-1 p-8 sm:p-12 flex flex-col justify-between">
                 {!selectedUserId ? (
                    <div className="my-auto flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                       <Calculator size={80} strokeWidth={1} className="text-slate-400" />
                       <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-700 uppercase tracking-wider">Engine Standby</p>
                          <p className="text-xs text-slate-400 max-w-[240px]">Select a staff member from the left focus panel to begin calculation sync.</p>
                       </div>
                    </div>
                 ) : isCalculating ? (
                    <div className="my-auto flex flex-col items-center justify-center space-y-6">
                       <div className="relative w-20 h-20">
                          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
                          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
                          <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-indigo-600 tracking-tighter italic">CALC</div>
                       </div>
                       <div className="text-center space-y-1">
                         <p className="text-sm font-bold text-slate-700">Syncing Workforce Variables</p>
                         <p className="text-xs text-slate-400">Recalculating with TER Indonesian tax tables</p>
                       </div>
                    </div>
                 ) : result ? (
                    <div className="space-y-10 animate-in fade-in duration-500">
                       
                       {/* Identity Summary */}
                       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 border border-slate-100/50 p-6 rounded-3xl">
                          <div className="flex items-center gap-4">
                             <div className="h-14 w-14 bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm shrink-0">
                                {result.company_context.logo_url ? <img src={result.company_context.logo_url} className="w-10 h-10 object-contain" alt="Logo" /> : <Building2 size={24} className="text-indigo-600" />}
                             </div>
                             <div>
                                <h3 className="text-base font-bold text-slate-800 leading-none">{result.company_context.name}</h3>
                                <p className="text-xs text-slate-400 mt-1 font-medium">{result.user.full_name}</p>
                             </div>
                          </div>
                          <div className="text-left sm:text-right">
                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-semibold uppercase">
                               <ShieldCheck size={12} /> Verified Profile
                             </span>
                             <p className="text-xs text-slate-500 mt-1.5 font-medium">{result.user.position}</p>
                          </div>
                       </div>

                       {/* Ledger Breakdown Columns */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                          {/* Earnings Cluster */}
                          <div className="bg-emerald-50/20 border border-emerald-100/30 rounded-3xl p-6 space-y-4">
                             <div className="flex items-center gap-2 border-b border-emerald-100/30 pb-3">
                                <PlusCircle className="text-emerald-600" size={18} />
                                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">Earnings</h5>
                             </div>
                             <div className="space-y-3.5">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-slate-500 font-medium">Gaji Pokok</span>
                                  <span className="font-bold text-slate-800 tabular-nums">{formatCurrency(result.breakdown.earnings.basic_salary)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-slate-500 font-medium">Tunjangan Tetap</span>
                                  <span className="font-bold text-slate-800 tabular-nums">{formatCurrency(result.breakdown.earnings.fixed_allowances)}</span>
                                </div>
                                {result.breakdown.earnings.variable_allowances > 0 && (
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-medium">Tunjangan Tidak Tetap</span>
                                    <span className="font-bold text-slate-800 tabular-nums">{formatCurrency(result.breakdown.earnings.variable_allowances)}</span>
                                  </div>
                                )}
                                {result.breakdown.earnings.overtime_pay > 0 && (
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-medium">Uang Lembur</span>
                                    <span className="font-bold text-slate-800 tabular-nums">{formatCurrency(result.breakdown.earnings.overtime_pay)}</span>
                                  </div>
                                )}
                                {result.breakdown.earnings.incentives > 0 && (
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-medium">Insentif Performa</span>
                                    <span className="font-bold text-slate-800 tabular-nums">{formatCurrency(result.breakdown.earnings.incentives)}</span>
                                  </div>
                                )}
                                {inputs.method === 'Net' && (
                                  <div className="flex justify-between items-center text-xs bg-indigo-50/50 border border-indigo-100/30 p-2.5 rounded-xl">
                                     <span className="text-indigo-700 font-semibold">Tunjangan Pajak</span>
                                     <span className="font-bold text-indigo-700 tabular-nums">+{formatCurrency(result.breakdown.earnings.tax_allowance)}</span>
                                  </div>
                                )}
                             </div>
                          </div>

                          {/* Liabilities Cluster */}
                          <div className="bg-rose-50/20 border border-rose-100/30 rounded-3xl p-6 space-y-4">
                             <div className="flex items-center gap-2 border-b border-rose-100/30 pb-3">
                                <MinusCircle className="text-rose-600" size={18} />
                                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">Liabilities</h5>
                             </div>
                             <div className="space-y-3.5">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-slate-500 font-medium">PPh 21 (TER)</span>
                                  <span className="font-bold text-rose-600 tabular-nums">-{formatCurrency(result.breakdown.deductions.pph21_amount)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-slate-500 font-medium">Iuran BPJS (Emp)</span>
                                  <span className="font-bold text-rose-600 tabular-nums">-{formatCurrency(result.breakdown.deductions.bpjs_health_employee + result.breakdown.deductions.bpjs_jht_employee + result.breakdown.deductions.bpjs_jp_employee)}</span>
                                </div>
                                {result.breakdown.deductions.unpaid_leave_deduction > 0 && (
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-medium italic">Potongan Absensi</span>
                                    <span className="font-bold text-rose-600 tabular-nums">-{formatCurrency(result.breakdown.deductions.unpaid_leave_deduction)}</span>
                                  </div>
                                )}
                             </div>
                          </div>
                       </div>

                       {/* Final Settlement Summary (Glowing Premium Glass Box) */}
                       <div className="relative group">
                          <div className="absolute inset-0 bg-indigo-500/5 rounded-3xl blur-xl group-hover:opacity-100 opacity-50 transition-opacity" />
                          <div className="relative bg-slate-900 p-8 rounded-3xl border border-slate-800 text-white overflow-hidden shadow-xl">
                             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[50px] pointer-events-none" />
                             
                             <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                                <div className="space-y-3">
                                   <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                                      <Coins size={12} /> Take-Home Pay
                                   </span>
                                   <div className="space-y-1">
                                      <p className="text-xs text-slate-400 font-medium">Disbursement Schedule</p>
                                      <p className="text-sm font-bold text-slate-200">{dayjs(selectedPeriod).format("MMMM YYYY")}</p>
                                   </div>
                                   <div className="text-xs text-slate-400 font-medium">
                                      {result.user.bank_name} • {result.user.bank_account_number}
                                   </div>
                                </div>

                                <div className="flex flex-col items-start md:items-end gap-4 w-full md:w-auto">
                                   <div className="space-y-0.5">
                                      <div className="flex items-baseline gap-1.5">
                                         <span className="text-sm font-semibold text-indigo-400">IDR</span>
                                         <span className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums text-white">
                                            {result.net_salary.toLocaleString('id-ID')}
                                         </span>
                                      </div>
                                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider text-left md:text-right">
                                         ✓ TER 2024 Tax Compliant
                                      </p>
                                   </div>
                                   
                                   <Button 
                                      className="w-full md:w-auto h-10 px-5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wider transition-all"
                                      onClick={() => setShowSlipPreview(true)}
                                   >
                                      Review Statement
                                      <ArrowRight size={14} className="ml-1.5" strokeWidth={2.5} />
                                   </Button>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 ) : (
                    <div className="my-auto flex flex-col items-center justify-center text-center space-y-4 text-rose-500">
                       <AlertCircle size={48} />
                       <h4 className="text-base font-bold uppercase tracking-wider text-slate-700">Calculation Engine Offline</h4>
                       <p className="text-xs text-slate-400 max-w-[280px]">Unable to process calculation. Please check database connectivity or recalculate.</p>
                    </div>
                 )}
              </div>
           </div>
        </div>

      </div>

      {result && <EnhancedPayslipModal showSlipPreview={showSlipPreview} setShowSlipPreview={setShowSlipPreview} selectedEmployeeSlip={result} selectedPeriod={selectedPeriod} />}
    </div>
  );
}
