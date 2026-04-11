"use client";

import { useAuthStore } from "@/store/auth.store";
import { Users, Building2, TrendingUp, ShieldCheck, ArrowUpRight, Activity } from "lucide-react";
import Chart from "@/components/ui/Chart";

export default function AdminDashboardPage() {
  const { user } = useAuthStore();

  const platformStats = [
    { title: "Total Tenants", value: "124", icon: Building2, color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/20" },
    { title: "Total Users", value: "1,452", icon: Users, color: "from-emerald-400 to-teal-500", shadow: "shadow-emerald-500/20" },
    { title: "Active Subs", value: "89", icon: ShieldCheck, color: "from-amber-400 to-orange-500", shadow: "shadow-amber-500/20" },
    { title: "Monthly Growth", value: "+12%", icon: TrendingUp, color: "from-rose-400 to-pink-600", shadow: "shadow-rose-500/20" },
  ];

  const tenantGrowthChart = {
    options: {
      chart: { type: "area" as const, toolbar: { show: false }, parentHeightOffset: 0, sparkline: { enabled: false } },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth" as const, width: 3 },
      xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], axisBorder: { show: false }, axisTicks: { show: false } },
      yaxis: { show: false },
      grid: { show: false },
      colors: ["#6366f1"],
      fill: {
        type: "gradient",
        gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 90, 100] },
      },
      tooltip: { theme: "light", y: { formatter: (val: number) => val + " Tenants" } }
    },
    series: [{ name: "New Tenants", data: [12, 18, 24, 32, 45, 52] }],
  };

  const planDistributionChart = {
    options: {
      chart: { type: "donut" as const },
      labels: ["Basic", "Pro", "Enterprise"],
      colors: ["#3b82f6", "#10b981", "#f59e0b"],
      legend: { position: "bottom" as const, fontSize: "14px", fontWeight: 600, markers: { radius: 12 } },
      dataLabels: { enabled: false },
      plotOptions: { pie: { donut: { size: "75%", labels: { show: true, name: { show: true }, value: { show: true, fontSize: "24px", fontWeight: "bold" }, total: { show: true, showAlways: true, label: "Total", fontSize: "14px" } } } } },
      stroke: { show: true, colors: ["#ffffff"], width: 4 }
    },
    series: [45, 60, 19],
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-4xl p-8 sm:p-10 shadow-2xl shadow-indigo-500/20 text-white">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-sm font-bold tracking-wide uppercase mb-4">
            <Activity size={16} /> Platform Overview
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">Welcome back, {user?.name} ✨</h1>
          <p className="text-indigo-100 font-medium max-w-xl text-sm sm:text-base leading-relaxed">
            Here is the system health report and growth analytics for the entire platform. Monitor tenant acquisition, active subscriptions, and user engagement seamlessly.
          </p>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {platformStats.map((stat, idx) => (
          <div key={idx} className="group bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${stat.color} text-white shadow-lg ${stat.shadow}`}>
                <stat.icon size={22} strokeWidth={2.5} />
              </div>
              <div className="flex items-center gap-1 text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-bold">
                <ArrowUpRight size={14} /> 4.2%
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
              <h3 className="text-xl font-bold text-neutral-900">Tenant Acquisition</h3>
              <p className="text-sm font-medium text-neutral-400">Year-to-date growth trajectory</p>
            </div>
            <select className="bg-neutral-50 border border-neutral-200 text-neutral-700 text-sm font-bold rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
              <option>This Year</option>
              <option>Last 6 Months</option>
            </select>
          </div>
          <div className="h-[320px]">
            <Chart options={tenantGrowthChart.options} series={tenantGrowthChart.series} type="area" height="100%" />
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-4xl p-6 sm:p-8 shadow-sm border border-neutral-100 flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-neutral-900">Plan Distribution</h3>
            <p className="text-sm font-medium text-neutral-400">Active subscriptions overview</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Chart options={planDistributionChart.options} series={planDistributionChart.series} type="donut" width="100%" height={320} />
          </div>
        </div>
      </section>

    </div>
  );
}
