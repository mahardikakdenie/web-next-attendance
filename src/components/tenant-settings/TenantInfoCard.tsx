"use client";

import React from "react";
import { Building2, Hash, Calendar, ShieldCheck, Globe } from "lucide-react";
import dayjs from "dayjs";

interface TenantInfoCardProps {
  tenant: {
    id: number;
    name: string;
    code: string;
    is_active: boolean;
    created_at: string;
  };
}

export default function TenantInfoCard({ tenant }: TenantInfoCardProps) {
  return (
    <div className="bg-white rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all flex flex-col h-full">
      <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
            <Building2 size={20} className="md:size-[24px]" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Tenant Identity</h3>
            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 md:mt-1">Core organizational data</p>
          </div>
        </div>
        <div className={`px-3 md:px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border ${
          tenant.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
        }`}>
          {tenant.is_active ? "Active" : "Inactive"}
        </div>
      </div>

      <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 flex-1">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
              <Globe size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Company Name</p>
              <p className="text-sm font-bold text-slate-700 truncate">{tenant.name}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
              <Hash size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tenant Code</p>
              <p className="text-sm font-bold text-slate-700 font-mono truncate">{tenant.code}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Created At</p>
              <p className="text-sm font-bold text-slate-700">{dayjs(tenant.created_at).format("DD MMM YYYY")}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Platform ID</p>
              <p className="text-sm font-bold text-slate-700">#{tenant.id.toString().padStart(4, '0')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
