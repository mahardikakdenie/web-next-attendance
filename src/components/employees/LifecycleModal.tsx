"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  X, 
  CheckCircle2, 
  Circle, 
  Loader2, 
  ClipboardCheck, 
  ArrowRight,
  TrendingUp,
  Layout
} from "lucide-react";
import { 
  getEmployeeLifecycle, 
  updateLifecycleTaskStatus, 
  LifecycleTask, 
  EmployeeLifecycle 
} from "@/service/lifecycle";
import { toast } from "sonner";
import { useAuthStore, ROLES } from "@/store/auth.store";

interface Props {
  open: boolean;
  onClose: () => void;
  employeeId: number;
  employeeName: string;
}

export default function LifecycleModal({ open, onClose, employeeId, employeeName }: Props) {
  const [data, setData] = useState<EmployeeLifecycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ONBOARDING" | "OFFBOARDING">("ONBOARDING");
  
  const { user } = useAuthStore();
  const isHR = user?.role?.name === ROLES.SUPERADMIN || user?.role?.name === ROLES.ADMIN || user?.role?.name === ROLES.HR;

  const fetchLifecycle = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await getEmployeeLifecycle(employeeId);
      if (resp.data) {
        setData(resp.data);
        setActiveTab(resp.data.status || "ONBOARDING");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load employee lifecycle");
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    if (open && employeeId) {
      fetchLifecycle();
    }
  }, [open, employeeId, fetchLifecycle]);

  const filteredTasks = useMemo(() => {
    if (!data) return [];
    return data.tasks.filter(t => t.category === activeTab);
  }, [data, activeTab]);

  const stats = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.is_completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [filteredTasks]);

  const handleToggle = async (task: LifecycleTask) => {
    if (!isHR) return;
    try {
      setUpdatingId(task.id);
      const newStatus = !task.is_completed;
      const resp = await updateLifecycleTaskStatus(employeeId, task.id, newStatus);
      if (resp.success) {
        setData(prev => {
          if (!prev) return null;
          return {
            ...prev,
            tasks: prev.tasks.map(t => t.id === task.id ? { ...t, is_completed: newStatus } : t)
          };
        });
        toast.success(`Task marked as ${newStatus ? 'completed' : 'incomplete'}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update task status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative bg-white rounded-[3rem] w-full max-w-2xl shadow-[0_0_100px_rgba(0,0,0,0.2)] border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <ClipboardCheck size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{employeeName}</h2>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                  <Layout size={12} /> Lifecycle Checklist
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400">
              <X size={24} />
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200/50 w-full mb-6">
            {(["ONBOARDING", "OFFBOARDING"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? "bg-white text-blue-600 shadow-sm shadow-slate-200" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Progress Bar */}
          {!loading && (
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-blue-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Task Progression</span>
                </div>
                <span className="text-xs font-black text-blue-600">{stats.completed} / {stats.total} Completed</span>
              </div>
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-1000 ease-out"
                  style={{ width: `${stats.percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Checklist...</p>
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <button
                  key={task.id}
                  disabled={!isHR || updatingId === task.id}
                  onClick={() => handleToggle(task)}
                  className={`w-full flex items-center gap-4 p-5 rounded-[24px] border transition-all text-left group ${
                    task.is_completed 
                      ? "bg-emerald-50/30 border-emerald-100" 
                      : "bg-white border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-100"
                  }`}
                >
                  <div className={`shrink-0 transition-colors ${
                    task.is_completed ? "text-emerald-500" : "text-slate-200 group-hover:text-blue-400"
                  }`}>
                    {updatingId === task.id ? (
                      <Loader2 size={24} className="animate-spin" />
                    ) : task.is_completed ? (
                      <CheckCircle2 size={24} className="fill-emerald-50" />
                    ) : (
                      <Circle size={24} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-black transition-all ${
                      task.is_completed ? "text-slate-400 line-through" : "text-slate-900"
                    }`}>
                      {task.task_name}
                    </p>
                    {task.is_completed && task.completed_at && (
                      <p className="text-[9px] font-bold text-emerald-600 uppercase mt-1">
                        Completed on {new Date(task.completed_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {isHR && !task.is_completed && (
                    <ArrowRight size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center rounded-[32px] border-2 border-dashed border-slate-100">
              <ClipboardCheck size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No tasks defined for this stage</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 shrink-0">
          <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            Authorized access only. Changes are recorded in compliance logs.
          </p>
        </div>
      </div>
    </div>
  );
}
