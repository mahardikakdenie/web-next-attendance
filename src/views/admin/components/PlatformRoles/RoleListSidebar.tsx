import React from "react";
import { Search, SearchX, ChevronRight, Lock } from "lucide-react";
import Input from "@/components/ui/Input";
import { Role } from "@/types/api";
import { getRoleBadgeColor } from "@/lib/utils";

interface RoleListSidebarProps {
  roleSearch: string;
  setRoleSearch: (val: string) => void;
  filteredRoles: Role[];
  selectedRoleId: number | null;
  setSelectedRoleId: (id: number) => void;
}

export function RoleListSidebar({
  roleSearch,
  setRoleSearch,
  filteredRoles,
  selectedRoleId,
  setSelectedRoleId
}: RoleListSidebarProps) {
  return (
    <div className="lg:col-span-4 space-y-4">
      <div className="bg-white rounded-[32px] border border-slate-100 p-4 shadow-sm">
        <Input 
          type="text" 
          placeholder="SEARCH REGISTRY..." 
          value={roleSearch}
          onChange={e => setRoleSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          variant="ghost"
          size="sm"
        />
      </div>
      
      <div className="space-y-3">
        {filteredRoles.length > 0 ? filteredRoles.map((role) => (
          <button
            key={role.id}
            onClick={() => setSelectedRoleId(role.id)}
            className={`w-full flex items-center gap-4 p-5 rounded-[32px] transition-all duration-300 text-left border group ${
              selectedRoleId === role.id 
              ? "bg-white border-indigo-200 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-100" 
              : "bg-slate-50/50 border-transparent hover:border-slate-200 hover:bg-white"
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
              selectedRoleId === role.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "bg-white text-slate-400 border border-slate-100 group-hover:bg-slate-50"
            }`}>
              <Lock size={24} strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-black text-sm tracking-tight mb-1 uppercase ${selectedRoleId === role.id ? "text-slate-900" : "text-slate-600"}`}>
                {role.name}
              </p>
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${getRoleBadgeColor(role.base_role)}`}>
                  {role.base_role}
                </span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter opacity-60">MASTER BLUEPRINT</span>
              </div>
            </div>
            <ChevronRight size={18} className={`transition-all ${selectedRoleId === role.id ? "text-indigo-500 translate-x-0" : "text-slate-300 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"}`} />
          </button>
        )) : (
          <div className="p-10 text-center bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
            <SearchX size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">EMPTY REGISTRY</p>
          </div>
        )}
      </div>
    </div>
  );
}
