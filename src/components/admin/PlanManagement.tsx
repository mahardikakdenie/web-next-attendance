"use client";

import { useState } from "react";
import { 
  Plus, 
  Settings2, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Users, 
  Activity,
  Loader2,
  Calendar,
  Wallet
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlans, createPlan, updatePlan, deletePlan, getSubscriptionFeatures } from "@/service/subscription";
import { SubscriptionPlan, CreatePlanPayload } from "@/types/subscription";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import CurrencyInput from "@/components/ui/CurrencyInput";

export default function PlanManagement() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<CreatePlanPayload>({
    name: "",
    price: 0,
    days: 30,
    max_employees: 0,
    features: [],
    is_active: true
  });

  const { data: plansData, isLoading: isPlansLoading } = useQuery({
    queryKey: ["admin-plans"],
    queryFn: () => getPlans()
  });

  const { data: featuresResp, isLoading: isFeaturesLoading } = useQuery({
    queryKey: ["subscription-features"],
    queryFn: () => getSubscriptionFeatures()
  });

  const plans = plansData?.data || [];
  const availableFeatures = featuresResp?.data || [];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreatePlanPayload) => createPlan(payload),
    onSuccess: () => {
      toast.success("New subscription plan created");
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
      closeModal();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number, payload: CreatePlanPayload }) => updatePlan(id, payload),
    onSuccess: () => {
      toast.success("Subscription plan updated");
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
      closeModal();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePlan(id),
    onSuccess: () => {
      toast.success("Subscription plan deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
    }
  });

  const openModal = (plan?: SubscriptionPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        price: plan.price || 0,
        days: plan.days || 30,
        max_employees: plan.max_employees,
        features: plan.features,
        is_active: plan.is_active
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: "",
        price: 0,
        days: 30,
        max_employees: 0,
        features: [],
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
  };

  const toggleFeature = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.price < 0) return toast.error("Price cannot be negative");
    if (formData.days < 1) return toast.error("Duration must be at least 1 day");

    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, payload: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isPlansLoading || isFeaturesLoading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Global Plans...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Standardized Plans</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Configure global product tiers</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
        >
          <Plus size={16} strokeWidth={3} />
          Define New Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-md transition-all group flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Settings2 size={24} />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => openModal(plan)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  <Edit3 size={18} />
                </button>
                <button 
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this plan? This may affect existing tenants.")) {
                      deleteMutation.mutate(plan.id);
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-1 mb-4">
              <h4 className="text-2xl font-black text-slate-900 tracking-tight">{plan.name}</h4>
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex items-center gap-2 text-blue-600 font-black text-lg">
                  <Wallet size={16} />
                  <span>{formatCurrency(plan.price || 0)}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">/ {plan.days || 30} Days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {plan.max_employees === 0 ? "Unlimited Seats" : `Max ${plan.max_employees} Employees`}
                  </span>
                  {!plan.is_active && (
                     <Badge className="bg-rose-100 text-rose-600 border-none text-[8px] uppercase">Inactive</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-50 space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Allowed Modules</p>
              <div className="flex flex-wrap gap-2">
                {plan.features.map((feat) => (
                  <span key={feat} className="px-3 py-1 bg-slate-50 text-slate-600 text-[9px] font-black uppercase rounded-lg border border-slate-100">
                    {feat}
                  </span>
                ))}
                {plan.features.length === 0 && <span className="text-[10px] text-slate-300 italic">No features defined</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-500 border border-white ring-1 ring-slate-200/50">
            <div className="relative overflow-hidden bg-slate-900 p-8 text-white shrink-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
              <div className="relative z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center">
                    <Activity size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight leading-none">
                      {editingPlan ? "Edit Subscription Tier" : "Define New Tier"}
                    </h2>
                    <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-widest">Global Product Catalog</p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-3 hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Plan Name</label>
                  <Input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Starter, Professional"
                    className="h-12 text-xs font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Employee Limit (0 = Unlimited)</label>
                  <Input 
                    required
                    type="number"
                    value={formData.max_employees}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_employees: Number(e.target.value) }))}
                    className="h-12 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <CurrencyInput 
                  label="Plan Price"
                  value={formData.price}
                  onChange={(val) => setFormData(prev => ({ ...prev, price: val }))}
                  placeholder="Set tier price..."
                />

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Duration (Days)</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input 
                      required
                      type="number"
                      value={formData.days}
                      onChange={(e) => setFormData(prev => ({ ...prev, days: Number(e.target.value) }))}
                      className="pl-12 h-12 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Entitled Features</label>
                   <button 
                     type="button" 
                     onClick={() => setFormData(prev => ({ ...prev, features: availableFeatures.map(f => f.feature_key) }))}
                     className="text-[9px] font-black text-blue-500 uppercase tracking-tighter"
                   >
                     Select All
                   </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {availableFeatures.map((feat) => {
                    const isSelected = formData.features.includes(feat.feature_key);
                    return (
                      <button
                        key={feat.id}
                        type="button"
                        onClick={() => toggleFeature(feat.feature_key)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${isSelected ? "bg-blue-50 border-blue-200" : "bg-white border-slate-100 hover:border-slate-200"}`}
                      >
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${isSelected ? "bg-blue-600 border-blue-600 text-white" : "bg-slate-50 border-slate-200"}`}>
                          {isSelected && <Check size={12} strokeWidth={4} />}
                        </div>
                        <span className={`text-[11px] font-black uppercase tracking-tight ${isSelected ? "text-blue-900" : "text-slate-500"}`}>
                          {feat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl">
                <div>
                  <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Active Status</h5>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">Determine if this plan can be assigned to tenants</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                  className={`w-12 h-6 rounded-full transition-all relative ${formData.is_active ? "bg-emerald-500" : "bg-slate-300"}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.is_active ? "left-7" : "left-1"}`} />
                </button>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 h-14 rounded-2xl font-black text-sm text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-widest">
                  Discard
                </button>
                <Button 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  type="submit" 
                  className="flex-1 h-14 rounded-2xl bg-slate-900 text-white hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    <span className="font-black uppercase tracking-widest text-xs">Commit Changes</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
