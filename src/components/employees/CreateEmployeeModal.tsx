"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  UserPlus, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Wallet, 
  ShieldCheck, 
  Briefcase,
  IdCard,
  Lock,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { toast } from "sonner";
import { getTenantRoles } from "@/service/roles";
import { Role, CreateUserPayload } from "@/types/api";
import { createUser } from "@/service/users";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateEmployeeModal({ open, onClose, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState<CreateUserPayload>({
    name: "",
    email: "",
    employee_id: "",
    department: "",
    phone_number: "",
    address: "",
    base_salary: 0,
    role_id: 0,
    password: "",
  });

  useEffect(() => {
    if (open) {
      const fetchRoles = async () => {
        try {
          const resp = await getTenantRoles();
          if (resp.data) {
            setRoles(resp.data);
            // Set default role if available
            if (resp.data.length > 0) {
              setFormData(prev => ({ ...prev, role_id: resp.data[0].id }));
            }
          }
        } catch (error) {
          console.error("Failed to fetch roles:", error);
        }
      };
      fetchRoles();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.role_id === 0) {
      toast.error("Please select a role");
      return;
    }

    try {
      setIsLoading(true);
      const resp = await createUser(formData);
      if (resp.success) {
        toast.success("Employee created successfully");
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          name: "",
          email: "",
          employee_id: "",
          department: "",
          phone_number: "",
          address: "",
          base_salary: 0,
          role_id: roles.length > 0 ? roles[0].id : 0,
          password: "",
        });
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { meta?: { message?: string } } } };
      const msg = axiosError?.response?.data?.meta?.message || "Failed to create employee";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-500 border border-white ring-1 ring-slate-200/50">
        
        {/* Header */}
        <div className="relative overflow-hidden bg-slate-900 p-8 text-white shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <UserPlus size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight leading-none">Add Employee</h2>
                <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-widest">Enroll new workforce member</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Basic Info Group */}
            <div className="md:col-span-2 flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Account Credentials</span>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Full Name</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input 
                  required
                  placeholder="e.g. John Doe" 
                  className="pl-12"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input 
                  required
                  type="email"
                  placeholder="john@company.com" 
                  className="pl-12"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input 
                  type="password"
                  placeholder="••••••••" 
                  className="pl-12"
                  value={formData.password}
                  onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Assign Role</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 z-10" />
                <select 
                  required
                  className="w-full h-14 pl-12 pr-5 rounded-2xl text-[15px] font-bold bg-white border border-neutral-200 shadow-sm hover:border-neutral-300 transition-all outline-none appearance-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                  value={formData.role_id}
                  onChange={e => setFormData(prev => ({ ...prev, role_id: Number(e.target.value) }))}
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name} ({role.base_role})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Employment Details Group */}
            <div className="md:col-span-2 flex items-center gap-2 mt-4 mb-2">
              <IdCard size={16} className="text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Employment Details</span>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Employee ID</label>
              <div className="relative">
                <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input 
                  required
                  placeholder="e.g. EMP-001" 
                  className="pl-12"
                  value={formData.employee_id}
                  onChange={e => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Department</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input 
                  required
                  placeholder="e.g. Engineering" 
                  className="pl-12"
                  value={formData.department}
                  onChange={e => setFormData(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Base Salary</label>
              <div className="relative">
                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input 
                  required
                  type="number"
                  placeholder="0" 
                  className="pl-12 font-mono"
                  value={formData.base_salary}
                  onChange={e => setFormData(prev => ({ ...prev, base_salary: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input 
                  required
                  placeholder="e.g. +62 812..." 
                  className="pl-12"
                  value={formData.phone_number}
                  onChange={e => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Home Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-6 text-slate-400 w-4 h-4" />
                <textarea 
                  required
                  className="w-full min-h-[100px] pl-12 pr-5 py-4 rounded-2xl text-[15px] font-medium transition-all duration-300 ease-out outline-none placeholder:text-neutral-400 bg-white border border-neutral-200 shadow-sm hover:border-neutral-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:shadow-md text-neutral-900"
                  placeholder="Full street address..."
                  value={formData.address}
                  onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex gap-4 mt-10">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 h-14 rounded-2xl font-black text-sm text-slate-500 hover:bg-slate-100 transition-all uppercase tracking-widest"
            >
              Cancel
            </button>
            <Button 
              disabled={isLoading}
              type="submit"
              className="flex-1 h-14 rounded-2xl bg-slate-900 text-white hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Enrolling...</span>
                </>
              ) : (
                <>
                  <UserPlus size={20} strokeWidth={2.5} />
                  <span className="font-black uppercase tracking-widest text-xs">Create Employee</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
