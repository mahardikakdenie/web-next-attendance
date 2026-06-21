"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search, Command, X, ArrowRight } from "lucide-react";
import { useAuthStore, RoleName } from "@/store/auth.store";
import { quickLinks } from "@/config/search-links";
import { useQuery } from "@tanstack/react-query";
import { getMyMenus } from "@/service/menu";
import { getIcon } from "@/lib/iconMap";
import { DynamicMenuItem } from "@/types/api";

export default function GlobalSearch() {
  const { user } = useAuthStore();
  const role = (user?.role?.base_role?.toLowerCase() || user?.base_role?.toLowerCase() || user?.role?.name?.toLowerCase()) as RoleName | undefined;

  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const modalInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch dynamic menus
  const { data: menuResp } = useQuery({
    queryKey: ["my-menus"],
    queryFn: getMyMenus,
    enabled: isMounted && !!user,
  });

  const dynamicLinks = useMemo(() => {
    if (!user || !menuResp?.data) return [];

    const rawMenus = menuResp.data;

    const isSuperadmin = 
      user?.tenant_id === 1 || 
      user?.role?.base_role === "SUPERADMIN" || 
      user?.base_role === "SUPERADMIN";

    const hasSettingsManage = user?.permissions?.includes("settings.manage") || user?.is_owner;
    const isTenantAdmin = hasSettingsManage || user?.is_owner || user?.role?.base_role === "ADMIN";
    
    const isSuspended = user?.tenant?.is_suspended || user?.billing_health?.lock_website || false;
    const subStatus = user?.subscription?.status;
    const isBlocked = !isSuperadmin && (isSuspended || (subStatus !== undefined && subStatus !== "Active" && subStatus !== "Trial"));

    let filtered = rawMenus;
    if (isBlocked && isTenantAdmin) {
      filtered = rawMenus.map(group => {
        const allowedChildren = group.children?.filter(item => {
          const path = item.path || "";
          return path === "/tenant-settings/billing" || path.startsWith("/support");
        }) || [];
        
        const groupPath = group.path || "";
        const isGroupAllowed = groupPath === "/tenant-settings/billing" || groupPath.startsWith("/support");
        
        if (allowedChildren.length > 0 || isGroupAllowed) {
          return {
            ...group,
            children: group.children ? allowedChildren : undefined
          };
        }
        return null;
      }).filter(Boolean) as DynamicMenuItem[];
    }

    const list: Array<{ title: string; description: string; path: string; icon: any }> = [];
    const traverse = (arr: DynamicMenuItem[]) => {
      for (const item of arr) {
        if (item.path) {
          const matchedStatic = quickLinks.find(link => link.path === item.path);
          list.push({
            title: item.label,
            description: matchedStatic?.description || `Navigate to ${item.label}`,
            path: item.path,
            icon: getIcon(item.icon),
          });
        }
        if (item.children && item.children.length > 0) {
          traverse(item.children);
        }
      }
    };
    traverse(filtered);
    return list;
  }, [menuResp, user]);

  const filteredResults = useMemo(() => {
    if (!role) return [];
    const base = dynamicLinks.length > 0 
      ? dynamicLinks 
      : quickLinks.filter(link => link.roles.includes(role));
      
    if (!searchQuery) return base;
    
    const lowerQuery = searchQuery.toLowerCase();
    return base.filter(link => 
      link.title.toLowerCase().includes(lowerQuery) || 
      link.description.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery, role, dynamicLinks]);

  const handleRedirect = useCallback((path: string) => {
    router.push(path);
    setIsModalOpen(false);
    setSearchQuery("");
  }, [router]);

  const toggleModal = useCallback((open: boolean) => {
    setIsModalOpen(open);
    if (open) {
      setActiveIndex(0);
    }
  }, []);

  // Global Hotkey (Command+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleModal(true);
      }
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleModal]);

  // Keyboard Navigation inside Modal
  useEffect(() => {
    if (!isModalOpen) return;
    
    const handleModalKeys = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev < filteredResults.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter' && filteredResults[activeIndex]) {
        handleRedirect(filteredResults[activeIndex].path);
      }
    };

    window.addEventListener('keydown', handleModalKeys);
    return () => window.removeEventListener('keydown', handleModalKeys);
  }, [isModalOpen, activeIndex, filteredResults, handleRedirect]);

  // Focus management
  useEffect(() => {
    if (isModalOpen) {
      const timer = setTimeout(() => modalInputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen]);

  return (
    <>
      {/* Navbar Search Trigger */}
      <button 
        onClick={() => toggleModal(true)}
        className="hidden lg:flex items-center gap-3 bg-slate-50 hover:bg-slate-100/80 px-4 py-2.5 rounded-2xl border border-slate-200/50 transition-all w-72 group text-left shadow-sm"
      >
        <Search size={16} className="text-slate-400 group-hover:text-blue-500" />
        <span className="text-sm font-semibold text-slate-400 flex-1">Search anything...</span>
        <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-md border border-slate-200 shadow-sm">
          <Command size={10} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-400">K</span>
        </div>
      </button>

      {/* --- COMMAND PALETTE MODAL --- */}
      {isModalOpen && isMounted && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-start justify-center pt-[14vh] px-4 md:px-0"
          role="dialog"
          aria-modal="true"
          aria-label="Global Search Command Palette"
        >
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/45 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Modal Card */}
          <div className="relative w-full max-w-xl bg-white rounded-[24px] shadow-[0_32px_96px_-24px_rgba(15,23,42,0.22)] ring-1 ring-slate-100 overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-200 flex flex-col max-h-[60vh] z-10">
            
            {/* Search Header */}
            <div className="flex items-center gap-3.5 px-5 py-4.5 border-b border-slate-100">
              <Search className="text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" size={20} strokeWidth={2} />
              <input 
                ref={modalInputRef}
                type="text" 
                role="combobox"
                aria-expanded={isModalOpen}
                aria-controls="search-results-list"
                aria-autocomplete="list"
                placeholder="Where would you like to go?"
                className="flex-1 bg-transparent border-none outline-none text-base font-medium text-slate-800 placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="flex items-center gap-1">
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="p-1 hover:bg-slate-100 rounded-md text-slate-400 transition-colors mr-1"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-slate-50 rounded border border-slate-200 text-[10px] font-medium text-slate-400 shadow-sm leading-none">ESC</kbd>
              </div>
            </div>

            {/* Results List */}
            <div 
              id="search-results-list"
              role="listbox"
              className="flex-1 overflow-y-auto p-2.5 custom-scrollbar"
            >
              {filteredResults.length > 0 ? (
                <div className="space-y-1">
                  <div className="px-3.5 py-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400/80">Applications & Pages</span>
                  </div>
                  {filteredResults.map((result, idx) => {
                    const Icon = result.icon;
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={idx}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => handleRedirect(result.path)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-[16px] transition-all duration-150 text-left border ${
                          isActive 
                          ? "bg-slate-50 border-slate-200/50 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.03)]" 
                          : "bg-transparent border-transparent text-slate-600 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                          isActive 
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                          : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                        }`}>
                          <Icon size={20} strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm tracking-tight mb-0.5 ${isActive ? "text-slate-900" : "text-slate-700"}`}>
                            {result.title}
                          </p>
                          <p className="text-xs font-normal text-slate-400 truncate">
                            {result.description}
                          </p>
                        </div>
                        <div className="shrink-0 w-5 h-5 flex items-center justify-center">
                          {isActive && <ArrowRight size={14} className="text-slate-400 animate-in slide-in-from-left-1 duration-150" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                    <Search size={22} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">No results found</p>
                  <p className="text-xs text-slate-400 mt-1">We couldn&lsquo;t find anything matching &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4.5">
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200/80 text-[10px] font-semibold text-slate-500 shadow-sm leading-none">↵</kbd>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Select</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    <kbd className="px-1 py-0.5 bg-white rounded border border-slate-200/80 text-[9px] font-semibold text-slate-500 shadow-sm leading-none">↑</kbd>
                    <kbd className="px-1 py-0.5 bg-white rounded border border-slate-200/80 text-[9px] font-semibold text-slate-500 shadow-sm leading-none">↓</kbd>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Navigate</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200/80 text-[10px] font-semibold text-slate-500 shadow-sm leading-none">ESC</kbd>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Close</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
