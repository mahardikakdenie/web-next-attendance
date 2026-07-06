"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import Avatar from "@/components/ui/Avatar";
import { getProfileImage } from "@/lib/utils";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserProfile() {
  const { user, logout } = useAuthStore();
  const isLoading = !user;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
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
            className={`w-10 h-10 rounded-full shadow-sm ring-2 transition-all duration-300 ${isOpen ? 'ring-blue-500 shadow-md' : 'ring-transparent group-hover:ring-blue-100 group-hover:shadow-md'}`}
          />
          {!isLoading && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
          )}
        </div>
      </div>

      {/* Dropdown Menu (Glassmorphism & Micro-animation) */}
      <div
        className={`absolute right-0 mt-3 w-64 bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-[24px] shadow-xl shadow-slate-200/50 py-2 z-50 origin-top-right transition-all duration-300 ease-out ${isOpen && !isLoading
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 -translate-y-2 pointer-events-none'
          }`}
      >
        {/* User Info Header */}
        <div className="px-4 py-3 border-b border-slate-100/80 mb-2">
          <p className="text-sm font-bold text-slate-900 truncate">
            {user?.name}
          </p>
          <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
            {user?.email}
          </p>
        </div>

        {/* Menu Items */}
        <div className="px-2 space-y-1">
          <Link
            href="/request-profile-update"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 rounded-2xl hover:bg-slate-100/80 hover:text-blue-600 transition-colors"
          >
            <User className="w-4 h-4" />
            Informasi Akun
          </Link>

          <Link
            href="/request-profile-update"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 rounded-2xl hover:bg-slate-100/80 hover:text-blue-600 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Pengaturan
          </Link>
        </div>

        <div className="px-2 mt-2 pt-2 border-t border-slate-100/80">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-600 rounded-2xl hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
