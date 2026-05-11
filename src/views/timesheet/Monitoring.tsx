"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search,
  Users,
  Download,
  Clock,
  Briefcase,
  ArrowRight,
  TrendingUp,
  LayoutDashboard,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { useQuery } from "@tanstack/react-query";
import { getTimesheetMonitoring, getTimesheetAnalytics, getEmployeeProjects } from "@/service/timesheet";
import { getDataUserslist } from "@/service/users";
import { TimesheetEntry } from "@/types/api";
import dayjs from "dayjs";
import Chart from "@/components/ui/Chart";
import { formatDuration } from "@/lib/utils";

export default function TimesheetMonitoringView() {
  const [selectedPeriod, setSelectedPeriod] = useState(dayjs().format("YYYY-MM"));
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProject] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [memberSearch, setMemberSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce member directory search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(memberSearch);
    }, 500);
    return () => clearTimeout(handler);
  }, [memberSearch]);

  const dateRange = useMemo(() => ({
    start_date: dayjs(selectedPeriod).startOf('month').format("YYYY-MM-DD"),
    end_date: dayjs(selectedPeriod).endOf('month').format("YYYY-MM-DD")
  }), [selectedPeriod]);

  // 1. Fetch All Employees (Sidebar Directory)
  const { data: employeesResp, isLoading: isEmployeesLoading } = useQuery({
    queryKey: ["employee-directory", debouncedSearch],
    queryFn: () => getDataUserslist({ limit: 100, page: 1, search: debouncedSearch }),
  });

  const allEmployees = employeesResp?.data || [];
  const filteredEmployees = allEmployees; // Server-side filtering is now used via debouncedSearch

  const selectedEmployee = allEmployees.find(e => e.id === selectedEmployeeId);

  // 2. Fetch Selected Employee Log
  const { data: monitoringResp, isLoading: isListLoading } = useQuery({
    queryKey: ["timesheet-monitoring", dateRange, selectedEmployeeId, selectedProjectId, currentPage, limit],
    queryFn: () => getTimesheetMonitoring({
      ...dateRange,
      user_id: selectedEmployeeId || undefined,
      project_id: selectedProjectId ? Number(selectedProjectId) : undefined,
      page: currentPage,
      limit: limit
    }),
    enabled: !!selectedEmployeeId
  });

  // 3. Fetch Organization-wide Analytics (Aggregate)
  const { data: analyticsResp } = useQuery({
    queryKey: ["timesheet-analytics-org", dateRange],
    queryFn: () => getTimesheetAnalytics(dateRange),
  });

  const { data: projectsResp } = useQuery({
    queryKey: ["employee-projects-list"],
    queryFn: () => getEmployeeProjects(),
  });

  const analytics = analyticsResp?.data;
  const pagination = monitoringResp?.meta?.pagination;
  const entries = monitoringResp?.data || [];
  const projects = projectsResp?.data || [];

  const projectOptions = projects.map(p => ({
    label: p.name,
    value: p.id,
    icon: <Briefcase size={14} />
  }));

  // --- Chart Configurations ---
  const donutChartOptions = {
    labels: analytics?.project_distribution?.map(p => p.project_name) || [],
    colors: ["#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#10b981", "#f59e0b"],
    stroke: { show: false },
    chart: {
      fontFamily: 'inherit',
      animations: { enabled: true, easing: 'easeinout' as const, speed: 800 }
    },
    plotOptions: {
      pie: {
        donut: { 
          size: "75%",
          labels: {
            show: true,
            total: {
            show: true,
            label: 'Total Hours',
            fontSize: '12px',
            fontWeight: 900,
            color: '#64748b',
            formatter: () => formatDuration(analytics?.total_hours || 0)
            }          }
        }
      }
    },
    dataLabels: { enabled: false },
    legend: { position: "bottom" as const, fontWeight: 700, fontSize: '10px' },
    tooltip: { y: { formatter: (val: number) => `${val} Hours` } }
  };

  const donutChartSeries = analytics?.project_distribution?.map(p => p.total_hours) || [];

  const areaChartOptions = {
    chart: {
      type: 'area' as const,
      toolbar: { show: false },
      sparkline: { enabled: false },
      fontFamily: 'inherit'
    },
    stroke: { curve: 'smooth' as const, width: 3, colors: ['#3b82f6'] },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100],
        colorStops: [
          { offset: 0, color: '#3b82f6', opacity: 0.4 },
          { offset: 100, color: '#3b82f6', opacity: 0 }
        ]
      }
    },
    xaxis: {
      categories: analytics?.daily_stats?.map(d => dayjs(d.date).format("DD MMM")) || [],
      labels: { style: { colors: '#94a3b8', fontWeight: 700, fontSize: '10px' } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: { style: { colors: '#94a3b8', fontWeight: 700, fontSize: '10px' } }
    },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    dataLabels: { enabled: false },
    tooltip: { theme: 'light', x: { show: true } }
  };

  const areaChartSeries = [{
    name: 'Total Hours',
    data: analytics?.daily_stats?.map(d => d.total_hours) || []
  }];

  const columns: Column<TimesheetEntry>[] = useMemo(() => [
    {
      header: "Project & Task",
      name: "task_name",
      accessor: (item) => (
        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-slate-900">{item.project_name || "Standard Project"}</span>
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">{item.task_name}</span>
        </div>
      ),
    },
    {
      header: "Date",
      accessor: (item) => (
        <span className="text-[12px] font-medium text-slate-600">{dayjs(item.date).format("DD MMM YYYY")}</span>
      ),
    },
    {
      header: "Description",
      key: "description",
      accessor: (item) => (
        <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{item.description}</p>
      ),
    },
    {
      header: "Duration",
      accessor: (item) => (
        <Badge className="bg-slate-950 text-white border-none font-black text-[10px] px-3 py-1 rounded-lg">
          {formatDuration(item.duration_hours)}
        </Badge>
      ),
    }
  ], []);

  return (
    <div className="flex h-[calc(100vh-140px)] -m-6 animate-in fade-in duration-500 overflow-hidden">
      
      {/* LEFT SIDEBAR: Member Directory */}
      <aside className="w-80 bg-white border-r border-slate-100 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-50 space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Team Members</h3>
              <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px]">{allEmployees.length}</Badge>
           </div>
           
           {/* Reset Selection / Back to Analytics Button */}
           <button
             onClick={() => setSelectedEmployeeId(null)}
             className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all group text-left border ${!selectedEmployeeId ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200" : "bg-slate-50 text-slate-600 border-slate-100 hover:border-blue-200 hover:bg-white"}`}
           >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${!selectedEmployeeId ? "bg-white/20 text-white" : "bg-white text-blue-600 shadow-sm"}`}>
                <LayoutDashboard size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-black uppercase tracking-tight">Global Analytics</p>
                <p className={`text-[10px] font-bold uppercase ${!selectedEmployeeId ? "text-blue-100" : "text-slate-400"}`}>Organization Overview</p>
              </div>
           </button>

           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                placeholder="Search staff..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-4 bg-slate-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {isEmployeesLoading ? (
            <div className="p-10 text-center space-y-3">
               <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
               <p className="text-[10px] font-black text-slate-400 uppercase">Loading Staff...</p>
            </div>
          ) : filteredEmployees.map(emp => (
            <button
              key={emp.id}
              onClick={() => setSelectedEmployeeId(emp.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all group text-left ${selectedEmployeeId === emp.id ? "bg-slate-950 text-white shadow-xl shadow-slate-900/20" : "hover:bg-slate-50"}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${selectedEmployeeId === emp.id ? "bg-white/10 text-white" : "bg-blue-50 text-blue-600"}`}>
                {emp.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[13px] font-bold truncate">{emp.name}</p>
                <p className="text-[10px] font-medium truncate uppercase tracking-tighter text-slate-400">
                  {emp.role?.name || "Staff Member"}
                </p>
              </div>
              {selectedEmployeeId === emp.id && <ArrowRight size={14} className="text-blue-400" />}
            </button>
          ))}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 p-8">
        
        {/* Top Control Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-fit">
            <button onClick={() => setSelectedPeriod(p => dayjs(p).subtract(1, 'month').format("YYYY-MM"))} className="p-2.5 text-slate-400 hover:text-blue-600 transition-all active:scale-90"><ChevronLeft size={18} strokeWidth={2.5} /></button>
            <div className="px-6 flex flex-col items-center min-w-[140px]">
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest leading-none mb-1">Period</span>
              <span className="text-[13px] font-black text-slate-900 leading-none">{dayjs(selectedPeriod).format("MMMM YYYY")}</span>
            </div>
            <button onClick={() => setSelectedPeriod(p => dayjs(p).add(1, 'month').format("YYYY-MM"))} className="p-2.5 text-slate-400 hover:text-blue-600 transition-all active:scale-90"><ChevronRight size={18} strokeWidth={2.5} /></button>
          </div>

          <div className="flex items-center gap-3">
             <Select 
                options={projectOptions}
                value={selectedProjectId}
                onChange={setSelectedProject}
                placeholder="Filter Project"
                className="w-48"
                searchable
             />
             <Button className="h-12 px-6 rounded-2xl bg-slate-950 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-900/10 transition-all hover:bg-blue-600">
               <Download size={16} className="mr-2" /> Export PDF
             </Button>
          </div>
        </div>

        {selectedEmployeeId ? (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Employee Focus Header */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 opacity-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
               <div className="flex items-center gap-6 relative z-10">
                  <button 
                    onClick={() => setSelectedEmployeeId(null)}
                    className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all mr-2 group/back"
                    title="Back to Overview"
                  >
                    <ArrowLeft size={20} className="group-hover/back:-translate-x-1 transition-transform" />
                  </button>
                  <div className="w-16 h-16 rounded-3xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-200">
                     {selectedEmployee?.name.charAt(0)}
                  </div>
                  <div className="space-y-1">
                     <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedEmployee?.name}</h2>
                     <div className="flex items-center gap-3">
                        <Badge className="bg-blue-50 text-blue-600 border-none font-bold text-[10px] uppercase">{selectedEmployee?.role?.name || 'Staff'}</Badge>
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                           <Clock size={12} /> Last logged {dayjs().format('HH:mm')} Today
                        </span>
                     </div>
                  </div>
               </div>
               
               <div className="flex gap-8 relative z-10">
                  <div className="text-center px-6 border-r border-slate-100">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hours Logged</p>
                     <p className="text-2xl font-black text-slate-900">142.5h</p>
                  </div>
                  <div className="text-center px-6">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Utilization</p>
                     <p className="text-2xl font-black text-emerald-500">94.2%</p>
                  </div>
               </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-2">
               <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-200"><Clock size={20} /></div>
                  <h3 className="text-lg font-black text-slate-900">Personal Work Logs</h3>
               </div>
               <DataTable 
                columns={columns}
                data={entries}
                isLoading={isListLoading}
                currentPage={currentPage}
                totalPages={pagination?.last_page || 1}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        ) : (
          /* NO EMPLOYEE SELECTED: Show Org Analytics Dashboard */
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl group-hover:bg-indigo-100 transition-colors" />
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 relative z-10"><Users size={22} strokeWidth={2.5} /></div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">Active Resources</p>
                <h3 className="text-4xl font-black text-slate-900 relative z-10">{analytics?.active_employees || 0} <span className="text-sm text-slate-400">Staff</span></h3>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors" />
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 relative z-10"><Clock size={22} strokeWidth={2.5} /></div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">Total Effort</p>
                <h3 className="text-4xl font-black text-slate-900 relative z-10">{analytics?.total_hours || 0} <span className="text-sm text-slate-400">Hrs</span></h3>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-emerald-500/5 transition-all">
                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100 transition-colors" />
                 <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 relative z-10"><TrendingUp size={22} strokeWidth={2.5} /></div>
                 <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-1 relative z-10">Org Efficiency</p>
                 <h3 className="text-4xl font-black text-slate-900 relative z-10">88.5%</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-1 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10">Resource Allocation</h3>
                  <div className="w-full">
                    <Chart options={donutChartOptions} series={donutChartSeries} type="donut" width="100%" />
                  </div>
               </div>
               
               <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Work Effort Trends</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-[10px] font-black text-slate-900 uppercase">Total Hours</span>
                    </div>
                  </div>
                  <div className="flex-1 min-h-[250px]">
                    <Chart options={areaChartOptions} series={areaChartSeries} type="area" height="100%" width="100%" />
                  </div>
               </div>
            </div>

            <div className="bg-blue-600 p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl shadow-blue-500/20">
               <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
               <div className="relative z-10 space-y-4 text-center md:text-left">
                  <h2 className="text-3xl font-black tracking-tight leading-tight">Ready to Audit Your Team?</h2>
                  <p className="text-blue-100 text-sm max-w-md">Select a specific member from the left directory to analyze their detailed task breakdown and productivity metrics.</p>
               </div>
               <div className="relative z-10">
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center animate-bounce">
                     <Users size={40} className="text-white" />
                  </div>
               </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
