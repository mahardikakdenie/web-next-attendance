"use client";

import { useState, useEffect } from "react";
import { Calendar, MessageSquare, Send, Loader2, Info, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { requestLeave } from "@/service/leave";
import { getDataUserslist } from "@/service/users";
import { useAuthStore } from "@/store/auth.store";
import { UserData } from "@/types/api";
import { toast } from "sonner";
import { useRefresh } from "@/lib/RefreshContext";

export function LeaveRequestCard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const { triggerRefresh } = useRefresh();
  const [employees, setEmployees] = useState<UserData[]>([]);
  const [formData, setFormData] = useState({
    leave_type_id: 1,
    start_date: "",
    end_date: "",
    reason: "",
    delegate_id: undefined as number | undefined,
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        if (!user?.id) return;
        const resp = await getDataUserslist({ user_id: user.id, limit: 100 });
        if (resp.data) {
          // Filter out self
          setEmployees(resp.data.filter(emp => emp.id !== user.id));
        }
      } catch (error) {
        console.error("Failed to fetch employees for delegation:", error);
      }
    };
    fetchEmployees();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.start_date || !formData.end_date || !formData.reason) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      toast.error("Start date cannot be after end date.");
      return;
    }

    try {
      setLoading(true);
      await requestLeave({
        ...formData,
        delegate_id: formData.delegate_id || undefined
      });
      toast.success("Leave request submitted successfully.");
      setFormData({
        leave_type_id: 1,
        start_date: "",
        end_date: "",
        reason: "",
        delegate_id: undefined,
      });
      triggerRefresh();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to submit leave request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full rounded-4xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-neutral-900 tracking-tight">Request Time Off</h2>
          <p className="text-sm font-medium text-neutral-400">Personal leave management (SOP Compliant).</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Calendar size={24} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Leave Type</label>
            <select 
              value={formData.leave_type_id}
              onChange={(e) => setFormData({ ...formData, leave_type_id: Number(e.target.value) })}
              className="w-full h-12 px-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-900 focus:bg-white focus:border-blue-500/20 transition-all outline-none appearance-none"
            >
              <option value={1}>Annual Leave</option>
              <option value={2}>Sick Leave</option>
              <option value={3}>Unpaid Leave</option>
              <option value={4}>Permission / Duty</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Date Range</label>
            <div className="flex items-center gap-2">
              <input 
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full h-12 px-3 bg-neutral-50 border border-neutral-100 rounded-xl text-xs font-bold text-neutral-900 focus:bg-white transition-all outline-none"
              />
              <span className="text-neutral-300">-</span>
              <input 
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full h-12 px-3 bg-neutral-50 border border-neutral-100 rounded-xl text-xs font-bold text-neutral-900 focus:bg-white transition-all outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Reason</label>
            <div className="relative">
              <MessageSquare className="absolute left-4 top-4 text-neutral-300" size={18} />
              <textarea 
                rows={2}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Tell us why you need this time off..."
                className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-medium text-neutral-700 focus:bg-white focus:border-blue-500/20 transition-all outline-none resize-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Delegation (Optional)</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
              <select 
                value={formData.delegate_id || ""}
                onChange={(e) => setFormData({ ...formData, delegate_id: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full h-12 pl-12 pr-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-900 focus:bg-white focus:border-blue-500/20 transition-all outline-none appearance-none"
              >
                <option value="">Select Replacement Colleague</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
            <Info size={14} />
            <span className="text-[10px] font-bold uppercase">Subject to Approval</span>
          </div>
          <Button 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            <span className="font-bold">Submit Request</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
