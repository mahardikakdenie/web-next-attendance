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
  Globe,
  Lock,
  Layers,
  Filter
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSuperadminMenus, getMenusOverview, updateMenu } from "@/service/menu";
import { getSystemRoles } from "@/service/roles";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";

import { toast } from "sonner";
import { getIcon } from "@/lib/iconMap";
import EditMenuModal from "@/components/admin/EditMenuModal";
import { Role, DynamicMenuItem, RoleOverviewMenuNode } from "@/types/api";

type MenuTreeNode = DynamicMenuItem & { children: MenuTreeNode[] };

const isMenuInOverview = (menu: DynamicMenuItem, overviewNodes: RoleOverviewMenuNode[]): boolean => {
  if (!overviewNodes) return false;
  for (const node of overviewNodes) {
    if (node.label === menu.label && (node.path === menu.path || (!node.path && !menu.path))) return true;
    if (node.children && node.children.length > 0) {
      if (isMenuInOverview(menu, node.children)) return true;
    }
  }
  return false;
};

export default function MenuManagementView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<DynamicMenuItem | null>(null);
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

  // 3. Fetch Menus Overview per role
  const { data: overviewResp, isLoading: isOverviewLoading } = useQuery({
    queryKey: ["menus-overview"],
    queryFn: getMenusOverview
  });

  const roles = useMemo(() => rolesResp?.data || [], [rolesResp?.data]);
  const rawMenus = useMemo(() => menuResp?.data || [], [menuResp?.data]);
  const roleOverviews = useMemo(() => overviewResp?.data || [], [overviewResp?.data]);

  // 4. Build Tree Structure
  const menuTree = useMemo(() => {
    const buildTree = (
      items: DynamicMenuItem[],
      parentId: number | null = null
    ): MenuTreeNode[] => {
      return items
        .filter(item => item.parent_id === parentId)
        .map(item => ({
          ...item,
          children: buildTree(items, item.id)
        } as MenuTreeNode))
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    };

    return buildTree(rawMenus);
  }, [rawMenus]);

  const toggleGroup = (key: string | number) => {
    setExpandedGroups(prev => ({ ...prev, [String(key)]: !prev[key] }));
  };

  const handleEdit = (menu: DynamicMenuItem) => {
    setSelectedMenu(menu);
    setIsEditModalOpen(true);
  };

  // 4. Recursive Tree Component
  const MenuNode = ({ menu, level = 0 }: { menu: MenuTreeNode, level?: number }) => {
    const handleRoleToggle = async (menuId: number | string, currentRoles: number[] = [], roleId: number, checked: boolean) => {
      if (menu.is_system) {
        toast.error("System menus cannot be modified via Role Lens");
        return;
      }
      try {
        const newRoles = checked 
          ? [...currentRoles, roleId] 
          : currentRoles.filter(id => id !== roleId);
        
        await updateMenu(menuId, { allowed_roles: newRoles });

        // If it is a parent menu (parent_id is null/undefined), propagate the roles to all children
        const clickedMenu = rawMenus.find(m => m.id === menuId);
        if (clickedMenu && !clickedMenu.parent_id) {
          const getDescendantIds = (pId: number | string, allMenus: typeof rawMenus): (number | string)[] => {
            const children = allMenus.filter(m => m.parent_id === pId);
            let ids: (number | string)[] = children.map(c => c.id);
            for (const child of children) {
              ids = [...ids, ...getDescendantIds(child.id, allMenus)];
            }
            return ids;
          };

          const descendantIds = getDescendantIds(menuId, rawMenus);
          for (const childId of descendantIds) {
            await updateMenu(childId, { allowed_roles: newRoles });
          }
        }

        refetch();
        toast.success("Menu visibility updated");
      } catch (error) {
        console.error(error);
        toast.error("Failed to update visibility");
      }
    };
    const Icon = getIcon(menu.icon);
    const hasChildren = menu.children && menu.children.length > 0;
    const isExpanded = expandedGroups[String(menu.id)] ?? true;

    // Filtering logic: Check if menu matches role filter
    let roleMatch = true;
    const activeRole = roles.find((r) => r.id === selectedRoleId);
    const isSuperAdminRole = activeRole?.base_role?.toUpperCase() === "SUPERADMIN";

    if (selectedRoleId !== "all") {
      if (activeRole) {
        const overview = roleOverviews.find((o) => o.base_role.toLowerCase() === activeRole.base_role.toLowerCase());
        if (overview) {
          roleMatch = isMenuInOverview(menu, overview.menus);
        } else {
          roleMatch = (!menu.allowed_roles || menu.allowed_roles.length === 0) || (menu.allowed_roles.includes(Number(selectedRoleId)));
        }
      }
    }

    // Search logic
    const searchMatch = !searchQuery ||
      menu.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      menu.path?.toLowerCase().includes(searchQuery.toLowerCase());

    // If no match and no children match, don't render (simplified for now)
    // if (!roleMatch && !hasChildren) return null; // Keep visible to allow toggling
    if (searchQuery && !searchMatch && !hasChildren) return null;

    return (
      <div className="w-full">
        <div
          className="group flex items-center gap-4 p-4 rounded-[24px] transition-all hover:bg-slate-50 border border-transparent hover:border-slate-100"
          style={{ marginLeft: `${level * 24}px` }}
        >
          <div className={`flex items-center gap-3 flex-1 min-w-0 ${!roleMatch ? "opacity-40 grayscale" : ""}`}>
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

          <div className={`hidden md:flex items-center gap-1.5 overflow-hidden max-w-[240px] ${!roleMatch ? "opacity-40 grayscale" : ""}`}>
            {menu.allowed_roles && menu.allowed_roles.length > 0 ? (
              <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 font-black text-[7px] uppercase tracking-widest px-2">
                👥 {menu.allowed_roles.map((rId: number) => roles.find(r => r.id === rId)?.name || rId).join(', ')}
              </Badge>
            ) : (
              <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-[7px] uppercase tracking-widest px-2">
                Public
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4">
             {selectedRoleId !== "all" && (
               <Switch 
                 checked={menu.is_system ? isSuperAdminRole : (menu.allowed_roles?.includes(Number(selectedRoleId)) || false)}
                 disabled={menu.is_system}
                 onCheckedChange={(checked) => handleRoleToggle(menu.id, menu.allowed_roles || [], Number(selectedRoleId), checked)}
               />
             )}
             <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400">
               {menu.sort_order}
             </div>
             <button
                onClick={() => handleEdit(menu)}
                disabled={menu.is_system}
                title={menu.is_system ? "System menus cannot be edited" : "Edit menu"}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition-all active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-100 disabled:hover:text-slate-400"
              >
                <Edit3 size={16} />
              </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1">
            {menu.children.map((child: MenuTreeNode) => (
              <MenuNode key={child.id} menu={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const isLoading = isRolesLoading || isMenusLoading || isOverviewLoading;

  return (
    <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
      {/* Header Section */}
      <section className="relative overflow-hidden bg-slate-950 rounded-[40px] p-8 md:p-12 shadow-2xl text-white">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-600 opacity-20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[11px] font-black tracking-[0.2em] uppercase text-indigo-400">
              <LayoutGrid size={16} className="fill-current" />
              UX ARCHITECTURE
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Navigation <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Builder</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-xl text-sm sm:text-base leading-relaxed">
              Define the skeletal structure and layout of the sidebar navigation. Manage labels, icons, paths, and hierarchical sorting.
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
              onClick={() => {
                setSelectedMenu({
                  id: "new",
                  label: "",
                  icon: "LayoutGrid",
                  sort_order: 0,
                  is_system: false,
                  allowed_roles: [],
                  path: ""
                } as unknown as DynamicMenuItem);
                setIsEditModalOpen(true);
              }}
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
                Menu visibility now follows assigned roles. Role lens helps preview which menus are visible to each role.
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
                  {menuTree.map((menu) => (
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
        availableMenus={rawMenus}
      />
    </div>
  );
}
