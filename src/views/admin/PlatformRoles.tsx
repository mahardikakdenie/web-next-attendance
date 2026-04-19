"use client";

import { useState } from "react";
import { 
  ShieldAlert, 
  Plus, 
  Search, 
  Settings2, 
  Lock, 
  CheckCircle2, 
  MoreVertical,
  Wand2,
  Trash2,
  Save,
  X
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSystemRoles } from "@/service/roles";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Role } from "@/types/api";

export default function PlatformRolesView() {
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // 1. Fetch System Roles
  const { data: rolesResp, isLoading } = useQuery({
    queryKey: ["system-roles"],
    queryFn: getSystemRoles,
  });

  const columns: Column<Role>[] = [
    {
      header: "System Role",
      accessor: (item) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
            <Lock size={18} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.name}</p>
            <p className="text-[11px] font-medium text-slate-400 max-w-xs truncate">{item.description}</p>
          </div>
        </div>
      ),
      sortable: true
    },
    {
      header: "Permissions Count",
      accessor: (item) => (
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 font-black">
          {item.permissions?.length || 0} Capabilities
        </Badge>
      )
    },
    {
      header: "Visibility",
      accessor: () => (
        <div className="flex items-center gap-1.5 text-emerald-600">
          <CheckCircle2 size={14} strokeWidth={3} />
          <span className="text-[10px] font-black uppercase tracking-widest">Global Master</span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 mb-1">
            <ShieldAlert size={14} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Security Blueprint</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight sm:text-5xl">System Governance</h1>
          <p className="text-slate-500 font-medium max-w-xl leading-relaxed">
            Define global access policies and permission structures. Changes made here ripple across all organization tenants.
          </p>
        </div>

        <Button className="flex items-center gap-2 bg-slate-900 text-white hover:bg-indigo-600 shadow-xl shadow-slate-200 px-8 py-4 rounded-[20px] transition-all active:scale-95 group">
          <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-black text-sm uppercase tracking-wide">Create Master Role</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Roles Table */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Search master roles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 h-12 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div className="flex gap-2">
               <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all"><Settings2 size={20} /></button>
            </div>
          </div>

          <DataTable 
            data={rolesResp?.data || []} 
            columns={columns} 
            isLoading={isLoading}
            onRowClick={(item) => setSelectedRole(item)}
            limit={limit}
            onLimitChange={setLimit}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            actions={(item) => (
              <button 
                onClick={() => setSelectedRole(item)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              >
                <MoreVertical size={18} />
              </button>
            )}
          />
        </div>

        {/* Right Side: Quick Insight / Selection */}
        <div className="lg:col-span-4 space-y-6">
          {selectedRole ? (
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden animate-in slide-in-from-right-4 duration-500">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
               
               <div className="relative z-10 space-y-8">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black uppercase tracking-tight text-blue-400">{selectedRole.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Active Master Policy</p>
                    </div>
                    <button onClick={() => setSelectedRole(null)} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                       <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic">
                      &ldquo;{selectedRole.description}&rdquo;
                    </p>
                    
                    <div className="pt-4 border-t border-white/5 space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">Entitled Permissions</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedRole.permissions?.map((p) => (
                          <span key={p.id} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-slate-300">
                            {p.id.split('.').join(' ')}
                          </span>
                        )) || <span className="text-xs italic text-slate-600">No specific permissions</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6">
                    <Button variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/5 rounded-2xl h-12 text-[11px]">
                       <Wand2 size={14} className="mr-2" /> Modify Matrix
                    </Button>
                    <button className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                       <Trash2 size={18} />
                    </button>
                  </div>
               </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] p-10 border border-dashed border-slate-200 text-center space-y-6">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                <ShieldAlert size={32} />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-black text-slate-900">Selection Required</h4>
                <p className="text-xs font-medium text-slate-400 leading-relaxed">
                  Choose a master system role from the list to audit permissions or manage global hierarchies.
                </p>
              </div>
            </div>
          )}

          <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <h4 className="text-base font-black mb-2 flex items-center gap-2">
              <Save size={18} />
              Policy Backup
            </h4>
            <p className="text-xs font-medium text-blue-100 leading-relaxed mb-6">
              Platform roles are immutable by default for tenants. Always maintain a stable core configuration.
            </p>
            <button className="w-full py-3 bg-white text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg transition-all active:scale-95">
              Sync All Tenants
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
