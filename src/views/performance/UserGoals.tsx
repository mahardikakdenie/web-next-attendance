"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Target, 
  TrendingUp, 
  Plus,
  ChevronRight
} from "lucide-react";
import { getMyGoals, updateGoalProgress } from "@/service/performance";
import { PerformanceGoal } from "@/types/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";

export function UserGoalsSection() {
  const [goals, setGoals] = useState<PerformanceGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await getMyGoals();
      if (resp.data) {
        setGoals(resp.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchGoals();
    });
  }, [fetchGoals]);

  const handleUpdateProgress = async (id: number, current: number, target: number) => {
    const newVal = window.prompt(`Enter new progress (Current: ${current} / Target: ${target}):`, String(current));
    if (newVal === null) return;
    
    const numVal = parseFloat(newVal);
    if (isNaN(numVal)) return toast.error("Invalid number");

    try {
      await updateGoalProgress(id, numVal);
      toast.success(numVal >= target ? "Goal completed! Status updated to COMPLETED." : "Progress updated");
      fetchGoals();
    } catch {
      toast.error("Failed to update progress");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case 'CANCELLED': return "bg-rose-50 text-rose-600 border-rose-100";
      default: return "bg-blue-50 text-blue-600 border-blue-100";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[40px] p-8 border border-slate-100 animate-pulse">
        <div className="h-6 w-32 bg-slate-100 rounded-full mb-6"></div>
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-24 bg-slate-50 rounded-3xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <section className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Target size={20} className="text-indigo-600" />
            Performance Goals
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tracking your OKRs & KPIs</p>
        </div>
        <Badge className="bg-indigo-50 text-indigo-600 border-none font-black text-[10px]">
          {goals.filter(g => g.status === 'IN_PROGRESS').length} Active
        </Badge>
      </div>

      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-[32px]">
            <Target size={32} className="mx-auto text-slate-200 mb-2" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No goals assigned yet</p>
          </div>
        ) : (
          goals.map((goal) => {
            const percentage = Math.min(100, Math.max(0, (goal.current_progress / goal.target_value) * 100));
            
            return (
              <div 
                key={goal.id} 
                className="p-5 rounded-[32px] bg-slate-50/50 border border-transparent hover:border-slate-100 hover:bg-white transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      goal.type === 'OKR' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      <TrendingUp size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-black text-slate-900 leading-tight">{goal.title}</p>
                        <Badge className={`${getStatusBadge(goal.status)} border text-[8px] px-1.5 py-0.5 font-black uppercase tracking-widest`}>
                          {goal.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{goal.type} • Goal ID: #{goal.id}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleUpdateProgress(goal.id, goal.current_progress, goal.target_value)}
                    className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-slate-900">{goal.current_progress} / {goal.target_value} {goal.unit} ({Math.round(percentage)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        percentage >= 100 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-indigo-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {goals.length > 0 && (
        <button className="w-full mt-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
          View Detailed Analytics <ChevronRight size={14} />
        </button>
      )}
    </section>
  );
}
