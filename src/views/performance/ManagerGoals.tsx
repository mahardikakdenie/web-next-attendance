"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Target, 
  UserPlus, 
  Search, 
  Loader2,
  X,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Clock
} from "lucide-react";
import dayjs from "dayjs";
import { createGoal, getUserGoals } from "@/service/performance";
import { getDataUserslist } from "@/service/users";
import { UserData, PerformanceGoal, GoalType } from "@/types/api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import Image from "next/image";

export default function ManagerGoalsView() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userGoals, setUserGoals] = useState<PerformanceGoal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "KPI" as GoalType,
    target_value: 100,
    unit: "%",
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
  });

  const fetchUsers = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const resp = await getDataUserslist({ user_id: user.id, limit: 100 });
      if (resp.data) {
        setUsers(resp.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchUserGoals = useCallback(async (userId: number) => {
    try {
      const resp = await getUserGoals(userId);
      if (resp.data) {
        setUserGoals(resp.data);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchUsers();
    });
  }, [fetchUsers]);

  useEffect(() => {
    if (selectedUser) {
      Promise.resolve().then(() => {
        fetchUserGoals(selectedUser.id);
      });
    }
  }, [selectedUser, fetchUserGoals]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      return toast.error("Start date cannot be after end date");
    }

    try {
      setIsSubmitting(true);
      const resp = await createGoal({
        ...formData,
        user_id: selectedUser.id,
        status: 'IN_PROGRESS',
        current_progress: 0
      });

      if (resp.success) {
        toast.success("Goal assigned successfully");
        setIsModalOpen(false);
        fetchUserGoals(selectedUser.id);
        setFormData({
          title: "",
          description: "",
          type: "KPI",
          target_value: 100,
          unit: "%",
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
        });
      }
    } catch (error) {
      toast.error("Failed to assign goal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.employee_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-700">
      <section className="bg-slate-900 rounded-[40px] p-8 sm:p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500 opacity-10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[10px] font-black tracking-[0.2em] uppercase">
              <Target size={14} className="text-indigo-400" />
              Goal Management
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Assign & Monitor <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Team Progress</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-xl text-xs sm:text-sm leading-relaxed">
              Set measurable KPIs and OKRs for your team members and track their achievements in real-time.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left: Team List */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm h-full">
            <div className="relative mb-6">
              <input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl h-12 pl-12 pr-4 text-xs font-bold transition-all outline-none"
                placeholder="Search team member..."
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {isLoading ? (
                [1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-2xl"></div>)
              ) : (
                filteredUsers.map(u => (
                  <div 
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedUser?.id === u.id ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="relative w-10 h-10 shrink-0">
                      <Image src={u.media_url || "/profile.jpg"} fill alt={u.name} className="rounded-xl object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate">{u.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{u.employee_id} • {u.department}</p>
                    </div>
                    <ChevronRight size={14} className={selectedUser?.id === u.id ? 'text-indigo-600' : 'text-slate-300'} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Goals Detail */}
        <div className="xl:col-span-8 space-y-8">
          {!selectedUser ? (
            <div className="bg-white rounded-[40px] p-20 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center opacity-40">
              <Target size={64} className="text-slate-200 mb-4" />
              <h3 className="text-lg font-black text-slate-900">No User Selected</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Select a team member from the left to manage their goals</p>
            </div>
          ) : (
            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10 border-b border-slate-50 pb-8">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 shrink-0 shadow-lg">
                    <Image src={selectedUser.media_url || "/profile.jpg"} fill alt={selectedUser.name} className="rounded-2xl object-cover border-2 border-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{selectedUser.name}</h2>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{selectedUser.department} • Active Goals: {userGoals.length}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                >
                  <UserPlus size={18} strokeWidth={3} />
                  <span className="text-xs uppercase tracking-widest">Assign New Goal</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userGoals.length === 0 ? (
                  <div className="md:col-span-2 py-20 text-center opacity-30">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">No performance goals assigned to this user</p>
                  </div>
                ) : (
                  userGoals.map(goal => {
                    const percentage = Math.min(100, Math.max(0, (goal.current_progress / goal.target_value) * 100));
                    return (
                      <div key={goal.id} className="p-6 rounded-[32px] bg-slate-50/50 border border-slate-100 group hover:bg-white hover:shadow-xl transition-all duration-500">
                        <div className="flex items-center justify-between mb-6">
                          <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                            goal.type === 'OKR' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {goal.type}
                          </div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Clock size={10} /> {dayjs(goal.end_date).format('MMM DD, YYYY')}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{goal.title}</h4>
                        <p className="text-[10px] font-medium text-slate-500 leading-relaxed mb-6 line-clamp-2">{goal.description}</p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-400">Completion</span>
                            <span className="text-slate-900">{Math.round(percentage)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assign Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_0_100px_rgba(0,0,0,0.2)] border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <form onSubmit={handleCreateGoal} className="flex flex-col h-full overflow-hidden">
              <div className="p-8 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <Target size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Assign New Goal</h2>
                </div>
                {!isSubmitting && (
                  <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"><X size={24} /></button>
                )}
              </div>

              <div className="p-8 pt-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Goal Title</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl h-14 px-5 text-sm font-bold text-slate-900 focus:border-indigo-600 focus:bg-white transition-all outline-none" placeholder="e.g. Increase Monthly Sales" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Goal Type</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as GoalType})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl h-14 px-5 text-sm font-bold text-slate-900 focus:border-indigo-600 focus:bg-white outline-none appearance-none">
                      <option value="KPI">KPI (Indicator)</option>
                      <option value="OKR">OKR (Result)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Value</label>
                    <div className="flex gap-2">
                      <input required type="number" value={formData.target_value} onChange={e => setFormData({...formData, target_value: parseFloat(e.target.value)})} className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl h-14 px-5 text-sm font-bold text-slate-900 focus:border-indigo-600 focus:bg-white outline-none" />
                      <input required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-20 bg-slate-50 border-2 border-slate-100 rounded-2xl h-14 text-center text-sm font-bold text-slate-900 focus:border-indigo-600 focus:bg-white outline-none" placeholder="%" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Start Date</label>
                    <input type="date" required value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl h-14 px-5 text-sm font-bold text-slate-900 focus:border-indigo-600 focus:bg-white outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">End Date</label>
                    <input type="date" required value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl h-14 px-5 text-sm font-bold text-slate-900 focus:border-indigo-600 focus:bg-white outline-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Detailed Description</label>
                  <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-sm font-bold text-slate-900 focus:border-indigo-600 focus:bg-white outline-none min-h-[120px] resize-none" placeholder="Describe the goal requirements..." />
                </div>
              </div>

              <div className="p-8 bg-slate-50 flex gap-4 shrink-0 border-t border-slate-200">
                <button type="button" disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all bg-white border border-slate-200">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin text-white" /> : <CheckCircle2 size={18} />}
                  <span>Assign Goal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
