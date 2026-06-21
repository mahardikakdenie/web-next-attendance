"use client";

import React from "react";
import { Globe } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import Breadcrumbs from "@/components/layouts/navbar/Breadcrumbs";
import GlobalSearch from "@/components/layouts/navbar/GlobalSearch";
import TenantSwitcher from "@/components/layouts/navbar/TenantSwitcher";
import UserProfile from "@/components/layouts/navbar/UserProfile";

export default function TopNavbar() {
  return (
    <div className="flex h-16 md:h-20 items-center justify-between px-6 md:px-8 bg-transparent">
      
      {/* Left: Breadcrumb & Search Context */}
      <div className="flex items-center gap-6">
        <Breadcrumbs />
        <GlobalSearch />
        <TenantSwitcher />
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-1 sm:gap-2">
          <button className="hidden sm:flex p-2.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100/80 rounded-xl transition-all">
            <Globe size={18} strokeWidth={2.5} />
          </button>
          <NotificationDropdown />
        </div>

        <div className="w-px h-6 bg-slate-200 hidden sm:block" />

        <UserProfile />
      </div>
    </div>
  );
}
