"use client";

import { CreditCard, ArrowUpRight, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";

const SUBSCRIPTIONS = [
  { id: 1, tenant: "TechCorp Indonesia", plan: "Enterprise", amount: "IDR 15,000,000", status: "Paid", nextBilling: "2024-04-12" },
  { id: 2, tenant: "Creative Studio", plan: "Business", amount: "IDR 5,000,000", status: "Paid", nextBilling: "2024-04-05" },
  { id: 3, tenant: "Global Logistics", plan: "Enterprise", amount: "IDR 25,000,000", status: "Overdue", nextBilling: "2024-03-20" },
  { id: 4, tenant: "Future Retail", plan: "Business", amount: "IDR 5,000,000", status: "Pending", nextBilling: "2024-04-01" },
];

export default function SubscriptionsPage() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-indigo-600 mb-2">
          <CreditCard size={20} strokeWidth={2.5} />
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Financial Oversight</span>
        </div>
        <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Subscriptions</h1>
        <p className="text-neutral-500 font-medium">Monitor recurring revenue and tenant billing cycles.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm">
          <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-1">Monthly Recurring Revenue (MRR)</p>
          <h3 className="text-2xl font-black text-neutral-900">IDR 842,000,000</h3>
          <div className="flex items-center gap-1 mt-2 text-green-600">
            <ArrowUpRight size={14} />
            <span className="text-[10px] font-bold">8.2% from last month</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm">
          <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-1">Active Subscriptions</p>
          <h3 className="text-2xl font-black text-neutral-900">386</h3>
          <p className="text-[10px] font-bold text-neutral-400 mt-2">Paid & Business accounts</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm">
          <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-1">Churn Rate</p>
          <h3 className="text-2xl font-black text-rose-600">1.2%</h3>
          <p className="text-[10px] font-bold text-neutral-400 mt-2">Industry average: 3.5%</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-100">
          <h2 className="text-lg font-black text-neutral-900">Recent Billing Cycles</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50/50 border-b border-neutral-100">
                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Tenant</th>
                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Plan</th>
                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Next Billing</th>
                <th className="px-6 py-5 text-right font-black text-neutral-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {SUBSCRIPTIONS.map((sub) => (
                <tr key={sub.id} className="hover:bg-neutral-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-neutral-900">{sub.tenant}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-neutral-600">
                    {sub.plan}
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-neutral-900">
                    {sub.amount}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1.5 ${
                      sub.status === "Paid" ? "text-emerald-600" : sub.status === "Overdue" ? "text-rose-600" : "text-amber-600"
                    }`}>
                      {sub.status === "Paid" ? <CheckCircle2 size={14} /> : sub.status === "Overdue" ? <AlertCircle size={14} /> : <Clock size={14} />}
                      <span className="text-[11px] font-black uppercase tracking-wider">{sub.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-neutral-500">
                    {new Date(sub.nextBilling).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button className="bg-neutral-900 text-white text-xs px-4 py-2 rounded-xl">View Invoice</Button>
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
