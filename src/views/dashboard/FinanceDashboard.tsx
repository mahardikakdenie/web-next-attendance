"use client";

import { useAuthStore } from "@/store/auth.store";
import { Wallet, DollarSign, Receipt, TrendingDown, TrendingUp, PieChart } from "lucide-react";
import Chart from "@/components/ui/Chart";

export default function FinanceDashboardPage() {
  const { user } = useAuthStore();

  const financeStats = [
    { title: "Total Payroll (Monthly)", value: "$245K", icon: Wallet, color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/20" },
    { title: "Overtime Costs", value: "$12.4K", icon: DollarSign, color: "from-rose-400 to-red-500", shadow: "shadow-rose-500/20" },
    { title: "Pending Disbursals", value: "4", icon: Receipt, color: "from-amber-400 to-orange-500", shadow: "shadow-amber-500/20" },
    { title: "Cost Reduction", value: "-2.4%", icon: TrendingDown, color: "from-emerald-400 to-teal-500", shadow: "shadow-emerald-500/20" },
  ];

  const payrollTrendsChart = {
    options: {
      chart: { type: "line" as const, toolbar: { show: false }, parentHeightOffset: 0 },
      stroke: { curve: "smooth" as const, width: [4, 4] },
      xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], axisBorder: { show: false }, axisTicks: { show: false } },
      yaxis: { show: false },
      grid: { strokeDashArray: 4, borderColor: "#f1f5f9" },
      colors: ["#3b82f6", "#ef4444"],
      markers: { size: 6, strokeWidth: 3, hover: { size: 8 } },
      legend: { position: "top" as const, horizontalAlign: "right" as const, fontSize: "14px", fontWeight: 600 },
      tooltip: { theme: "light" }
    },
    series: [
      { name: "Base Salary ($k)", data: [210, 215, 220, 220, 230, 245] },
      { name: "Overtime Costs ($k)", data: [15, 12, 18, 14, 10, 12.4] },
    ],
  };

  const costBreakdownChart = {
    options: {
      chart: { type: "radialBar" as const },
      labels: ["Salaries", "Taxes", "Benefits", "Overtime"],
      colors: ["#3b82f6", "#f59e0b", "#10b981", "#ef4444"],
      legend: { position: "bottom" as const, fontSize: "14px", fontWeight: 600, markers: { size: 6 } },
      plotOptions: {
        radialBar: {
          hollow: { size: "40%" },
          track: { margin: 10, background: "#f8fafc" },
          dataLabels: { name: { fontSize: "16px", fontWeight: 600 }, value: { fontSize: "20px", fontWeight: "bold" } }
        }
      },
      stroke: { lineCap: "round" as const }
    },
    series: [65, 15, 10, 10],
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-800 rounded-4xl p-8 sm:p-10 shadow-2xl shadow-indigo-600/20 text-white">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-sm font-bold tracking-wide uppercase mb-4">
            <PieChart size={16} /> Financial Overview
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">Hello, {user?.name} ✨</h1>
          <p className="text-indigo-100 font-medium max-w-xl text-sm sm:text-base leading-relaxed">
            Here is the financial snapshot for this month. Monitor payroll disbursements, overtime costs, and optimize budgeting efficiently.
          </p>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {financeStats.map((stat, idx) => (
          <div key={idx} className="group bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${stat.color} text-white shadow-lg ${stat.shadow}`}>
                <stat.icon size={22} strokeWidth={2.5} />
              </div>
              <div className="flex items-center gap-1 text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-bold">
                <TrendingUp size={14} /> 1.2%
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-black text-neutral-900 tracking-tight">{stat.value}</h3>
              <p className="text-sm font-semibold text-neutral-500 mt-1">{stat.title}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white rounded-4xl p-6 sm:p-8 shadow-sm border border-neutral-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-neutral-900">Payroll & Overtime Trends</h3>
              <p className="text-sm font-medium text-neutral-400">Monthly expenditure tracking</p>
            </div>
            <select className="bg-neutral-50 border border-neutral-200 text-neutral-700 text-sm font-bold rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
              <option>Year 2024</option>
              <option>Year 2023</option>
            </select>
          </div>
          <div className="h-[320px]">
            <Chart options={payrollTrendsChart.options} series={payrollTrendsChart.series} type="line" height="100%" />
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-4xl p-6 sm:p-8 shadow-sm border border-neutral-100 flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-neutral-900">Expense Breakdown</h3>
            <p className="text-sm font-medium text-neutral-400">Distribution of payroll costs</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Chart options={costBreakdownChart.options} series={costBreakdownChart.series} type="radialBar" width="100%" height={320} />
          </div>
        </div>
      </section>

    </div>
  );
}
