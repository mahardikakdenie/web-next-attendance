"use client";

import { CreditCard, CheckCircle2, AlertCircle, Clock, TrendingUp, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";

interface Subscription {
  id: number;
  tenant: string;
  plan: string;
  amount: string;
  status: string;
  nextBilling: string;
}

const SUBSCRIPTIONS: Subscription[] = [
  { id: 1, tenant: "TechCorp Indonesia", plan: "Enterprise", amount: "IDR 15,000,000", status: "Paid", nextBilling: "2024-04-12" },
  { id: 2, tenant: "Creative Studio", plan: "Business", amount: "IDR 5,000,000", status: "Paid", nextBilling: "2024-04-05" },
  { id: 3, tenant: "Global Logistics", plan: "Enterprise", amount: "IDR 25,000,000", status: "Overdue", nextBilling: "2024-03-20" },
  { id: 4, tenant: "Future Retail", plan: "Business", amount: "IDR 5,000,000", status: "Pending", nextBilling: "2024-04-01" },
];

export default function SubscriptionsPage() {
  const columns: Column<Subscription>[] = [
    {
      header: "Tenant",
      accessor: (item) => <p className="text-sm font-black text-slate-900">{item.tenant}</p>,
      sortable: true
    },
    {
      header: "Plan",
      accessor: (item) => (
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
          {item.plan}
        </span>
      ),
      sortable: true
    },
    {
      header: "Amount",
      accessor: (item) => <p className="text-sm font-black text-slate-900">{item.amount}</p>,
      sortable: true
    },
    {
      header: "Status",
      accessor: (item) => (
        <div className={`flex items-center gap-1.5 ${
          item.status === "Paid" ? "text-emerald-600" : item.status === "Overdue" ? "text-rose-600" : "text-amber-600"
        }`}>
          {item.status === "Paid" ? <CheckCircle2 size={14} /> : item.status === "Overdue" ? <AlertCircle size={14} /> : <Clock size={14} />}
          <span className="text-[11px] font-black uppercase tracking-wider">{item.status}</span>
        </div>
      ),
      sortable: true
    },
    {
      header: "Next Billing",
      accessor: (item) => <p className="text-sm font-bold text-slate-500">{new Date(item.nextBilling).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>,
      sortable: true
    }
  ];

  const actions = () => (
    <Button className="bg-slate-900 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all">
      Invoice
    </Button>
  );

  const stats = [
    { title: "Monthly Revenue", value: "IDR 842M", growth: "+8.2%", icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Active Licenses", value: "386", growth: "Stable", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Revenue Growth", value: "12.5%", growth: "High", icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 mb-1">
          <CreditCard size={14} strokeWidth={3} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Financial Oversight</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Subscriptions</h1>
        <p className="text-slate-500 font-medium">Monitor recurring revenue and organizational billing health.</p>
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
        <h2 className="text-xl font-black text-slate-900 tracking-tight px-2">Recent Billing Cycles</h2>
        <DataTable 
          data={SUBSCRIPTIONS} 
          columns={columns} 
          actions={actions}
          searchKey="tenant"
          searchPlaceholder="Search by organization name..."
        />
      </div>
    </div>
  );
}
