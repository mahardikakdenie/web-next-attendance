"use client";

import { useState, useEffect } from "react";
import { 
  Receipt, 
  Plus, 
  Check, 
  X, 
  MoreHorizontal, 
  Filter,
  Wallet,
  Clock,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { ExpenseClaim, ExpenseStatus } from "@/types/finance";
import { useAuthStore, ROLES } from "@/store/auth.store";
import { 
  getExpenses, 
  getExpensesSummary, 
  approveExpense, 
  rejectExpense,
  updateUserQuota
} from "@/service/finance";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Input from "@/components/ui/Input";
import CreateExpenseModal from "@/components/finance/CreateExpenseModal";
import { getDataUserslist } from "@/service/users";

export default function ExpensesView() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isAdminOrFinance = [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.FINANCE].includes(user?.role?.name as 'superadmin' | 'admin' | 'finance');

  const [activeTab, setActiveTab] = useState<ExpenseStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: number; name: string; quota: number } | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Queries
  const { data: expensesData, isLoading: isExpensesLoading } = useQuery({
    queryKey: ["expenses", activeTab, debouncedSearch, currentPage, limit],
    queryFn: () => getExpenses({
      status: activeTab === "all" ? undefined : activeTab,
      search: debouncedSearch,
      page: currentPage,
      limit
    }),
  });

  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["expenses-summary"],
    queryFn: () => getExpensesSummary(),
  });

  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ["users-quota"],
    queryFn: () => getDataUserslist({ limit: 10, page: 1, user_id: user?.id as number }),
    enabled: isAdminOrFinance
  });

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (id: number) => approveExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses-summary"] });
      queryClient.invalidateQueries({ queryKey: ["users-quota"] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => rejectExpense(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses-summary"] });
      queryClient.invalidateQueries({ queryKey: ["users-quota"] });
    }
  });

  const updateQuotaMutation = useMutation({
    mutationFn: ({ userId, quota }: { userId: number; quota: number }) => updateUserQuota(userId, quota),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-quota"] });
      setIsQuotaModalOpen(false);
      setSelectedUser(null);
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const claims = expensesData?.data || [];
  const stats = summaryData?.data;

  console.log("claims : ", claims);
  

  const columns: Column<ExpenseClaim>[] = [
    {
      header: "Claim ID",
      accessor: (c) => <span className="font-black text-slate-900">{c.claimID}</span>,
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

  const handleApprove = (id: number) => {
    if (window.confirm("Are you sure you want to approve this claim?")) {
      approveMutation.mutate(id);
    }
  };

  const handleReject = (id: number) => {
    const reason = window.prompt("Reason for rejection:");
    if (reason) {
      rejectMutation.mutate({ id, reason });
    }
  };

  const actions = (c: ExpenseClaim) => (
    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
      {isAdminOrFinance && c.status === "Pending" && (
        <>
          <button 
            onClick={() => handleApprove(c.id)}
            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl" 
            title="Approve"
          >
            <Check size={18} strokeWidth={3} />
          </button>
          <button 
            onClick={() => handleReject(c.id)}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl" 
            title="Reject"
          >
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
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12 animate-in fade-in duration-700 relative">
      
      {/* Loading Overlay */}
      {(isExpensesLoading || approveMutation.isPending || rejectMutation.isPending) && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex flex-col items-center justify-center rounded-3xl">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Processing...</p>
        </div>
      )}

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
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 px-5 rounded-2xl"
          >
            <Plus size={18} strokeWidth={3} />
            <span className="font-bold text-sm">New Claim</span>
          </Button>
        </div>
      </div>

      <CreateExpenseModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
           <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={28} strokeWidth={2.5} />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Approval</p>
              <h3 className="text-2xl font-black text-slate-900">
                {isSummaryLoading ? "..." : formatCurrency(stats?.pendingAmount || 0)}
              </h3>
           </div>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
           <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={28} strokeWidth={2.5} />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Approved This Month</p>
              <h3 className="text-2xl font-black text-slate-900">
                {isSummaryLoading ? "..." : formatCurrency(stats?.approvedThisMonthAmount || 0)}
              </h3>
           </div>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
           <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet size={28} strokeWidth={2.5} />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Top Category</p>
              <h3 className="text-2xl font-black text-slate-900">
                {isSummaryLoading ? "..." : `${stats?.topCategory.name} (${stats?.topCategory.percentage}%)`}
              </h3>
           </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit border border-slate-200/50">
            {(["all", "Pending", "Approved", "Rejected"] as const).map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative group min-w-[300px]">
            <Input
              placeholder="Search by Claim ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 bg-white border-slate-200 rounded-2xl"
            />
          </div>
        </div>

        <DataTable 
          data={expensesData?.data ?? []} 
          columns={columns} 
          actions={actions}
          currentPage={currentPage}
          totalPages={expensesData?.meta?.pagination?.last_page || 1}
          onPageChange={(page) => setCurrentPage(page)}
          isLoading={isExpensesLoading}
          limit={limit}
          onLimitChange={setLimit}
        />
      </div>

      {/* User Quota Management (Admin/Finance Only) */}
      {isAdminOrFinance && (
        <section className="mt-16 space-y-8 animate-in slide-in-from-bottom-4 duration-1000">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">User Quota Management</h2>
            <p className="text-slate-500 font-medium text-sm">Set and manage monthly reimbursement limits for employees.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isUsersLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-3xl" />)
            ) : (usersData?.data || []).map(u => (
              <div key={u.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <Avatar src={u.media_url} className="w-12 h-12 rounded-2xl" />
                  <div>
                    <p className="font-black text-slate-900 text-sm">{u.name}</p>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                      Quota: {formatCurrency(u.expense_quota || 0)}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedUser({ id: u.id, name: u.name, quota: u.expense_quota || 0 });
                    setIsQuotaModalOpen(true);
                  }}
                  className="p-3 bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all"
                >
                  <Plus size={18} strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Set Quota Modal */}
      {isQuotaModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900">Set Monthly Quota</h2>
                <button onClick={() => setIsQuotaModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X size={24} />
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4">
                <Avatar src={usersData?.data.find(u => u.id === selectedUser.id)?.media_url ?? ''} className="w-10 h-10 rounded-xl" />
                <div>
                  <p className="font-black text-sm text-slate-900">{selectedUser.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Current: {formatCurrency(selectedUser.quota)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Quota Amount (IDR)</label>
                <Input 
                  type="number"
                  defaultValue={selectedUser.quota}
                  onChange={(e) => setSelectedUser({ ...selectedUser, quota: Number(e.target.value) })}
                  className="h-12 bg-slate-50 border-slate-200 rounded-2xl font-black"
                  placeholder="e.g. 5000000"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="secondary" className="flex-1 h-12 rounded-2xl font-black" onClick={() => setIsQuotaModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  disabled={updateQuotaMutation.isPending}
                  className="flex-1 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 font-black"
                  onClick={() => updateQuotaMutation.mutate({ userId: selectedUser.id, quota: selectedUser.quota })}
                >
                  {updateQuotaMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : "Save Quota"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
