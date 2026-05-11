"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  X, 
  Building2, 
  ShieldAlert, 
  CheckCircle2, 
  Loader2,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { updateTenant, UpdateTenantPayload } from "@/service/admin";
import { getPlans } from "@/service/subscription";
import { OwnerStats } from "@/types/api";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface EditTenantModalProps {
  tenant: OwnerStats | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditTenantModal({ tenant, isOpen, onClose, onSuccess }: EditTenantModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: plansResp, isLoading: isPlansLoading } = useQuery({
    queryKey: ["admin-plans-list"],
    queryFn: () => getPlans(),
    enabled: isOpen
  });

  const plans = useMemo(() => plansResp?.data || [], [plansResp]);

  const planOptions = useMemo(() => plans.map(p => ({
    label: `${p.name} Tier`,
    value: p.id,
    icon: <CreditCard size={14} className="text-blue-500" />
  })), [plans]);

  // Initial state based on current tenant and plans
  const [formData, setFormData] = useState<UpdateTenantPayload>(() => ({
    name: tenant?.tenant_name || "",
    plan_id: 0, // Will be updated by useEffect when plans load
    is_suspended: tenant?.tenant_status === "Suspended",
    suspended_reason: tenant?.suspended_reason || ""
  }));

  // Update plan_id once plans are loaded
  useEffect(() => {
    if (tenant && plans.length > 0) {
      const currentPlan = plans.find(p => p.name === tenant.tenant_plan);
      if (currentPlan) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData(prev => ({ ...prev, plan_id: currentPlan.id }));
      }
    }
  }, [tenant, plans]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;

    setIsSubmitting(true);
    try {
      // Use tenant_id specifically for the organization update endpoint
      await updateTenant(tenant.tenant_id, formData);
      toast.success("Organization updated successfully");
      
      // Invalidate both lists since this endpoint updates both tenant & subscription data
      void queryClient.invalidateQueries({ queryKey: ["owners-stats"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to update organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-8 pb-0 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                <Building2 size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Edit Organization</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Configuration & Governance</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-8 space-y-8">
            {/* General Info */}
            <div className="space-y-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Organization Name</label>
                 <Input 
                  placeholder="Enter company name..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
               </div>

              <div className="space-y-2">
                <Select 
                  label="Subscription Plan"
                  value={formData.plan_id}
                  onChange={(val) => setFormData({ ...formData, plan_id: Number(val) })}
                  options={planOptions}
                  placeholder={isPlansLoading ? "Loading plans..." : "Select Plan"}
                  disabled={isPlansLoading}
                />
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Security & Access */}
            <div className="space-y-6">
               <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50/50 border border-slate-100 group transition-all hover:bg-slate-50">
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.is_suspended ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
                       <ShieldAlert size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                       <p className="text-sm font-black text-slate-900">Suspend Access</p>
                       <p className="text-[11px] font-medium text-slate-400">Instantly block all organization members</p>
                    </div>
                  </div>
                  <Switch 
                    checked={formData.is_suspended}
                    onCheckedChange={(val) => setFormData({ ...formData, is_suspended: val })}
                  />
               </div>

               {formData.is_suspended && (
                 <div className="animate-in slide-in-from-top-2 duration-300">
                    <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1 mb-2 block">Suspension Reason</label>
                    <textarea 
                      required
                      value={formData.suspended_reason}
                      onChange={(e) => setFormData({ ...formData, suspended_reason: e.target.value })}
                      placeholder="Specify the policy violation or reason..."
                      className="w-full p-5 bg-rose-50/20 border border-rose-100 rounded-3xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-rose-500/5 transition-all min-h-[100px] resize-none"
                    />
                 </div>
               )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-8 pt-0 flex gap-3">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose}
              className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest border-slate-200"
            >
              Cancel
            </Button>
            <Button 
              disabled={isSubmitting}
              className="flex-[2] h-14 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                   <CheckCircle2 size={18} />
                   <span>Save Changes</span>
                </div>
              )}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
