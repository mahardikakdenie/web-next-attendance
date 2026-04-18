"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { 
  Wallet, 
  ArrowUpRight,
  Printer,
  Users,
  FileSpreadsheet,
  Eye,
  EyeOff,
  Filter,
  Plus,
  Loader2,
  CheckCircle2,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuthStore, ROLES } from "@/store/auth.store";
import { Badge } from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { getProfileImage } from "@/lib/utils";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { DataTable, Column } from "@/components/ui/DataTable";
import EnhancedPayslipModal from "@/components/ui/EnhancedPayslipModal"; 
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getPayrollSummary, 
  getPayrollList, 
  generatePayrollCycle, 
  publishPayroll 
} from "@/service/payroll";
import { CustomApiError, PayrollRecord } from "@/types/api";
import { toast } from "sonner";
import dayjs from "dayjs";
import Input from "@/components/ui/Input";

export default function PayrollView() {
  const { user, loading: authLoading } = useAuthStore();
  const queryClient = useQueryClient();
  const isAdmin = user?.role?.name === ROLES.SUPERADMIN || user?.role?.name === ROLES.ADMIN || user?.role?.name === ROLES.HR || user?.role?.name === ROLES.FINANCE;
  
  const [activeTab, setActiveTab] = useState<"hr" | "finance">("hr");
  const [selectedPeriod, setSelectedPeriod] = useState(dayjs().format("YYYY-MM"));
  const [showSlipPreview, setShowSlipPreview] = useState<number | null>(null);
  const [isMasked, setIsMasked] = useState(true);
  
  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const toggleMask = () => setIsMasked(!isMasked);

  const navigatePeriod = (direction: 'next' | 'prev') => {
    setSelectedPeriod(prev => 
      dayjs(prev).add(direction === 'next' ? 1 : -1, 'month').format("YYYY-MM")
    );
  };

  // Queries
  const { data: summaryResp, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["payroll-summary", selectedPeriod],
    queryFn: () => getPayrollSummary(selectedPeriod),
    enabled: !!user && isAdmin,
  });

  const { data: listResp, isLoading: isListLoading } = useQuery({
    queryKey: ["payroll-list", selectedPeriod, currentPage, limit, debouncedSearch],
    queryFn: () => getPayrollList({ 
      period: selectedPeriod, 
      page: currentPage, 
      limit, 
      search: debouncedSearch 
    }),
    enabled: !!user && isAdmin,
  });

  // Mutations
  const generateMutation = useMutation({
    mutationFn: () => generatePayrollCycle(selectedPeriod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-list"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-summary"] });
      toast.success("Payroll cycle generated successfully");
    },
    onError: (err: CustomApiError) => {
      toast.error(err.response?.data?.meta?.message || "Failed to generate payroll");
    }
  });

  const publishMutation = useMutation({
    mutationFn: (id: number) => publishPayroll(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-list"] });
      toast.success("Payslip published to employee");
    },
    onError: (err: CustomApiError) => {
      toast.error(err.response?.data?.meta?.message || "Failed to publish payslip");
    }
  });

  const formatCurrency = useCallback((amount: number | undefined) => {
    if (isMasked) return "Rp ••••••••";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  }, [isMasked]);

  const payrollData = useMemo(() => {
    return listResp?.data || [];
  }, [listResp?.data]);
  const meta = listResp?.meta;
  const stats = summaryResp?.data;

  const selectedEmployeeSlip = useMemo(() => {
    if (!showSlipPreview) return null;
    return payrollData.find(e => e.id === showSlipPreview) || null;
  }, [showSlipPreview, payrollData]);

  const columns: Column<PayrollRecord>[] = useMemo(() => {
    const baseCols: Column<PayrollRecord>[] = [
      {
        header: "Employee",
        accessor: (emp) => (
          <div className="flex items-center gap-3">
            <Avatar src={getProfileImage(emp.user?.media_url)} className="w-10 h-10 rounded-xl" />
            <div>
              <p className="text-[13px] font-black text-neutral-900">{emp.user?.full_name || 'Unknown'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">{emp.user?.position || 'Staff'}</span>
                <span className="w-1 h-1 rounded-full bg-neutral-300" />
                <span className="text-[10px] font-black text-blue-500">{emp.user?.ptkp_status || '-'}</span>
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
          accessor: (emp) => formatCurrency(emp.breakdown?.earnings?.basic_salary),
          sortable: true,
        },
        {
          header: "Sync Attendance",
          accessor: (emp) => {
            // Menggunakan any agar tidak error di TypeScript jika field ini tidak dikirim API
            const attendanceDays = (emp).attendance_days || 0;
            const workingDays = (emp).working_days || 0;
            const unpaidLeaveDays = (emp).unpaid_leave_days || 0;
            
            return (
              <div className="flex flex-col">
                 <span className="text-[13px] font-black text-neutral-700">{attendanceDays} / {workingDays} Days</span>
                 {unpaidLeaveDays > 0 && <span className="text-[10px] font-bold text-rose-500">Unpaid: {unpaidLeaveDays} Days</span>}
              </div>
            );
          },
        },
        {
          header: "Prorata / Adj.",
          accessor: (emp) => {
            const deduction = emp.breakdown?.deductions?.unpaid_leave_deduction || 0;
            return (
              <span className={`text-[13px] font-bold ${deduction > 0 ? "text-rose-500" : "text-green-600"}`}>
                {deduction > 0 ? `-${formatCurrency(deduction)}` : "No Adjustment"}
              </span>
            );
          },
        },
        {
          header: "Net Salary",
          accessor: (emp) => formatCurrency(emp.net_salary),
          sortable: true,
          className: "font-black text-neutral-900"
        }
      );
    } else {
      baseCols.push(
        {
          header: "Gross Bruto",
          accessor: (emp) => formatCurrency(emp.breakdown?.earnings?.gross_income),
          sortable: true,
          className: "font-black text-neutral-900"
        },
        {
          header: "PPh 21 (TER)",
          accessor: (emp) => `-${formatCurrency(emp.breakdown?.deductions?.pph21_amount)}`,
          className: "font-black text-indigo-600"
        },
        {
          header: "BPJS Total",
          accessor: (emp) => {
            const bpjsKaryawan = 
              (emp.breakdown?.deductions?.bpjs_health_employee || 0) + 
              (emp.breakdown?.deductions?.bpjs_jht_employee || 0) + 
              (emp.breakdown?.deductions?.bpjs_jp_employee || 0);
              
            return `-${formatCurrency(bpjsKaryawan)}`;
          },
          className: "font-bold text-rose-500"
        },
        {
          header: "Net Payable",
          accessor: (emp) => formatCurrency(emp.net_salary),
          sortable: true,
          className: "font-black text-blue-600"
        }
      );
    }

    baseCols.push({
      header: "Status",
      accessor: (emp) => (
        <Badge className={`${emp.status === "Published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"} border-none text-[9px] font-black uppercase tracking-widest px-2.5`}>
          {emp.status}
        </Badge>
      ),
      sortable: true,
    });

    return baseCols;
  }, [activeTab, formatCurrency]);

  const actions = (emp: PayrollRecord) => (
    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {emp.status === "Draft" && (
        <button 
          onClick={() => publishMutation.mutate(emp.id)}
          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
          title="Publish Slip"
        >
          <CheckCircle2 size={18} />
        </button>
      )}
      <button 
        onClick={() => setShowSlipPreview(emp.id)}
        className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
        title="Print Slip"
      >
        <Printer size={18} />
      </button>
    </div>
  );

  if (authLoading || (user && !isAdmin)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      
      {/* Header Management */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight leading-none">Payroll Operations</h1>
            <button 
              onClick={toggleMask}
              className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-500 rounded-xl transition-all"
              title={isMasked ? "Show Salary" : "Hide Salary"}
            >
              {isMasked ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          
          {/* Island Date Filter */}
          <div className="flex items-center gap-4">
             <Badge className="bg-blue-50 text-blue-600 border-none px-3 py-1.5 text-[10px] font-black uppercase tracking-wider">Enterprise Mode</Badge>
             
             <div className="flex items-center bg-white p-1 rounded-2xl border border-neutral-200 shadow-sm">
                <button 
                  onClick={() => navigatePeriod('prev')}
                  className="p-2 hover:bg-neutral-50 rounded-xl transition-all text-neutral-400 hover:text-neutral-900"
                >
                  <ChevronLeft size={16} strokeWidth={3} />
                </button>
                
                <div className="px-4 flex flex-col items-center min-w-[140px]">
                  <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">Payroll Period</span>
                  <span className="text-sm font-black text-neutral-900 leading-none">
                    {dayjs(selectedPeriod).format("MMMM YYYY")}
                  </span>
                </div>

                <button 
                  onClick={() => navigatePeriod('next')}
                  className="p-2 hover:bg-neutral-50 rounded-xl transition-all text-neutral-400 hover:text-neutral-900"
                >
                  <ChevronRight size={16} strokeWidth={3} />
                </button>
             </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            disabled={generateMutation.isPending}
            onClick={() => generateMutation.mutate()}
            className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 px-5 py-2.5 rounded-2xl transition-all"
          >
            {generateMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            <span className="font-bold">New Cycle</span>
          </Button>
        </div>
      </div>

      {/* Custom Role Tabs */}
      <div className="flex p-1.5 bg-neutral-100 rounded-[22px] w-fit border border-neutral-200/50 shadow-inner">
        <button 
          onClick={() => setActiveTab("hr")}
          className={`flex items-center gap-2 px-8 py-2.5 rounded-[18px] text-[11px] font-black uppercase tracking-wider transition-all ${activeTab === "hr" ? "bg-white text-blue-600 shadow-md" : "text-neutral-400 hover:text-neutral-900"}`}
        >
          <Users size={16} />
          <span>HR Administration</span>
        </button>
        <button 
          onClick={() => setActiveTab("finance")}
          className={`flex items-center gap-2 px-8 py-2.5 rounded-[18px] text-[11px] font-black uppercase tracking-wider transition-all ${activeTab === "finance" ? "bg-white text-indigo-600 shadow-md" : "text-neutral-400 hover:text-neutral-900"}`}
        >
          <Wallet size={16} />
          <span>Finance & Tax</span>
        </button>
      </div>

      {/* Management Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isSummaryLoading ? <CardSkeleton /> : (
          <div className="bg-white p-6 rounded-4xl border border-neutral-100 shadow-sm">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Total Net Payout</p>
            <h3 className="text-xl font-black text-neutral-900">{formatCurrency(stats?.total_net_payout || 0)}</h3>
            <div className={`flex items-center gap-1 mt-2 ${(stats?.payout_diff_percentage || 0) >= 0 ? 'text-green-600' : 'text-rose-600'}`}>
               <ArrowUpRight size={14} className={(stats?.payout_diff_percentage || 0) < 0 ? 'rotate-90' : ''} />
               <span className="text-[10px] font-bold">{Math.abs(stats?.payout_diff_percentage || 0)}% from last month</span>
            </div>
          </div>
        )}
        {isSummaryLoading ? <CardSkeleton /> : (
          <div className="bg-white p-6 rounded-4xl border border-neutral-100 shadow-sm">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Tax Liability (PPh 21)</p>
            <h3 className="text-xl font-black text-indigo-600">{formatCurrency(stats?.total_tax_liability || 0)}</h3>
            <p className="text-[10px] font-bold text-neutral-400 mt-2">Calculated via TER Scheme</p>
          </div>
        )}
        {isSummaryLoading ? <CardSkeleton /> : (
          <div className="bg-white p-6 rounded-4xl border border-neutral-100 shadow-sm">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">BPJS Provision</p>
            <h3 className="text-xl font-black text-rose-500">{formatCurrency(stats?.total_bpjs_provision || 0)}</h3>
            <p className="text-[10px] font-bold text-neutral-400 mt-2">Comp: 4% | Emp: 1%</p>
          </div>
        )}
        {isSummaryLoading ? <CardSkeleton /> : (
          <div className="bg-white p-6 rounded-4xl border border-neutral-100 shadow-sm">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Attendance Sync</p>
            <h3 className="text-xl font-black text-neutral-900">{stats?.attendance_sync_rate || 0}%</h3>
            <p className="text-[10px] font-bold text-blue-600 mt-2">Automated Integration Active</p>
          </div>
        )}
      </div>

      {/* Main Content Area / Table */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex gap-2">
             <Button variant="secondary" className="px-5 rounded-2xl">
                <Filter size={18} />
                <span className="font-bold">Filters</span>
             </Button>
             <Button className="bg-neutral-900 px-5 rounded-2xl flex items-center gap-2 shadow-md hover:bg-neutral-800 transition-all text-white">
                <FileSpreadsheet size={18} />
                <span className="font-bold">Export CSV</span>
             </Button>
          </div>
          <div className="relative group max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <Input
              placeholder="Search by name or NIK..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 bg-white border-neutral-200 rounded-2xl shadow-xs"
            />
          </div>
        </div>

        <DataTable 
          data={payrollData} 
          columns={columns} 
          actions={actions}
          isLoading={isListLoading}
          currentPage={currentPage}
          totalPages={meta ? meta?.pagination?.last_page : 1}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {showSlipPreview && selectedEmployeeSlip && (
        <EnhancedPayslipModal
          showSlipPreview={!!showSlipPreview}
          setShowSlipPreview={() => setShowSlipPreview(null)}
          selectedPeriod={dayjs(selectedPeriod).format("MMMM YYYY")}
          selectedEmployeeSlip={selectedEmployeeSlip}
        />
      )}

    </div>
  );
}
