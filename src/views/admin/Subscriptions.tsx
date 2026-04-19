"use client";

import { useState, useEffect } from "react";
import { 
  CreditCard, 
  Search, 
  Building2, 
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  MoreVertical,
  ShieldCheck,
  SearchX,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BellRing,
  Ban,
  Users,
  CheckCircle2} from "lucide-react";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getSubscriptions, 
  sendBillingReminder, 
  suspendTenant 
} from "@/service/subscription";
import { TenantSubscription, SubscriptionStatus } from "@/types/subscription";
import { toast } from "sonner";
import dayjs from "dayjs";
import { Can } from "@/components/auth/PermissionGuard";
import SuspendTenantModal from "@/components/admin/SuspendTenantModal";
import { Skeleton, TableSkeleton } from "@/components/ui/Skeleton";
import Image from "next/image";

// --- Internal Components ---

const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
        <div className="flex justify-between items-start">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <Skeleton className="w-16 h-6 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="w-32 h-3" />
          <Skeleton className="w-48 h-10" />
        </div>
      </div>
    ))}
  </div>
);

export default function SubscriptionsView() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SubscriptionStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [selectedTenantForSuspend, setSelectedTenantForSuspend] = useState<{id: number, name: string} | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // --- Queries ---

  const { data: subData, isLoading, isError } = useQuery({
    queryKey: ["admin-subscriptions", activeTab, debouncedSearch, currentPage],
    queryFn: () => getSubscriptions(currentPage, limit, activeTab, debouncedSearch)
  });

  // --- Mutations ---

  const remindMutation = useMutation({
    mutationFn: (id: number) => sendBillingReminder(id),
    onSuccess: () => toast.success("Billing reminder sent to organization owner")
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number, reason: string }) => suspendTenant(id, reason),
    onSuccess: () => {
      toast.success("Organization access has been suspended");
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
    }
  });

  // --- Helpers ---

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const handleSuspend = (tenant: {id: number, name: string}) => {
    setSelectedTenantForSuspend(tenant);
    setIsSuspendModalOpen(true);
  };

  const confirmSuspend = (reason: string) => {
    if (selectedTenantForSuspend) {
      suspendMutation.mutate({ id: selectedTenantForSuspend.id, reason });
      setIsSuspendModalOpen(false);
    }
  };

  // --- Column Definitions ---

  const columns: Column<TenantSubscription>[] = [
    { 
      header: "Organization", 
      accessor: (s) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 overflow-hidden border border-slate-200 shadow-sm">
            {s.tenant_logo ? (
              <Image src={s.tenant_logo} alt={s.tenant_name} className="w-full h-full object-cover" />
            ) : (
              <Building2 size={20} />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 leading-tight">{s.tenant_name}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{s.tenant_code}</span>
          </div>
        </div>
      )
    },
    { 
      header: "Plan Details", 
      accessor: (s) => (
        <div className="flex flex-col">
          <Badge className={`border-none font-black text-[9px] uppercase tracking-widest w-fit mb-1 ${
            s.plan === "Enterprise" ? "bg-indigo-900 text-indigo-100" : 
            s.plan === "Business" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
          }`}>
            {s.plan}
          </Badge>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
            <Calendar size={10} /> {s.billing_cycle}
          </div>
        </div>
      )
    },
    { 
      header: "Monthly Amount", 
      accessor: (s) => (
        <div className="flex flex-col">
          <span className="font-black text-slate-900">{formatCurrency(s.amount)}</span>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mt-0.5">
            <Users size={10} /> {s.active_employees} Seats
          </div>
        </div>
      ),
      sortable: true
    },
    { 
      header: "Status", 
      accessor: (s) => {
        const styles = {
          Active: "bg-emerald-100 text-emerald-700",
          "Past Due": "bg-rose-100 text-rose-700 animate-pulse",
          Canceled: "bg-slate-100 text-slate-400",
          Trial: "bg-blue-100 text-blue-700"
        };
        return (
          <div className="flex items-center gap-2">
            <Badge className={`${styles[s.status]} border-none font-black text-[9px] uppercase tracking-widest`}>
              {s.status}
            </Badge>
          </div>
        );
      }
    },
    { 
      header: "Next Billing", 
      accessor: (s) => {
        const isOverdue = dayjs().isAfter(dayjs(s.next_billing_date));
        return (
          <div className="flex flex-col">
            <div className={`flex items-center gap-1.5 text-sm font-black ${isOverdue ? "text-rose-600" : "text-slate-900"}`}>
              <Clock size={14} />
              {dayjs(s.next_billing_date).format("DD MMM YYYY")}
            </div>
            {isOverdue && <span className="text-[9px] font-black text-rose-400 uppercase tracking-tighter">Overdue Action Needed</span>}
          </div>
        );
      },
      sortable: true
    }
  ];

  const stats = subData?.data?.stats;
  const items = subData?.data?.items || [];
  // const total = subData?.data?.total || 0;
  const totalPages = subData?.meta?.pagination?.last_page || 1;

  return (
    <Can permission="analytics.executive">
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12 animate-in fade-in duration-700 relative">
        
        {/* Header */}
        <section className="relative overflow-hidden bg-slate-950 rounded-[40px] p-8 sm:p-12 shadow-2xl text-white">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-600 opacity-20 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[11px] font-black tracking-[0.2em] uppercase text-blue-400">
                <ShieldCheck size={16} className="fill-current" />
                Financial Oversight Command
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                Billing <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">& Subscriptions</span>
              </h1>
              <p className="text-slate-400 font-medium max-w-xl text-sm sm:text-base leading-relaxed">
                Monitor recurring revenue streams, manage enterprise license cycles, and maintain the financial health of the global ecosystem.
              </p>
            </div>
            
            <div className="flex p-1.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 w-fit">
              {(["all", "Active", "Past Due", "Canceled"] as const).map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => { setActiveTab(tab); setCurrentPage(1); }} 
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-white text-slate-950 shadow-xl" : "text-slate-400 hover:text-white"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Summary Cards */}
        {isLoading && !subData ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <DollarSign size={80} />
              </div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <TrendingUp size={22} strokeWidth={2.5} />
                </div>
                <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px] px-2.5">{stats?.mrr_growth || "0%"}</Badge>
              </div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Recurring Revenue (MRR)</p>
              <h3 className="text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                {stats ? formatCurrency(stats.mrr) : "IDR 0"}
              </h3>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <Users size={80} />
              </div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <CheckCircle2 size={22} strokeWidth={2.5} />
                </div>
                <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] px-2.5">{stats?.active_tenants_growth || "0"}</Badge>
              </div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Paid Organizations</p>
              <h3 className="text-3xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                {stats?.active_tenants || 0} Tenants
              </h3>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative border-l-4 border-l-rose-500">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <AlertCircle size={80} />
              </div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                  <AlertCircle size={22} strokeWidth={2.5} />
                </div>
                <Badge className="bg-rose-50 text-rose-600 border-none font-black text-[10px] px-2.5">{stats?.past_due_growth || "0%"}</Badge>
              </div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Outstanding (Past Due)</p>
              <h3 className="text-3xl font-black text-slate-900 group-hover:text-rose-600 transition-colors">
                {stats ? formatCurrency(stats.past_due_amount) : "IDR 0"}
              </h3>
            </div>
          </div>
        )}

        {/* Main Interface */}
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 flex flex-col min-h-[600px] overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                <CreditCard size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Billing Pipeline</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Tenant License Cycles</p>
              </div>
            </div>
            
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search organization or code..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-12 bg-slate-50 border-none rounded-2xl text-xs font-bold w-full sm:w-80 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all" 
              />
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 p-8">
            {isLoading ? (
              <TableSkeleton rows={limit} cols={5} />
            ) : isError ? (
               <div className="h-[300px] flex flex-col items-center justify-center text-center">
                  <div className="p-4 bg-rose-50 text-rose-600 rounded-3xl mb-4">
                     <Ban size={40} />
                  </div>
                  <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Backend Integration Error</h4>
                  <p className="text-sm font-medium text-slate-400 mt-1 max-w-xs mx-auto">Unable to fetch billing data. Please ensure the new API endpoints are implemented.</p>
               </div>
            ) : items.length > 0 ? (
              <DataTable 
                data={items} 
                columns={columns}
                actions={(s) => (
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    {s.status === "Past Due" && (
                      <button 
                        onClick={() => remindMutation.mutate(s.id)}
                        disabled={remindMutation.isPending}
                        className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-900 transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2"
                      >
                        {remindMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <BellRing size={12} />}
                        Remind
                      </button>
                    )}
                    <button 
                      onClick={() => handleSuspend({ id: s.id, name: s.tenant_name })}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all" 
                      title="Suspend Organization"
                    >
                      <Ban size={18} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-900 transition-all rounded-xl hover:bg-slate-50">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                )}
              />
            ) : !isLoading && (
              <div className="h-[300px] flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                  <SearchX size={40} />
                </div>
                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">No Subscriptions Found</h4>
                <p className="text-sm font-medium text-slate-400 mt-1">Adjust filters or search to broaden your criteria.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {items.length > 0 && (
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Financial Session Encrypted
               </div>
               
               <div className="flex items-center gap-2">
                  <button 
                    disabled={currentPage === 1 || isLoading}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-100 disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft size={20} strokeWidth={3} />
                  </button>
                  
                  <div className="flex items-center px-4 h-12 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-900 shadow-sm">
                    Page {currentPage} of {totalPages}
                  </div>

                  <button 
                    disabled={currentPage >= totalPages || isLoading}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-100 disabled:opacity-30 transition-all"
                  >
                    <ChevronRight size={20} strokeWidth={3} />
                  </button>
               </div>
            </div>
          )}
        </div>

        {/* Suspend Confirmation Modal */}
        <SuspendTenantModal 
          isOpen={isSuspendModalOpen}
          onClose={() => {
            setIsSuspendModalOpen(false);
            setSelectedTenantForSuspend(null);
          }}
          onConfirm={confirmSuspend}
          isSubmitting={suspendMutation.isPending}
          tenantName={selectedTenantForSuspend?.name || ""}
        />

      </div>
    </Can>
  );
}
