"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, LayoutGrid, Type, Loader2, Save, Hash, Box, KeyRound, Link as LinkIcon, ChevronDown } from "lucide-react";
import Input from "@/components/ui/Input";
import NativeSelect from "@/components/ui/NativeSelect";
import Checkbox from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { updateMenu, createMenu } from "@/service/menu";
import { getSystemRoles } from "@/service/roles";
import { Role } from "@/types/api";
import { getIcon } from "@/lib/iconMap";
import { toast } from "sonner";
import { Switch } from "@/components/ui/Switch";
import { useQuery } from "@tanstack/react-query";

interface MenuData {
  id: number | string;
  label: string;
  icon: string;
  allowed_roles?: number[];
  
  sort_order: number;
  is_system: boolean;
  path?: string;
  parent_id?: number | string | null;
}

interface EditMenuModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  menu: MenuData | null;
  availableMenus?: MenuData[];
}

const MenuIconPreview = ({ name, size, strokeWidth }: { name: string; size?: number; strokeWidth?: number }) => {
  return React.createElement(getIcon(name), { size, strokeWidth });
};

export default function EditMenuModal({ open, onClose, onSuccess, menu, availableMenus = [] }: EditMenuModalProps) {
  const isNew = menu?.id === "new";
  const [formData, setFormData] = useState<MenuData>({
    id: "",
    label: "",
    icon: "",
    allowed_roles: [],
    
    sort_order: 0,
    is_system: false,
    path: "",
    parent_id: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch system roles for allowed_roles assignment
  const { data: rolesResp } = useQuery({
    queryKey: ["system-roles"],
    queryFn: getSystemRoles,
    enabled: open,
  });
  const roleOptions = useMemo(() => rolesResp?.data || [], [rolesResp]);


  useEffect(() => {
    if (open && menu) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        ...menu,
        allowed_roles: menu.allowed_roles || [],
        
      });
    }
  }, [open, menu]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label) {
      toast.error("Label is required");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalAllowedRoles = formData.allowed_roles || [];
      if (formData.is_system) {
        finalAllowedRoles = roleOptions
          .filter((r: Role) => r.base_role === "SUPERADMIN")
          .map((r: Role) => r.id);
      }

      const payload = {
        label: formData.label,
        icon: formData.icon,
        sort_order: Number(formData.sort_order),
        is_system: formData.is_system,
        path: formData.path || undefined,
        allowed_roles: finalAllowedRoles,
        parent_id: formData.parent_id ? Number(formData.parent_id) : null,
      };

      const getDescendantIds = (pId: number | string, allMenus: MenuData[]): (number | string)[] => {
        const children = allMenus.filter(m => m.parent_id === pId);
        let ids = children.map(c => c.id);
        for (const child of children) {
          ids = [...ids, ...getDescendantIds(child.id, allMenus)];
        }
        return ids;
      };

      if (isNew) {
        await createMenu(payload);
        toast.success("New menu created successfully.");
      } else {
        await updateMenu(formData.id, payload);
        
        // If the menu was a parent, propagate changes to all descendants
        const wasParent = menu && !menu.parent_id;
        if (wasParent) {
          const descendantIds = getDescendantIds(formData.id, availableMenus);
          for (const childId of descendantIds) {
            const childMenu = availableMenus.find(m => m.id === childId);
            if (childMenu) {
              await updateMenu(childId, {
                label: childMenu.label,
                icon: childMenu.icon,
                sort_order: Number(childMenu.sort_order),
                is_system: payload.is_system,
                path: childMenu.path || undefined,
                allowed_roles: payload.allowed_roles,
                parent_id: childMenu.parent_id ? Number(childMenu.parent_id) : null,
              });
            }
          }
        }
        
        toast.success("Menu configuration updated.");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(isNew ? "Failed to create menu." : "Failed to update menu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
        <form onSubmit={handleSubmit}>
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                  <MenuIconPreview name={formData.icon} size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                    {isNew ? "Create New Menu" : "Edit Menu"}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    {isNew ? "Add a new navigation element" : "Configure dynamic access & branding"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  required
                  label="Menu Label"
                  placeholder="e.g. Workforce Intelligence"
                  value={formData.label}
                  onChange={(e) => setFormData({...formData, label: e.target.value})}
                  leftIcon={<Type size={18} />}
                  variant="ghost"
                />

                <Input
                  label="Route Path"
                  placeholder="/admin/analytics"
                  value={formData.path || ""}
                  onChange={(e) => setFormData({...formData, path: e.target.value})}
                  leftIcon={<LinkIcon size={18} />}
                  variant="ghost"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  required
                  label="Icon Name (Lucide)"
                  placeholder="Users, Zap, etc."
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  leftIcon={<Box size={18} />}
                  rightIcon={<MenuIconPreview name={formData.icon} size={16} />}
                  variant="ghost"
                />

                <Input
                  required
                  type="number"
                  label="Sort Order"
                  placeholder="1"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                  leftIcon={<Hash size={18} />}
                  variant="ghost"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                    <KeyRound size={14} /> Allowed Roles
                  </label>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl grid grid-cols-2 gap-3">
                    {roleOptions.map((role: Role) => {
                      const isSuperAdmin = role.base_role === "SUPERADMIN";
                      const isDisabled = formData.is_system && !isSuperAdmin;
                      const isChecked = formData.is_system && isSuperAdmin ? true : (formData.allowed_roles?.includes(role.id) || false);
                      return (
                        <Checkbox
                          key={role.id}
                          label={role.name}
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={(checked) => {
                            const current = formData.allowed_roles || [];
                            setFormData({
                              ...formData,
                              allowed_roles: checked
                                ? [...current, role.id]
                                : current.filter(id => id !== role.id)
                            });
                          }}
                        />
                      );
                    })}
                    {roleOptions.length === 0 && <span className="text-xs text-slate-400">Loading roles...</span>}
                  </div>
                </div>

                <NativeSelect
                  label="Parent Group"
                  variant="ghost"
                  value={formData.parent_id || ""}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || null })}
                  options={[
                    { label: "— Root Level —", value: "" },
                    ...availableMenus
                      .filter(m => m.id !== formData.id)
                      .map((m) => ({ label: m.label, value: m.id }))
                  ]}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-slate-900">System Lock</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Prevents deletion & logic override</p>
                  </div>
                  <Switch
                    checked={formData.is_system}
                    onCheckedChange={(checked) => setFormData({...formData, is_system: checked})}
                  />
                </div>
                {formData.is_system && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-amber-800">
                    <span className="text-lg">ℹ️</span>
                    <p className="text-xs font-bold leading-relaxed">
                      This is a System Menu. It is strictly reserved for Superadmin roles and cannot be assigned to regular tenant roles.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-50 flex gap-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all bg-white border border-slate-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin text-white" size={18} />
              ) : (
                <Save size={18} strokeWidth={2.5} />
              )}
              <span>Save Configuration</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
