import React from "react";
import { GitBranch, HelpCircle, Lock, CheckCircle2, ArrowRightLeft } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import { Role } from "@/types/api";
import { getRoleBadgeColor } from "@/lib/utils";

interface HierarchyTabProps {
  selectedRole: Role;
  roles: Role[];
  childRoleIds: number[];
  toggleChildRole: (id: number) => void;
}

export function HierarchyTab({
  selectedRole,
  roles,
  childRoleIds,
  toggleChildRole
}: HierarchyTabProps) {
  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
         <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10">
               <GitBranch size={32} className="text-indigo-400" />
            </div>
            <div>
               <h3 className="text-xl font-black uppercase tracking-widest">MASTER BLUEPRINT TREE</h3>
               <p className="text-slate-400 text-xs font-bold mt-1 uppercase opacity-60">GLOBAL INHERITANCE ARCHITECTURE</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
         <div className="space-y-4">
            <div className="flex items-center gap-2 ml-2">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">VISUAL BLUEPRINT</span>
               <Tooltip content="INHERITANCE DIAGRAM FOR THE SELECTED MASTER ROLE.">
                  <HelpCircle size={12} className="text-slate-300" />
               </Tooltip>
            </div>
            <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 flex flex-col items-center">
               <div className="w-48 p-4 rounded-2xl bg-white border border-indigo-200 shadow-xl shadow-indigo-500/5 flex flex-col items-center text-center ring-1 ring-indigo-50">
                  <Badge className={`border-none mb-2 text-[9px] font-black ${getRoleBadgeColor(selectedRole.base_role)}`}>{selectedRole.base_role}</Badge>
                  <p className="font-black text-sm text-slate-900 uppercase">{selectedRole.name}</p>
               </div>
               <div className="h-12 w-px bg-slate-200"></div>
               <div className="w-full grid grid-cols-2 gap-4">
                  {childRoleIds.length > 0 ? childRoleIds.map(id => {
                    const child = roles.find(r => r.id === id);
                    return (
                      <div key={id} className="p-3 rounded-xl bg-white border border-slate-100 shadow-sm text-center">
                         <p className="font-black text-[10px] text-slate-600 uppercase truncate">{child?.name}</p>
                      </div>
                    );
                  }) : (
                    <div className="col-span-2 p-6 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">NULL INHERITANCE</p>
                    </div>
                  )}
               </div>
            </div>
         </div>

         <div className="space-y-4">
            <div className="flex items-center gap-2 ml-2">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">REGISTRY OPTIONS</span>
            </div>
            <div className="space-y-2">
               {roles.filter(r => r.id !== selectedRole.id).map(r => (
                 <button
                   key={r.id}
                   onClick={() => toggleChildRole(r.id)}
                   className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${
                     childRoleIds.includes(r.id) ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-100 hover:border-slate-200"
                   }`}
                 >
                    <div className="flex items-center gap-3">
                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${childRoleIds.includes(r.id) ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                          <Lock size={16} />
                       </div>
                       <p className={`text-xs font-black uppercase tracking-tight ${childRoleIds.includes(r.id) ? "text-indigo-700" : "text-slate-600"}`}>{r.name}</p>
                    </div>
                    {childRoleIds.includes(r.id) ? (
                      <CheckCircle2 size={18} className="text-indigo-600" />
                    ) : (
                      <ArrowRightLeft size={16} className="text-slate-300" />
                    )}
                  </button>
               ))}
             </div>
          </div>
       </div>
    </div>
  );
}
