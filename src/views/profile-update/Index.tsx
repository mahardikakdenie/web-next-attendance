"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  UserCog, 
  Search, 
  Eye,
  X,
  ArrowRight,
  AlertCircle,
  Lock,
  ShieldCheck,
  Wallet,
  History,
  CheckCircle,
  XCircle,
  MessageSquare,
  Loader2
} from "lucide-react";
import { useAuthStore, ROLES } from "@/store/auth.store";
import UserCurrentDataCard from "@/components/profile-update/UserCurrentDataCard";
import ProfileImageUpdate from "@/components/profile-update/ProfileImageUpdate";
import MyPayrollTab from "@/components/profile-update/MyPayrollTab";
import SecurityTab from "@/components/profile-update/SecurityTab";
import MyRequestsTab from "@/components/profile-update/MyRequestsTab";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAllChangeRequests, 
  approveChangeRequest, 
  rejectChangeRequest 
} from "@/service/users";
import { ProfileChangeRequest, CustomApiError } from "@/types/api";
import { toast } from "sonner";
import dayjs from "dayjs";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";

type TabId = "profile" | "requests" | "payroll" | "verification" | "security";

export default function ProfileUpdateView() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const fetchUser = useAuthStore((state) => state.fetchUser);
  
  const queryClient = useQueryClient();
  const isAdmin = useMemo(() => 
    user?.role?.name === ROLES.SUPERADMIN || 
    user?.role?.name === ROLES.ADMIN || 
    user?.role?.name === ROLES.HR, 
  [user]);
  
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedRequest, setSelectedRequest] = useState<ProfileChangeRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []); // Only fetch on mount to prevent infinite loops

  // Admin Queries
  const { data: adminRequestsResp, isLoading: isAdminRequestsLoading } = useQuery({
    queryKey: ["admin-profile-requests", statusFilter],
    queryFn: () => getAllChangeRequests({ status: statusFilter }),
    enabled: isAdmin && activeTab === "verification",
  });

  // Admin Mutations
  const approveMutation = useMutation({
    mutationFn: (id: number) => approveChangeRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-profile-requests"] });
      setSelectedRequest(null);
      toast.success("Profile change request approved");
    },
    onError: (err: CustomApiError) => {
      toast.error(err.response?.data?.meta?.message || "Failed to approve request");
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number, reason: string }) => rejectChangeRequest(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-profile-requests"] });
      setSelectedRequest(null);
      setShowRejectInput(false);
      setRejectReason("");
      toast.success("Profile change request rejected");
    },
    onError: (err: CustomApiError) => {
      toast.error(err.response?.data?.meta?.message || "Failed to reject request");
    }
  });

  const userData = useMemo(() => ({
    fullName: user?.name,
    email: user?.email,
    phoneNumber: user?.phone_number || "-",
    employeeId: user?.employee_id || "-",
    department: user?.department || "-",
    address: user?.address || "-",
  }), [user]);

  const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "My Profile", icon: UserCog },
    { id: "requests", label: "My Requests", icon: History },
    { id: "payroll", label: "My Payroll", icon: Wallet },
    ...(isAdmin ? [{ id: "verification", label: "Verification Center", icon: ShieldCheck } as const] : []),
    { id: "security", label: "Security", icon: Lock },
  ];

  return (
    <section className="mx-auto max-w-6xl space-y-8 pb-20 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-neutral-900">
            Account Settings
          </h1>
          <p className="text-base font-medium text-neutral-400">
            Manage your personal identity, security preferences, and data verifications.
          </p>
        </div>
      </div>

      {/* Modern Tab Navigation */}
      <div className="flex items-center gap-1 bg-neutral-100 p-1.5 rounded-3xl w-fit border border-neutral-200/50 shadow-inner ml-4 md:ml-0 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-[18px] text-sm font-black transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id 
                  ? "bg-white text-blue-600 shadow-md shadow-blue-500/5" 
                  : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              <Icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: PROFILE */}
      {activeTab === "profile" && (
        <div className="space-y-12 animate-in fade-in duration-500 max-w-4xl mx-auto w-full">
          <ProfileImageUpdate currentImage={user?.media_url} />
          
          <div className="px-4 md:px-0">
            <UserCurrentDataCard data={userData} isLoading={loading} />
          </div>
        </div>
      )}

      {/* TAB CONTENT: MY REQUESTS */}
      {activeTab === "requests" && (
        <MyRequestsTab />
      )}

      {/* TAB CONTENT: PAYROLL */}
      {activeTab === "payroll" && (
        <MyPayrollTab />
      )}

      {/* TAB CONTENT: VERIFICATION CENTER (ADMIN ONLY) */}
      {activeTab === "verification" && isAdmin && (
        <div className="space-y-6 animate-in fade-in duration-500 px-4 md:px-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-2xl w-fit">
                {['pending', 'approved', 'rejected', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      statusFilter === status 
                        ? "bg-white text-blue-600 shadow-sm" 
                        : "text-neutral-400 hover:text-neutral-600"
                    }`}
                  >
                    {status}
                  </button>
                ))}
             </div>
          </div>

          <div className="bg-white rounded-4xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex flex-col lg:flex-row justify-between items-center gap-4">
              <div className="relative w-full lg:max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search employee or ID..."
                  className="w-full pl-12 pr-4 h-12 bg-neutral-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-neutral-50/50 border-b border-neutral-100">
                    <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Employee</th>
                    <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Changes</th>
                    <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-5 text-right font-black text-neutral-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {(adminRequestsResp?.data || [])
                    .filter(req => req.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || req.user?.employee_id.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((req) => (
                    <tr key={req.id} className="hover:bg-neutral-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={req.user?.media_url} name={req.user?.name} className="w-10 h-10 rounded-xl" />
                          <div>
                            <p className="text-sm font-black text-neutral-900">{req.user?.name}</p>
                            <p className="text-[10px] font-bold text-neutral-400 uppercase">{dayjs(req.created_at).format("DD MMM YYYY")}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {Object.keys(req.new_data).map(field => (
                            <span key={field} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-md uppercase">
                              {field.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`border-none px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          req.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                          req.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                          req.status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-neutral-50 text-neutral-700'
                        }`}>
                          {req.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          onClick={() => setSelectedRequest(req)}
                          className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 flex items-center gap-2 ml-auto shadow-lg shadow-blue-600/20"
                        >
                          <Eye size={14} />
                          <span>Review</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {(!adminRequestsResp?.data || adminRequestsResp.data.length === 0) && !isAdminRequestsLoading && (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center text-neutral-400 font-bold uppercase tracking-widest text-xs">
                        No requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SECURITY */}
      {activeTab === "security" && (
        <SecurityTab />
      )}

      {/* REVIEW MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="bg-neutral-900 p-8 text-white flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black tracking-tight uppercase">Data Change Review</h2>
                <p className="text-neutral-400 font-bold text-sm mt-1">Reviewing submission from {selectedRequest.user?.name}</p>
              </div>
              <button onClick={() => { setSelectedRequest(null); setShowRejectInput(false); }} className="text-neutral-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="flex items-center gap-4 bg-neutral-50 p-4 rounded-3xl border border-neutral-100">
                <Avatar src={selectedRequest.user?.media_url} name={selectedRequest.user?.name} className="w-14 h-14 rounded-2xl" />
                <div>
                  <h3 className="text-lg font-black text-neutral-900">{selectedRequest.user?.name}</h3>
                  <p className="text-sm font-bold text-neutral-400">{selectedRequest.user?.department} • ID: {selectedRequest.user?.employee_id}</p>
                </div>
                <div className="ml-auto flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl shadow-sm border border-neutral-100">
                  <AlertCircle size={14} className="text-blue-500" />
                  <span className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">{Object.keys(selectedRequest.new_data).length} Changes Detected</span>
                </div>
              </div>

              {/* Comparison Section */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 px-2">
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Current Data</p>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Proposed Update</p>
                </div>

                <div className="space-y-3">
                  {Object.entries(selectedRequest.new_data).map(([field, newValue]) => {
                    const oldValue = selectedRequest.old_data[field as keyof typeof selectedRequest.old_data];
                    return (
                      <div key={field} className="grid grid-cols-[1fr,auto,1fr] items-center gap-4 group">
                        <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                          <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">{field.replace('_', ' ')}</p>
                          <p className="text-sm font-bold text-neutral-600">{oldValue || "-"}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                          <ArrowRight size={16} />
                        </div>
                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                          <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">{field.replace('_', ' ')}</p>
                          <p className="text-sm font-black text-blue-700">{newValue || "-"}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {showRejectInput ? (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Rejection Reason</label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Please explain why this request is being rejected..."
                        className="w-full bg-rose-50/50 border border-rose-100 rounded-2xl p-4 text-sm font-bold text-neutral-900 outline-none focus:bg-white focus:border-rose-400 transition-all resize-none"
                        rows={3}
                      />
                   </div>
                   <div className="flex gap-3">
                      <Button 
                        onClick={() => setShowRejectInput(false)}
                        variant="secondary"
                        className="flex-1 rounded-2xl h-12 font-bold"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => rejectMutation.mutate({ id: selectedRequest.id, reason: rejectReason })}
                        disabled={!rejectReason || rejectMutation.isPending}
                        className="flex-1 bg-rose-600 text-white hover:bg-rose-700 rounded-2xl h-12 font-black shadow-lg shadow-rose-600/20"
                      >
                        {rejectMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : "Confirm Reject"}
                      </Button>
                   </div>
                </div>
              ) : (
                selectedRequest.status === 'pending' && (
                  <div className="flex gap-4 pt-4">
                    <Button 
                      onClick={() => setShowRejectInput(true)}
                      className="flex-1 bg-white text-rose-500 border border-rose-100 hover:bg-rose-50 rounded-2xl h-14 font-black flex items-center justify-center gap-2 shadow-sm"
                    >
                      <XCircle size={20} />
                      <span>Reject Request</span>
                    </Button>
                    <Button 
                      onClick={() => approveMutation.mutate(selectedRequest.id)}
                      disabled={approveMutation.isPending}
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl h-14 font-black flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
                    >
                      {approveMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={20} />}
                      <span>Approve & Update</span>
                    </Button>
                  </div>
                )
              )}

              {selectedRequest.status === 'rejected' && selectedRequest.admin_notes && (
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex gap-3">
                   <MessageSquare size={18} className="text-rose-600 shrink-0 mt-0.5" />
                   <div>
                      <p className="text-xs font-black text-rose-900 uppercase">Admin Rejection Note</p>
                      <p className="text-xs font-bold text-rose-700 mt-1 italic">&ldquo;{selectedRequest.admin_notes}&rdquo;</p>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
