"use client";

import { Shield, Plus, Mail, MoreVertical, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import { DataTable, Column } from "@/components/ui/DataTable";

interface Account {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar: string;
}

const ACCOUNTS: Account[] = [
  { id: 1, name: "Super Admin Root", email: "root@attendance.pro", role: "Superadmin", status: "Active", avatar: "https://i.pravatar.cc/150?u=root" },
  { id: 2, name: "System Support", email: "support@attendance.pro", role: "Support", status: "Active", avatar: "https://i.pravatar.cc/150?u=support" },
  { id: 3, name: "DevOps Lead", email: "devops@attendance.pro", role: "Engineer", status: "Active", avatar: "https://i.pravatar.cc/150?u=devops" },
];

export default function AccountsPage() {
  const columns: Column<Account>[] = [
    {
      header: "Administrator",
      accessor: (item) => (
        <div className="flex items-center gap-4">
          <Avatar src={item.avatar} className="w-10 h-10 rounded-2xl shadow-sm" />
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
        <Badge className="bg-slate-100 text-slate-700 border-none font-black text-[10px] px-3 py-1 uppercase tracking-wider rounded-lg">
          {item.role}
        </Badge>
      ),
      sortable: true
    },
    {
      header: "Status",
      accessor: (item) => (
        <div className="flex items-center gap-1.5 text-emerald-600">
          <UserCheck size={14} strokeWidth={3} />
          <span className="text-[11px] font-black uppercase tracking-wider">{item.status}</span>
        </div>
      ),
      sortable: true
    }
  ];

  const actions = () => (
    <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
      <MoreVertical size={18} />
    </button>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* Dynamic Header with Modern Typography */}
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

        <Button className="flex items-center gap-2 bg-slate-900 text-white hover:bg-blue-600 shadow-xl shadow-slate-200 hover:shadow-blue-500/20 px-8 py-4 rounded-[20px] transition-all active:scale-95 group">
          <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-black text-sm uppercase tracking-wide">Add Admin</span>
        </Button>
      </div>

      {/* Grid Layout for Tables & Cards */}
      <div className="grid grid-cols-1 gap-8">
        <DataTable 
          data={ACCOUNTS} 
          columns={columns} 
          actions={actions}
          searchKey="name"
          searchPlaceholder="Search administrators..."
        />
      </div>
    </div>
  );
}
