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

function LogWorkModal({ onClose, projects, onSuccess }: { isOpen: boolean, onClose: () => void, projects: Project[], onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    project_id: "",
    task_id: "",
    duration_hours: "",
    date: dayjs().format("YYYY-MM-DD"),
    description: ""
  });

  const queryClient = useQueryClient();

  const { data: taskResp } = useQuery({
    queryKey: ["project-tasks", formData.project_id],
    queryFn: () => getTasks(Number(formData.project_id)),
    enabled: !!formData.project_id
  });

  const tasks = taskResp?.data || [];

  const projectOptions = projects.map(p => ({
    label: p.name,
    value: p.id,
    icon: <Briefcase size={14} />
  }));

  const taskOptions = tasks.map(t => ({
    label: t.name,
    value: t.id
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project_id) return toast.error("Please select a project");

    setLoading(true);
    let newEntry: APIResponse<TimesheetEntry>;

    // 1. API Call
    try {
      newEntry = await createTimesheetEntry({
        ...formData,
        project_id: Number(formData.project_id),
        task_id: formData.task_id ? Number(formData.task_id) : undefined,
        task_name: tasks.find(t => t.id === Number(formData.task_id))?.name || "Task",
        duration_hours: Number(formData.duration_hours),
        date: dayjs(formData.date).toISOString()
      });
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Timesheet entry creation failed:", error);
      toast.error(err?.response?.data?.message || "Failed to add entry");
      setLoading(false);
      return;
    }

    // 2. Safe Local Cache Update
    try {
      queryClient.setQueriesData({ queryKey: ["timesheet-entries"] }, (oldData: unknown) => {
        const typedOldData = oldData as { data?: { entries?: TimesheetEntry[] } } | undefined;
        if (!typedOldData || !typedOldData.data || !Array.isArray(typedOldData.data.entries)) return oldData;
        return {
          ...typedOldData,
          data: {
            ...typedOldData.data,
            entries: [newEntry.data, ...typedOldData.data.entries]
          }
        };
      });
    } catch (cacheError) {
      console.error("Failed to update local cache:", cacheError);
      // Let it pass silently, data is safely on the server
    }

    // 3. UI Cleanup
    toast.success("Entry successfully logged");
    onSuccess();
    onClose();
    setLoading(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Manual Time Log</h2>
                <p className="text-sm text-slate-400 font-medium">Capture your work efforts for accurate billing.</p>
              </div>
              <button type="button" onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><Plus className="rotate-45" size={24} /></button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project</label>
                <Select 
                  value={formData.project_id}
                  onChange={(val) => setFormData({ ...formData, project_id: val, task_id: "" })}
                  options={projectOptions}
                  placeholder="Select Project..."
                  searchable
                  className="h-14 rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Task</label>
                    <button type="button" onClick={() => setIsCreateTaskModalOpen(true)} className="text-[9px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest">+ Tambah Task</button>
                </div>
                <Select 
                  value={formData.task_id}
                  onChange={(val) => setFormData({ ...formData, task_id: val })}
                  options={taskOptions}
                  placeholder="Select Task..."
                  searchable
                  className="h-14 rounded-2xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                  <div className="relative group">
                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <Input 
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-bold focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Effort (Hours)</label>
                  <div className="relative group">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <Input 
                      type="number"
                      step="0.5"
                      min="0"
                      required
                      placeholder="e.g. 8"
                      value={formData.duration_hours}
                      onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                      className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-bold focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Description</label>
                <textarea 
                  placeholder="Briefly describe your contributions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 rounded-2xl p-5 text-sm font-bold border-none focus:ring-2 focus:ring-blue-500/10 transition-all outline-none resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1 h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest">Cancel</Button>
              <Button 
                type="submit"
                disabled={loading}
                className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95"
              >
                {loading ? "Processing..." : "Commit Log"}
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      {isCreateTaskModalOpen && (
        <CreateTaskModal 
          projectId={Number(formData.project_id)}
          onClose={() => setIsCreateTaskModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["project-tasks", formData.project_id] });
            setIsCreateTaskModalOpen(false);
          }}
        />
      )}
    </>
  );
}

function CreateTaskModal({ projectId, onClose, onSuccess }: { projectId: number, onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [taskData, setTaskData] = useState({ name: "", description: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      toast.error("Project ID tidak valid");
      return;
    }
    setLoading(true);
    
    const payload = {
      project_id: Number(projectId),
      name: taskData.name,
      description: taskData.description || ""
    };

    console.log("Creating task with payload:", payload);
    
    try {
      await createTask(payload);
      toast.success("Task created successfully");
      onSuccess();
    } catch (error) {
      console.error("Task creation failed:", error);
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
        <h3 className="text-lg font-black text-slate-900 mb-6">Tambah Task Baru</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            required
            placeholder="Nama Task..."
            value={taskData.name}
            onChange={(e) => setTaskData({...taskData, name: e.target.value})}
            className="h-12"
          />
          <textarea 
            placeholder="Deskripsi (Opsional)..."
            value={taskData.description}
            onChange={(e) => setTaskData({...taskData, description: e.target.value})}
            className="w-full bg-slate-50 rounded-2xl p-4 text-sm border-none focus:ring-2 focus:ring-blue-500/10 outline-none"
            rows={3}
          />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Batal</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white hover:bg-blue-700">Simpan</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
