"use client";

import { useAuthStore } from "@/store/auth.store";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  ArrowUpRight, 
  BarChart3, 
  Search, 
  Calendar,
  X,
  Target,
  History,
  TrendingUp
} from "lucide-react";
import Chart from "@/components/ui/Chart";
import { DataTable, Column } from "@/components/ui/DataTable";
import { useState, useMemo } from "react";
import Image from "next/image";

// --- Dummy Data ---

interface EmployeePerformance {
  id: number;
  name: string;
  avatar: string;
  department: string;
  score: number;
  totalLate: number;
  avgClockIn: string;
  status: "Excellent" | "Good" | "At Risk";
}

const matrixDummyData: EmployeePerformance[] = [
  { id: 1, name: "Bagus Fikri", avatar: "https://i.pravatar.cc/150?u=bagus", department: "Engineering", score: 98, totalLate: 0, avgClockIn: "08:15 AM", status: "Excellent" },
  { id: 2, name: "Ihdizein", avatar: "https://i.pravatar.cc/150?u=ihdizein", department: "Design", score: 85, totalLate: 3, avgClockIn: "09:10 AM", status: "Good" },
  { id: 3, name: "Mufti Hidayat", avatar: "https://i.pravatar.cc/150?u=mufti", department: "Marketing", score: 62, totalLate: 12, avgClockIn: "09:45 AM", status: "At Risk" },
  { id: 4, name: "Sarah Connor", avatar: "https://i.pravatar.cc/150?u=sarah", department: "Engineering", score: 95, totalLate: 1, avgClockIn: "08:30 AM", status: "Excellent" },
  { id: 5, name: "John Doe", avatar: "https://i.pravatar.cc/150?u=john", department: "HR", score: 88, totalLate: 2, avgClockIn: "08:45 AM", status: "Good" },
];

const heatmapData = [
  { name: "Mon", data: generateHeatmapSeries(8) },
  { name: "Tue", data: generateHeatmapSeries(8) },
  { name: "Wed", data: generateHeatmapSeries(8) },
  { name: "Thu", data: generateHeatmapSeries(8) },
  { name: "Fri", data: generateHeatmapSeries(8) },
];

function generateHeatmapSeries(count: number) {
  const series = [];
  const times = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
  for (let i = 0; i < count; i++) {
    series.push({
      x: times[i],
      y: Math.floor(Math.random() * 100)
    });
  }
  return series;
}

// --- Components ---

function StatusBadge({ status }: { status: EmployeePerformance["status"] }) {
  const styles = {
    Excellent: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Good: "bg-blue-50 text-blue-700 border-blue-100",
    "At Risk": "bg-rose-50 text-rose-700 border-rose-100",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function HrDashboardPage() {
  const { user } = useAuthStore();
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeePerformance | null>(null);

  const hrStats = [
    { title: "Presence Rate", value: "94.2%", icon: UserCheck, color: "from-emerald-400 to-teal-500", shadow: "shadow-emerald-500/20" },
    { title: "Absenteeism", value: "2.8%", icon: UserX, color: "from-rose-400 to-red-500", shadow: "shadow-rose-500/20" },
    { title: "Avg. Punctuality", value: "14m Late", icon: Clock, color: "from-amber-400 to-orange-500", shadow: "shadow-amber-500/20" },
    { title: "Active Requests", value: "18", icon: BarChart3, color: "from-indigo-400 to-blue-600", shadow: "shadow-blue-500/20" },
  ];

  const columns: Column<EmployeePerformance>[] = [
    {
      header: "Employee",
      accessor: (item) => (
        <div className="flex items-center gap-3">
          <Image src={item.avatar} width={32} height={32} alt={item.name} className="rounded-lg" />
          <div>
            <p className="font-bold text-neutral-900">{item.name}</p>
            <p className="text-[10px] text-neutral-400 font-medium uppercase">{item.department}</p>
          </div>
        </div>
      ),
      sortable: true
    },
    {
      header: "Attendance Score",
      accessor: (item) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 w-16 bg-neutral-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${item.score > 90 ? 'bg-emerald-500' : item.score > 75 ? 'bg-blue-500' : 'bg-rose-500'}`} 
              style={{ width: `${item.score}%` }} 
            />
          </div>
          <span className="font-black text-xs">{item.score}</span>
        </div>
      )
    },
    { header: "Total Late", accessor: "totalLate", sortable: true, align: "center" },
    { header: "Avg. Clock-In", accessor: "avgClockIn", align: "center" },
    { header: "Status", accessor: (item) => <StatusBadge status={item.status} />, align: "right" }
  ];

  const heatmapOptions = {
    chart: { toolbar: { show: false } },
    dataLabels: { enabled: false },
    colors: ["#10b981"],
    xaxis: { type: "category" as const },
    title: { text: "Attendance Peak Times", style: { fontSize: '14px', fontWeight: 700, color: '#171717' } },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        radius: 4,
        useFillColorAsStroke: true,
        colorScale: {
          ranges: [
            { from: 0, to: 30, name: 'Low', color: '#f8fafc' },
            { from: 31, to: 60, name: 'Medium', color: '#d1fae5' },
            { from: 61, to: 100, name: 'High', color: '#10b981' }
          ]
        }
      }
    }
  };

  const individualRadarOptions = {
    chart: { toolbar: { show: false } },
    xaxis: { categories: ['Punctuality', 'Overtime', 'Leaves', 'Productivity', 'Compliance'] },
    colors: ['#6366f1'],
    fill: { opacity: 0.2 },
    markers: { size: 4 },
    yaxis: { show: false }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">
      
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 rounded-4xl p-8 sm:p-10 shadow-2xl shadow-teal-500/20 text-white">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-sm font-bold tracking-wide uppercase mb-4">
            <BarChart3 size={16} /> Advanced People Analytics
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">HR Intelligence Center</h1>
          <p className="text-teal-50 font-medium max-w-xl text-sm sm:text-base leading-relaxed">
            Monitor real-time workforce behavior, identify punctuality trends, and analyze individual employee performance scores.
          </p>
        </div>
      </section>

      {/* KPI Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {hrStats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 hover:shadow-xl transition-all duration-300">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${stat.color} text-white shadow-lg ${stat.shadow} mb-4`}>
              <stat.icon size={22} strokeWidth={2.5} />
            </div>
            <h3 className="text-3xl font-black text-neutral-900 tracking-tight">{stat.value}</h3>
            <p className="text-sm font-semibold text-neutral-500 mt-1">{stat.title}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Attendance Heatmap */}
        <div className="lg:col-span-12 bg-white rounded-4xl p-6 sm:p-8 shadow-sm border border-neutral-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-neutral-900">Workforce Attendance Heatmap</h3>
              <p className="text-sm font-medium text-neutral-400">Identify peak arrival times and daily density</p>
            </div>
            <Calendar className="text-neutral-300" />
          </div>
          <Chart options={heatmapOptions} series={heatmapData} type="heatmap" height={350} />
        </div>

        {/* Employee Performance Matrix */}
        <div className="lg:col-span-12 bg-white rounded-4xl p-6 sm:p-8 shadow-sm border border-neutral-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-xl font-bold text-neutral-900">Employee Performance Matrix</h3>
              <p className="text-sm font-medium text-neutral-400">Click a row to analyze individual behavior</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input 
                type="text" 
                placeholder="Search employee..." 
                className="pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none w-full sm:w-64"
              />
            </div>
          </div>
          
          <DataTable 
            data={matrixDummyData} 
            columns={columns} 
            onRowClick={(item) => setSelectedEmployee(item)}
          />
        </div>
      </section>

      {/* Individual Drill-down Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-8 border-b border-neutral-100 bg-neutral-50/50">
              <div className="flex items-center gap-5">
                <div className="relative w-20 h-20">
                  <Image src={selectedEmployee.avatar} fill alt={selectedEmployee.name} className="rounded-3xl object-cover shadow-lg" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-neutral-900">{selectedEmployee.name}</h2>
                  <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest">{selectedEmployee.department} Specialist</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={selectedEmployee.status} />
                    <span className="text-xs font-bold text-neutral-400">Score: {selectedEmployee.score}/100</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all text-neutral-400 hover:text-rose-500"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Radar Chart */}
                <div className="bg-neutral-50/50 rounded-3xl p-6 border border-neutral-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Target size={18} className="text-indigo-500" />
                    <h4 className="font-bold text-neutral-800">Behavioral DNA</h4>
                  </div>
                  <Chart 
                    options={individualRadarOptions} 
                    series={[{ name: selectedEmployee.name, data: [80, 50, 30, 40, 100] }]} 
                    type="radar" 
                    height={300} 
                  />
                </div>

                {/* Individual Stats Timeline */}
                <div className="bg-neutral-50/50 rounded-3xl p-6 border border-neutral-100 flex flex-col">
                  <div className="flex items-center gap-2 mb-6">
                    <History size={18} className="text-emerald-500" />
                    <h4 className="font-bold text-neutral-800">Punctuality Trends</h4>
                  </div>
                  <div className="space-y-4 flex-1">
                    {[
                      { label: "On Time (This Month)", value: "22 Days", color: "text-emerald-600" },
                      { label: "Late Frequency", value: selectedEmployee.totalLate + " Times", color: "text-rose-600" },
                      { label: "Avg. Daily Duration", value: "8h 45m", color: "text-blue-600" },
                      { label: "Overtime Contribution", value: "12.5 Hours", color: "text-amber-600" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-neutral-100">
                        <span className="text-xs font-bold text-neutral-500 uppercase">{item.label}</span>
                        <span className={`text-sm font-black ${item.color}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-8 flex gap-4">
                <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                  <TrendingUp size={18} /> Improve Productivity
                </button>
                <button className="flex-1 bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-black py-4 rounded-2xl transition-all active:scale-95">
                  View Full Audit Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
