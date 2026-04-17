"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { 
  Plus, 
  ChevronRight,
  ShieldAlert,
  Save,
  Lock,
  Loader2,
  Globe,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Badge } from "@/components/ui/Badge";
import { 
  PermissionModule
} from "@/types/permissions";
import { Role } from "@/types/api";
import { getTenantRoles } from "@/service/roles";
import { toast } from "sonner";

// --- SYSTEM PERMISSION MODULES ---
const PERMISSION_MODULES: PermissionModule[] = [
  {
    id: "mod_platform",
    name: "Platform Administration",
    icon: Globe,
    permissions: [
      { id: "tenants.manage", name: "Manage Tenants", description: "Create and suspend organizations", action: "edit" },
      { id: "subscriptions.manage", name: "Billing Control", description: "Manage platform pricing and plans", action: "edit" },
      { id: "accounts.global", name: "Global Accounts", description: "Manage all system-wide users", action: "edit" },
    ]
  },
  {
    id: "mod_attendance",
    name: "Attendance Module",
    icon: Clock,
    permissions: [
      { id: "attendance.view", name: "View Logs", description: "System-wide log monitoring", action: "view" },
      { id: "attendance.master", name: "Master Config", description: "Configure global attendance rules", action: "edit" },
    ]
  }
];

export default function PlatformRolesView() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  const fetchRoles = useCallback(async () => {
    try {
      setIsLoading(true);
      const resp = await getTenantRoles();
      if (resp.data) {
        // Here Superadmin CAN see everything including 'superadmin'
        setRoles(resp.data);
        if (resp.data.length > 0 && selectedRoleId === null) {
          setSelectedRoleId(resp.data[0].id);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load platform roles");
    } finally {
      setIsLoading(false);
    }
  }, [selectedRoleId]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchRoles();
    });
  }, [fetchRoles]);

  const selectedRole = useMemo(() => 
    roles.find(r => r.id === selectedRoleId) || null
  , [roles, selectedRoleId]);

  if (isLoading && roles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="font-bold text-slate-400 tracking-widest uppercase text-xs">Loading Platform DNA...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">
      
      {/* --- HEADER SECTION --- */}
      <section className="relative overflow-hidden bg-slate-950 rounded-[40px] p-8 sm:p-12 shadow-2xl text-white">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-600 opacity-20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[11px] font-black tracking-[0.2em] uppercase">
              <Globe size={16} className="text-blue-400" />
              Global System Control
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Roles & Governance</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-xl text-sm sm:text-base leading-relaxed">
              Manage core system roles and master permissions that define the default capabilities for every tenant in the platform.
            </p>
          </div>
          <div className="flex gap-3">
             <Button className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-2">
                <Plus size={20} strokeWidth={3} /> New System Role
             </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT SIDE: SYSTEM ROLES */}
        <div className="lg:col-span-4 space-y-4">
          <div className="px-2 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Core Roles</span>
            <Badge className="bg-slate-900 text-blue-400 border-none px-2 py-0.5">Master Access</Badge>
          </div>
          
          <div className="space-y-3">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`w-full flex items-center gap-4 p-5 rounded-[32px] transition-all duration-300 text-left border group ${
                  selectedRoleId === role.id 
                  ? "bg-white border-blue-200 shadow-xl shadow-blue-500/10 ring-1 ring-blue-100" 
                  : "bg-slate-50/50 border-transparent hover:border-slate-200 hover:bg-white"
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                  selectedRoleId === role.id ? "bg-slate-900 text-white shadow-lg" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                }`}>
                  <ShieldAlert size={24} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`font-black text-sm tracking-tight ${selectedRoleId === role.id ? "text-slate-900" : "text-slate-600"}`}>
                      {role.name}
                    </p>
                    <Lock size={12} className="text-slate-300" />
                  </div>
                  <p className="text-[11px] font-medium text-slate-400 truncate">{role.description}</p>
                </div>
                <ChevronRight size={18} className={`transition-all ${selectedRoleId === role.id ? "text-blue-500 translate-x-0" : "text-slate-300 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"}`} />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: PERMISSION MASTER */}
        <div className="lg:col-span-8 bg-white rounded-[40px] shadow-sm border border-slate-100 flex flex-col min-h-[600px] overflow-hidden">
          {selectedRole ? (
            <>
              <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedRole.name} Master Config</h2>
                  <p className="text-sm font-medium text-slate-400 mt-1">Defining global permissions for this system role</p>
                </div>
                <Button className="bg-slate-900 hover:bg-blue-600 text-white font-black px-6 py-3 rounded-2xl flex items-center gap-2 transition-all">
                  <Save size={18} /> Update Global Policy
                </Button>
              </div>

              <div className="flex-1 p-8 space-y-10">
                {PERMISSION_MODULES.map((module) => (
                  <div key={module.id} className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                        <module.icon size={20} strokeWidth={2.5} />
                      </div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">{module.name}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {module.permissions.map((perm) => (
                        <div key={perm.id} className="flex items-center justify-between p-5 rounded-3xl bg-slate-50/50 border border-slate-100 transition-all">
                          <div className="flex-1 pr-4">
                            <p className="text-sm font-black text-slate-800">{perm.name}</p>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">{perm.description}</p>
                          </div>
                          <Switch 
                            checked={selectedRole.permissions?.some(p => p.id === perm.id) || false}
                            disabled={true} // System roles managed by dev/migration mostly
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <p className="font-bold">Select a core role to view master policy</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
