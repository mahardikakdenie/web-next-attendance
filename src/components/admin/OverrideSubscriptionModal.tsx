"use client";

import { useState } from "react";
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlans, overrideSubscription } from "@/service/subscription";
import { TenantSubscription, SubscriptionStatus, OverrideSubscriptionPayload } from "@/types/subscription";
import dayjs from "dayjs";
import { useMemo } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  subscription: TenantSubscription | null;
}

export default function OverrideSubscriptionModal({ isOpen, onClose, subscription }: Props) {
  const queryClient = useQueryClient();

  const { data: plansData } = useQuery({
    queryKey: ["admin-plans-active"],
    queryFn: () => getPlans(),
    enabled: isOpen
  });

  const plans = useMemo(() => plansData?.data || [], [plansData]);

  // Prepare initial data based on subscription and plans
  const initialData = useMemo(() => {
    if (!subscription) return {
      plan_id: 0,
      status: "Active" as SubscriptionStatus,
      amount: 0,
      next_billing_date: ""
    };

    const currentPlan = plans.find(p => p.name === subscription.plan);
    return {
      plan_id: currentPlan?.id || 0,
      status: subscription.status,
      amount: subscription.amount,
      next_billing_date: dayjs(subscription.next_billing_date).format("YYYY-MM-DD")
    };
  }, [subscription, plans]);

  const [formData, setFormData] = useState(initialData);

  // Sync formData when initialData changes (only if needed, e.g. when plans data finally arrives)
  const [prevInitialData, setPrevInitialData] = useState(initialData);
  if (initialData !== prevInitialData) {
    setFormData(initialData);
    setPrevInitialData(initialData);
  }

  const mutation = useMutation({
    mutationFn: (payload: OverrideSubscriptionPayload) => overrideSubscription(subscription!.id, payload),
    onSuccess: () => {
      toast.success("Subscription updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      onClose();
    },
    onError: (error: unknown) => {
      const apiError = error as { response?: { data?: { meta?: { message?: string } } } };
      toast.error(apiError?.response?.data?.meta?.message || "Failed to update subscription");
    }
  });

  if (!isOpen || !subscription) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-500 border border-white ring-1 ring-slate-200/50">
        
        {/* Header */}
        <div className="relative overflow-hidden bg-slate-900 p-8 text-white shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <ShieldCheck size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight leading-none">Manual Override</h2>
                <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-widest">{subscription.tenant_name}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Subscription Plan</label>
              <select 
                value={formData.plan_id}
                onChange={(e) => setFormData(prev => ({ ...prev, plan_id: Number(e.target.value) }))}
                className="w-full h-12 px-4 rounded-xl bg-slate-50 border-none text-xs font-bold focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none appearance-none"
              >
                <option value={0}>Select Plan</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Current Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as SubscriptionStatus }))}
                className="w-full h-12 px-4 rounded-xl bg-slate-50 border-none text-xs font-bold focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
              >
                {(["Active", "Past Due", "Canceled", "Trial"] as const).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Amount (IDR)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input 
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  className="pl-10 h-12 text-xs font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Next Billing Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input 
                  type="date"
                  value={formData.next_billing_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, next_billing_date: e.target.value }))}
                  className="pl-10 h-12 text-xs font-bold"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3">
             <CreditCard size={20} className="text-amber-600 shrink-0 mt-0.5" />
             <p className="text-[11px] font-medium text-amber-800 leading-relaxed">
                Manual overrides directly bypass automated billing logic. Ensure the dates and amounts are correct before applying changes.
             </p>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-50">
            <button 
              onClick={onClose}
              className="flex-1 h-12 rounded-xl font-black text-xs text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-widest"
            >
              Cancel
            </button>
            <Button 
              disabled={mutation.isPending}
              onClick={() => mutation.mutate(formData)}
              className="flex-1 h-12 rounded-xl bg-slate-900 text-white hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-2"
            >
              {mutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className="font-black uppercase tracking-widest text-[10px]">Update Subscription</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
