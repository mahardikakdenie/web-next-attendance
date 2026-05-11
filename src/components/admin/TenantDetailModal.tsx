"use client";

import React, { useState } from "react";
import { 
  X, 
  Building2, 
  ShieldAlert, 
  CheckCircle2, 
  Loader2,
  Calendar,
  Wallet,
  Users,
  Clock,
  TrendingUp,
  Receipt,
  Plane,
  Mail,
  Briefcase,
  Edit,
  ExternalLink,
  CreditCard,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getTenantFullDetails } from "@/service/admin";
import { TenantFullDetails } from "@/types/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import dayjs from "dayjs";
import { DataTable, Column } from "@/components/ui/DataTable";

interface TenantDetailModalProps {
  tenantId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

type TabType = "subscription" | "stats" | "employees";

export default function TenantDetailModal({ tenantId, isOpen, onClose, onEdit }: TenantDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("subscription");

  const { data: detailsResp, isLoading, isError } = useQuery({
    queryKey: ["tenant-full-details", tenantId],
    queryFn: () => getTenantFullDetails(tenantId!),
    enabled: !!tenantId && isOpen,
  });

  const details = detailsResp?.data;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const employeeColumns: Column<TenantFullDetails["employees"][number]>[] = [
    {
      header: "Employee",
      accessor: (emp) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">
            {emp.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-xs">{emp.name}</span>
            <span className="text-[9px] text-slate-400 font-medium">{emp.email}</span>
          </div>
        </div>
      )
    },
    {
      header: "Role & Position",
      accessor: (emp) => (
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-tight">{emp.role}</span>
          <span className="text-[10px] font-bold text-slate-500">{emp.position}</span>
        </div>
      )
    },
    {
      header: "Department",
      accessor: (emp) => (
        <Badge className="bg-slate-50 text-slate-500 border-none font-bold text-[9px] uppercase">{emp.department}</Badge>
      )
    },
    {
      header: "Joined",
      accessor: (emp) => (
        <span className="text-[10px] font-medium text-slate-400">{dayjs(emp.created_at).format("DD MMM YYYY")}</span>
      )
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative bg-white rounded-[40px] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 pb-6 flex items-center justify-between border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[24px] bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/10 shrink-0">
              <Building2 size={32} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                  {isLoading ? "Synchronizing Data..." : details?.tenant.name}
                </h2>
                {!isLoading && details && (
                  <Badge className={`border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full ${
                    details.tenant.is_suspended ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {details.tenant.is_suspended ? "Suspended" : "Active"}
                  </Badge>
                )}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                Organization Intelligence • <span className="text-blue-500">{details?.tenant.code}</span>
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-12 h-12 rounded-2xl hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4">
             <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
                <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 w-8 h-8 animate-pulse" />
             </div>
             <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Retrieving organization telemetry...</p>
          </div>
        ) : isError ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
             <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle size={40} className="text-rose-500" />
             </div>
             <h3 className="text-xl font-black text-slate-900">Telemetry Link Failed</h3>
             <p className="text-slate-400 text-sm mt-2 max-w-xs">We encountered an issue while establishing a secure connection to the organization&apos;s data store.</p>
             <Button onClick={() => onClose()} variant="secondary" className="mt-8 px-8 h-12 rounded-2xl">Close Portal</Button>
          </div>
        ) : details && (
          <>
            {/* Tabs Trigger */}
            <div className="px-8 pt-4 flex gap-8 shrink-0">
               {(["subscription", "stats", "employees"] as const).map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`pb-4 text-[11px] font-black uppercase tracking-[0.15em] transition-all relative ${
                     activeTab === tab ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                   }`}
                 >
                   {tab}
                   {activeTab === tab && (
                     <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300" />
                   )}
                 </button>
               ))}
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
               {activeTab === "subscription" && (
                 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-blue-500/30 transition-colors" />
                          <div className="relative z-10">
                             <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                                   <ShieldCheck size={20} strokeWidth={2.5} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Active Plan</span>
                             </div>
                             <h3 className="text-4xl font-black tracking-tight mb-1">{details.subscription.plan_name}</h3>
                             <p className="text-blue-400 font-bold text-xs uppercase tracking-widest">{details.subscription.billing_cycle} Fulfillment</p>
                          </div>
                       </div>

                       <div className="bg-white border border-slate-100 rounded-[32px] p-8 flex flex-col justify-between shadow-sm">
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subscription Value</p>
                             <h4 className="text-3xl font-black text-slate-900 tabular-nums">{formatCurrency(details.subscription.amount)}</h4>
                          </div>
                          <div className="flex items-center gap-3 pt-6 border-t border-slate-50 mt-6">
                             <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Calendar size={16} strokeWidth={2.5} />
                             </div>
                             <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">Next Billing Event</p>
                                <p className="text-sm font-black text-slate-900 leading-none">{dayjs(details.subscription.next_billing_date).format("DD MMMM YYYY")}</p>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="p-6 rounded-[24px] bg-slate-50 border border-slate-100 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400">
                             <Clock size={20} />
                          </div>
                          <div>
                             <p className="text-xs font-black text-slate-900">Provisioned On</p>
                             <p className="text-[11px] font-bold text-slate-400">{dayjs(details.tenant.created_at).format("DD MMM YYYY, HH:mm")}</p>
                          </div>
                       </div>
                       <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px] px-3 py-1 uppercase">{details.subscription.status}</Badge>
                    </div>
                 </div>
               )}

               {activeTab === "stats" && (
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm hover:shadow-md transition-all group">
                       <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <Users size={24} strokeWidth={2.5} />
                       </div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Resources</p>
                       <div className="flex items-baseline gap-1">
                          <h3 className="text-3xl font-black text-slate-900 tabular-nums">{details.usage_stats.total_employees}</h3>
                          <span className="text-xs font-bold text-slate-400 uppercase">Staff</span>
                       </div>
                    </div>

                    <div className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm hover:shadow-md transition-all group">
                       <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <Clock size={24} strokeWidth={2.5} />
                       </div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Attendances</p>
                       <div className="flex items-baseline gap-1">
                          <h3 className="text-3xl font-black text-slate-900 tabular-nums">{details.usage_stats.total_attendances}</h3>
                          <span className="text-xs font-bold text-slate-400 uppercase">Logs</span>
                       </div>
                    </div>

                    <div className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm hover:shadow-md transition-all group">
                       <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <Plane size={24} strokeWidth={2.5} />
                       </div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Offs</p>
                       <div className="flex items-baseline gap-1">
                          <h3 className="text-3xl font-black text-slate-900 tabular-nums">{details.usage_stats.total_leaves}</h3>
                          <span className="text-xs font-bold text-slate-400 uppercase">Req</span>
                       </div>
                    </div>

                    <div className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm hover:shadow-md transition-all group">
                       <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <Wallet size={24} strokeWidth={2.5} />
                       </div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payrolls</p>
                       <div className="flex items-baseline gap-1">
                          <h3 className="text-3xl font-black text-slate-900 tabular-nums">{details.usage_stats.total_payrolls}</h3>
                          <span className="text-xs font-bold text-slate-400 uppercase">Cyc</span>
                       </div>
                    </div>

                    <div className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm hover:shadow-md transition-all group">
                       <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <Receipt size={24} strokeWidth={2.5} />
                       </div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expenses</p>
                       <div className="flex items-baseline gap-1">
                          <h3 className="text-3xl font-black text-slate-900 tabular-nums">{details.usage_stats.total_expenses}</h3>
                          <span className="text-xs font-bold text-slate-400 uppercase">Req</span>
                       </div>
                    </div>
                 </div>
               )}

               {activeTab === "employees" && (
                 <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 min-h-[400px]">
                    <DataTable 
                      columns={employeeColumns}
                      data={details.employees}
                      isLoading={false}
                    />
                 </div>
               )}
            </div>

            {/* Footer Actions */}
            <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex gap-4 shrink-0">
               <Button 
                onClick={onEdit}
                className="flex-1 h-14 bg-slate-900 text-white rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
               >
                 <Edit size={18} className="mr-2" />
                 Modify Organization
               </Button>
               
               <Button 
                 variant="secondary"
                 onClick={() => onEdit()} // Using the same edit trigger as suspension is inside edit modal
                 className={`flex-1 h-14 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all ${
                   details.tenant.is_suspended 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white" 
                    : "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-600 hover:text-white"
                 }`}
               >
                 <ShieldAlert size={18} className="mr-2" />
                 {details.tenant.is_suspended ? "Restore Access" : "Restrict Access"}
               </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
