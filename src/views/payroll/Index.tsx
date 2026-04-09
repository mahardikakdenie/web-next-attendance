"use client";

import { useState, useMemo } from "react";
import { 
  Wallet, 
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  Printer,
  Users,
  Settings,
  CreditCard,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuthStore, ROLES } from "@/store/auth.store";
import { Badge } from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { calculatePayroll } from "@/lib/payrollCalculator";

import EnhancedPayslipModal from "@/components/ui/EnhancedPayslipModal"; 

// --- TYPESCRIPT DEFINITIONS ---
// Mendefinisikan struktur data agar TS tidak bingung
interface PayrollBreakdown {
  grossIncome: number;
  pph21Amount: number;
  unpaidLeaveDeduction: number;
  bpjs: {
    health: { employee: number };
    jht: { employee: number };
  };
}

interface CalculatedResult {
  netSalary: number;
  breakdown: PayrollBreakdown;
}

// Gabungan antara data mock awal dengan hasil kalkulasi
type EmployeePayrollRecord = typeof MOCK_EMPLOYEE_PAYROLL[0] & CalculatedResult;
// ------------------------------

const MOCK_EMPLOYEE_PAYROLL = [
  {
    id: 1,
    name: "Alex Johnson",
    role: "Senior Developer",
    avatar: "https://i.pravatar.cc/150?u=alex",
    basic: 12000000,
    allowance: 2500000,
    attendanceDays: 22,
    workingDays: 22,
    unpaidLeave: 0,
    ptkp: "TK/0" as const,
    status: "Published",
  },
  {
    id: 2,
    name: "Sarah Chen",
    role: "UI Designer",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    basic: 9500000,
    allowance: 1200000,
    attendanceDays: 20,
    workingDays: 22,
    unpaidLeave: 2,
    ptkp: "K/0" as const,
    status: "Published",
  },
  {
    id: 3,
    name: "Marcus Miller",
    role: "Project Manager",
    avatar: "https://i.pravatar.cc/150?u=marcus",
    basic: 11000000,
    allowance: 1800000,
    attendanceDays: 22,
    workingDays: 22,
    unpaidLeave: 0,
    ptkp: "K/1" as const,
    status: "Draft",
  }
];

export default function PayrollView() {
  const { user } = useAuthStore();
  const role = user?.role?.name;
  const isAdmin = role === ROLES.SUPERADMIN || role === ROLES.ADMIN || role === ROLES.HR;
  
  const [activeTab, setActiveTab] = useState<"hr" | "finance">("hr");
  const [searchTerm, setSearchTerm] = useState("");
  const selectedPeriod = "March 2024";
  const [showSlipPreview, setShowSlipPreview] = useState<number | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Terapkan tipe EmployeePayrollRecord[] pada useMemo
  const calculatedData = useMemo<EmployeePayrollRecord[]>(() => {
    return MOCK_EMPLOYEE_PAYROLL.map(emp => {
      // Kita asumsikan fungsi lib Anda mengembalikan struktur CalculatedResult
      const result = calculatePayroll({
        basicSalary: emp.basic,
        allowances: emp.allowance,
        attendanceDays: emp.attendanceDays,
        workingDaysInMonth: emp.workingDays,
        overtimeHours: 0,
        unpaidLeaveDays: emp.unpaidLeave,
        ptkpStatus: emp.ptkp
      }) as CalculatedResult; 
      
      return { ...emp, ...result };
    });
  }, []);

  const filteredEmployees = useMemo<EmployeePayrollRecord[]>(() => {
    return calculatedData.filter(emp => 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, calculatedData]);

  // Return typenya EmployeePayrollRecord | null
  const selectedEmployeeSlip = useMemo<EmployeePayrollRecord | null>(() => {
    if (!showSlipPreview) return null;
    return calculatedData.find(e => e.id === showSlipPreview) || null;
  }, [showSlipPreview, calculatedData]);

  const handleExportBankFile = () => {
    alert("System: Generating Bank Transfer File (LLG/RTGS Format)... \nStatus: Success \nFile: payroll_export_march_2024.csv");
  };

  if (isAdmin) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
        
        {/* Header Management */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Payroll Operations</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-blue-100 text-blue-700 border-none px-2 py-0.5 text-[10px] font-black uppercase">Enterprise Mode</Badge>
              <p className="text-sm text-neutral-500 font-medium">Period: {selectedPeriod}</p>
            </div>
          </div>
          <div className="flex gap-2">
             {activeTab === "finance" && (
                <Button 
                  onClick={handleExportBankFile}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-600/20"
                >
                  <CreditCard size={18} />
                  <span>Disbursement</span>
                </Button>
             )}
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-600/20">
              <Plus size={18} />
              <span>New Cycle</span>
            </Button>
          </div>
        </div>

        {/* Custom Role Tabs */}
        <div className="flex p-1.5 bg-neutral-100 rounded-[20px] w-fit border border-neutral-200/50 shadow-inner">
          <button 
            onClick={() => setActiveTab("hr")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-black transition-all ${activeTab === "hr" ? "bg-white text-blue-600 shadow-md" : "text-neutral-500 hover:text-neutral-900"}`}
          >
            <Users size={18} />
            <span>HR Administration</span>
          </button>
          <button 
            onClick={() => setActiveTab("finance")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-black transition-all ${activeTab === "finance" ? "bg-white text-indigo-600 shadow-md" : "text-neutral-500 hover:text-neutral-900"}`}
          >
            <Wallet size={18} />
            <span>Finance & Tax</span>
          </button>
        </div>

        {/* Management Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-4xl border border-neutral-100 shadow-sm">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Total Net Payout</p>
            <h3 className="text-xl font-black text-neutral-900">{formatCurrency(calculatedData.reduce((acc, curr) => acc + curr.netSalary, 0))}</h3>
            <div className="flex items-center gap-1 mt-2 text-green-600">
               <ArrowUpRight size={14} />
               <span className="text-[10px] font-bold">12.5% from last month</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-4xl border border-neutral-100 shadow-sm">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Tax Liability (PPh 21)</p>
            <h3 className="text-xl font-black text-indigo-600">{formatCurrency(calculatedData.reduce((acc, curr) => acc + curr.breakdown.pph21Amount, 0))}</h3>
            <p className="text-[10px] font-bold text-neutral-400 mt-2">Calculated via TER Scheme</p>
          </div>
          <div className="bg-white p-5 rounded-4xl border border-neutral-100 shadow-sm">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">BPJS Provision</p>
            <h3 className="text-xl font-black text-rose-500">{formatCurrency(1250000)}</h3>
            <p className="text-[10px] font-bold text-neutral-400 mt-2">Comp: 4% | Emp: 1%</p>
          </div>
          <div className="bg-white p-5 rounded-4xl border border-neutral-100 shadow-sm">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Attendance Sync</p>
            <h3 className="text-xl font-black text-neutral-900">98.2%</h3>
            <p className="text-[10px] font-bold text-blue-600 mt-2">Automated Integration Active</p>
          </div>
        </div>

        {/* Main Content Area / Table */}
        <div className="bg-white rounded-4xl border border-neutral-100 shadow-sm overflow-hidden">
          {/* Internal Filters */}
          <div className="p-6 border-b border-neutral-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by name, role, or ID..." 
                className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
               <Button className="bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border-none px-4 rounded-xl flex items-center gap-2">
                  <Filter size={16} />
                  <span>Filters</span>
               </Button>
               <Button 
                onClick={handleExportBankFile}
                className="bg-neutral-900 text-white px-4 rounded-xl flex items-center gap-2"
               >
                  <FileSpreadsheet size={16} />
                  <span>Export</span>
               </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-neutral-50/30">
                  <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Employee</th>
                  {activeTab === "hr" ? (
                    <>
                      <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Base Salary</th>
                      <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Sync Attendance</th>
                      <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Prorata / Adj.</th>
                      <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Net Salary</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Gross Bruto</th>
                      <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">PPh 21 (TER)</th>
                      <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">BPJS Total</th>
                      <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Net Payable</th>
                    </>
                  )}
                  <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-neutral-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={emp.avatar} className="w-10 h-10 rounded-xl" />
                        <div>
                          <p className="text-[13px] font-black text-neutral-900">{emp.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">{emp.role}</span>
                            <span className="w-1 h-1 rounded-full bg-neutral-300" />
                            <span className="text-[10px] font-black text-blue-500">{emp.ptkp}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {activeTab === "hr" ? (
                      <>
                        <td className="px-6 py-4 text-[13px] font-bold text-neutral-600">{formatCurrency(emp.basic)}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                             <span className="text-[13px] font-black text-neutral-700">{emp.attendanceDays} / {emp.workingDays} Days</span>
                             {emp.unpaidLeave > 0 && <span className="text-[10px] font-bold text-rose-500">Unpaid: {emp.unpaidLeave} Days</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`text-[13px] font-bold ${emp.unpaidLeave > 0 ? "text-rose-500" : "text-green-600"}`}>
                             {emp.unpaidLeave > 0 ? `-${formatCurrency(emp.breakdown.unpaidLeaveDeduction)}` : "No Adjustment"}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-[13px] font-black text-neutral-900">{formatCurrency(emp.netSalary)}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-[13px] font-black text-neutral-900">{formatCurrency(emp.breakdown.grossIncome)}</td>
                        <td className="px-6 py-4 text-[13px] font-black text-indigo-600">-{formatCurrency(emp.breakdown.pph21Amount)}</td>
                        <td className="px-6 py-4 text-[13px] font-bold text-rose-500">
                          -{formatCurrency(emp.breakdown.bpjs.health.employee + emp.breakdown.bpjs.jht.employee)}
                        </td>
                        <td className="px-6 py-4 text-[14px] font-black text-blue-600">{formatCurrency(emp.netSalary)}</td>
                      </>
                    )}

                    <td className="px-6 py-4">
                       <Badge className={`${emp.status === "Published" ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"} border-none text-[9px] font-black uppercase tracking-widest px-2.5`}>
                          {emp.status}
                       </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                          onClick={() => setShowSlipPreview(emp.id)}
                          className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                         >
                           <Printer size={18} />
                         </button>
                         <button className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all">
                           <Settings size={18} />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pemanggilan Komponen Modal Slip Gaji tanpa 'any' */}
        <EnhancedPayslipModal
          showSlipPreview={showSlipPreview}
          setShowSlipPreview={setShowSlipPreview}
          selectedPeriod={selectedPeriod}
          selectedEmployeeSlip={selectedEmployeeSlip}
        />

      </div>
    );
  }

  // Employee View
  return (
     <div className="space-y-6 animate-in fade-in duration-500">
        <h1 className="text-2xl font-black text-neutral-900">My Compensation</h1>
        <div className="bg-neutral-50 p-12 rounded-[40px] text-center">
           <p className="text-neutral-400 font-bold">Accessing Personal Payroll Dashboard...</p>
        </div>
     </div>
  );
}
