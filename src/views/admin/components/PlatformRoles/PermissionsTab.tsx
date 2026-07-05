import React from "react";
import { Search, X, Loader2, ShieldAlert } from "lucide-react";
import { Switch } from "@/components/ui/Switch";
import { Role } from "@/types/api";

interface PermissionsTabProps {
  permSearch: string;
  setPermSearch: (val: string) => void;
  isPermsLoading: boolean;
  filteredModules: any[];
  selectedRole: Role;
  isSaving: boolean;
  togglePermission: (permissionId: string) => void;
}

export function PermissionsTab({
  permSearch,
  setPermSearch,
  isPermsLoading,
  filteredModules,
  selectedRole,
  isSaving,
  togglePermission
}: PermissionsTabProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Search Permissions */}
      <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input 
          type="text"
          placeholder="SEARCH CAPABILITIES (E.G. 'SUPERADMIN', 'ATTENDANCE')..."
          className="bg-transparent border-none outline-none w-full text-xs font-black uppercase tracking-widest text-slate-700 placeholder:text-slate-300"
          value={permSearch}
          onChange={(e) => setPermSearch(e.target.value)}
        />
        {permSearch && (
          <button onClick={() => setPermSearch("")} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        )}
      </div>

      {isPermsLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SYNCING CAPABILITIES...</p>
        </div>
      ) : filteredModules.map((module) => (
        <div key={module.key} className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100 shadow-inner">
              {module.icon ? <module.icon size={20} strokeWidth={2.5} /> : <ShieldAlert size={20} strokeWidth={2.5} />}
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">{module.name}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {module.permissions.map((perm: any) => (
              <div 
                key={perm.id} 
                className="flex items-center justify-between p-5 rounded-3xl bg-slate-50/50 border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all group"
              >
                <div className="flex-1 pr-4">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{perm.id}</p>
                    {perm.id.includes("superadmin") && (
                      <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded-md text-[8px] font-black tracking-widest uppercase">
                        CRITICAL
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase opacity-60 leading-relaxed mt-0.5">
                    {perm.description || `Capability: ${perm.action || perm.id.split('.').pop()} access`}
                  </p>
                </div>
                <Switch
                  disabled={isSaving}
                  checked={selectedRole.permissions?.some(p => p.id === perm.id) || false}
                  onCheckedChange={() => togglePermission(perm.id)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
