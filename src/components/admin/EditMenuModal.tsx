"use client";

import { useState, useEffect } from "react";
import { X, LayoutGrid, Type, Shield, Loader2, Save, Hash, Box } from "lucide-react";
import Input from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateMenu } from "@/service/menu";
import { toast } from "sonner";
import { Switch } from "@/components/ui/Switch";

interface MenuData {
  id: number | string;
  label: string;
  icon: string;
  allowed_roles: string[];
  sort_order: number;
  is_system: boolean;
  path?: string;
}

interface EditMenuModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  menu: MenuData | null;
}

const ROLE_OPTIONS = [
  { label: "SUPERADMIN", value: "SUPERADMIN" },
  { label: "ADMIN", value: "ADMIN" },
  { label: "HR", value: "HR" },
  { label: "FINANCE", value: "FINANCE" },
  { label: "EMPLOYEE", value: "EMPLOYEE" },
];

export default function EditMenuModal({ open, onClose, onSuccess, menu }: EditMenuModalProps) {
  const [formData, setFormData] = useState<MenuData>({
    id: "",
    label: "",
    icon: "",
    allowed_roles: [],
    sort_order: 0,
    is_system: false,
    path: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && menu) {
      setFormData({
        ...menu,
        allowed_roles: menu.allowed_roles || []
      });
    }
  }, [open, menu]);

  const toggleRole = (role: string) => {
    setFormData(prev => {
      const roles = [...prev.allowed_roles];
      const index = roles.indexOf(role);
      if (index > -1) {
        roles.splice(index, 1);
      } else {
        roles.push(role);
      }
      return { ...prev, allowed_roles: roles };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label) {
      toast.error("Label is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateMenu(formData.id, {
        label: formData.label,
        icon: formData.icon,
        allowed_roles: formData.allowed_roles,
        sort_order: Number(formData.sort_order),
        is_system: formData.is_system,
        path: formData.path
      });
      toast.success("Menu configuration updated. Changes will reflect after refresh.");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update menu configuration.");
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
                  <LayoutGrid size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                    Edit Menu
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    Configure dynamic access & branding
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
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Menu Label</label>
                <div className="relative">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input 
                    required
                    placeholder="e.g. Workforce Intelligence"
                    value={formData.label}
                    onChange={(e) => setFormData({...formData, label: e.target.value})}
                    className="pl-12 h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Icon Name (Lucide)</label>
                  <div className="relative">
                    <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                      required
                      placeholder="Users, Zap, etc."
                      value={formData.icon}
                      onChange={(e) => setFormData({...formData, icon: e.target.value})}
                      className="pl-12 h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sort Order</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                      required
                      type="number"
                      placeholder="1"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                      className="pl-12 h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  <Shield size={14} /> Allowed Roles (Multi-Select)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {ROLE_OPTIONS.map((role) => {
                    const isActive = formData.allowed_roles.includes(role.value);
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => toggleRole(role.value)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                          isActive 
                            ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" 
                            : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isActive ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-200"
                        }`}>
                          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-in zoom-in-50" />}
                        </div>
                        <span className="text-xs font-black tracking-tight">{role.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

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
