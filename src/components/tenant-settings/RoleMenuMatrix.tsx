"use client";

import React, { useState } from "react";
import { 
  Users, 
  ChevronRight, 
  ChevronDown, 
  LayoutGrid, 
  Eye, 
  SearchX, 
  ShieldCheck,
  Building2
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface MenuNode {
  label: string;
  path?: string;
  children?: MenuNode[];
}

interface RoleOverview {
  role_name: string;
  base_role: string;
  menus: MenuNode[];
}

interface RoleMenuMatrixProps {
  roles: RoleOverview[];
}

export default function RoleMenuMatrix({ roles }: RoleMenuMatrixProps) {
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
  const currentRole = roles[selectedRoleIndex];

  const renderMenuTree = (nodes: MenuNode[], level = 0) => {
    return (
      <div className={`space-y-1 ${level > 0 ? "ml-6 mt-1 border-l border-slate-100 pl-4" : ""}`}>
        {nodes.map((node, i) => {
          const hasChildren = node.children && node.children.length > 0;
          return (
            <div key={i} className="group">
              <div className={`flex items-center gap-3 py-2 px-3 rounded-xl transition-all ${node.path ? "hover:bg-slate-50" : ""}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${node.path ? "bg-blue-500" : "bg-slate-300"}`} />
                <span className={`text-sm ${hasChildren ? "font-black text-slate-900" : "font-bold text-slate-600"}`}>
                  {node.label}
                </span>
                {node.path && (
                  <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                    {node.path}
                  </span>
                )}
              </div>
              {hasChildren && renderMenuTree(node.children!, level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  if (!roles || roles.length === 0) {
    return (
      <div className="bg-white rounded-[40px] border border-slate-100 p-20 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
          <SearchX size={40} />
        </div>
        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Menu Data Available</h4>
        <p className="text-sm font-medium text-slate-400 mt-2">We couldn't retrieve the menu matrix for your organization roles.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-[500px] md:min-h-[600px]">
      {/* Sidebar: Role List */}
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-50 bg-slate-50/30 p-5 md:p-6 lg:p-8 flex flex-col gap-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/10">
            <Users size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Access Matrix</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transparency</p>
          </div>
        </div>

        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 custom-scrollbar-horizontal lg:custom-scrollbar">
          {roles.map((role, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedRoleIndex(idx)}
              className={`flex-shrink-0 lg:w-full flex items-center gap-4 p-3 md:p-4 rounded-[20px] md:rounded-[24px] transition-all group text-left ${
                selectedRoleIndex === idx 
                ? "bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/50" 
                : "hover:bg-white/60 text-slate-500"
              }`}
            >
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${
                selectedRoleIndex === idx ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-white"
              }`}>
                <ShieldCheck size={18} className="md:size-[20px]" />
              </div>
              <div className="flex-1 overflow-hidden pr-2">
                <p className={`text-xs md:text-sm font-black truncate ${selectedRoleIndex === idx ? "text-slate-900" : "text-slate-500"}`}>
                  {role.role_name}
                </p>
                <Badge className="bg-slate-100 text-slate-400 border-none font-black text-[7px] md:text-[8px] mt-0.5 md:mt-1 px-1.5 uppercase whitespace-nowrap">
                  {role.base_role}
                </Badge>
              </div>
              <ChevronRight size={16} className={`hidden lg:block transition-all ${selectedRoleIndex === idx ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Main Area: Menu Tree */}
      <div className="flex-1 p-6 md:p-10 lg:p-12 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-10 pb-6 md:pb-8 border-b border-slate-50">
          <div>
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Eye size={16} strokeWidth={3} />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">Viewing Perspective</span>
            </div>
            <h4 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {currentRole.role_name} <span className="text-slate-300">View</span>
            </h4>
          </div>
          
          <div className="bg-slate-50 px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl border border-slate-100 flex items-center gap-3">
             <Building2 size={14} className="md:size-[16px] text-slate-400" />
             <span className="text-[10px] md:text-xs font-bold text-slate-600">Permissions are enforced per-session</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 md:pr-4">
           {currentRole.menus && currentRole.menus.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-12 gap-y-8 md:gap-y-10">
               {currentRole.menus.map((rootMenu, i) => (
                 <div key={i} className="space-y-4">
                   <div className="flex items-center gap-3 text-slate-900 px-1">
                      <LayoutGrid size={18} className="text-blue-500" />
                      <h5 className="text-xs md:text-sm font-black uppercase tracking-widest">{rootMenu.label}</h5>
                   </div>
                   {rootMenu.children && renderMenuTree(rootMenu.children)}
                 </div>
               ))}
             </div>
           ) : (
             <div className="h-full py-20 flex flex-col items-center justify-center text-center opacity-40 grayscale">
                <SearchX size={48} className="mb-4 text-slate-300" />
                <p className="font-bold text-slate-500">No menus assigned to this role</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
