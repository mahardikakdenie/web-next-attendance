"use client";

import { useState } from "react";
import { Plus, Briefcase, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTasks, createTimesheetEntry, createTask } from "@/service/timesheet";
import { TimesheetEntry, Project, APIResponse } from "@/types/api";
import { toast } from "sonner";
import dayjs from "dayjs";

export default function LogWorkModal({ onClose, projects, onSuccess }: { isOpen: boolean, onClose: () => void, projects: Project[], onSuccess: () => void }) {
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
