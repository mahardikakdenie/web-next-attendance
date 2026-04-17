"use client";

import React, { useState, useCallback, useEffect } from "react";
import { 
  Users, 
  Search, 
  Building2, 
  Calendar,
  Clock,
  Wallet,
  Receipt,
  Plane,
  ChevronLeft,
  ChevronRight,
  Loader2,
  TrendingUp,
  Mail,
  MoreVertical,
  ShieldCheck,
  SearchX
} from "lucide-react";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { OwnerStats } from "@/types/api";
import { getOwnersStats } from "@/service/support";
import { toast } from "sonner";
import dayjs from "dayjs";
import { Can } from "@/components/auth/PermissionGuard";

const StatTooltip = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <div className="group/tooltip relative inline-flex items-center justify-center">
    {children}
    <div className="absolute bottom-full mb-3 hidden group-hover/tooltip:flex flex-col items-center z-[100] animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
      <div className="bg-slate-900 text-white text-[10px] font-bold leading-relaxed px-3 py-2 rounded-xl whitespace-normal min-w-[200px] shadow-2xl border border-white/10 text-center">
        {label}
      </div>
      <div className="w-2.5 h-2.5 bg-slate-900 rotate-45 -mt-1.5 border-r border-b border-white/10"></div>
    </div>
  </div>
);

export default function OwnersStatsView() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<OwnerStats[]>([]);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const resp = await getOwnersStats(limit, offset);
      if (resp.data) {
        setData(resp.data.items || []);
        setTotal(resp.data.total || 0);
      }
    } catch {
      toast.error("Failed to sync tenant monitoring data");
    } finally {
      setIsLoading(false);
    }
  }, [limit, offset]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchData();
    });
  }, [fetchData]);

  const filteredData = data.filter(item => 
    item.tenant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tenant_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<OwnerStats>[] = [
    { 
      header: "No", 
      accessor: (o: OwnerStats, index: number) => <span className="text-[10px] font-black text-slate-400">{(offset + index + 1).toString().padStart(2, '0')}</span>,
      width: "50px"
    },
    { 
      header: "Owner Info", 
      accessor: (o) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xs font-black shadow-lg">
            {o.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 leading-tight">{o.name}</span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 lowercase mt-0.5">
              <Mail size={10} /> {o.email}
            </div>
          </div>
        </div>
      )
    },
    { 
      header: "Company", 
      accessor: (o) => (
        <div className="flex flex-col">
          <span className="font-black text-slate-900">{o.tenant_name}</span>
          <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[9px] uppercase tracking-widest w-fit mt-1">
            {o.tenant_code}
          </Badge>
        </div>
      )
    },
    { 
      header: "Employees", 
      accessor: (o) => (
        <div className={`flex flex-col ${o.employee_count === 0 ? "text-slate-300" : "text-blue-600"}`}>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black">{o.employee_count}</span>
            <StatTooltip label="Current number of active employee accounts registered within this organization's ecosystem.">
              <Users size={14} />
            </StatTooltip>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest opacity-50">Active Users</span>
        </div>
      ),
      sortable: true
    },
    { 
      header: "Usage Statistics", 
      accessor: (o) => (
        <div className="grid grid-cols-3 gap-1.5 min-w-[300px]">
          <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100/50">
            <StatTooltip label="Total employee clock-in/out attendance logs recorded across the entire organization.">
              <Clock size={12} className="text-indigo-500" />
            </StatTooltip>
            <span className="text-[10px] font-black text-slate-600">{o.attendance_count}</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100/50">
            <StatTooltip label="Number of approved leave requests, including annual and special leave types.">
              <Plane size={12} className="text-emerald-500" />
            </StatTooltip>
            <span className="text-[10px] font-black text-slate-600">{o.leave_count}</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100/50">
            <StatTooltip label="Cumulative overtime hours submitted by staff and validated within the system.">
              <TrendingUp size={12} className="text-amber-500" />
            </StatTooltip>
            <span className="text-[10px] font-black text-slate-600">{o.overtime_count}</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100/50">
            <StatTooltip label="Number of payroll cycles and salary disbursement events successfully executed.">
              <Wallet size={12} className="text-blue-500" />
            </StatTooltip>
            <span className="text-[10px] font-black text-slate-600">{o.payroll_count}</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100/50">
            <StatTooltip label="Total reimbursement claims and corporate expense requests processed for this tenant.">
              <Receipt size={12} className="text-rose-500" />
            </StatTooltip>
            <span className="text-[10px] font-black text-slate-600">{o.expense_count}</span>
          </div>
        </div>
      )
    },
    { 
      header: "Join Date", 
      accessor: (o) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Calendar size={14} />
          <span className="text-xs font-bold">{dayjs(o.created_at).format("DD MMM YYYY")}</span>
        </div>
      ),
      sortable: true
    }
  ];

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <Can permission="analytics.executive">
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">
        
        {/* Header Section */}
        <section className="relative overflow-hidden bg-slate-950 rounded-[40px] p-8 sm:p-12 shadow-2xl text-white">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-600 opacity-20 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[11px] font-black tracking-[0.2em] uppercase text-indigo-400">
                <ShieldCheck size={16} className="fill-current" />
                Superadmin Command Center
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                Tenant <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Vitality Stats</span>
              </h1>
              <h2 className="text-slate-400 font-medium max-w-xl text-sm sm:text-base leading-relaxed">
                Monitor platform health by analyzing tenant adoption, employee distribution, and feature usage across all organizations.
              </h2>
            </div>
            
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 flex flex-col gap-1 min-w-[200px]">
               <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Total Ecosystem Size</span>
               <div className="flex items-end gap-2">
                  <span className="text-4xl font-black">{total}</span>
                  <span className="text-xs font-bold text-slate-500 mb-1.5 uppercase">Organizations</span>
               </div>
            </div>
          </div>
        </section>

        {/* Main Interface */}
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 flex flex-col min-h-[700px] overflow-hidden relative">
          
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-30 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
          )}

          {/* Toolbar */}
          <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <Building2 size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Owner Monitoring</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Tenant Activity Pipeline</p>
              </div>
            </div>
            
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by company or owner..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-12 bg-slate-50 border-none rounded-2xl text-xs font-bold w-full sm:w-80 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all" 
              />
            </div>
          </div>

          {/* Table Content */}
          <div className="flex-1 p-8 overflow-x-auto">
            {filteredData.length > 0 ? (
              <DataTable 
                data={filteredData} 
                columns={columns}
                actions={() => (
                  <button className="p-2 text-slate-300 hover:text-slate-900 transition-all rounded-xl hover:bg-slate-50">
                    <MoreVertical size={18} />
                  </button>
                )}
              />
            ) : !isLoading && (
              <div className="h-[400px] flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                  <SearchX size={40} />
                </div>
                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">No Results Found</h4>
                <p className="text-sm font-medium text-slate-400 mt-1">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Showing <span className="text-slate-900">{filteredData.length}</span> of {total} organizations
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                disabled={offset === 0 || isLoading}
                onClick={() => setOffset(prev => Math.max(0, prev - limit))}
                className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={20} strokeWidth={3} />
              </button>
              
              <div className="flex items-center px-4 h-12 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-900">
                Page {currentPage} of {totalPages || 1}
              </div>

              <button 
                disabled={currentPage >= totalPages || isLoading}
                onClick={() => setOffset(prev => prev + limit)}
                className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={20} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Can>
  );
}
