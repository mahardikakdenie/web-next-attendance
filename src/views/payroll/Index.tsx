"use client";

import { useState, useMemo, useCallback } from "react";
import { 
  Wallet, 
  ArrowUpRight,
  Printer,
  Users,
  Settings,
  CreditCard,
  FileSpreadsheet,
  Eye,
  EyeOff,
  Filter,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuthStore, ROLES } from "@/store/auth.store";
import { Badge } from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { calculatePayroll } from "@/lib/payrollCalculator";
import { TableSkeleton, Skeleton, CardSkeleton } from "@/components/ui/Skeleton";
import { DataTable, Column } from "@/components/ui/DataTable";

import EnhancedPayslipModal from "@/components/ui/EnhancedPayslipModal"; 

// --- TYPESCRIPT DEFINITIONS ---
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

type EmployeePayrollRecord = typeof MOCK_EMPLOYEE_PAYROLL[0] & CalculatedResult;

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
  const { user, loading } = useAuthStore();
  const role = user?.role?.name;
  const isAdmin = role === ROLES.SUPERADMIN || role === ROLES.ADMIN || role === ROLES.HR;
  
  const [activeTab, setActiveTab] = useState<"hr" | "finance">("hr");
  const selectedPeriod = "March 2024";
  const [showSlipPreview, setShowSlipPreview] = useState<number | null>(null);
  const [isMasked, setIsMasked] = useState(true);

  const formatCurrency = useCallback((amount: number) => {
    if (isMasked) {
      return "Rp ••••••••";
    }
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }, [isMasked]);

  const toggleMask = () => setIsMasked(!isMasked);

  const calculatedData = useMemo<EmployeePayrollRecord[]>(() => {
    return MOCK_EMPLOYEE_PAYROLL.map(emp => {
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

  const selectedEmployeeSlip = useMemo<EmployeePayrollRecord | null>(() => {
    if (!showSlipPreview) return null;
    return calculatedData.find(e => e.id === showSlipPreview) || null;
  }, [showSlipPreview, calculatedData]);

  const handleExportBankFile = () => {
    alert("System: Generating Bank Transfer File (LLG/RTGS Format)... \nStatus: Success \nFile: payroll_export_march_2024.csv");
  };

  const columns: Column<EmployeePayrollRecord>[] = useMemo(() => {
    const baseCols: Column<EmployeePayrollRecord>[] = [
      {
        header: "Employee",
        accessor: (emp) => (
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
        ),
        sortable: true,
      }
    ];

    if (activeTab === "hr") {
      baseCols.push(
        {
          header: "Base Salary",
          accessor: (emp) => formatCurrency(emp.basic),
          sortable: true,
        },
        {
          header: "Sync Attendance",
          accessor: (emp) => (
            <div className="flex flex-col">
               <span className="text-[13px] font-black text-neutral-700">{emp.attendanceDays} / {emp.workingDays} Days</span>
               {emp.unpaidLeave > 0 && <span className="text-[10px] font-bold text-rose-500">Unpaid: {emp.unpaidLeave} Days</span>}
            </div>
          ),
        },
        {
          header: "Prorata / Adj.",
          accessor: (emp) => (
            <span className={`text-[13px] font-bold ${emp.unpaidLeave > 0 ? "text-rose-500" : "text-green-600"}`}>
              {emp.unpaidLeave > 0 ? `-${formatCurrency(emp.breakdown.unpaidLeaveDeduction)}` : "No Adjustment"}
            </span>
          ),
        },
        {
          header: "Net Salary",
          accessor: (emp) => formatCurrency(emp.netSalary),
          sortable: true,
          className: "font-black text-neutral-900"
        }
      );
    } else {
      baseCols.push(
        {
          header: "Gross Bruto",
          accessor: (emp) => formatCurrency(emp.breakdown.grossIncome),
          sortable: true,
          className: "font-black text-neutral-900"
        },
        {
          header: "PPh 21 (TER)",
          accessor: (emp) => `-${formatCurrency(emp.breakdown.pph21Amount)}`,
          className: "font-black text-indigo-600"
        },
        {
          header: "BPJS Total",
          accessor: (emp) => `-${formatCurrency(emp.breakdown.bpjs.health.employee + emp.breakdown.bpjs.jht.employee)}`,
          className: "font-bold text-rose-500"
        },
        {
          header: "Net Payable",
          accessor: (emp) => formatCurrency(emp.netSalary),
          sortable: true,
          className: "font-black text-blue-600"
        }
      );
    }

    baseCols.push({
      header: "Status",
      accessor: (emp) => (
        <Badge className={`${emp.status === "Published" ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"} border-none text-[9px] font-black uppercase tracking-widest px-2.5`}>
          {emp.status}
        </Badge>
      ),
      sortable: true,
    });

    return baseCols;
  }, [activeTab, formatCurrency]);

  const actions = (emp: EmployeePayrollRecord) => (
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
  );

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-10 w-64 rounded-xl" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-12 w-32 rounded-2xl" />
            <Skeleton className="h-12 w-40 rounded-2xl" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>

        <div className="bg-white rounded-4xl border border-neutral-100 p-8 shadow-sm">
          <TableSkeleton rows={6} cols={6} />
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
        
        {/* Header Management */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Payroll Operations</h1>
              <button 
                onClick={toggleMask}
                className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-500 rounded-xl transition-all"
                title={isMasked ? "Show Salary" : "Hide Salary"}
              >
                {isMasked ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-blue-100 text-blue-700 border-none px-2 py-0.5 text-[10px] font-black uppercase">Enterprise Mode</Badge>
              <p className="text-sm text-neutral-500 font-medium">Period: {selectedPeriod}</p>
            </div>
          </div>
          <div className="flex gap-3">
             {activeTab === "finance" && (
                <Button 
                  onClick={handleExportBankFile}
                  className="flex items-center gap-2 bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-50 shadow-sm px-5 py-2.5 rounded-2xl transition-all"
                >
                  <CreditCard size={18} />
                  <span className="font-bold">Disbursement</span>
                </Button>
             )}
            <Button className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 px-5 py-2.5 rounded-2xl transition-all">
              <Plus size={18} />
              <span className="font-bold">New Cycle</span>
            </Button>
          </div>
        </div>

        {/* Custom Role Tabs */}
        <div className="flex p-1.5 bg-neutral-100 rounded-[22px] w-fit border border-neutral-200/50 shadow-inner">
          <button 
            onClick={() => setActiveTab("hr")}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-[18px] text-[11px] font-black uppercase tracking-wider transition-all ${activeTab === "hr" ? "bg-white text-blue-600 shadow-md" : "text-neutral-500 hover:text-neutral-900"}`}
          >
            <Users size={16} />
            <span>HR Administration</span>
          </button>
          <button 
            onClick={() => setActiveTab("finance")}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-[18px] text-[11px] font-black uppercase tracking-wider transition-all ${activeTab === "finance" ? "bg-white text-indigo-600 shadow-md" : "text-neutral-500 hover:text-neutral-900"}`}
          >
            <Wallet size={16} />
            <span>Finance & Tax</span>
          </button>
        </div>

        {/* Management Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-4xl border border-neutral-100 shadow-sm">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Total Net Payout</p>
            <h3 className="text-xl font-black text-neutral-900">{formatCurrency(calculatedData.reduce((acc, curr) => acc + curr.netSalary, 0))}</h3>
            <div className="flex items-center gap-1 mt-2 text-green-600">
               <ArrowUpRight size={14} />
               <span className="text-[10px] font-bold">12.5% from last month</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-4xl border border-neutral-100 shadow-sm">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Tax Liability (PPh 21)</p>
            <h3 className="text-xl font-black text-indigo-600">{formatCurrency(calculatedData.reduce((acc, curr) => acc + curr.breakdown.pph21Amount, 0))}</h3>
            <p className="text-[10px] font-bold text-neutral-400 mt-2">Calculated via TER Scheme</p>
          </div>
          <div className="bg-white p-6 rounded-4xl border border-neutral-100 shadow-sm">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">BPJS Provision</p>
            <h3 className="text-xl font-black text-rose-500">{formatCurrency(1250000)}</h3>
            <p className="text-[10px] font-bold text-neutral-400 mt-2">Comp: 4% | Emp: 1%</p>
          </div>
          <div className="bg-white p-6 rounded-4xl border border-neutral-100 shadow-sm">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Attendance Sync</p>
            <h3 className="text-xl font-black text-neutral-900">98.2%</h3>
            <p className="text-[10px] font-bold text-blue-600 mt-2">Automated Integration Active</p>
          </div>
        </div>

        {/* Main Content Area / Table */}
        <div className="space-y-4">
          <div className="flex gap-2">
             <Button variant="secondary" className="px-5 rounded-2xl">
                <Filter size={18} />
                <span className="font-bold">Filters</span>
             </Button>
             <Button 
              onClick={handleExportBankFile}
              className="bg-neutral-900 px-5 rounded-2xl flex items-center gap-2 shadow-md"
             >
                <FileSpreadsheet size={18} />
                <span className="font-bold">Export CSV</span>
             </Button>
          </div>

          <DataTable 
            data={calculatedData} 
            columns={columns} 
            searchKey="name" 
            searchPlaceholder="Search by name or role..."
            actions={actions}
          />
        </div>

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
        <div className="bg-neutral-50 p-12 rounded-[40px] text-center border border-dashed border-neutral-200">
           <p className="text-neutral-400 font-bold">Accessing Personal Payroll Dashboard...</p>
        </div>
     </div>
  );
}
