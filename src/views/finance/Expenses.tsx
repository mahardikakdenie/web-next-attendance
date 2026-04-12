"use client";

import { useState, useMemo } from "react";
import { 
  Receipt, 
  Plus, 
  Check, 
  X, 
  MoreHorizontal, 
  Filter,
  Wallet,
  Clock,
  CheckCircle2
} from "lucide-react";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { ExpenseClaim } from "@/types/finance";

const MOCK_CLAIMS: ExpenseClaim[] = [
  { id: "EXP-001", employeeName: "Alex Johnson", avatar: "https://i.pravatar.cc/150?u=alex", category: "Travel", amount: 450000, date: "2024-03-15", description: "Taxi to client office", status: "Pending" },
  { id: "EXP-002", employeeName: "Sarah Chen", avatar: "https://i.pravatar.cc/150?u=sarah", category: "Medical", amount: 1200000, date: "2024-03-14", description: "Annual health checkup", status: "Approved" },
  { id: "EXP-003", employeeName: "Marcus Miller", avatar: "https://i.pravatar.cc/150?u=marcus", category: "Supplies", amount: 250000, date: "2024-03-12", description: "Office stationery", status: "Rejected" },
  { id: "EXP-004", employeeName: "Alex Johnson", avatar: "https://i.pravatar.cc/150?u=alex", category: "Travel", amount: 2100000, date: "2024-03-10", description: "Flight to Singapore conference", status: "Approved" },
];

export default function ExpensesView() {
  const [claims] = useState<ExpenseClaim[]>(MOCK_CLAIMS);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved">("all");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      if (activeTab === "all") return true;
      return c.status.toLowerCase() === activeTab;
    });
  }, [claims, activeTab]);

  const columns: Column<ExpenseClaim>[] = [
    {
      header: "Claim ID",
      accessor: (c) => <span className="font-black text-slate-900">{c.id}</span>,
      sortable: true
    },
    {
      header: "Employee",
      accessor: (c) => (
        <div className="flex items-center gap-3">
          <Avatar src={c.avatar} className="w-8 h-8 rounded-lg" />
          <span className="font-bold text-slate-700">{c.employeeName}</span>
        </div>
      ),
      sortable: true
    },
    {
      header: "Category",
      accessor: (c) => (
        <Badge className="bg-slate-100 text-slate-600 border-none font-bold text-[10px] px-2.5">
          {c.category}
        </Badge>
      )
    },
    {
      header: "Amount",
      accessor: (c) => <span className="font-black text-slate-900">{formatCurrency(c.amount)}</span>,
      sortable: true
    },
    {
      header: "Date",
      accessor: (c) => <span className="text-xs font-bold text-slate-500">{c.date}</span>,
      sortable: true
    },
    {
      header: "Status",
      accessor: (c) => {
        const styles = {
          Pending: "bg-amber-100 text-amber-700",
          Approved: "bg-emerald-100 text-emerald-700",
          Rejected: "bg-rose-100 text-rose-700"
        };
        return (
          <Badge className={`${styles[c.status]} border-none font-black text-[9px] uppercase tracking-widest`}>
            {c.status}
          </Badge>
        );
      }
    }
  ];

  const actions = (c: ExpenseClaim) => (
    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
      {c.status === "Pending" && (
        <>
          <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl" title="Approve">
            <Check size={18} strokeWidth={3} />
          </button>
          <button className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl" title="Reject">
            <X size={18} strokeWidth={3} />
          </button>
        </>
      )}
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
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <Receipt size={20} strokeWidth={2.5} />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Expense Management</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Reimbursements</h1>
          <p className="text-slate-500 font-medium">Review and process employee claims and operational expenses.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" className="px-5 rounded-2xl">
            <Filter size={18} />
            <span className="font-bold text-sm">Filter Status</span>
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 px-5 rounded-2xl">
            <Plus size={18} strokeWidth={3} />
            <span className="font-bold text-sm">New Claim</span>
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
           <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={28} strokeWidth={2.5} />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Approval</p>
              <h3 className="text-2xl font-black text-slate-900">Rp 4.2M</h3>
           </div>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
           <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={28} strokeWidth={2.5} />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Approved This Month</p>
              <h3 className="text-2xl font-black text-slate-900">Rp 12.8M</h3>
           </div>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
           <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet size={28} strokeWidth={2.5} />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Top Category</p>
              <h3 className="text-2xl font-black text-slate-900">Travel (60%)</h3>
           </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="space-y-6">
        <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit border border-slate-200/50">
          {(["all", "pending", "approved"] as const).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <DataTable 
          data={filteredClaims} 
          columns={columns} 
          actions={actions}
          searchKey="id"
          searchPlaceholder="Search by Claim ID..."
        />
      </div>

    </div>
  );
}
