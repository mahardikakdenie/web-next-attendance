"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  BarChart3, 
  Search, 
  Loader2,
  ChevronRight,
  Star,
  MessageSquare,
  Send,
  Calendar,
  Filter
} from "lucide-react";
import { 
  getCycles, 
  getAppraisals, 
  submitSelfReview 
} from "@/service/performance";
import { PerformanceCycle, Appraisal, UserData } from "@/types/api";
import { toast } from "sonner";
import { useAuthStore, ROLES } from "@/store/auth.store";
import { Badge } from "@/components/ui/Badge";
import Image from "next/image";

export default function AppraisalsView() {
  const { user } = useAuthStore();
  const [cycles, setCycles] = useState<PerformanceCycle[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<number | null>(null);
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [selfReviewModal, setSelfReviewModal] = useState<{
    isOpen: boolean;
    appraisalId: number | null;
    score: number;
    comments: string;
  }>({
    isOpen: false,
    appraisalId: null,
    score: 5,
    comments: ""
  });

  const fetchCycles = useCallback(async () => {
    try {
      setIsLoading(true);
      const resp = await getCycles();
      if (resp.data && resp.data.length > 0) {
        setCycles(resp.data);
        const activeCycle = resp.data.find(c => c.status === 'ACTIVE') || resp.data[0];
        setSelectedCycle(activeCycle.id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAppraisals = useCallback(async (cycleId: number) => {
    try {
      setIsLoading(true);
      const resp = await getAppraisals(cycleId);
      if (resp.data) {
        setAppraisals(resp.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  useEffect(() => {
    if (selectedCycle) {
      fetchAppraisals(selectedCycle);
    }
  }, [selectedCycle, fetchAppraisals]);

  const handleSelfReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selfReviewModal.appraisalId) return;

    try {
      setIsSubmitting(true);
      const resp = await submitSelfReview(
        selfReviewModal.appraisalId,
        selfReviewModal.score,
        selfReviewModal.comments
      );

      if (resp.success) {
        toast.success("Self-review submitted successfully");
        setSelfReviewModal({ isOpen: false, appraisalId: null, score: 5, comments: "" });
        if (selectedCycle) fetchAppraisals(selectedCycle);
      }
    } catch (error) {
      toast.error("Failed to submit self-review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isManagerOrAdmin = user?.role?.name && [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR].includes(user.role.name as any);

  const filteredAppraisals = appraisals.filter(a => 
    (a as any).user_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const myAppraisal = appraisals.find(a => a.user_id === user?.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case 'MANAGER_REVIEW': return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case 'SELF_REVIEW': return "bg-amber-50 text-amber-600 border-amber-100";
      default: return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-700">
      <section className="bg-indigo-600 rounded-[40px] p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-600/20">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white opacity-10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-[10px] font-black tracking-[0.2em] uppercase">
              <BarChart3 size={14} />
              Performance Appraisals
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Review & <span className="text-indigo-200">Excellence</span>
            </h1>
            <p className="text-indigo-100 font-medium max-w-xl text-sm sm:text-base leading-relaxed opacity-80">
              Manage performance review cycles, submit self-assessments, and track team growth in a structured environment.
            </p>
          </div>

          <div className="flex flex-col gap-2 min-w-[240px]">
            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-200 ml-1">Active Cycle</label>
            <div className="relative">
              <select 
                value={selectedCycle || ""} 
                onChange={e => setSelectedCycle(Number(e.target.value))}
                className="w-full bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl h-14 px-5 pr-12 text-sm font-bold text-white focus:border-white outline-none appearance-none cursor-pointer"
              >
                {cycles.map(c => (
                  <option key={c.id} value={c.id} className="text-slate-900">{c.name} ({c.status})</option>
                ))}
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-200 pointer-events-none" size={18} />
            </div>
          </div>
        </div>
      </section>

      {/* Employee View: My Appraisal */}
      {!isManagerOrAdmin && myAppraisal && (
        <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm overflow-hidden relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                <Star size={32} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Appraisal Status</h2>
                <p className="text-sm font-bold text-slate-400 mt-1 flex items-center gap-2">
                  <Badge className={`${getStatusBadge(myAppraisal.status)} border px-2 py-0.5`}>
                    {myAppraisal.status.replace('_', ' ')}
                  </Badge>
                  • Cycle: {cycles.find(c => c.id === selectedCycle)?.name}
                </p>
              </div>
            </div>

            {(myAppraisal.status === 'PENDING' || myAppraisal.status === 'SELF_REVIEW') && (
              <button 
                onClick={() => setSelfReviewModal({ ...selfReviewModal, isOpen: true, appraisalId: myAppraisal.id })}
                className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-indigo-200 transition-all active:scale-95"
              >
                <Send size={18} strokeWidth={3} />
                <span className="text-xs uppercase tracking-widest">Submit Self Review</span>
              </button>
            )}
          </div>

          {myAppraisal.status === 'COMPLETED' && (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-50">
              <div className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Self Score</p>
                <p className="text-3xl font-black text-slate-900">{myAppraisal.self_score.toFixed(1)} <span className="text-sm text-slate-400">/ 5.0</span></p>
              </div>
              <div className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Manager Score</p>
                <p className="text-3xl font-black text-slate-900">{myAppraisal.manager_score.toFixed(1)} <span className="text-sm text-slate-400">/ 5.0</span></p>
              </div>
              <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Final Rating</p>
                <p className="text-3xl font-black text-indigo-600">{myAppraisal.final_rating || 'N/A'}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin/Manager View: Team Appraisals */}
      {isManagerOrAdmin && (
        <div className="space-y-6">
          <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Team Monitoring</h2>
              <div className="relative w-full sm:w-80">
                <input 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl h-12 pl-12 pr-4 text-xs font-bold transition-all outline-none"
                  placeholder="Search by employee name..."
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {isLoading ? (
                [1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-50 animate-pulse rounded-[32px]"></div>)
              ) : filteredAppraisals.length === 0 ? (
                <div className="md:col-span-2 xl:col-span-3 py-20 text-center opacity-30">
                  <BarChart3 size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">No appraisal records found for this cycle</p>
                </div>
              ) : (
                filteredAppraisals.map(a => (
                  <div key={a.id} className="p-6 rounded-[32px] bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-500 group">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm shadow-sm overflow-hidden relative border border-white">
                        {(a as any).user_name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-900 truncate">{(a as any).user_name}</p>
                        <Badge className={`${getStatusBadge(a.status)} border text-[8px] px-1.5 py-0.5 font-black uppercase tracking-widest mt-1`}>
                          {a.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Self Score</p>
                        <p className="text-lg font-black text-slate-900">{a.self_score?.toFixed(1) || '0.0'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Mgr Score</p>
                        <p className="text-lg font-black text-slate-900">{a.manager_score?.toFixed(1) || '0.0'}</p>
                      </div>
                    </div>

                    <button className="w-full py-3 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-2">
                      Review Details <ChevronRight size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Self Review Modal */}
      {selfReviewModal.isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => !isSubmitting && setSelfReviewModal({ ...selfReviewModal, isOpen: false })} />
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_0_100px_rgba(0,0,0,0.2)] border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <form onSubmit={handleSelfReviewSubmit} className="flex flex-col h-full overflow-hidden">
              <div className="p-8 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <Star size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Self Review</h2>
                </div>
                {!isSubmitting && (
                  <button type="button" onClick={() => setSelfReviewModal({ ...selfReviewModal, isOpen: false })} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"><X size={24} /></button>
                )}
              </div>

              <div className="p-8 pt-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Performance Score (1.0 - 5.0)</label>
                  <div className="flex flex-col gap-4">
                    <input 
                      type="range" 
                      min="1" 
                      max="5" 
                      step="0.1"
                      value={selfReviewModal.score}
                      onChange={e => setSelfReviewModal({ ...selfReviewModal, score: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-bold text-slate-400">Needs Improvement (1.0)</span>
                      <span className="text-4xl font-black text-indigo-600">{selfReviewModal.score.toFixed(1)}</span>
                      <span className="text-[10px] font-bold text-slate-400">Exceptional (5.0)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Comments & Achievement Summary</label>
                  <textarea 
                    required 
                    value={selfReviewModal.comments} 
                    onChange={e => setSelfReviewModal({ ...selfReviewModal, comments: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-sm font-bold text-slate-900 focus:border-indigo-600 focus:bg-white outline-none min-h-[160px] resize-none" 
                    placeholder="Briefly describe your key achievements and areas for growth in this cycle..." 
                  />
                </div>
              </div>

              <div className="p-8 bg-slate-50 flex gap-4 shrink-0 border-t border-slate-200">
                <button type="button" disabled={isSubmitting} onClick={() => setSelfReviewModal({ ...selfReviewModal, isOpen: false })} className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all bg-white border border-slate-200">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin text-white" /> : <CheckCircle2 size={18} />}
                  <span>Submit Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
