"use client";

import { useAuthStore } from "@/store/auth.store";
import { 
  Wallet, 
  Receipt, 
  TrendingDown, 
  TrendingUp, 
  PieChart,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  Scale
} from "lucide-react";
import Chart from "@/components/ui/Chart";
import { Button } from "@/components/ui/Button";

export default function FinanceDashboardPage() {
  const { user } = useAuthStore();

  const financeStats = [
    { title: "Actual Payroll (MTD)", value: "Rp 245M", icon: Wallet, color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/20" },
    { title: "Budget Variance", value: "+Rp 12.5M", icon: Scale, color: "from-rose-400 to-red-500", shadow: "shadow-rose-500/20" },
    { title: "Pending Claims", value: "14", icon: Receipt, color: "from-amber-400 to-orange-500", shadow: "shadow-amber-500/20" },
    { title: "Forecast Next Month", value: "Rp 255M", icon: TrendingUp, color: "from-emerald-400 to-teal-500", shadow: "shadow-emerald-500/20" },
  ];

  const budgetVarianceChart = {
    options: {
      chart: { type: "bar" as const, toolbar: { show: false } },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          borderRadius: 6,
        },
      },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2, colors: ["transparent"] },
      xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] },
      yaxis: { title: { text: "Rp (Millions)" } },
      fill: { opacity: 1 },
      colors: ["#94a3b8", "#3b82f6", "#f59e0b"],
      legend: { position: "top" as const, horizontalAlign: "right" as const, fontSize: "12px", fontWeight: 600, markers: { size: 6 } },
      tooltip: {
        y: { formatter: (val: number) => "Rp " + val + " Juta" }
      }
    },
    series: [
      { name: "Budget Allocated", data: [220, 220, 230, 230, 240, 240] },
      { name: "Actual Spent", data: [210, 215, 225, 235, 245, 0] },
      { name: "Forecast", data: [0, 0, 0, 0, 0, 255] }
    ],
  };

  const costBreakdownChart = {
    options: {
      chart: { type: "radialBar" as const },
      labels: ["Base Salaries", "Taxes (TER)", "BPJS Benefits", "Overtime", "Reimbursements"],
      colors: ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"],
      legend: { position: "bottom" as const, fontSize: "12px", fontWeight: 600, markers: { size: 6 } },
      plotOptions: {
        radialBar: {
          hollow: { size: "35%" },
          track: { margin: 8, background: "#f8fafc" },
          dataLabels: { name: { fontSize: "14px", fontWeight: 600 }, value: { fontSize: "16px", fontWeight: "bold" } }
        }
      },
      stroke: { lineCap: "round" as const }
    },
    series: [60, 15, 10, 8, 7],
  };

  const handleExportJournal = () => {
    alert("System: Exporting General Ledger (GL) Journal Entry \nFormat: CSV (Xero/Accurate Compatible) \nStatus: Generated successfully.");
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-800 to-indigo-950 rounded-[40px] p-8 sm:p-12 shadow-2xl shadow-indigo-900/20 text-white">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-white opacity-5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-black tracking-widest uppercase mb-4">
              <PieChart size={16} className="text-blue-300" /> Executive Financial Overview
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-2">Hello, {user?.name} ✨</h1>
            <p className="text-indigo-200 font-medium max-w-xl text-sm sm:text-base leading-relaxed">
              Monitor real-time budget variances, forecast next month&apos;s payroll liabilities, and export accounting journals seamlessly.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button 
              onClick={handleExportJournal}
              className="flex items-center justify-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 border border-white/20 shadow-xl px-6 py-3.5 rounded-2xl transition-all active:scale-95"
            >
              <FileSpreadsheet size={18} strokeWidth={2.5} />
              <span className="font-black uppercase tracking-widest text-[10px]">Export GL Journal</span>
            </Button>
            <Button className="flex items-center justify-center gap-2 bg-indigo-500/20 text-white hover:bg-indigo-500/40 border border-white/10 shadow-md px-6 py-3.5 rounded-2xl transition-all active:scale-95">
              <Download size={18} strokeWidth={2.5} />
              <span className="font-black uppercase tracking-widest text-[10px]">Download Report</span>
            </Button>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {financeStats.map((stat, idx) => (
          <div key={idx} className="group bg-white rounded-[32px] p-6 shadow-sm border border-neutral-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${stat.color} text-white shadow-lg ${stat.shadow}`}>
                <stat.icon size={22} strokeWidth={2.5} />
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase ${idx === 1 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {idx === 1 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} 
                {idx === 1 ? 'Over Budget' : 'On Track'}
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-black text-neutral-900 tracking-tight">{stat.value}</h3>
              <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mt-1">{stat.title}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Analytics Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white rounded-[40px] p-8 sm:p-10 shadow-sm border border-neutral-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-2xl font-black text-neutral-900 tracking-tight">Budget Variance & Forecast</h3>
              <p className="text-sm font-medium text-neutral-400 mt-1">Compare allocated budget against actual spending and forecasts.</p>
            </div>
            <select className="bg-neutral-50 border border-neutral-200 text-neutral-700 text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/10">
              <option>H1 2024 (Jan - Jun)</option>
              <option>H2 2023 (Jul - Dec)</option>
            </select>
          </div>
          
          <div className="h-[350px]">
            <Chart options={budgetVarianceChart.options} series={budgetVarianceChart.series} type="bar" height="100%" />
          </div>

          <div className="mt-6 flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <AlertTriangle className="text-amber-500 shrink-0" size={20} />
            <p className="text-xs font-bold text-amber-800 leading-relaxed">
              <strong>Forecast Alert:</strong> Total payroll liability is predicted to exceed the budget by <span className="text-rose-600">Rp 15M</span> in June due to historical mid-year allowance trends.
            </p>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-[40px] p-8 sm:p-10 shadow-sm border border-neutral-100 flex flex-col">
          <div className="mb-6">
            <h3 className="text-2xl font-black text-neutral-900 tracking-tight">Cost Allocation</h3>
            <p className="text-sm font-medium text-neutral-400 mt-1">Distribution of total workforce liability</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Chart options={costBreakdownChart.options} series={costBreakdownChart.series} type="radialBar" width="100%" height={320} />
          </div>
          <div className="mt-6 pt-6 border-t border-neutral-50">
             <div className="flex items-center justify-between text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3">
                <span>Top Liability</span>
                <span className="text-blue-600">Primary Cost</span>
             </div>
             <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                   <span className="text-xs font-bold text-neutral-600">Base Salaries</span>
                   <span className="text-xs font-black text-neutral-900">60%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                   <span className="text-xs font-bold text-neutral-600">Taxes (PPh 21)</span>
                   <span className="text-xs font-black text-neutral-900">15%</span>
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
