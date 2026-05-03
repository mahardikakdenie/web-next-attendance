"use client";

import { useAuthStore } from "@/store/auth.store";
import { Users, Building2, TrendingUp, ShieldCheck, ArrowUpRight, ArrowDownRight, Activity, Loader2, AlertCircle } from "lucide-react";
import Chart from "@/components/ui/Chart";
import { useQuery } from "@tanstack/react-query";
import { getGlobalAnalytics } from "@/service/admin";
import { useState, useMemo } from "react";

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState("this_year");

  const { data: analyticsResponse, isLoading, isError } = useQuery({
    queryKey: ["global-analytics", period],
    queryFn: () => getGlobalAnalytics(period),
  });

  const data = analyticsResponse?.data;

  const platformStats = useMemo(() => {
    if (!data) return [];
    return [
      { 
        title: "Total Tenants", 
        value: data.kpis.total_tenants.value.toLocaleString(), 
        growth: data.kpis.total_tenants.growth_pct,
        icon: Building2, 
        color: "from-blue-500 to-indigo-600", 
        shadow: "shadow-blue-500/20" 
      },
      { 
        title: "Total Users", 
        value: data.kpis.total_users.value.toLocaleString(), 
        growth: data.kpis.total_users.growth_pct,
        icon: Users, 
        color: "from-emerald-400 to-teal-500", 
        shadow: "shadow-emerald-500/20" 
      },
      { 
        title: "Active Subs", 
        value: data.kpis.active_subscriptions.value.toLocaleString(), 
        growth: data.kpis.active_subscriptions.growth_pct,
        icon: ShieldCheck, 
        color: "from-amber-400 to-orange-500", 
        shadow: "shadow-amber-500/20" 
      },
      { 
        title: "Monthly Growth", 
        value: `${data.kpis.monthly_growth.value}%`, 
        growth: data.kpis.monthly_growth.growth_pct,
        icon: TrendingUp, 
        color: "from-rose-400 to-pink-600", 
        shadow: "shadow-rose-500/20" 
      },
    ];
  }, [data]);

  const tenantGrowthChart = useMemo(() => ({
    options: {
      chart: { type: "area" as const, toolbar: { show: false }, parentHeightOffset: 0, sparkline: { enabled: false } },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth" as const, width: 3 },
      xaxis: { 
        categories: data?.growth_chart?.labels || [], 
        axisBorder: { show: false }, 
        axisTicks: { show: false },
        labels: { style: { colors: "#94a3b8", fontWeight: 600 } }
      },
      yaxis: { show: false },
      grid: { show: false },
      colors: ["#6366f1"],
      fill: {
        type: "gradient",
        gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 90, 100] },
      },
      tooltip: { theme: "light", y: { formatter: (val: number) => val + " Tenants" } }
    },
    series: [{ name: "New Tenants", data: data?.growth_chart?.data || [] }],
  }), [data]);

  const tenantStatusChart = useMemo(() => ({
    options: {
      chart: { type: "donut" as const },
      labels: data?.tenant_status?.map(p => p.label) || [],
      colors: data?.tenant_status?.map(p => p.color) || ["#10b981", "#f43f5e", "#f59e0b"],
      legend: { position: "bottom" as const, fontSize: "14px", fontWeight: 600, markers: { size: 6 } },
      dataLabels: { enabled: false },
      plotOptions: { pie: { donut: { size: "75%", labels: { show: true, name: { show: true }, value: { show: true, fontSize: "24px", fontWeight: "bold" }, total: { show: true, showAlways: true, label: "Total", fontSize: "14px" } } } } },
      stroke: { show: true, colors: ["#ffffff"], width: 4 }
    },
    series: data?.tenant_status?.map(p => p.value) || [],
  }), [data]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Platform Analytics...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-500 mb-2">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-xl font-black text-slate-900">Failed to Load Analytics</h3>
        <p className="text-slate-500 max-w-sm">We encountered an error while fetching the platform health report. Please try refreshing the page.</p>
      </div>
    );
  }

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
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                stat.growth >= 0 ? "text-emerald-500 bg-emerald-50" : "text-rose-500 bg-rose-50"
              }`}>
                {stat.growth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(stat.growth)}%
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
              <p className="text-sm font-medium text-neutral-400">Growth trajectory based on selected period</p>
            </div>
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-neutral-50 border border-neutral-200 text-neutral-700 text-sm font-bold rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="this_year">This Year</option>
              <option value="last_6_months">Last 6 Months</option>
            </select>
          </div>
          <div className="h-[320px]">
            <Chart options={tenantGrowthChart.options} series={tenantGrowthChart.series} type="area" height="100%" />
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-4xl p-6 sm:p-8 shadow-sm border border-neutral-100 flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-neutral-900">System Status</h3>
            <p className="text-sm font-medium text-neutral-400">Operational health overview</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Chart options={tenantStatusChart.options} series={tenantStatusChart.series} type="donut" width="100%" height={320} />
          </div>
        </div>
      </section>

    </div>
  );
}
