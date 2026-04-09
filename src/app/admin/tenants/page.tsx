"use client";

import { useState } from "react";
import { 
  Building2, 
  Search, 
  Plus, 
  MoreVertical, 
  Globe, 
  Users, 
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { TableSkeleton } from "@/components/ui/Skeleton";

const MOCK_TENANTS = [
  {
    id: 1,
    name: "TechCorp Indonesia",
    code: "TCI",
    logo: "https://ui-avatars.com/api/?name=TechCorp&background=0D8ABC&color=fff",
    status: "Active",
    employees: 124,
    plan: "Enterprise",
    createdAt: "2023-10-12",
    domain: "techcorp.attendance.pro"
  },
  {
    id: 2,
    name: "Creative Studio",
    code: "CST",
    logo: "https://ui-avatars.com/api/?name=Creative+Studio&background=F59E0B&color=fff",
    status: "Active",
    employees: 45,
    plan: "Business",
    createdAt: "2023-11-05",
    domain: "creative.attendance.pro"
  },
  {
    id: 3,
    name: "Global Logistics",
    code: "GLO",
    logo: "https://ui-avatars.com/api/?name=Global+Logistics&background=10B981&color=fff",
    status: "Suspended",
    employees: 890,
    plan: "Enterprise",
    createdAt: "2023-08-20",
    domain: "logistics.attendance.pro"
  }
];

export default function ManageTenantsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading] = useState(false);

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <TableSkeleton rows={10} cols={6} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <ShieldCheck size={20} strokeWidth={2.5} />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Platform Administration</span>
          </div>
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Manage Tenants</h1>
          <p className="text-neutral-500 font-medium">Overview and management of all organizations on the platform.</p>
        </div>

        <Button className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 px-6 py-3 rounded-2xl transition-all active:scale-95">
          <Plus size={18} />
          <span className="font-bold">Register New Tenant</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm">
          <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-1">Total Tenants</p>
          <h3 className="text-2xl font-black text-neutral-900">42</h3>
          <div className="flex items-center gap-1 mt-2 text-green-600">
            <ArrowUpRight size={14} />
            <span className="text-[10px] font-bold">+4 this month</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm">
          <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-1">Active Users</p>
          <h3 className="text-2xl font-black text-neutral-900">12,402</h3>
          <p className="text-[10px] font-bold text-neutral-400 mt-2">Across all organizations</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm">
          <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-1">Monthly Revenue</p>
          <h3 className="text-2xl font-black text-indigo-600">IDR 450M</h3>
          <div className="flex items-center gap-1 mt-2 text-green-600">
            <ArrowUpRight size={14} />
            <span className="text-[10px] font-bold">12.5% increase</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm">
          <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-1">System Health</p>
          <h3 className="text-2xl font-black text-emerald-600">99.9%</h3>
          <p className="text-[10px] font-bold text-neutral-400 mt-2">All clusters operational</p>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-[32px] border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="relative w-full lg:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search tenant name, code, or domain..."
              className="w-full pl-12 pr-4 h-12 bg-neutral-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50/50 border-b border-neutral-100">
                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Organization</th>
                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Plan</th>
                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Usage</th>
                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Registered</th>
                <th className="px-6 py-5 text-right font-black text-neutral-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {MOCK_TENANTS.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-neutral-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <Avatar src={tenant.logo} className="w-12 h-12 rounded-2xl" />
                      <div>
                        <p className="text-sm font-black text-neutral-900">{tenant.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase">{tenant.code}</span>
                          <span className="w-1 h-1 rounded-full bg-neutral-300" />
                          <div className="flex items-center gap-1 text-[10px] text-blue-500 font-bold">
                            <Globe size={10} />
                            <span>{tenant.domain}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      tenant.plan === "Enterprise" ? "bg-indigo-50 text-indigo-700" : "bg-blue-50 text-blue-700"
                    }`}>
                      {tenant.plan}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-neutral-700 font-bold">
                      <Users size={14} className="text-neutral-400" />
                      <span className="text-sm">{tenant.employees} Employees</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1.5 ${
                      tenant.status === "Active" ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      {tenant.status === "Active" ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      <span className="text-[11px] font-black uppercase tracking-wider">{tenant.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-neutral-500">
                    {new Date(tenant.createdAt).toLocaleDateString()}
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
