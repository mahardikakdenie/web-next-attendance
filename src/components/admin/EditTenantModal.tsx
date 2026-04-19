"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Building2, 
  ShieldAlert, 
  CheckCircle2, 
  Loader2,
  AlertTriangle,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { updateTenant, UpdateTenantPayload } from "@/service/admin";
import { OwnerStats } from "@/types/api";
import { toast } from "sonner";

interface EditTenantModalProps {
  tenant: OwnerStats | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditTenantModal({ tenant, isOpen, onClose, onSuccess }: EditTenantModalProps) {
  const [formData, setFormData] = useState<UpdateTenantPayload>({
    name: "",
    plan: "Basic",
    is_suspended: false,
    suspended_reason: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tenant) {
      Promise.resolve().then(() => {
        setFormData({
          name: tenant.tenant_name,
          plan: tenant.tenant_plan || "Basic",
          is_suspended: false, // In a real scenario, this would come from the API as well
          suspended_reason: ""
        });
      });
    }
  }, [tenant]);

  if (!isOpen || !tenant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.is_suspended && !formData.suspended_reason.trim()) {
      toast.error("Please provide a reason for suspension");
      return;
    }

    try {
      setIsSubmitting(true);
      const resp = await updateTenant(tenant.tenant_id, formData);
      if (resp.success) {
        toast.success("Organization updated successfully");
        onSuccess();
        onClose();
      }
    } catch {
      toast.error("Failed to update organization details");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl border border-white ring-1 ring-slate-200/50 overflow-hidden animate-in zoom-in-95 duration-300">
        <form onSubmit={handleSubmit} className="flex flex-col">
          
          {/* Header */}
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                <Building2 size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Edit Organization</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tenant Registry Management</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white hover:shadow-md rounded-xl text-slate-400 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Organization Code (Read-Only)</label>
              <div className="h-12 bg-slate-100 border border-slate-200 rounded-2xl px-4 flex items-center text-sm font-bold text-slate-500 cursor-not-allowed">
                {tenant.tenant_code}
              </div>
              <p className="text-[9px] text-slate-400 font-medium ml-1 flex items-center gap-1">
                <Info size={10} /> Internal identifiers cannot be modified.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Name</label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12 bg-slate-50 border-slate-200 rounded-2xl font-bold"
                placeholder="e.g. Acme Corp Revised"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subscription Plan</label>
              <select 
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="Basic">Basic Plan</option>
                <option value="Pro">Pro Business</option>
                <option value="Enterprise">Enterprise Elite</option>
              </select>
            </div>

            <div className="pt-4 border-t border-slate-50">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-[24px] border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.is_suspended ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}`}>
                    {formData.is_suspended ? <ShieldAlert size={20} /> : <CheckCircle2 size={20} />}
                  </div>
                  <div>
                    <p className={`text-sm font-black tracking-tight ${formData.is_suspended ? "text-rose-600" : "text-emerald-600"}`}>
                      {formData.is_suspended ? "Organization Suspended" : "Organization Active"}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Tenant Access Status</p>
                  </div>
                </div>
                <Switch 
                  checked={formData.is_suspended}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_suspended: checked })}
                />
              </div>
            </div>

            {formData.is_suspended && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">Suspension Reason</label>
                <textarea 
                  value={formData.suspended_reason}
                  onChange={(e) => setFormData({ ...formData, suspended_reason: e.target.value })}
                  className="w-full min-h-[100px] bg-rose-50/30 border border-rose-100 rounded-2xl p-4 text-sm font-medium text-slate-900 focus:ring-4 focus:ring-rose-500/5 outline-none transition-all placeholder:text-rose-200"
                  placeholder="Explain why this organization is being suspended..."
                  required={formData.is_suspended}
                />
                <div className="flex items-center gap-2 p-3 bg-rose-50 rounded-xl text-[10px] font-bold text-rose-600 border border-rose-100/50">
                   <AlertTriangle size={14} />
                   This will block all users from this organization immediately.
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-3">
            <Button 
              type="button"
              variant="secondary" 
              className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Discard
            </Button>
            <Button 
              type="submit"
              className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-indigo-600 shadow-xl shadow-indigo-600/10 font-black text-xs uppercase tracking-widest transition-all active:scale-95"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
