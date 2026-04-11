"use client";

import { 
  Globe, 
  Users, 
  ShieldCheck,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Plus,
  MoreVertical,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { DataTable, Column } from "@/components/ui/DataTable";

interface Tenant {
  id: number;
  name: string;
  code: string;
  logo: string;
  status: string;
  employees: number;
  plan: string;
  createdAt: string;
  domain: string;
}

const MOCK_TENANTS: Tenant[] = [
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
  const columns: Column<Tenant>[] = [
    {
      header: "Organization",
      accessor: (item) => (
        <div className="flex items-center gap-4">
          <Avatar src={item.logo} className="w-12 h-12 rounded-2xl shadow-sm border border-slate-100" />
          <div>
            <p className="text-sm font-black text-slate-900 leading-tight">{item.name}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{item.code}</span>
              <span className="w-1 h-1 rounded-full bg-slate-200" />
              <div className="flex items-center gap-1 text-[10px] text-blue-500 font-bold">
                <Globe size={10} />
                <span>{item.domain}</span>
              </div>
            </div>
          </div>
        </div>
      ),
      sortable: true
    },
    {
      header: "Plan",
      accessor: (item) => (
        <Badge className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border-none ${
          item.plan === "Enterprise" ? "bg-indigo-50 text-indigo-700" : "bg-blue-50 text-blue-700"
        }`}>
          {item.plan}
        </Badge>
      ),
      sortable: true
    },
    {
      header: "Usage",
      accessor: (item) => (
        <div className="flex items-center gap-2 text-slate-600 font-bold">
          <Users size={14} className="text-slate-300" />
          <span className="text-xs">{item.employees} Users</span>
        </div>
      ),
      sortable: true
    },
    {
      header: "Status",
      accessor: (item) => (
        <div className={`flex items-center gap-1.5 ${
          item.status === "Active" ? "text-emerald-600" : "text-rose-600"
        }`}>
          {item.status === "Active" ? <CheckCircle2 size={14} strokeWidth={3} /> : <XCircle size={14} strokeWidth={3} />}
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

  const stats = [
    { title: "Total Tenants", value: "42", growth: "+4", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Total Revenue", value: "IDR 450M", growth: "12.5%", icon: ArrowUpRight, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "System Health", value: "99.9%", growth: "Optimal", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 mb-1">
            <ShieldCheck size={14} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Platform Control</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Organization Tenants</h1>
          <p className="text-slate-500 font-medium max-w-lg">
            Monitor and manage organization-level instances across the global infrastructure.
          </p>
        </div>

        <Button className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200 px-8 py-4 rounded-[20px] transition-all active:scale-95 group">
          <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-black text-sm uppercase tracking-wide">New Tenant</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.bg} ${s.color}`}>
                <s.icon size={22} strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-black bg-slate-50 text-slate-400 px-2 py-1 rounded-lg uppercase tracking-wider">{s.growth}</span>
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.title}</p>
            <h3 className="text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-black text-slate-900 tracking-tight px-2">Managed Organizations</h2>
        <DataTable 
          data={MOCK_TENANTS} 
          columns={columns} 
          actions={actions}
          searchKey="name"
          searchPlaceholder="Search by tenant name, code or domain..."
        />
      </div>
    </div>
  );
}
