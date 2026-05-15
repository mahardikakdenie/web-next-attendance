"use client";

import React, { useState, useMemo } from "react";
import { 
  LayoutGrid, 
  Search, 
  Edit3, 
  Loader2, 
  Shield, 
  Plus,
  RefreshCcw,
  ChevronRight,
  ChevronDown,
  Box,
  Hash,
  Globe,
  Lock,
  Layers,
  ArrowRight,
  Filter
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSuperadminMenus } from "@/service/menu";
import { getSystemRoles } from "@/service/roles";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { getIcon } from "@/lib/iconMap";
import EditMenuModal from "@/components/admin/EditMenuModal";
import { Role } from "@/types/api";

export default function MenuManagementView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<any>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | number>("all");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // 1. Fetch System Roles (tenant_id is null)
  const { data: rolesResp, isLoading: isRolesLoading } = useQuery({
    queryKey: ["system-roles"],
    queryFn: getSystemRoles
  });

  // 2. Fetch All Menus
  const { data: menuResp, isLoading: isMenusLoading, refetch, isRefetching } = useQuery({
    queryKey: ["superadmin-menus"],
    queryFn: getSuperadminMenus
  });

  const roles = rolesResp?.data || [];
  const rawMenus = menuResp?.data || [];

  // 3. Build Tree Structure
  const menuTree = useMemo(() => {
    const buildTree = (items: any[], parentId: number | null = null): any[] => {
      return items
        .filter(item => item.parent_id === parentId)
        .map(item => ({
          ...item,
          children: buildTree(items, item.id)
        }))
        .sort((a, b) => a.sort_order - b.sort_order);
    };

    // If search or role filter is active, we might want to flatten or highlight
    // For now, let's build the full tree and apply filtering logic within the tree rendering
    return buildTree(rawMenus);
  }, [rawMenus]);

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEdit = (menu: any) => {
    setSelectedMenu(menu);
    setIsEditModalOpen(true);
  };

  // 4. Recursive Tree Component
  const MenuNode = ({ menu, level = 0 }: { menu: any, level?: number }) => {
    const Icon = getIcon(menu.icon);
    const hasChildren = menu.children && menu.children.length > 0;
    const isExpanded = expandedGroups[menu.id] ?? true;
    
    // Filtering logic: Check if menu matches role filter
    const roleMatch = selectedRoleId === "all" || (menu.allowed_roles && menu.allowed_roles.includes(
      roles.find(r => r.id === selectedRoleId)?.base_role || roles.find(r => r.id === selectedRoleId)?.name.toUpperCase()
    ));

    // Search logic
    const searchMatch = !searchQuery || 
      menu.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      menu.path?.toLowerCase().includes(searchQuery.toLowerCase());

    // If no match and no children match, don't render (simplified for now)
    if (!roleMatch && !hasChildren) return null;
    if (searchQuery && !searchMatch && !hasChildren) return null;

    return (
      <div className="w-full">
        <div 
          className={`group flex items-center gap-4 p-4 rounded-[24px] transition-all hover:bg-slate-50 border border-transparent hover:border-slate-100 ${
            !roleMatch ? "opacity-40 grayscale" : ""
          }`}
          style={{ marginLeft: `${level * 24}px` }}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {hasChildren ? (
              <button 
                onClick={() => toggleGroup(menu.id)}
                className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <div className="w-6" />
            )}

            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
              menu.is_system ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-100"
            }`}>
              <Icon size={18} />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 tracking-tight truncate">{menu.label}</span>
                {menu.is_system && (
                  <Badge className="bg-slate-100 text-slate-400 border-none font-black text-[7px] uppercase px-1.5 py-0">System</Badge>
                )}
              </div>
              <span className="text-[10px] font-mono text-slate-400 truncate">{menu.path || "Group Header"}</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 overflow-hidden max-w-[200px]">
            {menu.allowed_roles?.slice(0, 2).map((role: string) => (
              <Badge 
                key={role} 
                className="bg-indigo-50 text-indigo-600 border-indigo-100 font-black text-[7px] uppercase tracking-widest px-1.5"
              >
                {role}
              </Badge>
            ))}
            {menu.allowed_roles?.length > 2 && (
              <span className="text-[8px] font-black text-slate-300">+{menu.allowed_roles.length - 2}</span>
            )}
          </div>

          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400">
               {menu.sort_order}
             </div>
             <button 
                onClick={() => handleEdit(menu)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition-all active:scale-95 shadow-sm"
              >
                <Edit3 size={16} />
              </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1">
            {menu.children.map((child: any) => (
              <MenuNode key={child.id} menu={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const isLoading = isRolesLoading || isMenusLoading;

  return (
    <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
      {/* Header Section */}
      <section className="relative overflow-hidden bg-slate-950 rounded-[40px] p-8 md:p-12 shadow-2xl text-white">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-600 opacity-20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[11px] font-black tracking-[0.2em] uppercase text-indigo-400">
              <Shield size={16} className="fill-current" />
              Infrastructure Control
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Navigation <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Architecture</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-xl text-sm sm:text-base leading-relaxed">
              Define the skeletal structure of the user experience. Configure role-based visibility and hierarchical sorting.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={() => refetch()}
              variant="secondary"
              className="h-14 w-14 rounded-2xl bg-white/5 border-white/10 text-white flex items-center justify-center p-0 hover:bg-white/10"
              disabled={isRefetching}
            >
              <RefreshCcw size={20} className={isRefetching ? "animate-spin" : ""} />
            </Button>
            <Button 
              className="h-14 px-8 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 group"
            >
              Create Menu
              <Plus size={16} className="ml-2 group-hover:rotate-90 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar: Role Filtering */}
        <aside className="w-full lg:w-72 flex flex-col gap-6">
          <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Filter size={16} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Role Lens</h3>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setSelectedRoleId("all")}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left ${
                  selectedRoleId === "all" 
                  ? "bg-slate-900 text-white shadow-lg" 
                  : "hover:bg-slate-50 text-slate-500"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedRoleId === "all" ? "bg-white/20" : "bg-slate-100"}`}>
                  <Globe size={16} />
                </div>
                <span className="text-xs font-black uppercase tracking-tight">All Roles</span>
              </button>

              {roles.map((role: Role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left ${
                    selectedRoleId === role.id 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                    : "hover:bg-slate-50 text-slate-500"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedRoleId === role.id ? "bg-white/20" : "bg-slate-100"}`}>
                    <Shield size={16} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-black uppercase tracking-tight truncate">{role.name}</p>
                    <p className={`text-[8px] font-bold uppercase opacity-60 ${selectedRoleId === role.id ? "text-white" : "text-slate-400"}`}>System Role</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-indigo-50 rounded-[32px] p-6 border border-indigo-100">
             <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                   <Lock size={16} />
                </div>
                <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Security Note</h4>
             </div>
             <p className="text-[10px] font-bold text-indigo-700/70 leading-relaxed">
                Filtering by role shows which menus are visible to that specific role. Faded items are hidden for the selected role.
             </p>
          </div>
        </aside>

        {/* Main Content: Tree View */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <Layers size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Navigation Tree</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Hierarchical visualization</p>
                </div>
              </div>

              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  placeholder="Search labels or paths..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-slate-50 border-none rounded-2xl font-bold"
                />
              </div>
            </div>

            <div className="p-6 md:p-8 min-h-[400px]">
              {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Building Tree Metadata...</p>
                </div>
              ) : menuTree.length > 0 ? (
                <div className="space-y-2">
                  {menuTree.map((menu: any) => (
                    <MenuNode key={menu.id} menu={menu} />
                  ))}
                </div>
              ) : (
                <div className="h-full py-20 flex flex-col items-center justify-center text-center opacity-40 grayscale">
                  <LayoutGrid size={64} className="mb-4 text-slate-200" />
                  <p className="font-black text-slate-400 uppercase tracking-widest">No navigation elements found</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                 <RefreshCcw size={16} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Hierarchical changes are reflected in the user sidebar in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>

      <EditMenuModal 
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => refetch()}
        menu={selectedMenu}
      />
    </div>
  );
}
