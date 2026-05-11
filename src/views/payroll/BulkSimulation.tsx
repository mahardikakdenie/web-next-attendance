"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { 
  FileSpreadsheet, 
  Wallet, 
  Users, 
  Loader2, 
  AlertCircle,
  Building2,
  Receipt,
  RefreshCw,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { useQuery } from "@tanstack/react-query";
import { 
  getEmployeeBaseline, 
  getEmployeeAttendanceSync
} from "@/service/payroll";
import { getDataUserslist } from "@/service/users";
import { calculatePayroll, PayrollInput } from "@/lib/payrollCalculator";
import { toast } from "sonner";
import dayjs from "dayjs";
import Input from "@/components/ui/Input";

interface SimulationResult {
  id: number;
  userId: number;
  name: string;
  employeeId: string;
  department: string;
  calculation: ReturnType<typeof calculatePayroll>;
}

export default function BulkSimulation({ period }: { period: string }) {
  const [runType, setRunType] = useState<'Regular' | 'THR' | 'Bonus' | 'All'>('Regular');
  const [method, setMethod] = useState<'Gross' | 'Net'>('Gross');
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch all employees
  const { data: employeesResp } = useQuery({
    queryKey: ["employees-list-bulk"],
    queryFn: () => getDataUserslist({ limit: 1000 }),
  });

  const employees = useMemo(() => employeesResp?.data || [], [employeesResp]);

  // State to hold simulation results
  const [simulations, setSimulations] = useState<SimulationResult[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const startSimulation = useCallback(async () => {
    if (employees.length === 0) return;
    
    setIsSimulating(true);
    const results: SimulationResult[] = [];
    
    try {
      // We'll process in batches to avoid overwhelming the browser/UI
      const batchSize = 10;
      for (let i = 0; i < employees.length; i += batchSize) {
        const batch = employees.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (emp) => {
          try {
            // 1. Fetch Baseline
            const baselineResp = await getEmployeeBaseline(emp.id);
            // 2. Fetch Attendance Sync
            const syncResp = await getEmployeeAttendanceSync(emp.id, period);

            if (baselineResp.data && syncResp.data) {
              const baseline = baselineResp.data;
              const sync = syncResp.data;

              const calc = calculatePayroll({
                runType,
                method,
                basicSalary: baseline.basic_salary,
                fixedAllowances: baseline.fixed_allowances,
                incentives: 0,
                dailyMealAllowance: 0,
                dailyTransportAllowance: 0,
                attendanceDays: sync.attendance_days,
                workingDaysInMonth: sync.working_days_in_month,
                overtimeHours: sync.overtime_hours,
                unpaidLeaveDays: sync.unpaid_leave_days,
                ptkpStatus: baseline.ptkp_status as PayrollInput['ptkpStatus'],
              });

              results.push({
                id: emp.id,
                userId: emp.id,
                name: emp.name,
                employeeId: emp.employee_id,
                department: emp.department,
                calculation: calc
              });
            }
          } catch (err) {
            console.error(`Failed to simulate for ${emp.name}`, err);
          }
        }));
      }
      setSimulations(results);
      toast.success(`Simulated payroll for ${results.length} employees`);
    } catch (error) {
      console.error("Bulk simulation error:", error);
      toast.error("Failed to run bulk simulation");
    } finally {
      setIsSimulating(false);
    }
  }, [employees, period, runType, method]);

  // Run simulation only when explicitly requested or when employees first load
  useEffect(() => {
    if (employees.length > 0 && simulations.length === 0) {
      startSimulation();
    }
    // We intentionally only want this to run once on load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees.length]);

  const stats = useMemo(() => {
    return simulations.reduce((acc, curr) => {
      acc.totalNet += curr.calculation.netSalary;
      acc.totalTax += curr.calculation.breakdown.pph21Amount;
      acc.totalBpjs += (
        curr.calculation.breakdown.bpjs.health.employee + 
        curr.calculation.breakdown.bpjs.jht.employee + 
        curr.calculation.breakdown.bpjs.jp.employee
      );
      acc.totalCompanyCost += curr.calculation.totalCompanyCost;
      return acc;
    }, { totalNet: 0, totalTax: 0, totalBpjs: 0, totalCompanyCost: 0 });
  }, [simulations]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredSimulations = useMemo(() => {
    return simulations.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [simulations, searchTerm]);

  const columns: Column<SimulationResult>[] = [
    {
      header: "Employee",
      accessor: (row) => (
        <div>
          <p className="font-black text-neutral-900">{row.name}</p>
          <p className="text-[10px] font-bold text-neutral-400 uppercase">{row.employeeId} • {row.department}</p>
        </div>
      ),
    },
    {
      header: "Gross Income",
      accessor: (row) => formatCurrency(row.calculation.breakdown.grossIncome),
      className: "font-bold text-neutral-700"
    },
    {
      header: "Tax (PPh 21)",
      accessor: (row) => (
        <span className="text-rose-500 font-bold">
          -{formatCurrency(row.calculation.breakdown.pph21Amount)}
        </span>
      ),
    },
    {
      header: "BPJS (Emp)",
      accessor: (row) => {
        const bpjs = row.calculation.breakdown.bpjs;
        const total = bpjs.health.employee + bpjs.jht.employee + bpjs.jp.employee;
        return <span className="text-rose-500 font-bold">-{formatCurrency(total)}</span>;
      },
    },
    {
      header: "Net Salary",
      accessor: (row) => formatCurrency(row.calculation.netSalary),
      className: "font-black text-blue-600"
    },
    {
      header: "Company Cost",
      accessor: (row) => formatCurrency(row.calculation.totalCompanyCost),
      className: "font-bold text-neutral-500"
    }
  ];

  const exportToCSV = () => {
    const headers = ["Employee Name", "ID", "Department", "Gross Income", "Tax", "BPJS Emp", "Net Salary", "Company Cost"];
    const rows = simulations.map(s => [
      s.name,
      s.employeeId,
      s.department,
      s.calculation.breakdown.grossIncome,
      s.calculation.breakdown.pph21Amount,
      s.calculation.breakdown.bpjs.health.employee + s.calculation.breakdown.bpjs.jht.employee + s.calculation.breakdown.bpjs.jp.employee,
      s.calculation.netSalary,
      s.calculation.totalCompanyCost
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payroll_simulation_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Bulk Simulation Calculator</h2>
          <p className="text-sm text-neutral-500 font-medium">Projecting payroll costs for {dayjs(period).format("MMMM YYYY")}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            onClick={startSimulation}
            disabled={isSimulating}
            className="rounded-2xl h-11 px-6"
          >
            {isSimulating ? <Loader2 className="animate-spin mr-2" size={18} /> : <RefreshCw className="mr-2" size={18} />}
            <span className="font-bold">Recalculate All</span>
          </Button>
          <Button 
            onClick={exportToCSV}
            disabled={simulations.length === 0}
            className="bg-neutral-900 text-white hover:bg-neutral-800 rounded-2xl h-11 px-6"
          >
            <FileSpreadsheet className="mr-2" size={18} />
            <span className="font-bold">Export Projection</span>
          </Button>
        </div>
      </div>

      {/* Configuration Island */}
      <div className="bg-white p-4 rounded-3xl border border-neutral-200 shadow-sm flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Run Type:</span>
          <div className="flex bg-neutral-100 p-1 rounded-xl">
            {(['Regular', 'THR', 'Bonus', 'All'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setRunType(t)}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${runType === t ? "bg-white text-blue-600 shadow-sm" : "text-neutral-400 hover:text-neutral-600"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Tax Method:</span>
          <div className="flex bg-neutral-100 p-1 rounded-xl">
            {(['Gross', 'Net'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${method === m ? "bg-white text-indigo-600 shadow-sm" : "text-neutral-400 hover:text-neutral-600"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-lg shadow-blue-600/20">
          <div className="flex items-center gap-2 mb-4 opacity-80">
            <Wallet size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Total Net Payout</span>
          </div>
          <h3 className="text-2xl font-black">{formatCurrency(stats.totalNet)}</h3>
          <p className="text-[10px] font-bold mt-2 opacity-60 italic">Estimated employee take-home</p>
        </div>
        <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-lg shadow-indigo-600/20">
          <div className="flex items-center gap-2 mb-4 opacity-80">
            <Receipt size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Tax Provision (PPh 21)</span>
          </div>
          <h3 className="text-2xl font-black">{formatCurrency(stats.totalTax)}</h3>
          <p className="text-[10px] font-bold mt-2 opacity-60 italic">Projected TER monthly tax</p>
        </div>
        <div className="bg-rose-500 p-6 rounded-[2rem] text-white shadow-lg shadow-rose-500/20">
          <div className="flex items-center gap-2 mb-4 opacity-80">
            <Users size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">BPJS Total Provision</span>
          </div>
          <h3 className="text-2xl font-black">{formatCurrency(stats.totalBpjs)}</h3>
          <p className="text-[10px] font-bold mt-2 opacity-60 italic">Estimated social security</p>
        </div>
        <div className="bg-neutral-900 p-6 rounded-[2rem] text-white shadow-lg shadow-neutral-900/20">
          <div className="flex items-center gap-2 mb-4 opacity-80">
            <Building2 size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Total Company Cost</span>
          </div>
          <h3 className="text-2xl font-black text-emerald-400">{formatCurrency(stats.totalCompanyCost)}</h3>
          <p className="text-[10px] font-bold mt-2 opacity-60 italic">Complete expense projection</p>
        </div>
      </div>

      {/* Simulation Info */}
      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
        <AlertCircle className="text-amber-600 shrink-0" size={18} />
        <p className="text-[11px] text-amber-800 font-medium">
          <strong>Simulation Mode:</strong> This data is calculated locally based on the latest employee baselines and current period attendance. 
          Values may change if employee profiles or attendance records are updated. These records are <strong>not saved</strong> until you perform a Bulk Generation.
        </p>
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        <div className="flex justify-end">
          <div className="relative group max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <Input
              placeholder="Filter by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-11 bg-white border-neutral-200 rounded-2xl"
            />
          </div>
        </div>

        <DataTable 
          data={filteredSimulations} 
          columns={columns} 
          isLoading={isSimulating}
        />
      </div>
    </div>
  );
}
