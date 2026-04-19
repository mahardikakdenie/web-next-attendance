"use client";

import { useState } from "react";
import { 
  Landmark, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Users,
  Search
} from "lucide-react";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { EmployeeLoan } from "@/types/finance";

const MOCK_LOANS: EmployeeLoan[] = [
  { id: "LOAN-001", employeeName: "Alex Johnson", avatar: null, principalAmount: 5000000, monthlyInstallment: 1000000, remainingBalance: 2000000, interestRate: 0, tenorMonths: 5, paidMonths: 3, status: "Active", startDate: "2024-01-01" },
  { id: "LOAN-002", employeeName: "Sarah Chen", avatar: null, principalAmount: 2000000, monthlyInstallment: 500000, remainingBalance: 0, interestRate: 0, tenorMonths: 4, paidMonths: 4, status: "Paid", startDate: "2023-11-01" },
  { id: "LOAN-003", employeeName: "Marcus Miller", avatar: null, principalAmount: 10000000, monthlyInstallment: 2000000, remainingBalance: 10000000, interestRate: 0, tenorMonths: 5, paidMonths: 0, status: "Pending", startDate: "2024-04-01" },
];

export default function LoansView() {
  const [loans] = useState<EmployeeLoan[]>(MOCK_LOANS);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const columns: Column<EmployeeLoan>[] = [
    {
      header: "Employee",
      accessor: (l) => (
        <div className="flex items-center gap-3">
          <Avatar src={l.avatar} name={l.employeeName} className="w-8 h-8 rounded-lg" />
          <div>
            <p className="font-bold text-slate-700 leading-none">{l.employeeName}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{l.id}</p>
          </div>
        </div>
      ),
      sortable: true
    },
    {
      header: "Principal",
      accessor: (l) => <span className="font-bold text-slate-900">{formatCurrency(l.principalAmount)}</span>,
      sortable: true
    },
    {
      header: "Installment",
      accessor: (l) => (
        <div className="flex flex-col">
          <span className="font-black text-blue-600">{formatCurrency(l.monthlyInstallment)}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase">per month</span>
        </div>
      )
    },
    {
      header: "Progress",
      accessor: (l) => {
        const progress = (l.paidMonths / l.tenorMonths) * 100;
        return (
          <div className="flex flex-col gap-1.5 w-32">
            <div className="flex justify-between text-[10px] font-black uppercase">
              <span className="text-slate-400">{l.paidMonths}/{l.tenorMonths} Mos</span>
              <span className="text-blue-600">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        );
      }
    },
    {
      header: "Remaining",
      accessor: (l) => <span className="font-black text-rose-600">{formatCurrency(l.remainingBalance)}</span>,
      sortable: true
    },
    {
      header: "Status",
      accessor: (l) => {
        const styles = {
          Active: "bg-blue-100 text-blue-700",
          Paid: "bg-emerald-100 text-emerald-700",
          Pending: "bg-amber-100 text-amber-700",
          Rejected: "bg-rose-100 text-rose-700"
        };
        return (
          <Badge className={`${styles[l.status as keyof typeof styles]} border-none font-black text-[9px] uppercase tracking-widest`}>
            {l.status}
          </Badge>
        );
      }
    }
  ];

  const actions = () => (
    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
      <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl">
        <MoreHorizontal size={18} />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Landmark size={20} strokeWidth={2.5} />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Financial Assistance</span>
          </div>
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Employee Loans</h1>
          <p className="text-neutral-500 font-medium">Manage cash advances and track automatic payroll deductions.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" className="px-5 rounded-2xl">
            <Filter size={18} />
            <span className="font-bold text-sm">Filter Status</span>
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 px-5 rounded-2xl">
            <Plus size={18} strokeWidth={3} />
            <span className="font-bold text-sm">New Loan</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Outstanding</p>
           <h3 className="text-2xl font-black text-slate-900">Rp 124.5M</h3>
           <div className="flex items-center gap-1 mt-2 text-rose-500">
              <TrendingUp size={14} />
              <span className="text-[10px] font-bold">+2.4% vs last month</span>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Active Loans</p>
           <h3 className="text-2xl font-black text-slate-900">12 Users</h3>
           <div className="flex items-center gap-1 mt-2 text-blue-500 font-bold text-[10px]">
              <Users size={14} /> 4.2% of total staff
           </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Monthly Recovery</p>
           <h3 className="text-2xl font-black text-emerald-600">Rp 18.2M</h3>
           <div className="flex items-center gap-1 mt-2 text-emerald-500 font-bold text-[10px]">
              <CheckCircle2 size={14} /> Auto-deduction active
           </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pending Review</p>
           <h3 className="text-2xl font-black text-amber-600">3 Requests</h3>
           <div className="flex items-center gap-1 mt-2 text-amber-500 font-bold text-[10px]">
              <AlertCircle size={14} /> Action required
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Portfolio</h2>
           <div className="flex items-center gap-2">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                <input 
                  type="text" 
                  placeholder="Search loans..." 
                  className="pl-9 pr-4 h-10 bg-slate-100 border-none rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-500/5 outline-none transition-all w-48"
                />
              </div>
              <button className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all"><Filter size={18} /></button>
           </div>
        </div>

        <DataTable 
          data={loans} 
          columns={columns} 
          actions={actions}
          limit={limit}
          onLimitChange={setLimit}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

    </div>
  );
}
