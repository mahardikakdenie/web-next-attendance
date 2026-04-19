"use client";

import { 
  UserCheck, 
  UserX, 
  Clock, 
  BarChart3, 
  Search, 
  Calendar,
  X,
  Target,
  History,
  TrendingUp,
  Coffee,
  Briefcase,
  Globe,
  Sparkles,
  Trophy,
  AlertTriangle,
  Activity,
  ArrowRight,
  Info,
  Download
} from "lucide-react";
import Chart from "@/components/ui/Chart";
import { DataTable, Column } from "@/components/ui/DataTable";
import { useState, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import type ApexCharts from "apexcharts";
import { 
  EmployeePerformance, 
  AnalyticsMetric, 
  ContextModalState, 
  ChartTooltipContext,
  StatItem,
  ApexSeriesObject,
  InternalChartState
} from "@/types/analytics";

import { 
  HrDashboardPerformanceMatrix, 
  HeatmapQueryParams,
  MappedUser
} from "@/types/api";
import { getHrDashboard, getHeatmap } from "@/service/dashboard";
import { useQuery } from "@tanstack/react-query";

/**
 * Visual Helpers
 */

function StatusBadge({ status }: { status: string }) {
  const isExcellent = status.toLowerCase() === "excellent";
  const isGood = status.toLowerCase() === "good";
  const isAtRisk = status.toLowerCase() === "at risk" || status.toLowerCase() === "poor";

  const styles = isExcellent 
    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
    : isGood 
    ? "bg-blue-50 text-blue-700 border-blue-100"
    : isAtRisk
    ? "bg-rose-50 text-rose-700 border-rose-100"
    : "bg-slate-50 text-slate-700 border-slate-100";

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${styles}`}>
      {status}
    </span>
  );
}

const mapEmployee = (emp: HrDashboardPerformanceMatrix): EmployeePerformance => ({
  id: emp.id,
  name: emp.name,
  avatar: emp.avatar,
  department: emp.department,
  score: emp.score,
  totalLate: emp.total_late,
  avgClockIn: emp.avg_clock_in,
  status: emp.status as EmployeePerformance["status"],
  overtimeHours: emp.overtime_hours,
  leaveBalance: emp.leave_balance
});

const mapUserToPerformance = (u: MappedUser): EmployeePerformance => ({
  id: u.id,
  name: u.name,
  avatar: u.avatar,
  department: u.department || "Staff",
  score: u.score || 0,
  totalLate: 0,
  avgClockIn: "-",
  status: "Good",
  overtimeHours: 0,
  leaveBalance: 0
});

export default function HrDashboardPage() {
  // --- States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeePerformance | null>(null);
  const [heatmapMetric, setHeatmapMetric] = useState<AnalyticsMetric>("attendance");
  const [heatmapEmployeeId, setHeatmapEmployeeId] = useState<number | "all">("all");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [contextModal, setContextModal] = useState<ContextModalState>({
    isOpen: false,
    title: "",
    description: "",
    employees: []
  });

  // --- Data Fetching with React Query ---

  const { data: dashboardResp, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["hr-dashboard"],
    queryFn: getHrDashboard,
  });

  const apiData = dashboardResp?.data || null;

  const { data: heatmapResp, isLoading: isHeatmapLoading } = useQuery({
    queryKey: ["hr-heatmap", heatmapMetric, heatmapEmployeeId],
    queryFn: async () => {
      const typeMap: Record<string, string> = {
        attendance: "clockin",
        overtime: "clockout",
        leave: "leave"
      };

      const params: HeatmapQueryParams = { 
        type: typeMap[heatmapMetric] || "clockin" 
      };

      if (heatmapEmployeeId !== "all") {
        params.user_id = heatmapEmployeeId as number;
      }

      return await getHeatmap(params);
    },
  });

  const heatmapApiData = useMemo(() => {
    return heatmapResp?.data || [];
  }, [heatmapResp]);

  const isLoading = isDashboardLoading;

  // --- Memos ---

  const employeeList = useMemo(() => apiData?.performance_matrix.map(mapEmployee) || [], [apiData]);
  const topAchievers = useMemo(() => apiData?.top_performers.map(mapEmployee) || [], [apiData]);
  const lowPerformers = useMemo(() => apiData?.need_attention.map(mapEmployee) || [], [apiData]);

  const hrStats: StatItem[] = useMemo(() => {
    const stats = apiData?.stats;
    return [
      { title: "Presence Rate", value: stats ? `${stats.presence_rate}%` : "0%", icon: UserCheck, color: "from-emerald-400 to-teal-500", shadow: "shadow-emerald-500/20" },
      { title: "Avg Overtime", value: stats ? `${stats.avg_overtime}h/wk` : "0h/wk", icon: Clock, color: "from-blue-400 to-indigo-600", shadow: "shadow-blue-500/20" },
      { title: "Pending Leave", value: stats ? `${stats.pending_leave} Requests` : "0 Requests", icon: Calendar, color: "from-amber-400 to-orange-500", shadow: "shadow-amber-500/20" },
      { title: "At Risk Staff", value: stats ? `${stats.at_risk_staff} Users` : "0 Users", icon: UserX, color: "from-rose-400 to-red-500", shadow: "shadow-rose-500/20" },
    ];
  }, [apiData]);

  const leaveDistributionLabels = useMemo(() => apiData?.leave_distribution.map((d) => d.label) || [], [apiData]);
  const leaveDistributionSeries = useMemo(() => apiData?.leave_distribution.map((d) => d.value) || [], [apiData]);

  const leaveTrendsSeries = useMemo(() => apiData?.leave_trends || [], [apiData]);

  const heatmapData = useMemo(() => {
    if (!heatmapApiData || heatmapApiData.length === 0) return [];
    
    const grouped: Record<string, { x: string, y: number, users: MappedUser[] }[]> = {};
    
    heatmapApiData.forEach(item => {
      if (!grouped[item.day]) grouped[item.day] = [];
      grouped[item.day].push({ 
        x: item.time, 
        y: item.value, 
        users: item.users || [] 
      });
    });

    return Object.keys(grouped).map(day => ({
      name: day,
      data: grouped[day]
    }));
  }, [heatmapApiData]);

  // --- Handlers ---

  const handleHeatmapClick = useCallback((_event: MouseEvent, _chartContext: ApexCharts, config?: { seriesIndex: number; dataPointIndex: number }) => {
    if (!config || config.seriesIndex < 0 || config.dataPointIndex < 0 || !heatmapData.length) return;
    const { seriesIndex, dataPointIndex } = config;

    const targetPoint = heatmapData[seriesIndex]?.data[dataPointIndex];
    if (!targetPoint) return;

    const day = heatmapData[seriesIndex].name;
    const time = targetPoint.x;
    
    const users = targetPoint.users.map((u: MappedUser) => {
      const fullProfile = employeeList.find(e => e.id === u.id);
      if (fullProfile) return fullProfile;
      return mapUserToPerformance(u);
    });

    setContextModal({
      isOpen: true,
      title: `Activity Detail`,
      description: `List of employees identified on ${day} at ${time}.`,
      employees: users
    });
  }, [heatmapData, employeeList]);

  const handleLeaveDonutClick = useCallback((_event: MouseEvent, _chartContext: ApexCharts, config: { dataPointIndex: number }) => {
    if (!apiData) return;
    const categoryIndex = config.dataPointIndex;
    const categoryData = apiData.leave_distribution[categoryIndex];
    
    if (!categoryData) return;

    const users = categoryData.users.map((u: MappedUser) => {
      const fullProfile = employeeList.find(e => e.id === u.id);
      return {
        ...mapUserToPerformance(u),
        ...(fullProfile || {})
      };
    });

    setContextModal({
      isOpen: true,
      title: `${categoryData.label} Overview`,
      description: `Staff members currently associated with this leave category.`,
      employees: users
    });
  }, [apiData, employeeList]);

  const handleTrendsClick = useCallback((_event: MouseEvent, chartContext: ApexCharts, config: { seriesIndex: number; dataPointIndex: number }) => {
    const w = (chartContext as unknown as { w: InternalChartState }).w;
    const month = w.globals.labels[config.dataPointIndex];
    const seriesArr = w.config.series;
    const series = seriesArr ? seriesArr[config.seriesIndex] as ApexSeriesObject : { name: "Trend", data: [] };
    const seriesName = series.name || "Trend";

    const randomUsers = [...employeeList].sort(() => 0.5 - Math.random()).slice(0, 3);

    setContextModal({
      isOpen: true,
      title: `${seriesName} - ${month}`,
      description: `Employees contributing to this trend during the selected period.`,
      employees: randomUsers
    });
  }, [employeeList]);

  // --- Chart Options ---

  const heatmapOptions: ApexCharts.ApexOptions = useMemo(() => ({
    chart: { 
      type: 'heatmap',
      toolbar: { show: false },
      animations: { enabled: true, easing: 'easeinout', speed: 800 },
      events: { dataPointSelection: handleHeatmapClick }
    },
    dataLabels: { enabled: false },
    colors: [heatmapMetric === "attendance" ? "#10b981" : heatmapMetric === "overtime" ? "#3b82f6" : "#f59e0b"],
    xaxis: { type: "category" },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        radius: 8,
        useFillColorAsStroke: false,
        colorScale: {
          ranges: [
            { from: 0, to: 0, name: 'None', color: '#f8fafc' },
            { from: 1, to: 30, name: 'Low', color: heatmapMetric === "attendance" ? '#d1fae5' : heatmapMetric === "overtime" ? '#dbeafe' : '#fef3c7' },
            { from: 31, to: 70, name: 'Medium', color: heatmapMetric === "attendance" ? '#6ee7b7' : heatmapMetric === "overtime" ? '#93c5fd' : '#fcd34d' },
            { from: 71, to: 100, name: 'High', color: heatmapMetric === "attendance" ? '#10b981' : heatmapMetric === "overtime" ? '#3b82f6' : '#f59e0b' }
          ]
        }
      }
    },
    tooltip: {
      custom: function({ series, seriesIndex, dataPointIndex, w }: ChartTooltipContext) {
        const val = series[seriesIndex][dataPointIndex];
        const time = w.globals.labels[dataPointIndex];
        const seriesArr = w.config.series;
        const seriesObj = seriesArr ? seriesArr[seriesIndex] as ApexSeriesObject : { name: "Unknown", data: [] };
        const day = seriesObj.name || "Unknown";
        
        if (heatmapEmployeeId !== "all") {
          const status = val > 0 ? "Logged Activity" : "No Activity";
          const statusColor = val > 0 ? "text-emerald-600" : "text-slate-400";
          return `
            <div class="p-3 bg-white rounded-xl shadow-xl border border-slate-100 font-sans">
              <div class="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">${day} @ ${time}</div>
              <div class="text-sm font-black ${statusColor}">${status}</div>
            </div>
          `;
        }

        const formulaText = heatmapMetric === "attendance" 
          ? "(Users Present ÷ Total Headcount) × 100" 
          : heatmapMetric === "overtime" 
          ? "(Active OT Hours ÷ Max OT Capacity) × 100"
          : "(Users on Leave ÷ Total Headcount) × 100";

        const metricName = heatmapMetric.charAt(0).toUpperCase() + heatmapMetric.slice(1);

        return `
          <div class="p-4 bg-white rounded-xl shadow-2xl border border-slate-100 font-sans min-w-60">
            <div class="flex justify-between items-center mb-3 border-b border-slate-100 pb-3">
              <span class="text-[11px] font-black text-slate-400 uppercase tracking-widest">${day} • ${time}</span>
              <span class="text-[11px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-md border border-blue-100">${val}% Intensity</span>
            </div>
            <div class="space-y-2">
              <div class="text-[11px] text-slate-500 font-medium leading-relaxed">
                <span class="font-black text-slate-900">Analysis:</span> Represents the density of ${metricName.toLowerCase()} events occurring within this window.
              </div>
              <div class="text-[10px] mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                <span class="block font-black text-slate-900 mb-1 text-[9px] uppercase tracking-widest">Calculation Formula:</span>
                <code class="font-mono text-blue-600 font-bold">${formulaText}</code>
              </div>
              <div class="text-[9px] text-blue-500 font-bold uppercase mt-2 italic text-right">Click point for employee list</div>
            </div>
          </div>
        `;
      }
    }
  }), [handleHeatmapClick, heatmapEmployeeId, heatmapMetric]);

  const leaveDistributionOptions: ApexCharts.ApexOptions = useMemo(() => ({
    chart: { 
      type: 'donut',
      events: { 
        dataPointSelection: (_event: MouseEvent, _chartContext: ApexCharts, config?: ApexCharts.ApexChartEventOpts) => {
          handleLeaveDonutClick(_event, _chartContext, { dataPointIndex: config?.dataPointIndex ?? 0 });
        }
      }
    },
    labels: leaveDistributionLabels.length > 0 ? leaveDistributionLabels : ['No Data'],
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'],
    legend: { position: 'bottom' as const, fontSize: '12px', fontWeight: 600, markers: { size: 6 } },
    plotOptions: { pie: { donut: { size: '75%', labels: { show: true, total: { show: true, label: 'Total Requests', fontSize: '14px', fontWeight: 700 } } } } },
    stroke: { show: true, width: 4, colors: ['#ffffff'] },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (val: number) => val + " Active Requests" } }
  }), [handleLeaveDonutClick, leaveDistributionLabels]);

  const leaveTrendsOptions: ApexCharts.ApexOptions = useMemo(() => ({
    chart: { 
      type: 'area', 
      toolbar: { show: false }, 
      stacked: true,
      events: { 
        markerClick: (_event: MouseEvent, chartContext: ApexCharts, config?: ApexCharts.ApexChartEventOpts) => {
          if (config) {
            handleTrendsClick(_event, chartContext, { seriesIndex: config.dataPointIndex ?? 0, dataPointIndex: config.dataPointIndex ?? 0 });
          }
        }
      }
    },
    colors: ['#3b82f6', '#ef4444'],
    stroke: { curve: 'smooth' as const, width: 3 },
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    yaxis: { show: false },
    grid: { show: false },
    dataLabels: { enabled: false },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.05 } }
  }), [handleTrendsClick]);

  const individualRadarOptions: ApexCharts.ApexOptions = useMemo(() => ({
    chart: { type: 'radar', toolbar: { show: false } },
    xaxis: { categories: ['Punctuality', 'Overtime', 'Leaves', 'Productivity', 'Compliance'] },
    colors: ['#6366f1'],
    fill: { opacity: 0.2 },
    markers: { size: 4 },
    yaxis: { show: false }
  }), []);

  // --- Render ---

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Activity className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="font-bold text-slate-400 tracking-widest uppercase text-xs">Loading Intelligence Data...</p>
      </div>
    );
  }

  const columns: Column<EmployeePerformance>[] = [
    {
      header: "Employee",
      accessor: (item) => (
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 shrink-0">
            <Image 
              src={item.avatar} 
              fill 
              alt={item.name} 
              className="rounded-lg object-cover" 
              sizes="32px"
            />
          </div>
          <div>
            <p className="font-bold text-neutral-900 leading-none">{item.name}</p>
            <p className="text-[10px] text-neutral-400 font-medium uppercase mt-1">{item.department}</p>
          </div>
        </div>
      ),
      sortable: true
    },
    {
      header: "Score",
      accessor: (item) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 w-12 bg-neutral-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${item.score > 90 ? 'bg-emerald-500' : item.score > 75 ? 'bg-blue-500' : 'bg-rose-500'}`} 
              style={{ width: `${item.score}%` }} 
            />
          </div>
          <span className="font-black text-[11px]">{item.score}</span>
        </div>
      ),
      sortable: true
    },
    { header: "OT Hours", accessor: "overtimeHours", sortable: true, align: "center" },
    { header: "Lates", accessor: "totalLate", sortable: true, align: "center" },
    { header: "Status", accessor: (item) => <StatusBadge status={item.status} />, align: "right" }
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">
      
      {/* Modern Header */}
      <section className="relative overflow-hidden bg-slate-900 rounded-[40px] p-8 sm:p-12 shadow-2xl shadow-slate-900/20 text-white">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-500 opacity-10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-emerald-500 opacity-10 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[11px] font-black tracking-[0.2em] uppercase">
              <BarChart3 size={16} className="text-blue-400" />
              Intelligence Dashboard
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Workforce <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Analytics</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-xl text-sm sm:text-base leading-relaxed">
              Track real-time productivity, attendance density, and individual behavioral DNA across your entire organization.
            </p>
          </div>
          <div className="flex gap-3">
             <button className="bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl transition-all font-bold text-sm flex items-center gap-2">
                <Download size={16} /> Generate Report
             </button>
          </div>
        </div>
      </section>

      {/* KPI Stats */}
      <section id="tour-hr-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {hrStats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${stat.color} text-white shadow-lg ${stat.shadow} mb-6 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-3xl font-black text-neutral-900 tracking-tight">{stat.value}</h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.title}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Advanced Heatmap with Visual User Switcher */}
        <div id="tour-hr-heatmap" className="lg:col-span-8 bg-white rounded-[40px] p-8 sm:p-10 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex flex-col gap-10 mb-10">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  Activity Intensity Heatmap
                  <Sparkles size={20} className="text-blue-500 animate-pulse" />
                </h3>
                <p className="text-sm font-medium text-slate-400">Visualize workforce patterns across days and time slots</p>
              </div>
              
              {/* Metric Selector */}
              <div className="flex p-1 bg-slate-100/80 rounded-2xl border border-slate-200/50 w-fit">
                {(["attendance", "overtime", "leave"] as AnalyticsMetric[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setHeatmapMetric(m)}
                    className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                      heatmapMetric === m ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* MODERN USER SWITCHER (AVATAR STRIP) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Select Perspective</span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">Contextual View</span>
              </div>
              
              <div ref={scrollRef} className="flex items-center gap-3 overflow-x-auto pb-4 pt-2 no-scrollbar custom-scrollbar">
                {/* All Employees Option */}
                <button
                  onClick={() => setHeatmapEmployeeId("all")}
                  className={`flex flex-col items-center gap-3 shrink-0 transition-all duration-300 group ${
                    heatmapEmployeeId === "all" ? "scale-105" : "opacity-60 grayscale hover:opacity-100 hover:grayscale-0"
                  }`}
                >
                  <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all ${
                    heatmapEmployeeId === "all" 
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-500/40 ring-4 ring-blue-100" 
                    : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                  }`}>
                    <Globe size={28} strokeWidth={2.5} />
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-wider ${
                    heatmapEmployeeId === "all" ? "text-blue-600" : "text-slate-400"
                  }`}>Collective</span>
                </button>

                <div className="w-px h-12 bg-slate-200 shrink-0 mx-2" />

                {/* Individual Employee Avatars */}
                {employeeList.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => setHeatmapEmployeeId(emp.id)}
                    className={`flex flex-col items-center gap-3 shrink-0 transition-all duration-300 group ${
                      heatmapEmployeeId === emp.id ? "scale-105" : "opacity-60 grayscale hover:opacity-100 hover:grayscale-0"
                    }`}
                  >
                    <div className={`relative w-16 h-16 rounded-[24px] overflow-hidden transition-all ${
                      heatmapEmployeeId === emp.id 
                      ? "shadow-xl shadow-blue-500/20 ring-4 ring-blue-500" 
                      : "ring-2 ring-transparent group-hover:ring-slate-200"
                    }`}>
                      <Image 
                        src={emp.avatar} 
                        fill 
                        alt={emp.name} 
                        className="object-cover" 
                        sizes="64px"
                      />
                    </div>
                    <span className={`text-[11px] font-black tracking-tight ${
                      heatmapEmployeeId === emp.id ? "text-slate-900" : "text-slate-400"
                    }`}>{emp.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 flex-1 min-h-[400px] relative">
            {isHeatmapLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-3xl">
                <Activity className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            )}
            <Chart options={heatmapOptions} series={heatmapData} type="heatmap" height="100%" />
          </div>
        </div>

        {/* Attendance Leaderboard */}
        <div id="tour-hr-leaderboard" className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Trophy size={20} className="text-amber-500" />
                  Top Performers
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Attendance Legends</p>
              </div>
            </div>

            <div className="space-y-4">
              {topAchievers.map((emp, idx) => (
                <div 
                  key={emp.id} 
                  className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all group cursor-pointer"
                  onClick={() => setSelectedEmployee(emp)}
                >
                  <div className="relative w-12 h-12 shrink-0">
                    <Image 
                      src={emp.avatar} 
                      fill 
                      alt={emp.name} 
                      className="rounded-xl object-cover" 
                      sizes="48px"
                    />
                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-white shadow-sm ${idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : 'bg-amber-700'}`}>
                      {idx + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-slate-900 truncate group-hover:text-blue-600 transition-colors">{emp.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{emp.department}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-emerald-600">{emp.score}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase">Score</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <AlertTriangle size={20} className="text-rose-500" />
                  Needs Attention
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Action Required</p>
              </div>
            </div>

            <div className="space-y-4">
              {lowPerformers.map((emp) => (
                <div 
                  key={emp.id} 
                  className="flex items-center gap-4 p-4 rounded-3xl bg-rose-50/30 border border-rose-100 hover:bg-rose-50 hover:shadow-md transition-all group cursor-pointer"
                  onClick={() => setSelectedEmployee(emp)}
                >
                  <div className="relative w-12 h-12 shrink-0">
                    <Image 
                      src={emp.avatar} 
                      fill 
                      alt={emp.name} 
                      className="rounded-xl object-cover" 
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-slate-900 truncate group-hover:text-rose-600 transition-colors">{emp.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{emp.department}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-rose-600">{emp.score}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase">Score</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dedicated Leave Analysis Section */}
        <div className="lg:col-span-12 grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 bg-white rounded-[40px] p-8 sm:p-10 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Leave Seasonality Trends</h3>
                <p className="text-sm font-medium text-slate-400 mt-1">Forecast and track workforce time-off requests</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Activity size={24} strokeWidth={2.5} />
              </div>
            </div>
            <div className="h-[350px]">
              <Chart options={leaveTrendsOptions} series={leaveTrendsSeries} type="area" height="100%" />
            </div>
            <div className="mt-4 text-right">
               <span className="text-[10px] font-black text-blue-500 uppercase italic">Click graph points for monthly staff list</span>
            </div>
          </div>

          <div id="tour-hr-heatmap" className="lg:col-span-8 bg-white rounded-[40px] p-8 sm:p-10 shadow-sm border border-slate-100 flex flex-col">

            <div className="mb-10">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Leave Type Mix</h3>
              <p className="text-sm font-medium text-slate-400 mt-1">Distribution of time-off categories</p>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <Chart options={leaveDistributionOptions} series={leaveDistributionSeries} type="donut" width="100%" />
            </div>
            <div className="mt-8 pt-8 border-t border-slate-100 space-y-3">
               <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                  <span>Insight</span>
                  <span className="text-blue-600">Interactive Chart</span>
               </div>
               <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Click on categories to view specific employees currently on that leave type.
               </p>
            </div>
          </div>
        </div>

        {/* Employee Performance Matrix */}
        <div id="tour-hr-matrix" className="lg:col-span-12 bg-white rounded-[40px] p-8 sm:p-10 shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Performance Matrix</h3>
              <p className="text-sm font-medium text-slate-400 mt-1">Deep dive into individual employee reliability and metrics</p>
            </div>
            <div className="relative group w-full sm:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search metrics..." 
                className="pl-12 pr-4 h-12 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none w-full focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all"
              />
            </div>
          </div>
          
          <DataTable 
            data={employeeList} 
            columns={columns} 
            onRowClick={(item) => setSelectedEmployee(item)}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            limit={limit}
            onLimitChange={setLimit}
          />
        </div>
      </section>

      {/* --- CONTEXTUAL DETAIL MODAL (FOR CHART CLICKS) --- */}
      {contextModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl border border-white ring-1 ring-slate-200/50 overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[80vh]">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Info size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">{contextModal.title}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{contextModal.description}</p>
                </div>
              </div>
              <button 
                onClick={() => setContextModal(prev => ({ ...prev, isOpen: false }))}
                className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-rose-500 shadow-sm hover:shadow-md"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="space-y-3">
                {contextModal.employees.length > 0 ? (
                  contextModal.employees.map((emp) => (
                    <div 
                      key={emp.id}
                      onClick={() => {
                        setContextModal(prev => ({ ...prev, isOpen: false }));
                        const fullEmpProfile = employeeList.find(e => e.id === emp.id);
                        if (fullEmpProfile) setSelectedEmployee(fullEmpProfile);
                      }}
                      className="flex items-center justify-between p-4 rounded-3xl bg-white border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 shrink-0">
                            <Image 
                              src={emp.avatar} 
                              fill 
                              alt={emp.name} 
                              className="rounded-2xl object-cover" 
                              sizes="48px"
                            />
                          </div>
                          <div>
                          <p className="font-black text-sm text-slate-900 group-hover:text-blue-600 transition-colors">{emp.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{emp.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm text-slate-500">View Profile</span>
                         <ArrowRight size={16} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-slate-400 font-bold">No active logs found for this data point.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center shrink-0">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Contextual Intelligence Unit • HR Analytics</p>
            </div>
          </div>
        </div>
      )}

      {selectedEmployee && !contextModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-500 border border-white ring-1 ring-slate-200/50">
            
            <div className="relative overflow-hidden bg-slate-900 p-10 text-white shrink-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
              <div className="relative z-10 flex justify-between items-center">
                <div className="flex items-center gap-8">
                  <div className="relative w-24 h-24 shrink-0 shadow-2xl">
                    <Image 
                      src={selectedEmployee.avatar} 
                      fill 
                      alt={selectedEmployee.name} 
                      className="rounded-[32px] object-cover border-4 border-white/10" 
                      sizes="96px"
                    />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center border-4 border-slate-900 shadow-lg">
                       <UserCheck size={18} className="text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest">
                      Employee DNA Profile
                    </div>
                    <h2 className="text-4xl font-black tracking-tight">{selectedEmployee.name}</h2>
                    <p className="text-slate-400 font-bold flex items-center gap-2">
                      <Briefcase size={16} /> {selectedEmployee.department} Specialist • <Coffee size={16} /> Net Score: {selectedEmployee.score}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedEmployee(null)}
                  className="p-4 hover:bg-white/10 rounded-[20px] transition-all text-slate-400 hover:text-white"
                >
                  <X size={32} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                <div className="xl:col-span-2 bg-slate-50/50 rounded-[32px] p-8 border border-slate-100 flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Target size={20} strokeWidth={2.5} />
                      </div>
                      <h4 className="text-xl font-black text-slate-900 tracking-tight">Behavioral Characteristics</h4>
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">30-Day Rolling Analysis</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <Chart 
                      options={individualRadarOptions} 
                      series={[{ name: selectedEmployee.name, data: [selectedEmployee.score, selectedEmployee.overtimeHours * 5, 60, 80, 100] }]} 
                      type="radar" 
                      height={350} 
                      width="100%"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6 text-emerald-600">
                      <History size={20} strokeWidth={2.5} />
                      <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">Punctuality DNA</h4>
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: "Arrival Consistency", value: "98%", color: "text-emerald-600", bg: "bg-emerald-50" },
                        { label: "Late Incident Rate", value: selectedEmployee.totalLate + " Times", color: "text-rose-600", bg: "bg-rose-50" },
                        { label: "Avg Clock-In", value: selectedEmployee.avgClockIn, color: "text-blue-600", bg: "bg-blue-50" },
                      ].map((item, i) => (
                        <div key={i} className="flex flex-col gap-1 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{item.label}</span>
                          <span className={`text-lg font-black ${item.color}`}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-500/20">
                    <h4 className="font-black uppercase tracking-widest text-[10px] mb-2 opacity-80">Workspace Balance</h4>
                    <div className="flex items-end justify-between">
                       <div>
                          <p className="text-3xl font-black leading-none">{selectedEmployee.leaveBalance} Days</p>
                          <p className="text-xs font-bold mt-2 text-indigo-100">Remaining Annual Leave</p>
                       </div>
                       <TrendingUp size={32} className="opacity-20" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button className="flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-slate-200 active:scale-95">
                  <TrendingUp size={20} /> Optimized Performance Path
                </button>
                <button className="flex items-center justify-center gap-3 bg-white border-2 border-slate-100 hover:bg-slate-50 text-slate-600 font-black py-5 rounded-3xl transition-all active:scale-95">
                  <Download size={20} /> Download Full Behavioral Audit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
