"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Square, Loader2, Clock, Briefcase, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Project } from "@/types/api";
import { createTimesheetEntry, getTasks } from "@/service/timesheet";
import { toast } from "sonner";
import dayjs from "dayjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface TimeTrackerProps {
  projects: Project[];
  onSuccess: () => void;
}

export default function TimeTracker({ projects, onSuccess }: TimeTrackerProps) {
  const queryClient = useQueryClient();
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    project_id: "",
    task_id: "",
    description: ""
  });

  const { data: taskResp } = useQuery({
    queryKey: ["project-tasks", formData.project_id],
    queryFn: () => getTasks(Number(formData.project_id)),
    enabled: !!formData.project_id
  });

  const tasks = taskResp?.data || [];
  const taskOptions = tasks.map(t => ({ label: t.name, value: t.id }));

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load state from localStorage
  useEffect(() => {
    const savedStartTime = localStorage.getItem("timesheet_start_time");
    const savedFormData = localStorage.getItem("timesheet_form_data");
    
    if (savedStartTime) {
      const startTime = parseInt(savedStartTime);
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setSeconds(elapsed);
      setIsActive(true);
    }

    if (savedFormData) {
      try {
        setFormData(JSON.parse(savedFormData));
      } catch (e) {
        console.error("Failed to parse saved form data", e);
      }
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  // Persist form data
  useEffect(() => {
    if (formData.project_id || formData.task_id || formData.description) {
      localStorage.setItem("timesheet_form_data", JSON.stringify(formData));
    }
  }, [formData]);

  const handleStart = () => {
    if (!formData.project_id || !formData.task_id) {
      toast.error("Please select both project and task first");
      return;
    }
    const startTime = Date.now();
    localStorage.setItem("timesheet_start_time", startTime.toString());
    localStorage.setItem("active_project_id", formData.project_id);
    localStorage.setItem("active_task_id", formData.task_id);
    setIsActive(true);
    toast.success("Time tracking started");
  };

  const handleStop = async () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    localStorage.removeItem("timesheet_start_time");
    
    const durationHours = Math.max(0.1, parseFloat((seconds / 3600).toFixed(2)));
    
    setLoading(true);
    let newEntry: any;

    try {
      newEntry = await createTimesheetEntry({
        project_id: Number(formData.project_id),
        task_id: Number(formData.task_id),
        task_name: tasks.find(t => t.id === Number(formData.task_id))?.name || "Task",
        description: formData.description || `Worked for ${formatTime(seconds)}`,
        duration_hours: durationHours,
        date: dayjs().toISOString()
      });
    } catch (error: any) {
      console.error("Timesheet entry creation failed:", error);
      toast.error(error?.response?.data?.message || "Failed to save timesheet entry");
      setIsActive(false); 
      setLoading(false);
      return;
    }

    try {
      queryClient.setQueriesData({ queryKey: ["timesheet-entries"] }, (oldData: any) => {
        if (!oldData || !oldData.data || !Array.isArray(oldData.data.entries)) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            entries: [newEntry.data, ...oldData.data.entries]
          }
        };
      });
    } catch (cacheError) {
      console.error("Failed to update local cache:", cacheError);
    }

    toast.success(`Logged ${durationHours} hours successfully`);
    setSeconds(0);
    setFormData({ project_id: "", task_id: "", description: "" });
    localStorage.removeItem("timesheet_form_data");
    onSuccess();
    setLoading(false);
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return [h, m, s].map(v => v.toString().padStart(2, "0")).join(":");
  };

  const projectOptions = projects.map(p => ({
    label: p.name,
    value: p.id,
    icon: <Briefcase size={14} />
  }));

  return (
    <div className={`w-full bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-2 transition-all duration-500 ${isActive ? "ring-2 ring-blue-500/20" : ""}`}>
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
        
        {/* Project Selector */}
        <div className="flex-[1] min-w-[200px]">
          <Select 
            disabled={isActive}
            value={formData.project_id}
            onChange={(val) => setFormData({ ...formData, project_id: val, task_id: "" })}
            options={projectOptions}
            placeholder="Select Project..."
            searchable
            className="h-12 border-none shadow-none bg-slate-50 rounded-2xl"
          />
        </div>

        {/* Task Selector */}
        <div className="flex-[1] min-w-[200px]">
          <Select 
            disabled={isActive || !formData.project_id}
            value={formData.task_id}
            onChange={(val) => setFormData({ ...formData, task_id: val })}
            options={taskOptions}
            placeholder={!formData.project_id ? "Select Project First..." : "Select Task..."}
            searchable
            className="h-12 border-none shadow-none bg-slate-50 rounded-2xl"
          />
        </div>

        {/* Description Input */}
        <div className="relative flex-[2] min-w-[280px] hidden xl:block">
           <Input 
            disabled={isActive}
            placeholder="Detailed description (optional)..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="h-12 px-5 bg-slate-50 border-none rounded-2xl text-[13px] font-medium text-slate-600 placeholder:text-slate-400 placeholder:font-medium focus:ring-4 focus:ring-blue-500/5 transition-all"
          />
        </div>

        {/* Timer & Controls */}
        <div className="flex items-center gap-4 px-4 bg-slate-950 rounded-2xl h-12 min-w-[240px]">
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isActive ? "bg-blue-600 animate-pulse" : "bg-white/10"}`}>
               <Clock size={16} className={isActive ? "text-white" : "text-slate-400"} />
            </div>
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-0.5">Elapsed</span>
               <span className="text-lg font-black font-mono text-white leading-none tracking-tighter">
                  {formatTime(seconds)}
               </span>
            </div>
          </div>

          <div className="w-px h-6 bg-white/10" />

          {!isActive ? (
            <button 
              onClick={handleStart}
              className="w-8 h-8 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-blue-600/20 group"
              title="Start Tracking"
            >
              <Play size={16} fill="currentColor" className="group-hover:scale-110 transition-transform" />
            </button>
          ) : (
            <button 
              onClick={handleStop}
              disabled={loading}
              className="w-8 h-8 bg-rose-600 hover:bg-rose-500 text-white rounded-lg flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-rose-600/20 group"
              title="Stop Tracking"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : (
                <Square size={14} fill="currentColor" className="group-hover:scale-110 transition-transform" />
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
