"use client";

import React, { useState } from "react";
import { 
  Settings2, 
  Clock, 
  Globe, 
  Save, 
  Loader2, 
  ShieldCheck, 
  Zap,
  Building
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDataCurrentTenant } from "@/service/tenantSettings";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { toast } from "sonner";
import { Can } from "@/components/auth/PermissionGuard";
import { UserData } from "@/types/api";

interface OrganizationSettingsFormProps {
  user: UserData | null;
}

export default function OrganizationSettingsForm({ user }: OrganizationSettingsFormProps) {
  const queryClient = useQueryClient();
  const settings = user?.tenant_setting;

  const [formData, setFormData] = useState({
    late_after_minute: settings?.late_after_minute || 15,
    allow_remote: settings?.allow_remote || false,
    clock_in_start_time: settings?.clock_in_start_time || "08:00",
    clock_in_end_time: settings?.clock_in_end_time || "17:00",
  });

  const mutation = useMutation({
    mutationFn: (data: any) => updateDataCurrentTenant({
      ...settings,
      ...data,
      id: settings?.id as number,
      tenant_id: settings?.tenant_id as number,
    } as any),
    onSuccess: () => {
      toast.success("Settings updated successfully");
      queryClient.invalidateQueries({ queryKey: ["tenant-settings-info"] });
    },
    onError: () => {
      toast.error("Failed to update settings");
    }
  });

  const handleSave = () => {
    mutation.mutate(formData);
  };

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
            <Settings2 size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Organization Rules</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure global attendance behavior</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-10">
        {/* Attendance Rules Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock size={16} />
            <h4 className="text-[11px] font-black uppercase tracking-widest">Attendance Thresholds</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-tight">Late Tolerance (Minutes)</label>
              <Input 
                type="number"
                value={formData.late_after_minute}
                onChange={(e) => setFormData({ ...formData, late_after_minute: parseInt(e.target.value) })}
                className="h-12 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
        </section>

        {/* Operational Hours Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-slate-400">
            <Globe size={16} />
            <h4 className="text-[11px] font-black uppercase tracking-widest">Standard Hours</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-tight">Start Time</label>
              <Input 
                type="time"
                value={formData.clock_in_start_time}
                onChange={(e) => setFormData({ ...formData, clock_in_start_time: e.target.value })}
                className="h-12 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-tight">End Time</label>
              <Input 
                type="time"
                value={formData.clock_in_end_time}
                onChange={(e) => setFormData({ ...formData, clock_in_end_time: e.target.value })}
                className="h-12 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
        </section>

        {/* Global Policies Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck size={16} />
            <h4 className="text-[11px] font-black uppercase tracking-widest">Security & Access</h4>
          </div>
          
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                <Zap size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">Allow Remote Attendance</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Users can clock-in from any location</p>
              </div>
            </div>
            <Switch 
              checked={formData.allow_remote}
              onCheckedChange={(checked) => setFormData({ ...formData, allow_remote: checked })}
            />
          </div>
        </section>

        {/* Action Section */}
        <div className="pt-6 border-t border-slate-50 flex justify-end">
          <Can permission="tenant.edit">
            <Button 
              onClick={handleSave}
              disabled={mutation.isPending}
              className="h-14 px-10 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all"
            >
              {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <Save size={18} className="mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </Can>
        </div>
      </div>
    </div>
  );
}
