"use client";

import { useState, useMemo } from "react";
import { 
  Calendar, 
  Clock, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  CheckCircle2, 
  History,
  Briefcase,
  AlertCircle,
  Loader2,
  PieChart as PieChartIcon
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getActiveProjects, createTimesheetEntry, getMyTimesheetReport } from "@/service/timesheet";
import { TimesheetEntry, Project } from "@/types/api";
import { toast } from "sonner";
import dayjs from "dayjs";
import { useAuthStore } from "@/store/auth.store";
import Chart from "@/components/ui/Chart";

export default function TimesheetView() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState(dayjs().format("YYYY-MM"));
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Queries
  const { data: reportResp, isLoading: isReportLoading } = useQuery({
    queryKey: ["timesheet-report", selectedPeriod],
    queryFn: () => getMyTimesheetReport(selectedPeriod),
  });

  const { data: projectsResp } = useQuery({
    queryKey: ["active-projects"],
    queryFn: () => getActiveProjects(),
  });

  const report = reportResp?.data;
  const projects = projectsResp?.data || [];

  const navigatePeriod = (direction: 'next' | 'prev') => {
    setSelectedPeriod(prev => 
      dayjs(prev).add(direction === 'next' ? 1 : -1, 'month').format("YYYY-MM")
    );
  };

  const columns: Column<TimesheetEntry>[] = useMemo(() => [
    {
      header: "Date",
      accessor: (item) => (
        <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
          <Calendar size={14} className="text-slate-400" />
          {dayjs(item.date).format("MMM DD, YYYY")}
        </div>
      ),
      sortable: true,
    },
    {
      header: "Project & Task",
      accessor: (item) => (
        <div className="space-y-1">
          <p className="text-sm font-black text-slate-900">{item.project?.name || 'Unknown Project'}</p>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-50 text-blue-600 border-blue-100 text-[9px] px-2 py-0.5 font-bold uppercase">{item.task_name}</Badge>
          </div>
        </div>
      ),
    },
    {
      header: "Hours",
      accessor: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
            {item.duration_hours}
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hrs</span>
        </div>
      ),
    },
    {
      header: "Description",
      accessor: (item) => (
        <p className="text-xs text-slate-500 font-medium max-w-xs truncate">{item.description}</p>
      ),
    },
  ], []);

  const chartOptions = {
    labels: report?.breakdown?.map(b => b.project_name) || [],
    colors: ["#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#eab308"],
    legend: { position: "bottom" as const },
    dataLabels: { enabled: false, },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Hours",
              formatter: () => report?.summary?.total_hours?.toString() ?? "0"
            }
          }
        }
      }
    }
  };

  const chartSeries = report?.breakdown?.map(b => b.total_hours) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Daily Timesheet</h1>
          <p className="text-slate-500 font-medium">Log and track your daily work contributions.</p>
        </div>
        
        <div className="flex items-center gap-3">
           {/* Period Navigator */}
           <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            <button onClick={() => navigatePeriod('prev')} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-blue-600">
              <ChevronLeft size={16} strokeWidth={3} />
            </button>
            <div className="px-4 flex flex-col items-center min-w-[120px]">
              <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em] leading-none mb-1">Period</span>
              <span className="text-sm font-black text-slate-800 leading-none">{dayjs(selectedPeriod).format("MMMM YYYY")}</span>
            </div>
            <button onClick={() => navigatePeriod('next')} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-blue-600">
              <ChevronRight size={16} strokeWidth={3} />
            </button>
          </div>

          <Button 
            onClick={() => setIsLogModalOpen(true)}
            className="bg-slate-900 hover:bg-blue-600 text-white rounded-2xl h-12 px-6 font-black flex items-center gap-2 shadow-lg shadow-slate-200 transition-all active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
            <span>Log Work</span>
          </Button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-blue-200 transition-all">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Hours</p>
            <h3 className="text-3xl font-black text-slate-900">{report?.summary?.total_hours ?? 0}</h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-indigo-200 transition-all">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Briefcase size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projects</p>
            <h3 className="text-3xl font-black text-slate-900">{report?.breakdown?.length ?? 0}</h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-emerald-200 transition-all">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</p>
            <h3 className="text-3xl font-black text-slate-900">92%</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Log Table */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History size={18} className="text-slate-400" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Work Log Details</h3>
              </div>
              <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50">
                <Download size={14} className="mr-2" />
                Export CSV
              </Button>
            </div>
            <DataTable 
              columns={columns} 
              data={report?.entries || []} 
              isLoading={isReportLoading}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              limit={limit}
              onLimitChange={setLimit}
            />
          </div>

          {/* Approval UI */}
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl shadow-slate-900/10">
            <div className="flex items-center gap-3 mb-10">
               <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <CheckCircle2 size={20} />
               </div>
               <h3 className="text-lg font-black tracking-tight">Report Authentication</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="h-px bg-white/10 w-full" />
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm font-black text-white">{report?.summary?.employee_name ?? user?.name}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Employee Signature</p>
                </div>
              </div>
              <div className="space-y-4 opacity-50">
                <div className="h-px bg-white/10 w-full" />
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm font-black text-white">{report?.summary?.manager_name ?? 'Project Manager'}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Manager Approval</p>
                </div>
              </div>
              <div className="space-y-4 opacity-50">
                <div className="h-px bg-white/10 w-full" />
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm font-black text-white">{report?.summary?.hr_name ?? 'HR Department'}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">HR Verification</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-8">
              <PieChartIcon size={18} className="text-indigo-500" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Project Breakdown</h3>
            </div>
            
            <div className="h-64">
               {report && (report?.breakdown?.length ?? 0) > 0 ? (
                 <Chart type="donut" options={chartOptions} series={chartSeries} height="100%" />
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <PieChartIcon size={48} className="text-slate-200 mb-2" />
                    <p className="text-xs font-bold text-slate-400 uppercase">No Data</p>
                 </div>
               )}
            </div>

            <div className="mt-8 space-y-3">
              {report?.breakdown?.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chartOptions.colors[i % chartOptions.colors.length] }} />
                      <span className="text-xs font-bold text-slate-700">{item.project_name}</span>
                   </div>
                   <span className="text-xs font-black text-slate-900">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
             <div className="relative z-10 space-y-4">
                <AlertCircle size={32} strokeWidth={2.5} />
                <h4 className="text-lg font-black tracking-tight">Policies & Guidelines</h4>
                <p className="text-xs text-indigo-100 font-medium leading-relaxed">
                  All work logs must be submitted by the end of each working day. Late submissions may delay monthly reporting cycles.
                </p>
                <Button className="w-full bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest h-10">Read Timesheet Policy</Button>
             </div>
          </div>
        </div>
      </div>

      {/* Log Work Modal */}
      {isLogModalOpen && (
        <LogWorkModal 
          isOpen={isLogModalOpen}
          onClose={() => setIsLogModalOpen(false)}
          projects={projects}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["timesheet-report"] })}
        />
      )}
    </div>
  );
}

interface LogWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onSuccess: () => void;
}

function LogWorkModal({ onClose, projects, onSuccess }: LogWorkModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    project_id: "",
    task_name: "",
    duration_hours: "",
    date: dayjs().format("YYYY-MM-DD"),
    description: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTimesheetEntry({
        ...formData,
        project_id: Number(formData.project_id),
        duration_hours: Number(formData.duration_hours)
      });
      toast.success("Work log submitted");
      onSuccess();
      onClose();
    } catch {
      toast.error("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <form onSubmit={handleSubmit}>
          <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                <Plus size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Log Daily Work</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entry Details</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Date</label>
                  <Input 
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="h-12 rounded-2xl font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Duration (Hrs)</label>
                  <Input 
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    placeholder="e.g. 8"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                    className="h-12 rounded-2xl font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Project</label>
                <select 
                  required
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                >
                  <option value="" disabled>Select active project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Task Category</label>
                <Input 
                  required
                  placeholder="e.g. Frontend Development"
                  value={formData.task_name}
                  onChange={(e) => setFormData({ ...formData, task_name: e.target.value })}
                  className="h-12 rounded-2xl font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Work Description</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="What did you achieve today?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12 rounded-2xl font-black uppercase text-[11px]">Discard</Button>
            <Button 
              type="submit"
              disabled={loading}
              className="flex-1 h-12 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-black uppercase text-[11px] shadow-lg shadow-blue-200"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Submit Log"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
