"use client";

import React from "react";
import { useAuthStore } from "@/store/auth.store";
import Avatar from "@/components/ui/Avatar";
import { getProfileImage } from "@/lib/utils";

export default function UserProfile() {
  const { user } = useAuthStore();
  const isLoading = !user;

  return (
    <div className="flex items-center gap-3 cursor-pointer group">
      <div className="text-right hidden md:block">
        {isLoading ? (
          <div className="space-y-1.5">
            <div className="h-3 w-20 bg-slate-200 animate-pulse rounded" />
            <div className="h-2 w-12 bg-slate-100 animate-pulse rounded ml-auto" />
          </div>
        ) : (
          <>
            <p className="text-sm font-black text-slate-900 tracking-tight leading-none">
              {user?.name}
            </p>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {user?.role?.name === 'employee' ? 'Team Member' : user?.role?.name}
            </span>
          </>
        )}
      </div>

      <div className="relative">
        <Avatar 
          src={getProfileImage(user?.media_url)} 
          name={user?.name}
          className="w-10 h-10 rounded-full shadow-sm group-hover:shadow-md ring-2 ring-transparent group-hover:ring-blue-100 transition-all duration-300"
        />
        {!isLoading && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
        )}
      </div>
    </div>
  );
}
