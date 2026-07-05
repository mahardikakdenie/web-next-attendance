"use client";

import { useState, useMemo } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  FileEdit,
  Clock,
  Briefcase,
  History,
  CheckCircle,
  Timer,
  Zap,
  Calendar as CalendarIcon
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getEmployeeProjects, createTimesheetEntry, getMyTimesheetEntries, getTasks, createTask } from "@/service/timesheet";
import { TimesheetEntry, Project, APIResponse } from "@/types/api";
import { toast } from "sonner";
import dayjs from "dayjs";
import TimeTracker from "@/components/timesheet/TimeTracker";
import { formatDuration } from "@/lib/utils";
import LogWorkModal from "@/components/timesheet/LogWorkModal";

export default function TimesheetView() {
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState(dayjs().format("YYYY-MM"));
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [activeTab, setActiveTab] = useState("Timesheet");
  
  // State for date range filtering
  const [dateRange, setDateRange] = useState({
    start_date: dayjs().format("YYYY-MM-DD"),
    end_date: dayjs().format("YYYY-MM-DD")
  });

  // Highlight state for the selected day in ribbon
  const [selectedDayHeader, setSelectedDayHeader] = useState<string | null>(null);
// Separate query for Monthly Summary (to keep ribbon data consistent)
const { data: monthResp } = useQuery({
  queryKey: ["timesheet-month-summary", selectedPeriod],
  queryFn: () => getMyTimesheetEntries({
    start_date: dayjs(selectedPeriod).startOf('month').format("YYYY-MM-DD"),
    end_date: dayjs(selectedPeriod).endOf('month').format("YYYY-MM-DD")
  }),
});

// Main query for the List Table (based on active selection)
const { data: reportResp, isLoading: isReportLoading } = useQuery({
  queryKey: ["timesheet-entries", dateRange.start_date, dateRange.end_date, currentPage, limit],
  queryFn: () => getMyTimesheetEntries({ ...dateRange, page: currentPage, limit: limit }),
});

const entries = reportResp?.data?.entries || [];
const totalPages = Math.ceil((reportResp?.data?.total || 1) / (reportResp?.data?.limit || limit));
  const { data: projectsResp } = useQuery({
    queryKey: ["employee-projects"],
    queryFn: () => getEmployeeProjects(),
  });

  const monthEntries = useMemo(() => monthResp?.data?.entries || [], [monthResp]);
  const projects = projectsResp?.data || [];

  const monthDates = useMemo(() => {
    const startOfMonth = dayjs(selectedPeriod).startOf('month');
    const daysInMonth = startOfMonth.daysInMonth();
    return Array.from({ length: daysInMonth }).map((_, i) => startOfMonth.add(i, 'day'));
  }, [selectedPeriod]);

  // Calculate stats for summary cards
  const stats = useMemo(() => {
    const totalHours = monthEntries.reduce((acc, curr) => acc + curr.duration_hours, 0);
    const activeProject = monthEntries[0]?.project_name || "No Project Active";

    return { totalHours, activeProject };
  }, [monthEntries]);

  // Calculate daily totals from the MONTHLY response so the ribbon is always full
  const dailyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    monthEntries.forEach(entry => {
      const dateKey = dayjs(entry.date).format("YYYY-MM-DD");
      totals[dateKey] = (totals[dateKey] || 0) + entry.duration_hours;
    });
    return totals;
  }, [monthEntries]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["timesheet-report"] });
    queryClient.invalidateQueries({ queryKey: ["timesheet-month-summary"] });
  };

  const navigatePeriod = (direction: 'next' | 'prev') => {
    const newPeriod = dayjs(selectedPeriod).add(direction === 'next' ? 1 : -1, 'month').format("YYYY-MM");
    setSelectedPeriod(newPeriod);
    
    // When period changes, reset list to full month
    const start = dayjs(newPeriod).startOf('month').format("YYYY-MM-DD");
    const end = dayjs(newPeriod).endOf('month').format("YYYY-MM-DD");
    
    setDateRange({ start_date: start, end_date: end });
    setSelectedDayHeader(null);
  };

  const handleDateClick = (dateKey: string) => {
    if (selectedDayHeader === dateKey) {
      // Toggle off -> Show full month
      setDateRange({
        start_date: dayjs(selectedPeriod).startOf('month').format("YYYY-MM-DD"),
        end_date: dayjs(selectedPeriod).endOf('month').format("YYYY-MM-DD")
      });
      setSelectedDayHeader(null);
    } else {
      // Toggle on -> Show specific day
      setDateRange({ start_date: dateKey, end_date: dateKey });
      setSelectedDayHeader(dateKey);
    }
  };

  const columns: Column<TimesheetEntry>[] = useMemo(() => [
    {
      header: "Project & Task",
      name: "task_name",
      accessor: (item: TimesheetEntry) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
             {item.project_name?.charAt(0) || "P"}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-slate-900 leading-tight">{item.project_name || 'Standard Project'}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{item.task_name}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Activity Note",
      key: "description",
      accessor: (item: TimesheetEntry) => (
        <div className="max-w-md">
           <p className="text-[12px] font-medium text-slate-600 line-clamp-2 leading-relaxed">{item.description || "No description provided."}</p>
        </div>
      ),
    },
    {
      header: "Duration",
      accessor: (item: TimesheetEntry) => (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-black text-slate-900">{formatDuration(item.duration_hours)}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase">{dayjs(item.date).format("HH:mm A")}</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: () => (
        <Badge className="border-none rounded-full px-3 py-1 text-[10px] font-black uppercase bg-emerald-50 text-emerald-600">
           Logged
        </Badge>
      )
    },
    {
      header: "Action",
      accessor: () => (
        <div className="flex items-center gap-2">
           <button className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
              <FileEdit size={16} />
           </button>
           <button className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
              <Plus className="rotate-45" size={16} />
           </button>
        </div>
      )
    }
  ], []);

  const tabs = ["Timesheet", "Pending approval", "Unsubmitted", "Approved"];

  return (
    <div className="min-h-screen bg-slate-50/50 -m-6 p-6 lg:p-10 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto space-y-10">
        
        {/* Navigation & Header */}
        <div className="space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1">
               <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                 <Timer className="text-blue-600" size={32} /> Work Timesheet
               </h1>
               <p className="text-sm text-slate-500 font-medium tracking-tight">Log your daily activities and track productivity.</p>
            </div>

            <div className="flex items-center gap-3">
               <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                  <button onClick={() => navigatePeriod('prev')} className="p-2.5 text-slate-400 hover:text-blue-600 transition-all active:scale-90"><ChevronLeft size={18} strokeWidth={2.5} /></button>
                  <div className="px-6 flex flex-col items-center min-w-[140px]">
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest leading-none mb-1">Period</span>
                    <span className="text-[13px] font-black text-slate-900 leading-none">{dayjs(selectedPeriod).format("MMMM YYYY")}</span>
                  </div>
                  <button onClick={() => navigatePeriod('next')} className="p-2.5 text-slate-400 hover:text-blue-600 transition-all active:scale-90"><ChevronRight size={18} strokeWidth={2.5} /></button>
               </div>
               <Button 
                onClick={() => setIsLogModalOpen(true)}
                className="bg-slate-900 text-white hover:bg-blue-600 rounded-[1.25rem] h-14 px-8 font-black text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-slate-900/10 transition-all active:scale-95"
              >
                <Plus size={18} strokeWidth={3} />
                <span>Track time</span>
              </Button>
            </div>
          </div>

          <nav className="flex items-center gap-1 bg-slate-200/50 p-1.5 rounded-[1.5rem] w-fit border border-slate-200">
            {tabs.map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 text-[11px] font-black uppercase tracking-widest rounded-[1.25rem] transition-all relative ${activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors" />
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 relative z-10"><Clock size={22} strokeWidth={2.5} /></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 relative z-10">Total Effort</p>
              <h3 className="text-4xl font-black text-slate-900 relative z-10">{formatDuration(stats.totalHours)}</h3>
           </div>
           
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100 transition-colors" />
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 relative z-10"><CheckCircle size={22} strokeWidth={2.5} /></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 relative z-10">Monthly Logs</p>
              <h3 className="text-4xl font-black text-slate-900 relative z-10">{monthEntries.length} <span className="text-sm text-slate-400">Logs</span></h3>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl group-hover:bg-indigo-100 transition-colors" />
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 relative z-10"><Briefcase size={22} strokeWidth={2.5} /></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 relative z-10">Active Project</p>
              <h3 className="text-lg font-black text-slate-900 relative z-10 truncate">{stats.activeProject}</h3>
           </div>

           <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-900/10 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 opacity-20 rounded-full blur-3xl group-hover:opacity-30 transition-opacity" />
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 text-blue-400 flex items-center justify-center mb-6 relative z-10"><Zap size={22} strokeWidth={2.5} /></div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1 relative z-10">Productivity Score</p>
              <h3 className="text-2xl font-black relative z-10">Top 10%</h3>
           </div>
        </div>

        {/* Horizontal Time Tracker Bar */}
        <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm">
           <TimeTracker projects={projects} onSuccess={handleRefresh} />
        </div>

        {/* Main Content Area - Clean Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          {/* Calendar Ribbon */}
          <div className="flex overflow-x-auto border-b border-slate-50 bg-slate-50/20 custom-scrollbar scroll-smooth">
             {monthDates.map((date) => {
                const dateKey = date.format("YYYY-MM-DD");
                const isActive = selectedDayHeader === dateKey;
                const isToday = dateKey === dayjs().format("YYYY-MM-DD");
                const hours = dailyTotals[dateKey] || 0;
                
                return (
                   <button 
                      key={dateKey} 
                      onClick={() => handleDateClick(dateKey)}
                      className={`py-6 px-8 flex flex-col items-center gap-2 relative transition-all hover:bg-white shrink-0 min-w-[100px] group ${isActive ? "bg-white" : ""}`}
                   >
                      <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`}>{date.format("ddd")}</span>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black transition-all ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : isToday ? "bg-blue-50 text-blue-600" : "text-slate-900 group-hover:bg-slate-100"}`}>
                        {date.format("D")}
                      </div>
                      <div className="flex flex-col items-center">
                        <span className={`text-[11px] font-black ${isActive ? "text-blue-600" : hours > 0 ? "text-slate-900" : "text-slate-300"}`}>
                          {formatDuration(hours)}
                        </span>
                        {hours > 0 && !isActive && <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1" />}
                      </div>
                      {isActive && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600" />}
                   </button>
                );
             })}
          </div>

          <div className="p-2">
             <DataTable 
               columns={columns} 
               data={entries} 
               isLoading={isReportLoading}
               currentPage={currentPage}
               totalPages={totalPages}
               onPageChange={setCurrentPage}
             />
          </div>

          {monthEntries.length > 0 && (
            <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                    <History size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Record Status</p>
                    <p className="text-xs font-bold text-slate-600 italic">Verify your logs before final submission.</p>
                  </div>
               </div>
               <Button className="bg-slate-900 hover:bg-blue-600 text-white rounded-2xl h-14 px-10 font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-900/10 transition-all active:scale-95">
                  Submit Monthly Approval
               </Button>
            </div>
          )}
        </div>

      </div>

      {/* Manual Entry Modal (Restyled for minimalism) */}
      {isLogModalOpen && (
        <LogWorkModal 
          isOpen={isLogModalOpen}
          onClose={() => setIsLogModalOpen(false)}
          projects={projects}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
}
