"use client";

import { useState, useEffect, useCallback } from "react";
import { X, User, Mail, Shield, Lock, Loader2, Save } from "lucide-react";
import Input from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getSystemRoles } from "@/service/roles";
import { createPlatformAccount, updatePlatformAccount } from "@/service/admin";
import { toast } from "sonner";
import { Role, UserData } from "@/types/api";

interface AccountModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  account?: UserData | null;
}

export default function AccountModal({ open, onClose, onSuccess, account }: AccountModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role_id: "",
    password: ""
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const resp = await getSystemRoles();
      if (resp.data) {
        setRoles(resp.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load platform roles");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        void fetchRoles();
        if (account) {
          setFormData({
            name: account.name,
            email: account.email,
            role_id: account.role?.id?.toString() || "",
            password: ""
          });
        } else {
          setFormData({
            name: "",
            email: "",
            role_id: "",
            password: ""
          });
        }
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [open, account, fetchRoles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role_id) {
      toast.error("Please select a role");
      return;
    }

    setIsSubmitting(true);
    try {
      if (account) {
        await updatePlatformAccount(account.id, {
          name: formData.name,
          email: formData.email,
          role_id: Number(formData.role_id)
        });
        toast.success("Administrator updated successfully");
      } else {
        await createPlatformAccount({
          name: formData.name,
          email: formData.email,
          role_id: Number(formData.role_id),
          password: formData.password || undefined
        });
        toast.success("New administrator created successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Operation failed. Please try again.");
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
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                  <Shield size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                    {account ? "Edit Administrator" : "Add New Admin"}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    {account ? `Updating access for ID #${account.id}` : "Configure new system-level access"}
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

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input 
                    required
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="pl-12 h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input 
                    required
                    type="email"
                    placeholder="admin@attendance.pro"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="pl-12 h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Platform Role</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select 
                    required
                    value={formData.role_id}
                    onChange={(e) => setFormData({...formData, role_id: e.target.value})}
                    className="w-full pl-12 pr-4 h-14 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-slate-500/5 transition-all appearance-none"
                    disabled={isLoading}
                  >
                    <option value="" disabled>Select a system role...</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>{role.name.toUpperCase()}</option>
                    ))}
                  </select>
                  {isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className="animate-spin text-slate-400" size={18} />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Password {account ? "(Leave blank to keep current)" : "(Optional)"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input 
                    type="password"
                    placeholder={account ? "••••••••" : "Leave blank to auto-generate"}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="pl-12 h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold"
                  />
                </div>
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
              Discard
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || isLoading}
              className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin text-white" size={18} />
              ) : (
                <Save size={18} strokeWidth={2.5} />
              )}
              <span>{account ? "Update Admin" : "Authorize Access"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
