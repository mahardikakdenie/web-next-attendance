"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  CreditCard, 
  Loader2, 
  Save,
  Building2,
  ShieldCheck,
  DollarSign
} from "lucide-react";
import Input from "@/components/ui/Input";
import { getPayrollProfile, updatePayrollProfile } from "@/service/payroll";
import { toast } from "sonner";
import { PayrollProfile } from "@/types/api";

interface PayrollProfileModalProps {
  open: boolean;
  onClose: () => void;
  employeeId: number;
  employeeName: string;
}

export default function PayrollProfileModal({ 
  open, 
  onClose, 
  employeeId, 
  employeeName 
}: PayrollProfileModalProps) {
  const [formData, setFormData] = useState<Partial<PayrollProfile>>({
    bank_name: "",
    bank_account_number: "",
    bank_account_holder: "",
    bpjs_health_number: "",
    bpjs_employment_number: "",
    npwp_number: "",
    ptkp_status: "TK/0",
    basic_salary: 0,
    fixed_allowance: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const resp = await getPayrollProfile(employeeId);
          if (resp.data) {
            setFormData(resp.data);
          }
        } catch (error) {
          console.error(error);
          toast.error("Failed to load payroll profile");
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [open, employeeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updatePayrollProfile(employeeId, formData);
      toast.success(`Payroll profile for ${employeeName} updated successfully`);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update payroll profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
        <form onSubmit={handleSubmit}>
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
                  <CreditCard size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">Payroll Profile</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Manage financial data for {employeeName}</p>
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

            {isLoading ? (
              <div className="h-[400px] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading records...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
                
                {/* 1. SALARY CONFIGURATION */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <DollarSign size={16} className="text-emerald-600" />
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salary Configuration</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Basic Salary (Monthly)</label>
                    <Input 
                      type="number"
                      value={formData.basic_salary}
                      onChange={(e) => setFormData({...formData, basic_salary: Number(e.target.value)})}
                      className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Fixed Allowance</label>
                    <Input 
                      type="number"
                      value={formData.fixed_allowance}
                      onChange={(e) => setFormData({...formData, fixed_allowance: Number(e.target.value)})}
                      className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">PTKP Status</label>
                    <select 
                      value={formData.ptkp_status}
                      onChange={(e) => setFormData({...formData, ptkp_status: e.target.value})}
                      className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="TK/0">TK/0 (Single)</option>
                      <option value="K/0">K/0 (Married)</option>
                      <option value="K/1">K/1 (Married, 1 Child)</option>
                      <option value="K/2">K/2 (Married, 2 Children)</option>
                      <option value="K/3">K/3 (Married, 3 Children)</option>
                    </select>
                  </div>
                </div>

                {/* 2. BANK INFORMATION */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Building2 size={16} className="text-blue-600" />
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank Information</h3>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bank Name</label>
                    <Input 
                      placeholder="e.g. BCA, Mandiri"
                      value={formData.bank_name}
                      onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                      className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Account Number</label>
                    <Input 
                      placeholder="e.g. 8830123456"
                      value={formData.bank_account_number}
                      onChange={(e) => setFormData({...formData, bank_account_number: e.target.value})}
                      className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Account Holder Name</label>
                    <Input 
                      placeholder="As seen on bank book"
                      value={formData.bank_account_holder}
                      onChange={(e) => setFormData({...formData, bank_account_holder: e.target.value})}
                      className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold"
                    />
                  </div>
                </div>

                {/* 3. SOCIAL SECURITY & TAX */}
                <div className="space-y-4 md:col-span-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security & Tax IDs</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">BPJS Health (KS)</label>
                      <Input 
                        value={formData.bpjs_health_number}
                        onChange={(e) => setFormData({...formData, bpjs_health_number: e.target.value})}
                        className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">BPJS Employment (TK)</label>
                      <Input 
                        value={formData.bpjs_employment_number}
                        onChange={(e) => setFormData({...formData, bpjs_employment_number: e.target.value})}
                        className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">NPWP Number</label>
                      <Input 
                        value={formData.npwp_number}
                        onChange={(e) => setFormData({...formData, npwp_number: e.target.value})}
                        className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-8 bg-slate-50 flex gap-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all bg-white border border-slate-200"
            >
              Discard Changes
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || isLoading}
              className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin text-white" size={18} />
              ) : (
                <Save size={18} strokeWidth={2.5} />
              )}
              <span>Secure Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
