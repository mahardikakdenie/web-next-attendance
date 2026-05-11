"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Calculator, 
  Wallet, 
  Users, 
  Loader2, 
  AlertCircle,
  Building2,
  Receipt,
  Download,
  CheckCircle2,
  History,
  TrendingUp,
  FileText,
  Banknote,
  Percent,
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
  Info,
  ChevronDown,
  LayoutGrid,
  Zap,
  Briefcase,
  ArrowRight,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import CurrencyInput from "@/components/ui/CurrencyInput";
import { Badge } from "@/components/ui/Badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  calculatePayrollAPI, 
  saveEmployeePayroll, 
  getEmployeeAttendanceSync
} from "@/service/payroll";
import { getDataUserslist } from "@/service/users";
import { UserData, CustomApiError, PayrollCalculatePayload, CustomAllowance } from "@/types/api";
import { toast } from "sonner";
import dayjs from "dayjs";
import { useAuthStore, ROLES } from "@/store/auth.store";
import EnhancedPayslipModal from "@/components/ui/EnhancedPayslipModal";
import Select from "@/components/ui/Select";

export default function SalaryCalculatorView({ isStateless = false }: { isStateless?: boolean }) {
  const { user, loading: authLoading } = useAuthStore();
  const queryClient = useQueryClient();
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
  const updateAllowance = (i: number, f: keyof CustomAllowance, v: any) => {
    const updated = [...customAllowances];
    updated[i] = { ...updated[i], [f]: v };
    setCustomAllowances(updated);
  };

  const isTHR = inputs.run_type === 'THR';

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in duration-1000">
      
      {/* ELITE HEADER */}
      <header className="relative overflow-hidden bg-slate-950 rounded-[2.5rem] p-10 shadow-2xl text-white">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-600 opacity-20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
               <Sparkles size={14} className="fill-current" /> Next-Gen Payroll Engine
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Payroll <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Intelligence</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-xl text-sm leading-relaxed">
              Automated Indonesian compliance with Smart Profile Lookup (v2.1). Precision tax and benefit orchestration.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl p-1.5 rounded-[24px] border border-white/10 shadow-2xl">
            <button onClick={() => setSelectedPeriod(p => dayjs(p).subtract(1,'month').format("YYYY-MM"))} className="p-3 hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-white"><ChevronLeft size={20} strokeWidth={3} /></button>
            <div className="px-8 flex flex-col items-center min-w-[140px]">
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Process Period</span>
              <span className="text-base font-black text-white leading-none">{dayjs(selectedPeriod).format("MMMM YYYY")}</span>
            </div>
            <button onClick={() => setSelectedPeriod(p => dayjs(p).add(1,'month').format("YYYY-MM"))} className="p-3 hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-white"><ChevronRight size={20} strokeWidth={3} /></button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: WORKSPACE PANEL */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* Staff Focus Card */}
          <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8 relative overflow-hidden group">
            <div className="flex items-center justify-between">
               <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Users className="text-indigo-600" size={20} /> Staff Focus
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Identity synchronization</p>
               </div>
               <Badge className="bg-indigo-50 text-indigo-600 border-none font-black text-[9px] uppercase px-4 py-1.5 rounded-full">Automated</Badge>
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
              <div className="p-6 bg-slate-950 rounded-[2rem] space-y-5 animate-in slide-in-from-top-4 duration-500 text-white shadow-2xl shadow-indigo-950/30 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600 opacity-20 rounded-full blur-[60px]" />
                 <div className="flex items-center gap-5 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-black text-xl text-white shadow-lg">
                       {result?.user.full_name.charAt(0) || "?"}
                    </div>
                    <div>
                       <p className="text-base font-black tracking-tight">{result?.user.full_name || "Synchronizing..."}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{result?.user.position || "Processing Position"}</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-colors">
                       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Settlement Bank</p>
                       <p className="text-xs font-black text-indigo-400">{result?.user.bank_name || "N/A"}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-colors">
                       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Account Hash</p>
                       <p className="text-xs font-black text-indigo-400">{result?.user.bank_account_number || "N/A"}</p>
                    </div>
                 </div>
              </div>
            )}
          </section>

          {/* Configuration Master Section */}
          <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
            
            {/* Section 0: Base Compensation */}
            <div className="group">
               <button onClick={() => toggleSection('salary')} className={`w-full p-8 flex items-center justify-between hover:bg-slate-50 transition-all text-left ${expandedSections.salary ? 'bg-slate-50/50' : ''}`}>
                  <div className="flex items-center gap-4">
                     <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${expandedSections.salary ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-blue-50 text-blue-600'}`}>
                        <Banknote size={22} />
                     </div>
                     <div className="space-y-0.5">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Base Compensation</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Core monthly contractuals</p>
                     </div>
                  </div>
                  <ChevronDown className={`text-slate-300 transition-transform duration-500 ${expandedSections.salary ? 'rotate-180 text-blue-600' : 'group-hover:text-slate-400'}`} size={20} strokeWidth={3} />
               </button>
               {expandedSections.salary && (
                 <div className="px-8 pb-8 pt-4 space-y-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                       <CurrencyInput 
                        label="Basic Salary Override"
                        placeholder="Leave zero to use profile value" 
                        value={inputs.basic_salary || 0} 
                        onChange={(v) => setInputs(p => ({ ...p, basic_salary: v }))} 
                       />
                       {(inputs.basic_salary || 0) > 0 && (
                         <p className="text-[10px] font-black text-amber-500 flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg w-fit mt-3">
                           <AlertCircle size={12} /> Override Active: Manual entry will take precedence
                         </p>
                       )}
                    </div>
                 </div>
               )}
            </div>

            {/* Section 1: Logic Configuration */}
            <div className="group border-t border-slate-50">
               <button onClick={() => toggleSection('config')} className={`w-full p-8 flex items-center justify-between hover:bg-slate-50 transition-all text-left ${expandedSections.config ? 'bg-slate-50/50' : ''}`}>
                  <div className="flex items-center gap-4">
                     <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${expandedSections.config ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-slate-100 text-slate-600'}`}>
                        <LayoutGrid size={22} />
                     </div>
                     <div className="space-y-0.5">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Logic & Tax</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Calculation methodology</p>
                     </div>
                  </div>
                  <ChevronDown className={`text-slate-300 transition-transform duration-500 ${expandedSections.config ? 'rotate-180 text-slate-900' : 'group-hover:text-slate-400'}`} size={20} strokeWidth={3} />
               </button>
               {expandedSections.config && (
                 <div className="px-8 pb-8 pt-4 grid grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Run Type</label>
                       <Select value={inputs.run_type} onChange={(v) => setInputs(p => ({ ...p, run_type: v }))} options={[{label:"Regular Payroll", value:"Regular"},{label:"THR Payment", value:"THR"},{label:"Bonus Only", value:"Bonus"},{label:"Consolidated All", value:"All"}]} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Methodology</label>
                       <Select value={inputs.method} onChange={(v) => setInputs(p => ({ ...p, method: v }))} options={[{label:"Gross (Ded. Tax)", value:"Gross"},{label:"Net (Cover Tax)", value:"Net"}]} />
                    </div>
                 </div>
               )}
            </div>

            {/* Section 2: Attendance Variables */}
            <div className="group border-t border-slate-50">
               <button onClick={() => toggleSection('attendance')} className={`w-full p-8 flex items-center justify-between hover:bg-slate-50 transition-all text-left ${expandedSections.attendance ? 'bg-slate-50/50' : ''}`}>
                  <div className="flex items-center gap-4">
                     <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${expandedSections.attendance ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-indigo-50 text-indigo-600'}`}>
                        <TrendingUp size={22} />
                     </div>
                     <div className="space-y-0.5">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Attendance Stats</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Variable effort components</p>
                     </div>
                  </div>
                  <ChevronDown className={`text-slate-300 transition-transform duration-500 ${expandedSections.attendance ? 'rotate-180 text-indigo-600' : 'group-hover:text-slate-400'}`} size={20} strokeWidth={3} />
               </button>
               {expandedSections.attendance && (
                 <div className="px-8 pb-8 pt-4 space-y-6 animate-in slide-in-from-top-2 duration-300">
                    {isTHR && (
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-[20px] flex gap-4 text-xs font-bold text-amber-700 leading-relaxed shadow-sm">
                         <AlertCircle size={20} className="shrink-0 text-amber-500" />
                         <span>Attendance factors are legally ignored during THR computation. Inputs locked.</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Working Days</label>
                          <Input type="number" value={inputs.working_days_in_month} onChange={(e) => setInputs(p => ({ ...p, working_days_in_month: Number(e.target.value) }))} className="h-14 font-black" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Actual Presence</label>
                          <Input type="number" disabled={isTHR} className={`h-14 font-black ${isTHR ? "opacity-30 grayscale bg-slate-50" : ""}`} value={inputs.attendance_days} onChange={(e) => setInputs(p => ({ ...p, attendance_days: Number(e.target.value) }))} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Overtime (Hrs)</label>
                          <Input type="number" disabled={isTHR} className={`h-14 font-black ${isTHR ? "opacity-30 grayscale bg-slate-50" : ""}`} value={inputs.overtime_hours || 0} onChange={(e) => setInputs(p => ({ ...p, overtime_hours: Number(e.target.value) }))} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Unpaid Absence</label>
                          <Input type="number" disabled={isTHR} className={`h-14 font-black ${isTHR ? "opacity-30 grayscale bg-slate-50" : ""}`} value={inputs.unpaid_leave_days || 0} onChange={(e) => setInputs(p => ({ ...p, unpaid_leave_days: Number(e.target.value) }))} />
                       </div>
                    </div>
                 </div>
               )}
            </div>

            {/* Section 3: Financial Benefits */}
            <div className="group border-t border-slate-50">
               <button onClick={() => toggleSection('allowances')} className={`w-full p-8 flex items-center justify-between hover:bg-slate-50 transition-all text-left ${expandedSections.allowances ? 'bg-slate-50/50' : ''}`}>
                  <div className="flex items-center gap-4">
                     <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${expandedSections.allowances ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-emerald-50 text-emerald-600'}`}>
                        <Coins size={22} />
                     </div>
                     <div className="space-y-0.5">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Financial Benefits</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Allowances, incentives & bonuses</p>
                     </div>
                  </div>
                  <ChevronDown className={`text-slate-300 transition-transform duration-500 ${expandedSections.allowances ? 'rotate-180 text-emerald-600' : 'group-hover:text-slate-400'}`} size={20} strokeWidth={3} />
               </button>
               {expandedSections.allowances && (
                 <div className="px-8 pb-8 pt-4 space-y-10 animate-in slide-in-from-top-2 duration-300">
                    
                    {/* Fixed Allowance Override */}
                    <div className="space-y-2">
                       <CurrencyInput 
                         label="Fixed Allowance Override (Tetap)" 
                         value={inputs.fixed_allowance || 0} 
                         onChange={(v) => setInputs(p => ({ ...p, fixed_allowance: v }))} 
                       />
                       {(inputs.fixed_allowance || 0) > 0 && <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-lg">Override Active</span>}
                    </div>

                    {/* Dynamic Variables */}
                    <div className="space-y-5">
                       <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Variable Breakdown (Tidak Tetap)</p>
                          <Button onClick={addAllowance} variant="ghost" className="h-8 px-4 rounded-xl text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white transition-all">
                            <Plus size={16} className="mr-2" /> Add Line Item
                          </Button>
                       </div>
                       
                       <div className="space-y-4">
                          {customAllowances.map((a, i) => (
                            <div key={i} className="flex items-center gap-3 animate-in slide-in-from-left-4 duration-500">
                               <div className="flex-[2]">
                                  <Input placeholder="Component Label (e.g. WiFi)" value={a.name} onChange={(e) => updateAllowance(i, 'name', e.target.value)} className="h-12 text-xs font-bold bg-slate-50 border-none shadow-none" />
                               </div>
                               <div className="flex-[1.5]">
                                  <CurrencyInput value={a.amount} onChange={(v) => updateAllowance(i, 'amount', v)} className="h-12 bg-slate-50 border-none shadow-none" />
                               </div>
                               <button onClick={() => removeAllowance(i)} className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                  <Trash2 size={18} />
                               </button>
                            </div>
                          ))}
                          
                          {customAllowances.length > 0 ? (
                            <div className="p-5 rounded-[24px] bg-emerald-50/50 border border-emerald-100 flex justify-between items-center animate-in zoom-in-95 duration-500">
                               <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Total Variable Sum</p>
                               <p className="text-sm font-black text-emerald-700 tabular-nums">{formatCurrency(totalVariable)}</p>
                            </div>
                          ) : (
                            <div className="p-10 border-2 border-dashed border-slate-100 rounded-[2rem] text-center opacity-60">
                               <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300"><LayoutGrid size={24} strokeWidth={1} /></div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">No extra variables defined<br/>Profile standards apply</p>
                            </div>
                          )}
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                       <CurrencyInput label="Performance Incentives" value={inputs.incentives || 0} onChange={(v) => setInputs(p => ({ ...p, incentives: v }))} />
                       <CurrencyInput label="One-time Bonus" value={inputs.bonus || 0} onChange={(v) => setInputs(p => ({ ...p, bonus: v }))} />
                    </div>
                 </div>
               )}
            </div>

            {/* Action Bar */}
            <div className="p-8 bg-slate-900">
               <Button 
                className="w-full h-18 rounded-[1.5rem] bg-indigo-600 text-white font-black uppercase text-[11px] tracking-[0.3em] shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-all hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none"
                onClick={() => saveMutation.mutate()}
                disabled={!result || saveMutation.isPending}
              >
                {saveMutation.isPending ? <Loader2 className="animate-spin" size={28} /> : (
                  <div className="flex items-center gap-4">
                     <Save size={24} />
                     <span>Finalize Calculation</span>
                  </div>
                )}
              </Button>
            </div>
          </section>
        </div>

        {/* RIGHT: LIVE PREMIUM PREVIEW */}
        <div className="xl:col-span-7 space-y-6 sticky top-8">
           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-300/50 overflow-hidden min-h-[850px] flex flex-col group transition-all hover:shadow-indigo-900/10">
              
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20 backdrop-blur-3xl">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-xl"><Printer size={22} strokeWidth={2.5} /></div>
                    <div>
                       <h3 className="text-base font-black text-slate-900 tracking-tight leading-none">Draft Statement</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Real-time Ledger Preview
                       </p>
                    </div>
                 </div>
                 <Button onClick={() => setShowSlipPreview(true)} variant="outline" className="h-12 rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest border-slate-200 hover:bg-slate-950 hover:text-white transition-all shadow-sm" disabled={!result}>
                    <FileText size={18} className="mr-2" /> Detailed View
                 </Button>
              </div>

              <div className="flex-1 p-10 sm:p-16">
                 {!selectedUserId ? (
                   <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-20 grayscale transition-all group-hover:opacity-30">
                      <Calculator size={120} strokeWidth={0.5} className="text-slate-900" />
                      <div className="space-y-2">
                         <p className="text-sm font-black text-slate-900 uppercase tracking-[0.4em]">Engine Standby</p>
                         <p className="text-xs font-medium text-slate-500">Select staff member to initiate smart sync.</p>
                      </div>
                   </div>
                 ) : isCalculating ? (
                   <div className="h-full flex flex-col items-center justify-center space-y-8">
                      <div className="relative w-24 h-24">
                         <div className="absolute inset-0 border-8 border-indigo-100 rounded-full" />
                         <div className="absolute inset-0 border-8 border-indigo-600 rounded-full border-t-transparent animate-spin" />
                         <div className="absolute inset-0 flex items-center justify-center font-black text-base text-indigo-600 tracking-tighter italic">AI.2</div>
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Processing Ledger</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Applying TER Tax Tables 2024</p>
                      </div>
                   </div>
                 ) : result ? (
                   <div className="space-y-16 animate-in fade-in zoom-in-95 duration-700">
                      
                      {/* Identity Header */}
                      <div className="flex flex-col md:flex-row justify-between items-start gap-10">
                         <div className="flex items-center gap-6">
                            <div className="relative h-20 w-20 bg-slate-50 rounded-[2.2rem] border border-slate-100 flex items-center justify-center overflow-hidden shadow-inner group-hover:rotate-3 transition-transform duration-500">
                               {result.company_context.logo_url ? <img src={result.company_context.logo_url} className="w-12 h-12 object-contain" alt="Logo" /> : <Building2 size={32} className="text-indigo-600" />}
                            </div>
                            <div className="space-y-1">
                               <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{result.company_context.name}</h2>
                               <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em]">{result.user.position}</p>
                            </div>
                         </div>
                         <div className="text-left md:text-right space-y-1.5">
                            <p className="text-base font-black text-slate-900 leading-none">{result.user.full_name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{result.user.bank_name} • {result.user.bank_account_number}</p>
                            <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase px-3 py-1 rounded-full mt-2">Verified Profile</Badge>
                         </div>
                      </div>

                      {/* Main Ledger Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative">
                         <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-100 -translate-x-1/2 border-dashed border-l" />

                         {/* Earnings Cluster */}
                         <div className="space-y-8">
                            <div className="flex items-center gap-4 border-b border-slate-50 pb-5">
                               <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm"><PlusCircle size={22} strokeWidth={2.5} /></div>
                               <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Earnings Cluster</h4>
                            </div>
                            <div className="space-y-6">
                               <div className="flex justify-between items-start"><div className="space-y-1"><p className="text-sm font-bold text-slate-700">Gaji Pokok</p><p className="text-[9px] text-slate-400 font-medium">Prorated attendance</p></div><span className="text-sm font-black text-slate-950 tabular-nums">{formatCurrency(result.breakdown.earnings.basic_salary)}</span></div>
                               <div className="flex justify-between items-start"><p className="text-sm font-bold text-slate-700">Tunjangan Tetap</p><span className="text-sm font-black text-slate-950 tabular-nums">{formatCurrency(result.breakdown.earnings.fixed_allowances)}</span></div>
                               {result.breakdown.earnings.variable_allowances > 0 && <div className="flex justify-between items-start group"><div className="space-y-1"><p className="text-sm font-bold text-slate-700">Tunjangan Tidak Tetap</p><p className="text-[9px] text-emerald-500 font-bold uppercase group-hover:translate-x-1 transition-transform">Aggregated</p></div><span className="text-sm font-black text-slate-950 tabular-nums">{formatCurrency(result.breakdown.earnings.variable_allowances)}</span></div>}
                               {result.breakdown.earnings.overtime_pay > 0 && <div className="flex justify-between items-start"><p className="text-sm font-bold text-slate-700">Uang Lembur</p><span className="text-sm font-black text-slate-950 tabular-nums">{formatCurrency(result.breakdown.earnings.overtime_pay)}</span></div>}
                               {result.breakdown.earnings.incentives > 0 && <div className="flex justify-between items-start"><p className="text-sm font-bold text-slate-700">Insentif Performa</p><span className="text-sm font-black text-slate-950 tabular-nums">{formatCurrency(result.breakdown.earnings.incentives)}</span></div>}
                               {inputs.method === 'Net' && (
                                 <div className="flex justify-between items-start p-4 rounded-3xl bg-indigo-50/50 border border-indigo-100/50 animate-in zoom-in-95 duration-700">
                                    <div className="space-y-1"><p className="text-sm font-bold text-indigo-700">Tunjangan Pajak</p><p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest">Net Method</p></div>
                                    <span className="text-sm font-black text-indigo-700 tabular-nums">+{formatCurrency(result.breakdown.earnings.tax_allowance)}</span>
                                 </div>
                               )}
                            </div>
                         </div>

                         {/* Deductions Cluster */}
                         <div className="space-y-8">
                            <div className="flex items-center gap-4 border-b border-slate-50 pb-5">
                               <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-sm"><MinusCircle size={22} strokeWidth={2.5} /></div>
                               <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Liability Cluster</h4>
                            </div>
                            <div className="space-y-6">
                               <div className="flex justify-between items-start"><div><p className="text-sm font-bold text-slate-700">PPh 21</p><p className="text-[9px] text-slate-400 font-medium">Income tax liability</p></div><span className="text-sm font-black text-rose-600 tabular-nums">-{formatCurrency(result.breakdown.deductions.pph21_amount)}</span></div>
                               <div className="flex justify-between items-start"><div><p className="text-sm font-bold text-slate-700">Iuran BPJS</p><p className="text-[9px] text-slate-400 font-medium">JHT, JP, Kesehatan (Emp)</p></div><span className="text-sm font-black text-rose-600 tabular-nums">-{formatCurrency(result.breakdown.deductions.bpjs_health_employee + result.breakdown.deductions.bpjs_jht_employee + result.breakdown.deductions.bpjs_jp_employee)}</span></div>
                               {result.breakdown.deductions.unpaid_leave_deduction > 0 && <div className="flex justify-between items-start"><div><p className="text-sm font-bold text-slate-700">Potongan Absensi</p><p className="text-[9px] text-rose-400 font-medium italic">Unpaid leave days</p></div><span className="text-sm font-black text-rose-600 tabular-nums">-{formatCurrency(result.breakdown.deductions.unpaid_leave_deduction)}</span></div>}
                            </div>
                         </div>
                      </div>

                      {/* Final Settlement Summary - Refined & Compact */}
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur-xl opacity-5 group-hover:opacity-10 transition-opacity duration-700" />
                        
                        <div className="relative bg-slate-950 rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] border border-white/5">
                           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />

                           <div className="relative z-10 p-8 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                              <div className="space-y-4 text-center lg:text-left">
                                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">
                                    <ShieldCheck size={12} /> Pending Approval
                                 </div>
                                 <div className="space-y-1">
                                    <h4 className="text-lg font-black text-white tracking-tight">Final Settlement</h4>
                                    <p className="text-[11px] font-medium text-slate-500 max-w-xs leading-relaxed">
                                       Disbursement for <span className="text-slate-300 font-bold">{dayjs(selectedPeriod).format("MMMM YYYY")}</span> cycle.
                                    </p>
                                 </div>
                                 
                                 {/* Compact Bank Chip */}
                                 <div className="inline-flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                       <Briefcase size={16} />
                                    </div>
                                    <div className="text-left">
                                       <p className="text-[10px] font-black text-slate-200 leading-none">{result.user.bank_name}</p>
                                       <p className="text-[9px] font-bold text-slate-500 mt-1">{result.user.bank_account_number}</p>
                                    </div>
                                 </div>
                              </div>

                              <div className="flex flex-col items-center lg:items-end gap-6">
                                 <div className="text-center lg:text-right space-y-1">
                                    <div className="flex items-baseline justify-center lg:justify-end gap-2">
                                       <span className="text-lg font-black text-indigo-500">IDR</span>
                                       <h3 className="text-5xl font-black text-white tracking-tighter tabular-nums">
                                          {result.net_salary.toLocaleString('id-ID')}
                                       </h3>
                                    </div>
                                    <div className="flex items-center justify-center lg:justify-end gap-1.5 text-[9px] font-black text-emerald-400 uppercase tracking-widest opacity-80">
                                       <CheckCircle2 size={10} strokeWidth={3} />
                                       TER 2024 Compliant
                                    </div>
                                 </div>

                                 <Button 
                                    className="h-12 px-8 rounded-xl bg-white text-slate-950 font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-indigo-500 hover:text-white transition-all active:scale-95 group/btn"
                                    onClick={() => setShowSlipPreview(true)}
                                 >
                                    Review & Approve
                                    <ArrowRight size={14} className="ml-2 group-hover/btn:translate-x-1 transition-transform" strokeWidth={3} />
                                 </Button>
                              </div>
                           </div>
                        </div>
                      </div>
                   </div>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30 grayscale"><AlertCircle size={60} strokeWidth={1} className="text-rose-500" /><h4 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Engine Outage</h4><p className="text-sm font-medium text-slate-400 max-w-xs">Failed to communicate with calculation service. Please verify your connection.</p></div>
                 )}
              </div>
           </div>
        </div>

      </div>

      {result && <EnhancedPayslipModal showSlipPreview={showSlipPreview} setShowSlipPreview={setShowSlipPreview} selectedEmployeeSlip={result} selectedPeriod={selectedPeriod} />}
    </div>
  );
}
