"use client";

import { useAuthStore, ROLES, RoleName } from "@/store/auth.store";
import Image from "next/image";
import { 
  Bell, 
  ChevronDown, 
  Building2, 
  Search,
  Globe,
  Command,
  LayoutGrid,
  X,
  ArrowRight,
  History,
  CalendarDays,
  Wallet,
  Users,
  ShieldCheck,
  TrendingUp,
  Clock,
  Settings,
  UserCog,
  ShieldAlert
} from "lucide-react";
import { getProfileImage } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useMemo, useEffect, useRef, useCallback, Fragment } from "react";
import { SearchLink, BreadcrumbSegment } from "@/types/layout";

export default function TopNavbar() {
  const { user } = useAuthStore();
  const role = user?.role?.name as RoleName | undefined;
  const isPlatformAdmin = role === ROLES.SUPERADMIN || role === ROLES.ADMIN;
  
  const pathname = usePathname();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const modalInputRef = useRef<HTMLInputElement>(null);

  const isLoading = !user;

  // --- Dynamic Breadcrumbs Logic ---
  const breadcrumbs = useMemo((): BreadcrumbSegment[] => {
    if (!pathname || pathname === "/") {
      return [
        { label: "Dashboard", isLast: false },
        { label: "Overview", isLast: true }
      ];
    }
    
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((segment, idx) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      isLast: idx === segments.length - 1
    }));
  }, [pathname]);

  // --- Search Data Definition ---
  const quickLinks: SearchLink[] = useMemo(() => [
    { 
      title: "My Workspace", 
      description: "Personal dashboard for attendance and daily tasks.",
      path: "/", 
      roles: [ROLES.USER, ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR, ROLES.FINANCE],
      icon: UserCog
    },
    { 
      title: "Attendance Dashboard", 
      description: "Monitor organization-wide real-time attendance logs.",
      path: "/attendances", 
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR],
      icon: CalendarDays
    },
    { 
      title: "Payroll Center", 
      description: "Manage salaries, tax compliance, and download payslips.",
      path: "/payroll", 
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR, ROLES.FINANCE, ROLES.USER],
      icon: Wallet
    },
    { 
      title: "HR Analytics", 
      description: "Advanced insights into workforce performance and behavior.",
      path: "/analytics", 
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR, ROLES.FINANCE],
      icon: TrendingUp
    },
    { 
      title: "Manage Employees", 
      description: "View and edit organization employee directory.",
      path: "/employees", 
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR],
      icon: Users
    },
    { 
      title: "Leave Approvals", 
      description: "Review and approve employee time-off and leave requests.",
      path: "/leaves", 
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR],
      icon: History
    },
    { 
      title: "Overtime Requests", 
      description: "Monitor and manage employee overtime submissions.",
      path: "/overtime", 
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR],
      icon: Clock
    },
    { 
      title: "Tenant Settings", 
      description: "Configure organization rules and geofence radius.",
      path: "/tenant-settings", 
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN],
      icon: Settings
    },
    { 
      title: "Organization Roles", 
      description: "Manage organizational roles, granular permissions, and hierarchy.",
      path: "/tenant-settings/roles", 
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN],
      icon: ShieldAlert
    },
    { 
      title: "Organization Tenants", 
      description: "Manage global platform organization instances.",
      path: "/admin/tenants", 
      roles: [ROLES.SUPERADMIN],
      icon: Building2
    },
    { 
      title: "Platform Accounts", 
      description: "System-level administrator account management.",
      path: "/admin/accounts", 
      roles: [ROLES.SUPERADMIN],
      icon: ShieldCheck
    },
  ], []);

  const filteredResults = useMemo(() => {
    if (!role) return [];
    const base = quickLinks.filter(link => link.roles.includes(role));
    if (!searchQuery) return base;
    
    const lowerQuery = searchQuery.toLowerCase();
    return base.filter(link => 
      link.title.toLowerCase().includes(lowerQuery) || 
      link.description.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery, role, quickLinks]);

  // --- Handlers ---
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

  // --- Side Effects ---
  
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
    <div className="flex h-16 md:h-20 items-center justify-between px-6 md:px-8 bg-transparent">
      
      {/* Left: Breadcrumb & Search Context */}
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-400 capitalize">
          <LayoutGrid size={16} className="text-slate-300" />
          {breadcrumbs.map((crumb, idx) => (
            <Fragment key={idx}>
              <span className={crumb.isLast ? "text-slate-800" : "text-slate-400"}>
                {crumb.label}
              </span>
              {!crumb.isLast && <span className="text-slate-300">/</span>}
            </Fragment>
          ))}
        </div>

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

        {/* Multi-Tenant Switcher */}
        {isPlatformAdmin && !isLoading && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 rounded-xl border border-blue-100/50 cursor-pointer hover:bg-blue-50 transition-colors group">
            <div className="relative w-5 h-5 rounded-md overflow-hidden flex items-center justify-center bg-white border border-blue-100 shadow-xs">
              {user?.tenant_setting?.tenant_logo ? (
                <Image 
                  src={user.tenant_setting.tenant_logo} 
                  alt="Tenant Logo" 
                  fill 
                  className="object-cover"
                />
              ) : (
                <Building2 size={12} className="text-blue-500" />
              )}
            </div>
            <span className="text-xs font-bold text-blue-700 leading-tight">{user?.tenant?.name ?? 'Global System'}</span>
            <ChevronDown size={12} className="text-blue-400 group-hover:translate-y-0.5 transition-transform" />
          </div>
        )}
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4 sm:gap-6">
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
              <Image
                src={getProfileImage(user?.media_url)}
                width={40}
                height={40}
                alt="User profile"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            {!isLoading && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
            )}
          </div>
        </div>
      </div>

      {/* --- COMMAND PALETTE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Modal Card */}
          <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-white ring-1 ring-slate-200/50 overflow-hidden animate-in zoom-in-95 slide-in-from-top-8 duration-300 flex flex-col max-h-[60vh]">
            
            {/* Search Header */}
            <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <Search className="text-blue-600" size={22} strokeWidth={2.5} />
              <input 
                ref={modalInputRef}
                type="text" 
                placeholder="Where would you like to go?"
                className="flex-1 bg-transparent border-none outline-none text-lg font-bold text-slate-900 placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200/50 rounded-xl text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
              {filteredResults.length > 0 ? (
                <div className="space-y-1">
                  <div className="px-4 py-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Applications & Pages</span>
                  </div>
                  {filteredResults.map((result, idx) => {
                    const Icon = result.icon;
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleRedirect(result.path)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 text-left group ${
                          isActive 
                          ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30" 
                          : "hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isActive ? "bg-white/20" : "bg-slate-100 text-slate-500 group-hover:bg-white"
                        }`}>
                          <Icon size={24} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-black text-sm tracking-tight leading-none mb-1 ${isActive ? "text-white" : "text-slate-900"}`}>
                            {result.title}
                          </p>
                          <p className={`text-xs font-medium truncate ${isActive ? "text-blue-100" : "text-slate-400"}`}>
                            {result.description}
                          </p>
                        </div>
                        {isActive && <ArrowRight size={18} className="shrink-0 animate-in slide-in-from-left-2 duration-300" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                    <Search size={32} className="text-slate-300" />
                  </div>
                  <p className="text-lg font-bold text-slate-900">No results found</p>
                  <p className="text-sm text-slate-400 mt-1">We couldn&lsquo;t find anything matching &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 bg-white rounded-md border border-slate-200 text-[10px] font-black text-slate-500 shadow-sm">↵</kbd>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex flex-col gap-0.5">
                    <kbd className="px-1.5 py-0.5 bg-white rounded-md border border-slate-200 text-[8px] font-black text-slate-500 shadow-sm leading-none">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-white rounded-md border border-slate-200 text-[8px] font-black text-slate-500 shadow-sm leading-none">↓</kbd>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Navigate</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-2 py-1 bg-white rounded-md border border-slate-200 text-[10px] font-black text-slate-500 shadow-sm">ESC</kbd>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
