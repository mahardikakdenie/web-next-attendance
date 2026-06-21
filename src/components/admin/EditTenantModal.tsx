"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
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
import Textarea from "@/components/ui/Textarea";
import SuspendTenantModal from "@/components/admin/SuspendTenantModal";
import Modal from "@/components/ui/Modal";
import { updateTenant, UpdateTenantPayload } from "@/service/admin";
import { getPlans } from "@/service/subscription";
import { OwnerStats, CustomApiError } from "@/types/api";
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
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);

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
    plan_id: 0,
    is_suspended: tenant?.tenant_status === "Suspended",
    suspended_reason: tenant?.suspended_reason || ""
  }));

  // Update plan_id once plans are loaded
  useEffect(() => {
    if (tenant && plans.length > 0) {
      const currentPlan = plans.find(p => p.name === tenant.tenant_plan);
      if (currentPlan) {
        setFormData(prev => ({ ...prev, plan_id: currentPlan.id }));
      }
    }
  }, [tenant, plans]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;

    setIsSubmitting(true);
    try {
      await updateTenant(tenant.tenant_id, formData);
      toast.success("Organization updated successfully");
      
      void queryClient.invalidateQueries({ queryKey: ["owners-stats"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const apiErr = err as CustomApiError;
      const msg = apiErr?.response?.data?.meta?.message || apiErr?.response?.data?.data || "Failed to update organization";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <>
      <Button 
        type="button" 
        variant="secondary" 
        onClick={onClose}
        className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest border-slate-200"
      >
        Cancel
      </Button>
      <Button 
        type="submit"
        disabled={isSubmitting}
        className="flex-[2] h-14 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95"
      >
        {isSubmitting ? (
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        ) : (
          <div className="flex items-center justify-center gap-2">
             <CheckCircle2 size={18} />
             <span>Save Changes</span>
          </div>
        )}
      </Button>
    </>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Edit Organization"
        subtitle="Configuration & Governance"
        icon={<Building2 size={24} strokeWidth={2.5} />}
        footer={footer}
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Info */}
          <div className="space-y-4">
             <Input 
              required
              label="Organization Name"
              placeholder="Enter company name..."
              value={formData.name}
              disabled={true}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

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
                  onCheckedChange={(val) => {
                    if (val) {
                      setIsSuspendModalOpen(true);
                    } else {
                      setFormData({ ...formData, is_suspended: false, suspended_reason: "" });
                    }
                  }}
                />
             </div>

             {formData.is_suspended && (
               <div className="animate-in slide-in-from-top-2 duration-300">
                  <Textarea 
                    required
                    label="Suspension Reason"
                    value={formData.suspended_reason}
                    onChange={(e) => setFormData({ ...formData, suspended_reason: e.target.value })}
                    placeholder="Specify the policy violation or reason..."
                  />
               </div>
             )}
          </div>
        </form>
      </Modal>

      <SuspendTenantModal
        isOpen={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
        onConfirm={(reason) => {
          setFormData({ ...formData, is_suspended: true, suspended_reason: reason });
          setIsSuspendModalOpen(false);
        }}
        isSubmitting={false}
        tenantName={tenant?.tenant_name || ""}
      />
    </>
  );
}
