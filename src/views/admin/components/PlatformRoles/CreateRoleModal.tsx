import React, { useState } from "react";
import { X, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import NativeSelect from "@/components/ui/NativeSelect";
import Textarea from "@/components/ui/Textarea";
import { createSystemRole } from "@/service/roles";
import { Role } from "@/types/api";
import { toast } from "sonner";

interface CreateRoleModalProps {
  setIsCreating: (val: boolean) => void;
  onSuccess: () => Promise<void>;
}

export function CreateRoleModal({
  setIsCreating,
  onSuccess
}: CreateRoleModalProps) {
  const [newRoleData, setNewRoleData] = useState({
    name: "",
    description: "",
    base_role: "EMPLOYEE" as Role["base_role"],
    department: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const payload = {
        ...newRoleData,
        permissions: []
      };
      const resp = await createSystemRole(payload);
      if (resp.success) {
        toast.success("New system role published");
        setIsCreating(false);
        setNewRoleData({ name: "", description: "", base_role: "EMPLOYEE", department: "" });
        await onSuccess();
      }
    } catch {
      toast.error("Failed to create system role");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
       <div className="bg-white rounded-[48px] w-full max-w-xl shadow-2xl overflow-hidden border border-white ring-1 ring-slate-200/50 animate-in zoom-in-95 duration-500">
          <form onSubmit={handleCreateRole}>
            <div className="p-10 border-b border-slate-50">
              <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">NEW CORE BLUEPRINT</h2>
                  <button type="button" onClick={() => setIsCreating(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400"><X size={24} /></button>
              </div>
              
              <div className="space-y-6">
                  <Input
                    required
                    label="CORE IDENTIFIER"
                    value={newRoleData.name}
                    onChange={e => setNewRoleData(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                    type="text" 
                    placeholder="e.g. PLATFORM_MODERATOR" 
                    variant="ghost"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <NativeSelect
                      required
                      label="BASE ARCHITECTURE"
                      value={newRoleData.base_role}
                      onChange={e => setNewRoleData(prev => ({ ...prev, base_role: e.target.value as Role["base_role"] }))}
                      options={[
                        { label: "SUPERADMIN", value: "SUPERADMIN" },
                        { label: "ADMIN", value: "ADMIN" },
                        { label: "HR", value: "HR" },
                        { label: "EMPLOYEE", value: "EMPLOYEE" }
                      ]}
                      variant="ghost"
                    />

                    <Input
                      required
                      label="DOMAIN SCOPE"
                      value={newRoleData.department}
                      onChange={e => setNewRoleData(prev => ({ ...prev, department: e.target.value }))}
                      type="text" 
                      placeholder="e.g. Governance" 
                      variant="ghost"
                    />
                  </div>

                  <Textarea
                    label="GOVERNANCE DESCRIPTION"
                    value={newRoleData.description}
                    onChange={e => setNewRoleData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="EXPLAIN GLOBAL POLICY CAPABILITIES..." 
                    variant="ghost"
                    rows={3}
                  />
              </div>
            </div>
            <div className="p-8 bg-slate-50/50 flex gap-4">
              <button type="button" onClick={() => setIsCreating(false)} className="flex-1 h-14 rounded-2xl font-black text-[10px] text-slate-500 hover:bg-slate-100 transition-all uppercase tracking-widest">CANCEL</button>
              <Button disabled={isSaving} type="submit" className="flex-1 h-14 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 font-black text-[10px] shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 uppercase tracking-widest">
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} strokeWidth={3} />}
                PUBLISH CORE
              </Button>
            </div>
          </form>
       </div>
    </div>
  );
}
