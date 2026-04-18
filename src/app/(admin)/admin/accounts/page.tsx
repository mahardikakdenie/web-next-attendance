"use client";

import { useState } from "react";
import { Shield, Plus, Mail, MoreVertical, UserCheck, UserX, Calendar, Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import { DataTable, Column } from "@/components/ui/DataTable";
import AccountModal from "@/components/admin/AccountModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlatformAccounts, toggleAccountStatus } from "@/service/admin";
import { UserData } from "@/types/api";
import dayjs from "dayjs";
import { toast } from "sonner";

export default function AccountsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedEmployee] = useState<UserData | null>(null);

  // 1. Fetch Accounts
  const { data: accountsResp, isLoading } = useQuery({
    queryKey: ["platform-accounts", search, page],
    queryFn: () => getPlatformAccounts({ 
      search, 
      limit, 
      offset: (page - 1) * limit 
    }),
  });

  // 2. Toggle Status Mutation
  const toggleMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: "active" | "suspended" }) => 
      toggleAccountStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["platform-accounts"] });
      toast.success("Account status updated");
    },
    onError: () => {
      toast.error("Failed to update status");
    }
  });

  const handleEdit = (account: UserData) => {
    setSelectedEmployee(account);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (account: UserData) => {
    if (account.id === 1) {
      toast.error("Root Admin cannot be suspended");
      return;
    }
    // const newStatus = account.role?.base_role === 'ADMIN' ? 'suspended' : 'active'; // This is a bit simplified, usually status is a separate field
    // Assuming status is in the object or inferred. Let's use a prompt for simplicity if status field not directly visible
    const currentStatus = account.status?.toLowerCase() || "active";
    const targetStatus = currentStatus === "active" ? "suspended" : "active";

    if (confirm(`Are you sure you want to ${targetStatus} this account?`)) {
      toggleMutation.mutate({ id: account.id, status: targetStatus as "active" | "suspended" });
    }
    };

  const getRoleBadgeColor = (roleName?: string) => {
    const name = roleName?.toUpperCase() || "";
    if (name.includes("SUPERADMIN")) return "bg-purple-50 text-purple-700 border-purple-100";
    if (name.includes("SUPPORT")) return "bg-blue-50 text-blue-700 border-blue-100";
    if (name.includes("ENGINEER")) return "bg-slate-50 text-slate-700 border-slate-100";
    return "bg-slate-100 text-slate-600 border-none";
  };

  const columns: Column<UserData>[] = [
    {
      header: "Administrator",
      accessor: (item) => (
        <div className="flex items-center gap-4">
          <Avatar 
            src={item.media_url} 
            name={item.name}
            className="w-10 h-10 rounded-2xl shadow-sm" 
          />
          <div>
            <p className="text-sm font-black text-slate-900">{item.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Mail size={12} className="text-slate-400" />
              <span className="text-[11px] font-bold text-slate-500">{item.email}</span>
            </div>
          </div>
        </div>
      ),
      sortable: true
    },
    {
      header: "Platform Role",
      accessor: (item) => (
        <Badge className={`border font-black text-[10px] px-3 py-1 uppercase tracking-wider rounded-lg ${getRoleBadgeColor(item.role?.name)}`}>
          {item.role?.name || "N/A"}
        </Badge>
      ),
      sortable: true
    },
    {
      header: "Status",
      accessor: (item) => {
        const status = item.status || "Active";
        const isActive = status.toLowerCase() === "active";
        return (
          <div className={`flex items-center gap-1.5 ${isActive ? "text-emerald-600" : "text-rose-600"}`}>
            {isActive ? <UserCheck size={14} strokeWidth={3} /> : <UserX size={14} strokeWidth={3} />}
            <span className="text-[11px] font-black uppercase tracking-wider">{status}</span>
          </div>
        );
      },
      sortable: true
    },
    {
      header: "Created At",
      accessor: (item) => (
        <div className="flex items-center gap-2 text-slate-400">
          <Calendar size={14} />
          <span className="text-xs font-bold">{dayjs(item.created_at).format("MMM D, YYYY")}</span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 mb-1">
            <Shield size={14} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Security Protocol</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight sm:text-5xl">Platform Accounts</h1>
          <p className="text-slate-500 font-medium max-w-lg">
            Manage global system administrators and technical staff with restricted platform access.
          </p>
        </div>

        <Button 
          onClick={() => {
            setSelectedEmployee(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-slate-900 text-white hover:bg-blue-600 shadow-xl shadow-slate-200 hover:shadow-blue-500/20 px-8 py-4 rounded-[20px] transition-all active:scale-95 group"
        >
          <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-black text-sm uppercase tracking-wide">Add Admin</span>
        </Button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 h-12 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          {isLoading && <Loader2 className="animate-spin text-blue-600" size={24} />}
        </div>

        <DataTable 
          data={accountsResp?.data || []} 
          columns={columns} 
          actions={(item) => (
            <div className="flex items-center gap-1">
              <button 
                onClick={() => handleEdit(item)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                title="Edit Account"
              >
                <MoreVertical size={18} />
              </button>
              {item.id !== 1 && (
                <button 
                  onClick={() => handleToggleStatus(item)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  title="Toggle Status"
                >
                  <Shield size={18} />
                </button>
              )}
            </div>
          )}
        />
        
        {/* Pagination Placeholder - Logic depends on DataTable implementation of paging */}
        {accountsResp?.meta?.pagination && (
          <div className="p-6 border-t border-slate-50 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Showing {accountsResp.data.length} of {accountsResp.meta.pagination.total} accounts
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === 1}
                onClick={() => setPage(prev => prev - 1)}
                className="rounded-xl font-bold"
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={page >= (accountsResp.meta.pagination.last_page || 1)}
                onClick={() => setPage(prev => prev + 1)}
                className="rounded-xl font-bold"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <AccountModal 
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => void queryClient.invalidateQueries({ queryKey: ["platform-accounts"] })}
        account={selectedAccount}
      />
    </div>
  );
}
