"use client";

import React, { useEffect } from "react";
import { 
  ShieldAlert,
  Save,
  Trash2,
  Lock,
  GitBranch,
  Loader2,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { usePlatformPermissions } from "./hooks/usePlatformPermissions";
import { usePlatformRoles } from "./hooks/usePlatformRoles";
import { PlatformRolesHeader } from "./components/PlatformRoles/PlatformRolesHeader";
import { RoleListSidebar } from "./components/PlatformRoles/RoleListSidebar";
import { PermissionsTab } from "./components/PlatformRoles/PermissionsTab";
import { HierarchyTab } from "./components/PlatformRoles/HierarchyTab";
import { CreateRoleModal } from "./components/PlatformRoles/CreateRoleModal";

export default function PlatformRolesView() {
  const {
    permissionModules,
    isPermsLoading,
    permSearch,
    setPermSearch,
    filteredModules,
    fetchPermissions
  } = usePlatformPermissions();

  const {
    roles,
    isLoading,
    selectedRoleId,
    setSelectedRoleId,
    activeTab,
    isCreating,
    setIsCreating,
    isSaving,
    isSyncing,
    roleSearch,
    setRoleSearch,
    childRoleIds,
    fetchRoles,
    selectedRole,
    filteredRoles,
    isCurrentTabDirty,
    isPermissionsDirty,
    isHierarchyDirty,
    handleTabChange,
    handleDiscardChanges,
    handleDeleteRole,
    togglePermission,
    toggleChildRole,
    handleSyncCache,
    onHandleChange
  } = usePlatformRoles({ fetchPermissions });

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchPermissions();
      fetchRoles();
    });
  }, [fetchPermissions, fetchRoles]);

  if (isLoading && roles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="font-bold text-slate-400 tracking-widest uppercase text-xs">Authenticating Master Registry...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">
      
      {/* --- HEADER SECTION --- */}
      <PlatformRolesHeader 
        isSyncing={isSyncing}
        handleSyncCache={handleSyncCache}
        setIsCreating={setIsCreating}
      />

      {/* --- MAIN INTERFACE --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* --- SIDEBAR --- */}
        <RoleListSidebar 
          roleSearch={roleSearch}
          setRoleSearch={setRoleSearch}
          filteredRoles={filteredRoles}
          selectedRoleId={selectedRoleId}
          setSelectedRoleId={setSelectedRoleId}
        />

        {/* --- MAIN CONTENT AREA --- */}
        <div className="lg:col-span-8 bg-white rounded-[40px] shadow-sm border border-slate-100 flex flex-col min-h-[750px] overflow-hidden">
          {selectedRole ? (
            <>
              <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center text-white shadow-xl">
                        <Lock size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                           <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{selectedRole.name}</h2>
                           <Tooltip content="THIS IS A PLATFORM-WIDE MASTER ROLE TEMPLATE. CHANGES AFFECT ALL TENANTS.">
                              <HelpCircle size={16} className="text-slate-300 hover:text-indigo-500 transition-colors" />
                           </Tooltip>
                        </div>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                          {selectedRole.description || "GLOBAL SYSTEM CORE POLICY"}
                        </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isCurrentTabDirty && (
                      <button onClick={handleDiscardChanges} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-all">DISCARD</button>
                    )}
                    <Button 
                      disabled={isSaving || !isCurrentTabDirty}
                      onClick={onHandleChange}
                      className={`font-black px-8 py-4 rounded-2xl flex items-center gap-2 shadow-lg transition-all active:scale-95 uppercase text-[10px] tracking-widest ${
                        isCurrentTabDirty ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200" : "bg-slate-100 text-slate-400 shadow-none cursor-default"
                      }`}
                    >
                      {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} strokeWidth={2.5} />} 
                      {isCurrentTabDirty ? "PUSH CHANGES" : "POLICY SYNCED"}
                    </Button>
                    <Tooltip content="PERMANENTLY DELETE THIS MASTER ROLE FROM THE REGISTRY.">
                       <button onClick={() => handleDeleteRole(selectedRole.id)} className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent">
                         <Trash2 size={20} />
                       </button>
                    </Tooltip>
                  </div>
                </div>

                 <div className="flex p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/50 w-fit">
                  <button
                    onClick={() => handleTabChange("permissions")}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 relative ${
                      activeTab === "permissions" ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <ShieldAlert size={14} /> CAPABILITIES MATRIX
                    {isPermissionsDirty && <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />}
                  </button>
                  <button
                    onClick={() => handleTabChange("hierarchy")}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 relative ${
                      activeTab === "hierarchy" ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <GitBranch size={14} /> GLOBAL HIERARCHY
                    {isHierarchyDirty && <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                {activeTab === "permissions" ? (
                  <PermissionsTab 
                    permSearch={permSearch}
                    setPermSearch={setPermSearch}
                    isPermsLoading={isPermsLoading}
                    filteredModules={filteredModules}
                    selectedRole={selectedRole}
                    isSaving={isSaving}
                    togglePermission={togglePermission}
                  />
                ) : (
                  <HierarchyTab 
                    selectedRole={selectedRole}
                    roles={roles}
                    childRoleIds={childRoleIds}
                    toggleChildRole={toggleChildRole}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
               <ShieldAlert size={48} className="mb-4 opacity-10" />
               <p className="font-black uppercase tracking-[0.3em] text-[10px] opacity-40">LOCKED • SELECT CORE POLICY</p>
            </div>
          )}
        </div>
      </div>

      {/* --- CREATE ROLE MODAL --- */}
      {isCreating && (
        <CreateRoleModal 
          setIsCreating={setIsCreating}
          onSuccess={fetchRoles}
        />
      )}
    </div>
  );
}
