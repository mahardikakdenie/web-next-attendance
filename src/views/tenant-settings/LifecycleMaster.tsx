"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Plus, 
  Trash2, 
  Loader2, 
  X, 
  ClipboardList, 
  CheckCircle2,
  AlertCircle,
  Search,
  Layout
} from "lucide-react";import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { 
  getLifecycleTemplates, 
  createLifecycleTemplate, 
  deleteLifecycleTemplate, 
  LifecycleTemplate 
} from "@/service/lifecycle";
import { toast } from "sonner";
import { useAuthStore, ROLES } from "@/store/auth.store";
import { useRouter } from "next/navigation";

export default function LifecycleMasterView() {
  const { user, loading: authLoading } = useAuthStore();
  const router = useRouter();

  const [templates, setTemplates] = useState<LifecycleTemplate[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"ONBOARDING" | "OFFBOARDING">("ONBOARDING");

  const [formData, setFormData] = useState({
    task_name: "",
    category: "ONBOARDING"
  });

  const fetchTemplates = useCallback(async () => {
    try {
      setIsFetching(true);
      const resp = await getLifecycleTemplates();
      if (resp.data) {
        setTemplates(resp.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load templates");
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      const allowedRoles: string[] = [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR];
      if (!user.role?.name || !allowedRoles.includes(user.role.name)) {
        router.replace("/");
        return;
      }
      fetchTemplates();
    }
  }, [authLoading, user, router, fetchTemplates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => 
      t.category === activeTab && 
      t.task_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [templates, activeTab, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.task_name) return;
    try {
      setIsSubmitting(true);
      const resp = await createLifecycleTemplate(formData);
      if (resp.success) {
        toast.success("Template task created");
        setIsModalOpen(false);
        setFormData({ task_name: "", category: activeTab });
        fetchTemplates();
      }
    } catch (error) {
      console.error(error);
      toast.error("Error creating template");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this task from global templates?")) return;
    try {
      const resp = await deleteLifecycleTemplate(id);
      if (resp.success) {
        toast.success("Template removed");
        fetchTemplates();
      }
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    }
  };

  if (authLoading) return null;

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-700">
      
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-slate-950 rounded-[40px] p-8 sm:p-12 shadow-2xl text-white">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-600 opacity-20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[11px] font-black tracking-[0.2em] uppercase text-indigo-400">
              <ClipboardList size={16} />
              Process Standardisation
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Lifecycle <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Master Data</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-xl text-sm sm:text-base leading-relaxed">
              Define global checklist templates for employee onboarding and offboarding. Tasks set here will be automatically assigned to new lifecycle instances.
            </p>
          </div>

          <Button 
            onClick={() => {
              setFormData({ ...formData, category: activeTab });
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white hover:bg-blue-700 font-black px-8 py-4 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus size={20} strokeWidth={3} /> Add Standard Task
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Controls & Stats */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm space-y-6">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-600" />
              <input 
                type="text" 
                placeholder="Filter tasks..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Category Filter</span>
              <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200/50">
                {(["ONBOARDING", "OFFBOARDING"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                <div className="flex items-center gap-3">
                  <Layout className="text-blue-600" size={18} />
                  <span className="text-xs font-bold text-slate-600">Total Templates</span>
                </div>
                <span className="text-lg font-black text-blue-900">{templates.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-[32px] p-8 border border-amber-100">
            <div className="flex gap-3 text-amber-600 mb-3">
              <AlertCircle size={20} strokeWidth={2.5} />
              <h4 className="font-black text-xs uppercase tracking-widest mt-0.5">Global Impact</h4>
            </div>
            <p className="text-xs text-amber-900/70 font-bold leading-relaxed">
              Adding or removing tasks here will affect <strong>future</strong> onboarding/offboarding processes. Existing checklists will remain unchanged.
            </p>
          </div>
        </div>

        {/* Right: Template List */}
        <div className="lg:col-span-8 space-y-4">
          {isFetching ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-[24px]" />
              ))}
            </div>
          ) : filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {filteredTemplates.map((t) => (
                <div 
                  key={t.id}
                  className="group flex items-center justify-between p-5 rounded-[24px] bg-white border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                      activeTab === 'ONBOARDING' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'
                    }`}>
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 tracking-tight">{t.task_name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {t.category} Template Task
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(t.id)}
                    className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200">
              <ClipboardList size={48} className="mx-auto text-slate-200 mb-4" />
              <h3 className="text-lg font-black text-slate-900">No Template Tasks</h3>
              <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto mt-2">
                Start building your organization&apos;s standard operating procedure for {activeTab.toLowerCase()}.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Template Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-[3rem] w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
            <form onSubmit={handleSubmit}>
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                      <Plus size={24} strokeWidth={3} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">New Task</h2>
                  </div>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Activity Name</label>
                    <input 
                      required
                      autoFocus
                      value={formData.task_name}
                      onChange={e => setFormData({ ...formData, task_name: e.target.value })}
                      className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 text-sm font-bold text-slate-900 focus:border-blue-600 focus:bg-white transition-all outline-none"
                      placeholder="e.g. Collect ID Cards"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Assign to Category</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["ONBOARDING", "OFFBOARDING"] as const).map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: cat })}
                          className={`h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                            formData.category === cat 
                              ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" 
                              : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all">Cancel</button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin text-white" /> : <CheckCircle2 size={18} />}
                  <span>Save Template</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
