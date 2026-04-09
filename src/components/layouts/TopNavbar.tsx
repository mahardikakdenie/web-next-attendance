'use client';

import { useAuthStore, ROLES } from "@/store/auth.store";
import Image from "next/image";
import { 
  Bell, 
  ChevronDown, 
  Building2, 
  Search,
  Globe,
  Command
} from "lucide-react";
import { getProfileImage } from "@/lib/utils";

export default function TopNavbar() {
  const user = useAuthStore((state) => state.user);
  const role = user?.role?.name;
  const isPlatformAdmin = role === ROLES.SUPERADMIN || role === ROLES.ADMIN;

  const isLoading = !user;

  return (
    <div className="flex h-20 items-center justify-between px-8 bg-white/80 backdrop-blur-xl border-b border-neutral-200 sticky top-0 z-40">
      
      {/* Left: Search & Navigation Context */}
      <div className="flex items-center gap-8">
        <div className="hidden lg:flex items-center gap-3 bg-neutral-100 px-4 py-2.5 rounded-2xl border border-transparent focus-within:border-blue-500/30 focus-within:bg-white transition-all w-80 group">
          <Search size={18} className="text-neutral-400 group-focus-within:text-blue-500" />
          <input 
            type="text" 
            placeholder="Search anything... (Ctrl + K)" 
            className="bg-transparent border-none outline-none text-sm font-medium text-neutral-600 w-full placeholder:text-neutral-400"
          />
          <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-neutral-200 shadow-sm">
            <Command size={10} className="text-neutral-400" />
            <span className="text-[10px] font-bold text-neutral-400">K</span>
          </div>
        </div>

        {/* Multi-Tenant Switcher (For Admins) */}
        {isPlatformAdmin && !isLoading && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-2xl border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors group">
            <Building2 size={16} className="text-blue-600" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Active Tenant</span>
              <span className="text-sm font-bold text-blue-700 leading-tight">{user?.tenant?.name ?? 'Global System'}</span>
            </div>
            <ChevronDown size={14} className="text-blue-400 ml-2 group-hover:translate-y-0.5 transition-transform" />
          </div>
        )}
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-6">
        {/* Quick Actions */}
        <div className="hidden md:flex items-center gap-3 border-r border-neutral-200 pr-6">
          <button className="p-2.5 text-neutral-500 hover:bg-neutral-100 rounded-xl transition-all">
            <Globe size={20} />
          </button>
          <button className="relative p-2.5 text-neutral-500 hover:bg-neutral-100 rounded-xl transition-all">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-4 pl-2">
          <div className="text-right hidden sm:block">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-3 w-24 bg-neutral-200 animate-pulse rounded" />
                <div className="h-2 w-16 bg-neutral-100 animate-pulse rounded ml-auto" />
              </div>
            ) : (
              <>
                <p className="text-sm font-black text-neutral-900 tracking-tight">{user?.name}</p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    {user?.role?.name === 'employee' ? 'Team Member' : user?.role?.name}
                  </span>
                  <div className={`w-1.5 h-1.5 rounded-full ${user?.role?.name === 'superadmin' ? 'bg-indigo-500' : 'bg-green-500'}`} />
                </div>
              </>
            )}
          </div>

          <div className="relative group cursor-pointer">
            <div className="w-11 h-11 rounded-2xl bg-neutral-100 border-2 border-white shadow-sm overflow-hidden group-hover:shadow-md transition-all duration-300">
              {isLoading ? (
                <div className="w-full h-full bg-neutral-200 animate-pulse" />
              ) : (
                <Image
                  src={getProfileImage(user?.media_url)}
                  width={44}
                  height={44}
                  alt="User profile"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
              <ChevronDown size={10} className="text-neutral-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
