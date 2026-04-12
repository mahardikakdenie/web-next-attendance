"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { 
  ShieldCheck, 
  Users, 
  Clock, 
  Wallet, 
  BarChart3, 
  Plus, 
  ChevronRight,
  ShieldAlert,
  Info,
  Save,
  Trash2,
  Lock,
  GitBranch,
  CheckCircle2,
  ChevronDown,
  X,
  Loader2,
  Sparkles,
  Search,
  SearchX,
  ArrowRightLeft
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Badge } from "@/components/ui/Badge";
import { 
  PermissionModule
} from "@/types/permissions";
import { Role } from "@/types/api";
import { getTenantRoles, createCustomRole, updateCustomRole, deleteCustomRole, saveRoleHierarchy } from "@/service/roles";
import { toast } from "sonner";

// --- PERMISSION MODULES CONFIGURATION ---
const PERMISSION_MODULES: PermissionModule[] = [
  {
    id: "mod_attendance",
    name: "Attendance & Monitoring",
    icon: Clock,
    permissions: [
      { id: "attendance.view", name: "View Logs", description: "Ability to see real-time attendance entries", action: "view" },
      { id: "attendance.edit", name: "Manual Correction", description: "Edit or add logs for employees", action: "edit" },
      { id: "attendance.approve", name: "Approve Requests", description: "Confirm or reject check-in adjustments", action: "approve" },
      { id: "attendance.export", name: "Export Data", description: "Download logs as PDF or Excel", action: "export" },
    ]
  },
  {
    id: "mod_payroll",
    name: "Payroll & Finance",
    icon: Wallet,
    permissions: [
      { id: "payroll.view", name: "View Salaries", description: "Access to employee pay information", action: "view" },
      { id: "payroll.edit", name: "Edit Allowances", description: "Modify fixed or recurring bonuses", action: "edit" },
      { id: "payroll.approve", name: "Process Disbursement", description: "Trigger monthly payroll runs", action: "approve" },
      { id: "payroll.create", name: "Generate Slips", description: "Create and distribute digital payslips", action: "create" },
    ]
  },
  {
    id: "mod_user",
    name: "User Management",
    icon: Users,
    permissions: [
      { id: "user.view", name: "View Directory", description: "Access to employee list and profiles", action: "view" },
      { id: "user.create", name: "Add Employees", description: "Create new user accounts and onboarding", action: "create" },
      { id: "user.edit", name: "Update Profiles", description: "Modify existing employee information", action: "edit" },
      { id: "user.delete", name: "Offboard/Archive", description: "Remove access or archive user records", action: "delete" },
    ]
  },
  {
    id: "mod_analytics",
    name: "Strategic Analytics",
    icon: BarChart3,
    permissions: [
      { id: "analytics.view", name: "View HR Stats", description: "See macro-level organization health", action: "view" },
      { id: "analytics.dna", name: "Access DNA Profile", description: "See individual behavioral analytics", action: "view" },
      { id: "analytics.executive", name: "Executive Reports", description: "View sensitive company growth data", action: "view" },
    ]
  },
  {
    id: "mod_support",
    name: "Platform Support",
    icon: Sparkles,
    permissions: [
      { id: "support.manage", name: "Support Desk", description: "Access helpdesk and provisioning tools", action: "approve" },
    ]
  }
];

export default function TenantRolesView() {
  // --- States ---
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"permissions" | "hierarchy">("permissions");
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");

  // New Role Form State
  const [newRoleData, setNewRoleData] = useState({
    name: "",
    description: "",
    base_role: "EMPLOYEE" as Role["base_role"],
    department: ""
  });

  // Hierarchy State
  const [childRoleIds, setChildRoleIds] = useState<number[]>([]);

  // --- Data Fetching ---
  const fetchRoles = useCallback(async () => {
    try {
      setIsLoading(true);
      const resp = await getTenantRoles();
      if (resp.data) {
        // FILTER: Jangan tampilkan superadmin di list tenant
        const filtered = resp.data.filter(r => r.name !== 'superadmin');
        setRoles(filtered);
        
        if (filtered.length > 0 && (selectedRoleId === null || !filtered.some(r => r.id === selectedRoleId))) {
          setSelectedRoleId(filtered[0].id);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load organization roles");
    } finally {
      setIsLoading(false);
    }
  }, [selectedRoleId]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // --- Memos ---
  const selectedRole = useMemo(() => 
    roles.find(r => r.id === selectedRoleId) || null
  , [roles, selectedRoleId]);

  const filteredRoles = useMemo(() => {
    return roles.filter(r => r.name.toLowerCase().includes(roleSearch.toLowerCase()));
  }, [roles, roleSearch]);

  // Update hierarchy state when role or tab changes
  useEffect(() => {
    if (selectedRole && activeTab === "hierarchy") {
      // Assuming children are populated in the role object or we fetch them
      // For now, let's keep it empty or use existing children if available
      // Backend should provide child roles in the Role object
      setChildRoleIds([]); // Reset for now, would be populated from API
    }
  }, [selectedRole, activeTab]);

  // --- Handlers ---
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoleData.name.length < 3) {
      toast.error("Role name must be at least 3 characters");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        ...newRoleData,
        permissions: [] // New roles start with zero permissions
      };
      const resp = await createCustomRole(payload);
      if (resp.success) {
        toast.success(`Role '${newRoleData.name}' created successfully`);
        setIsCreating(false);
        setNewRoleData({ name: "", description: "", base_role: "EMPLOYEE", department: "" });
        await fetchRoles();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create custom role");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole || selectedRole.is_system) return;

    try {
      setIsSaving(true);
      const payload = {
        name: selectedRole.name,
        description: selectedRole.description,
        base_role: selectedRole.base_role,
        permissions: selectedRole.permissions?.map(p => p.id) || []
      };
      const resp = await updateCustomRole(selectedRole.id, payload);
      if (resp.success) {
        toast.success("Permissions updated successfully");
        await fetchRoles();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update role permissions");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (!confirm("Are you sure you want to delete this role? This cannot be undone.")) return;

    try {
      setIsSaving(true);
      const resp = await deleteCustomRole(id);
      if (resp.success) {
        toast.success("Role deleted successfully");
        setSelectedRoleId(null);
        await fetchRoles();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete role");
    } finally {
      setIsSaving(false);
    }
  };

  const togglePermission = (permissionId: string) => {
    if (!selectedRole || selectedRole.is_system) return;

    setRoles(prev => prev.map(role => {
      if (role.id === selectedRoleId) {
        const currentPerms = role.permissions?.map(p => p.id) || [];
        const hasPermission = currentPerms.includes(permissionId);
        
        return {
          ...role,
          permissions: hasPermission 
            ? role.permissions?.filter(p => p.id !== permissionId)
            : [...(role.permissions || []), { id: permissionId, module: "", action: "" }]
        } as Role;
      }
      return role;
    }));
  };

  const handleSaveHierarchy = async () => {
    if (!selectedRoleId) return;
    
    try {
      setIsSaving(true);
      const resp = await saveRoleHierarchy(selectedRoleId, childRoleIds);
      if (resp.success) {
        toast.success("Reporting hierarchy saved");
        await fetchRoles();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save hierarchy");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleChildRole = (id: number) => {
    setChildRoleIds(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  if (isLoading && roles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="font-bold text-slate-400 tracking-widest uppercase text-xs">Synchronizing Access Levels...</p>
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[11px] font-black tracking-[0.2em] uppercase text-blue-400">
              <ShieldCheck size={16} className="fill-current" />
              Organization Architecture
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Tenant <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Access Control</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-xl text-sm sm:text-base leading-relaxed">
              Define your company&apos;s unique structural DNA. Create custom roles and map granular permissions specific to your tenant needs.
            </p>
          </div>
          <div className="flex gap-3">
             <Button 
              onClick={() => setIsCreating(true)}
              className="bg-blue-600 text-white hover:bg-blue-700 font-black px-8 py-4 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2"
             >
                <Plus size={20} strokeWidth={3} /> Create Unique Role
             </Button>
          </div>
        </div>
      </section>

      {/* --- MAIN INTERFACE --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT SIDE: ROLE LIST */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-[32px] border border-slate-100 p-4 shadow-sm">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search roles..." 
                value={roleSearch}
                onChange={e => setRoleSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            {filteredRoles.length > 0 ? filteredRoles.map((role) => (
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
                  selectedRoleId === role.id ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-white text-slate-400 border border-slate-100 group-hover:bg-slate-50"
                }`}>
                  {role.tenant_id === null ? <ShieldCheck size={24} strokeWidth={2.5} /> : <Sparkles size={24} strokeWidth={2.5} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`font-black text-sm tracking-tight ${selectedRoleId === role.id ? "text-slate-900" : "text-slate-600"}`}>
                      {role.name}
                    </p>
                    {role.is_system && (
                      <Lock size={12} className="text-slate-300" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      {role.tenant_id === null ? "System Role" : "Custom Role"}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className="text-[10px] font-bold text-blue-500/70 uppercase">{role.base_role}</span>
                  </div>
                </div>
                <ChevronRight size={18} className={`transition-all ${selectedRoleId === role.id ? "text-blue-500 translate-x-0" : "text-slate-300 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"}`} />
              </button>
            )) : (
              <div className="p-10 text-center bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                <SearchX size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No roles found</p>
              </div>
            )}
          </div>

          <div className="bg-blue-50/50 rounded-[32px] p-6 border border-blue-100 mt-8">
             <div className="flex gap-3 text-blue-600 mb-3">
                <Info size={20} strokeWidth={2.5} />
                <h4 className="font-black text-xs uppercase tracking-widest mt-0.5">Owner Control</h4>
             </div>
             <p className="text-xs text-blue-900/70 font-bold leading-relaxed">
                Roles are organized hierarchically. An <span className="text-blue-700 italic">Admin</span> can see everything, while custom roles can be restricted to specific departments.
             </p>
          </div>
        </div>

        {/* RIGHT SIDE: CONFIGURATION */}
        <div className="lg:col-span-8 bg-white rounded-[40px] shadow-sm border border-slate-100 flex flex-col min-h-[750px] overflow-hidden">
          
          {selectedRole ? (
            <>
              {/* Header & Tabs */}
              <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center text-white shadow-xl">
                        <Users size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedRole.name}</h2>
                        <p className="text-sm font-medium text-slate-400 mt-1">
                          {selectedRole.tenant_id === null ? "Standard platform template" : "Organization-specific custom role"}
                        </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!selectedRole.is_system && selectedRole.tenant_id !== null && (
                      <button 
                        onClick={() => handleDeleteRole(selectedRole.id)}
                        className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    <Button 
                      disabled={selectedRole.is_system || isSaving}
                      onClick={activeTab === "permissions" ? handleUpdateRole : handleSaveHierarchy}
                      className="bg-slate-900 hover:bg-blue-600 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-2 shadow-lg shadow-slate-200 transition-all active:scale-95"
                    >
                      {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} strokeWidth={2.5} />} 
                      Save Changes
                    </Button>
                  </div>
                </div>

                <div className="flex p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/50 w-fit">
                  <button
                    onClick={() => setActiveTab("permissions")}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                      activeTab === "permissions" ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <ShieldAlert size={16} /> Permissions Matrix
                  </button>
                  <button
                    onClick={() => setActiveTab("hierarchy")}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                      activeTab === "hierarchy" ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <GitBranch size={16} /> Reporting Hierarchy
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                {activeTab === "permissions" ? (
                  <div className="space-y-10 animate-in fade-in duration-500">
                    {PERMISSION_MODULES.map((module) => (
                      <div key={module.id} className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100">
                            <module.icon size={20} strokeWidth={2.5} />
                          </div>
                          <h3 className="text-lg font-black text-slate-900 tracking-tight">{module.name}</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {module.permissions.map((perm) => (
                            <div 
                              key={perm.id} 
                              className="flex items-center justify-between p-5 rounded-3xl bg-slate-50/50 border border-slate-100 hover:border-blue-100 hover:bg-white transition-all group"
                            >
                              <div className="flex-1 pr-4">
                                <p className="text-sm font-black text-slate-800">{perm.name}</p>
                                <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-0.5">{perm.description}</p>
                              </div>
                              <Switch 
                                checked={selectedRole.permissions?.some(p => p.id === perm.id) || false}
                                onCheckedChange={() => togglePermission(perm.id)}
                                disabled={selectedRole.is_system}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* --- HIERARCHY BUILDER --- */
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                       <div className="relative z-10 flex items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10">
                             <GitBranch size={32} className="text-blue-400" />
                          </div>
                          <div>
                             <h3 className="text-xl font-black tracking-tight">Hierarchy Builder</h3>
                             <p className="text-slate-400 text-sm font-medium mt-1">Select which roles report to <span className="text-blue-400 font-bold">{selectedRole.name}</span></p>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                       {/* Current Status */}
                       <div className="space-y-4">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Visual Tree</span>
                          <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 flex flex-col items-center">
                             <div className="w-48 p-4 rounded-2xl bg-white border border-blue-200 shadow-xl shadow-blue-500/5 flex flex-col items-center text-center">
                                <Badge className="bg-blue-50 text-blue-600 border-none mb-2">{selectedRole.base_role}</Badge>
                                <p className="font-black text-sm text-slate-900">{selectedRole.name}</p>
                             </div>
                             <div className="h-12 w-px bg-slate-200"></div>
                             <div className="w-full grid grid-cols-2 gap-4">
                                {childRoleIds.length > 0 ? childRoleIds.map(id => {
                                  const child = roles.find(r => r.id === id);
                                  return (
                                    <div key={id} className="p-3 rounded-xl bg-white border border-slate-100 shadow-sm text-center">
                                       <p className="font-bold text-xs text-slate-600">{child?.name}</p>
                                    </div>
                                  );
                                }) : (
                                  <div className="col-span-2 p-6 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">No subordinates assigned yet. <br /> Select from the list on the right.</p>
                                  </div>
                                )}
                             </div>
                          </div>
                       </div>

                       {/* Selection List */}
                       <div className="space-y-4">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Available Roles</span>
                          <div className="space-y-2">
                             {roles.filter(r => r.id !== selectedRoleId).map(r => (
                               <button
                                 key={r.id}
                                 onClick={() => toggleChildRole(r.id)}
                                 className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${
                                   childRoleIds.includes(r.id)
                                   ? "bg-blue-50 border-blue-200"
                                   : "bg-white border-slate-100 hover:border-slate-200"
                                 }`}
                               >
                                  <div className="flex items-center gap-3">
                                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${childRoleIds.includes(r.id) ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                                        <Users size={16} />
                                     </div>
                                     <p className={`text-sm font-bold ${childRoleIds.includes(r.id) ? "text-blue-700" : "text-slate-600"}`}>{r.name}</p>
                                  </div>
                                  {childRoleIds.includes(r.id) ? (
                                    <CheckCircle2 size={18} className="text-blue-600" />
                                  ) : (
                                    <ArrowRightLeft size={16} className="text-slate-300" />
                                  )}
                               </button>
                             ))}
                          </div>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
               <ShieldAlert size={48} className="mb-4 opacity-20" />
               <p className="font-bold">Select a role to start configuration</p>
            </div>
          )}

          {/* Footer Info */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <CheckCircle2 size={12} className="text-emerald-500" />
                Live Cloud Sync Active
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Tenant Access Engine • Build 2026.4</p>
          </div>
        </div>
      </div>

      {/* --- CREATE ROLE MODAL --- */}
      {isCreating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[48px] w-full max-w-xl shadow-2xl overflow-hidden border border-white ring-1 ring-slate-200/50 animate-in zoom-in-95 duration-500">
              <form onSubmit={handleCreateRole}>
                <div className="p-10 border-b border-slate-50">
                  <div className="flex items-center justify-between mb-8">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">New Organization Role</h2>
                      <button type="button" onClick={() => setIsCreating(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400"><X size={24} /></button>
                  </div>
                  
                  <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Unique Role Name</label>
                        <input 
                          required
                          value={newRoleData.name}
                          onChange={e => setNewRoleData(prev => ({ ...prev, name: e.target.value }))}
                          type="text" 
                          placeholder="e.g. Senior HR Specialist" 
                          className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 text-left relative">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Base Template</label>
                            <div className="relative">
                              <select 
                                value={newRoleData.base_role}
                                onChange={e => setNewRoleData(prev => ({ ...prev, base_role: e.target.value as Role["base_role"] }))}
                                className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 appearance-none text-sm font-bold pr-10 focus:ring-4 focus:ring-blue-500/5 outline-none"
                              >
                                  <option value="HR">HR</option>
                                  <option value="FINANCE">FINANCE</option>
                                  <option value="EMPLOYEE">EMPLOYEE</option>
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Department Name</label>
                            <input 
                              required
                              value={newRoleData.department}
                              onChange={e => setNewRoleData(prev => ({ ...prev, department: e.target.value }))}
                              type="text" 
                              placeholder="e.g. Human Resources" 
                              className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" 
                            />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Brief Description</label>
                        <textarea 
                          value={newRoleData.description}
                          onChange={e => setNewRoleData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="What is the purpose of this role?" 
                          className="w-full h-24 bg-slate-50 border-none rounded-2xl p-6 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all outline-none resize-none" 
                        />
                      </div>
                  </div>
                </div>
                <div className="p-8 bg-slate-50/50 flex gap-4">
                  <button type="button" onClick={() => setIsCreating(false)} className="flex-1 h-14 rounded-2xl font-black text-sm text-slate-500 hover:bg-slate-100 transition-all uppercase tracking-widest">Cancel</button>
                  <Button 
                    disabled={isSaving}
                    type="submit" 
                    className="flex-1 h-14 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 font-black text-sm shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus size={20} strokeWidth={3} />}
                    <span className="uppercase tracking-widest">Create Tenant Role</span>
                  </Button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
