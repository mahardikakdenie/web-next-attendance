"use client";

import { useAuthStore, ROLES } from "@/store/auth.store";
import Image from "next/image";
import { 
  Bell, 
  ChevronDown, 
  Building2, 
  Search,
  Globe,
  Command,
  LayoutGrid
} from "lucide-react";
import { getProfileImage } from "@/lib/utils";

export default function TopNavbar() {
  const {user} = useAuthStore();
  const role = user?.role?.name;
  const isPlatformAdmin = role === ROLES.SUPERADMIN || role === ROLES.ADMIN;

  const isLoading = !user;

  return (
    <div className="flex h-16 md:h-20 items-center justify-between px-6 md:px-8 bg-transparent">
      
      {/* Left: Breadcrumb & Search Context */}
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-400">
          <LayoutGrid size={16} className="text-slate-300" />
          <span>Dashboard</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800">Overview</span>
        </div>

        <div className="hidden lg:flex items-center gap-3 bg-slate-50 hover:bg-slate-100/80 px-4 py-2.5 rounded-2xl border border-transparent focus-within:border-blue-500/20 focus-within:bg-white focus-within:shadow-sm focus-within:ring-4 focus-within:ring-blue-500/5 transition-all w-72 group">
          <Search size={16} className="text-slate-400 group-focus-within:text-blue-500" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="bg-transparent border-none outline-none text-sm font-semibold text-slate-600 w-full placeholder:text-slate-400"
          />
          <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-md border border-slate-200 shadow-sm">
            <Command size={10} className="text-slate-400" />
            <span className="text-[10px] font-black text-slate-400">K</span>
          </div>
        </div>

        {/* Multi-Tenant Switcher (For Admins) */}
        {isPlatformAdmin && !isLoading && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 rounded-xl border border-blue-100/50 cursor-pointer hover:bg-blue-50 transition-colors group">
            <Building2 size={14} className="text-blue-500" />
            <span className="text-xs font-bold text-blue-700 leading-tight">{user?.tenant?.name ?? 'Global System'}</span>
            <ChevronDown size={12} className="text-blue-400 group-hover:translate-y-0.5 transition-transform" />
          </div>
        )}
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Quick Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button className="hidden sm:flex p-2.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100/80 rounded-xl transition-all">
            <Globe size={18} strokeWidth={2.5} />
          </button>
          <button className="relative p-2.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100/80 rounded-xl transition-all">
            <Bell size={18} strokeWidth={2.5} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
          </button>
        </div>

        <div className="w-px h-6 bg-slate-200 hidden sm:block" />

        {/* User Profile */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden md:block">
            {isLoading ? (
              <div className="space-y-1.5">
                <div className="h-3 w-20 bg-slate-200 animate-pulse rounded" />
                <div className="h-2 w-12 bg-slate-100 animate-pulse rounded ml-auto" />
              </div>
            ) : (
              <>
                <p className="text-sm font-black text-slate-900 tracking-tight leading-none">{user?.name}</p>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {user?.role?.name === 'employee' ? 'Team Member' : user?.role?.name}
                </span>
              </>
            )}
          </div>

          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-slate-100 shadow-sm overflow-hidden group-hover:shadow-md ring-2 ring-transparent group-hover:ring-blue-100 transition-all duration-300">
              {isLoading ? (
                <div className="w-full h-full bg-slate-200 animate-pulse" />
              ) : (
                <Image
                  src={getProfileImage(user?.media_url)}
                  width={40}
                  height={40}
                  alt="User profile"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              )}
            </div>
            {!isLoading && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
