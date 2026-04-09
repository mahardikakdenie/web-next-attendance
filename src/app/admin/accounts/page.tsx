"use client";

import { UserCheck, Shield, Mail, Phone, MoreVertical, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";

const ACCOUNTS = [
  { id: 1, name: "Super Admin Root", email: "root@attendance.pro", role: "Superadmin", status: "Active", avatar: "https://i.pravatar.cc/150?u=root" },
  { id: 2, name: "System Support", email: "support@attendance.pro", role: "Support", status: "Active", avatar: "https://i.pravatar.cc/150?u=support" },
  { id: 3, name: "DevOps Lead", email: "devops@attendance.pro", role: "Engineer", status: "Active", avatar: "https://i.pravatar.cc/150?u=devops" },
];

export default function AccountsPage() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-rose-600 mb-2">
            <Shield size={20} strokeWidth={2.5} />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Access Control</span>
          </div>
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Platform Accounts</h1>
          <p className="text-neutral-500 font-medium">Manage system administrators and technical support staff.</p>
        </div>

        <Button className="flex items-center gap-2 bg-neutral-900 text-white hover:bg-neutral-800 shadow-md px-6 py-3 rounded-2xl transition-all active:scale-95">
          <Plus size={18} />
          <span className="font-bold">Add Admin Account</span>
        </Button>
      </div>

      <div className="bg-white rounded-[32px] border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 group-focus-within:text-neutral-900 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              className="w-full pl-12 pr-4 h-12 bg-neutral-50 rounded-2xl border-none focus:ring-2 focus:ring-neutral-900/10 transition-all font-medium text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50/50 border-b border-neutral-100">
                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Administrator</th>
                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Platform Role</th>
                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-right font-black text-neutral-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {ACCOUNTS.map((acc) => (
                <tr key={acc.id} className="hover:bg-neutral-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <Avatar src={acc.avatar} className="w-10 h-10 rounded-xl" />
                      <div>
                        <p className="text-sm font-black text-neutral-900">{acc.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Mail size={12} className="text-neutral-400" />
                          <span className="text-[11px] font-bold text-neutral-500">{acc.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className="bg-neutral-100 text-neutral-700 border-none font-black text-[10px] px-3 py-1 uppercase">
                      {acc.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <UserCheck size={14} />
                      <span className="text-[11px] font-black uppercase tracking-wider">{acc.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
