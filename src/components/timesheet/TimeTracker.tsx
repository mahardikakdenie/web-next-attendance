"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Square, Loader2, Clock, Briefcase, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Project } from "@/types/api";
import { createTimesheetEntry } from "@/service/timesheet";
import { toast } from "sonner";
import dayjs from "dayjs";

interface TimeTrackerProps {
  projects: Project[];
  onSuccess: () => void;
}

export default function TimeTracker({ projects, onSuccess }: TimeTrackerProps) {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    project_id: "",
    task_name: "",
    description: ""
  });

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
    if (formData.project_id || formData.task_name || formData.description) {
      localStorage.setItem("timesheet_form_data", JSON.stringify(formData));
    }
  }, [formData]);

  const handleStart = () => {
    if (!formData.project_id || !formData.task_name) {
      toast.error("Please select a project and enter a task name first");
      return;
    }
    const startTime = Date.now();
    localStorage.setItem("timesheet_start_time", startTime.toString());
    setIsActive(true);
    toast.success("Time tracking started");
  };

  const handleStop = async () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    localStorage.removeItem("timesheet_start_time");
    
    // Auto-fill duration in hours (rounded to 2 decimal places, minimum 0.1)
    const durationHours = Math.max(0.1, parseFloat((seconds / 3600).toFixed(2)));
    
    setLoading(true);
    try {
      await createTimesheetEntry({
        project_id: Number(formData.project_id),
        task_name: formData.task_name,
        description: formData.description || `Worked for ${formatTime(seconds)}`,
        duration_hours: durationHours,
        date: dayjs().format("YYYY-MM-DD")
      });
      
      toast.success(`Logged ${durationHours} hours to ${projects.find(p => p.id === Number(formData.project_id))?.name}`);
      setSeconds(0);
      setFormData({ project_id: "", task_name: "", description: "" });
      localStorage.removeItem("timesheet_form_data");
      onSuccess();
    } catch {
      toast.error("Failed to save timesheet entry");
      // Re-enable tracking if it failed so they don't lose time? 
      // Actually better to just keep the seconds state so they can try again.
      setIsActive(false); 
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return [h, m, s].map(v => v.toString().padStart(2, "0")).join(":");
  };

  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isActive ? "bg-blue-600 animate-pulse" : "bg-white/10"}`}>
              <Clock size={24} className={isActive ? "text-white" : "text-blue-400"} />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">Time Tracker</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {isActive ? "Currently Tracking" : "Ready to Start"}
              </p>
            </div>
          </div>
          
          <div className="text-4xl sm:text-5xl font-black font-mono tracking-tighter text-blue-400">
            {formatTime(seconds)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-1">
              <Briefcase size={12} /> Project
            </label>
            <select 
              disabled={isActive}
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white outline-none focus:ring-4 focus:ring-blue-500/20 transition-all disabled:opacity-50"
            >
              <option value="" disabled className="bg-slate-900">Select project...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">{p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-1">
              <FileText size={12} /> Task Category
            </label>
            <Input 
              disabled={isActive}
              placeholder="e.g. Frontend Development"
              value={formData.task_name}
              onChange={(e) => setFormData({ ...formData, task_name: e.target.value })}
              className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-2xl font-bold"
            />
          </div>
        </div>

        <div className="space-y-2 mb-8">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Work Description (Optional)</label>
          <textarea 
            placeholder="What did you achieve in this session?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white placeholder:text-slate-500 outline-none focus:ring-4 focus:ring-blue-500/20 transition-all resize-none"
            rows={2}
          />
        </div>

        <div className="flex gap-4">
          {!isActive ? (
            <Button 
              onClick={handleStart}
              className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Play size={18} fill="currentColor" />
              Start Tracking
            </Button>
          ) : (
            <Button 
              onClick={handleStop}
              disabled={loading}
              className="flex-1 h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  <Square size={18} fill="currentColor" />
                  Stop & Save Entry
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
