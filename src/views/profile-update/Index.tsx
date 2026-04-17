"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  UserCog, 
  Search, 
  Filter,
  Eye,
  Check,
  X,
  ArrowRight,
  AlertCircle,
  Bell,
  Smartphone,
  Lock,
  ShieldCheck,
  Wallet
} from "lucide-react";
import { useAuthStore, ROLES } from "@/store/auth.store";
import UpdateRequestForm from "@/components/profile-update/UpdateRequestForm";
import UserCurrentDataCard from "@/components/profile-update/UserCurrentDataCard";
import ProfileImageUpdate from "@/components/profile-update/ProfileImageUpdate";
import MyPayrollTab from "@/components/profile-update/MyPayrollTab";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";

// MOCK DATA - Request List for Admin/HR
const MOCK_REQUESTS = [
  {
    id: 1,
    employeeName: "Alex Johnson",
    avatar: "https://i.pravatar.cc/150?u=alex",
    role: "Senior Developer",
    requestedAt: "2024-03-26 10:30 AM",
    status: "Pending",
    changes: {
      phone_number: { before: "+62 812-1111-2222", after: "+62 812-9999-8888" },
      address: { before: "Jakarta, Indonesia", after: "BSD City, Tangerang" }
    }
  },
  {
    id: 2,
    employeeName: "Sarah Chen",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    role: "UI Designer",
    requestedAt: "2024-03-25 02:15 PM",
    status: "Pending",
    changes: {
      name: { before: "Sarah Chen", after: "Sarah Chen-Miller" },
      email: { before: "sarah@company.com", after: "sarah.miller@company.com" }
    }
  }
];

type TabId = "profile" | "payroll" | "verification" | "security";

export default function ProfileUpdateView() {
  const { user, loading, fetchUser } = useAuthStore();
  const isAdmin = user?.role?.name === ROLES.SUPERADMIN || user?.role?.name === ROLES.ADMIN || user?.role?.name === ROLES.HR;
  
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<typeof MOCK_REQUESTS[0] | null>(null);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const userData = useMemo(() => ({
    fullName: user?.name,
    email: user?.email,
    phoneNumber: user?.phone_number || "+62 812-1111-2222",
    employeeId: user?.employee_id || "EMP-2024-017",
    department: user?.department || "Engineering",
    address: user?.address || "Jakarta, Indonesia",
  }), [user]);

  const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "My Profile", icon: UserCog },
    { id: "payroll", label: "My Payroll", icon: Wallet },
    ...(isAdmin ? [{ id: "verification", label: "Verification Center", icon: ShieldCheck } as const] : []),
    { id: "security", label: "Security & Preferences", icon: Lock },
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
        <div className="space-y-12 animate-in fade-in duration-500">
          <ProfileImageUpdate currentImage={user?.media_url} />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start px-4 md:px-0">
            <div className="lg:col-span-5">
              <UserCurrentDataCard data={userData} isLoading={loading} />
            </div>
            <div className="lg:col-span-7">
              <UpdateRequestForm />
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PAYROLL */}
      {activeTab === "payroll" && (
        <MyPayrollTab />
      )}

      {/* TAB CONTENT: VERIFICATION CENTER (ADMIN ONLY) */}
      {activeTab === "verification" && isAdmin && (
        <div className="space-y-6 animate-in fade-in duration-500 px-4 md:px-0">
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
              <Button className="bg-neutral-50 text-neutral-600 border-none px-4 py-2.5 rounded-xl flex items-center gap-2">
                <Filter size={16} />
                <span className="font-bold">Filters</span>
              </Button>
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
                  {MOCK_REQUESTS.map((req) => (
                    <tr key={req.id} className="hover:bg-neutral-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={req.avatar} className="w-10 h-10 rounded-xl" />
                          <div>
                            <p className="text-sm font-black text-neutral-900">{req.employeeName}</p>
                            <p className="text-[10px] font-bold text-neutral-400 uppercase">{req.requestedAt}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {Object.keys(req.changes).map(field => (
                            <span key={field} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-md uppercase">
                              {field.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-amber-50 text-amber-700 border-none px-3 py-1 rounded-full text-[10px] font-black uppercase">
                          {req.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          onClick={() => setSelectedRequest(req)}
                          className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 flex items-center gap-2 ml-auto"
                        >
                          <Eye size={14} />
                          <span>Review</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SECURITY & PREFERENCES */}
      {activeTab === "security" && (
        <div className="space-y-8 animate-in fade-in duration-500 px-4 md:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-4xl border border-neutral-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3 text-rose-500">
                <Lock size={24} strokeWidth={2.5} />
                <h3 className="text-xl font-black text-neutral-900 tracking-tight">Security Access</h3>
              </div>
              <p className="text-sm font-medium text-neutral-400">Manage your password and two-factor authentication.</p>
              
              <div className="space-y-4 pt-4">
                <Button className="w-full bg-neutral-900 text-white h-14 rounded-2xl font-black shadow-lg shadow-neutral-900/10">
                  Change Login Password
                </Button>
                <Button className="w-full bg-neutral-50 text-neutral-600 border border-neutral-200 h-14 rounded-2xl font-black">
                  Enable 2FA Authentication
                </Button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-4xl border border-neutral-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3 text-blue-500">
                <Smartphone size={24} strokeWidth={2.5} />
                <h3 className="text-xl font-black text-neutral-900 tracking-tight">Active Sessions</h3>
              </div>
              <p className="text-sm font-medium text-neutral-400">Devices currently logged into your account.</p>
              
              <div className="space-y-3">
                {[
                  { device: "MacBook Pro 14", location: "Jakarta, ID", status: "Current" },
                  { device: "iPhone 15 Pro", location: "Tangerang, ID", status: "Active" }
                ].map((session, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-neutral-100 shadow-sm">
                        <Smartphone size={18} className="text-neutral-400" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-neutral-900">{session.device}</p>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase">{session.location}</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px]">{session.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-4xl border border-neutral-200 shadow-sm space-y-8">
            <div className="flex items-center gap-3 text-amber-500">
              <Bell size={24} strokeWidth={2.5} />
              <h3 className="text-xl font-black text-neutral-900 tracking-tight">App Preferences</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">System Language</label>
                <select className="w-full h-14 px-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold text-neutral-900 outline-none">
                  <option>English (US)</option>
                  <option>Bahasa Indonesia</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Interface Theme</label>
                <div className="flex gap-2 p-1 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <button className="flex-1 h-12 bg-white rounded-xl shadow-sm text-xs font-black text-neutral-900">Light</button>
                  <button className="flex-1 h-12 rounded-xl text-xs font-black text-neutral-400">Dark</button>
                  <button className="flex-1 h-12 rounded-xl text-xs font-black text-neutral-400">System</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW MODAL (Reuse previous logic) */}
      {selectedRequest && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-neutral-900 p-8 text-white flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black tracking-tight uppercase">Data Change Review</h2>
                <p className="text-neutral-400 font-bold text-sm mt-1">Reviewing submission from {selectedRequest.employeeName}</p>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="text-neutral-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="flex items-center gap-4 bg-neutral-50 p-4 rounded-3xl border border-neutral-100">
                <Avatar src={selectedRequest.avatar} className="w-14 h-14 rounded-2xl" />
                <div>
                  <h3 className="text-lg font-black text-neutral-900">{selectedRequest.employeeName}</h3>
                  <p className="text-sm font-bold text-neutral-400">{selectedRequest.role} • ID: EMP-00{selectedRequest.id}</p>
                </div>
                <div className="ml-auto flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl shadow-sm border border-neutral-100">
                  <AlertCircle size={14} className="text-blue-500" />
                  <span className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">{Object.keys(selectedRequest.changes).length} Changes Detected</span>
                </div>
              </div>

              {/* Comparison Section */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 px-2">
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Current Data</p>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Proposed Update</p>
                </div>

                <div className="space-y-3">
                  {Object.entries(selectedRequest.changes).map(([field, data]) => (
                    <div key={field} className="grid grid-cols-[1fr,auto,1fr] items-center gap-4 group">
                      <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">{field.replace('_', ' ')}</p>
                        <p className="text-sm font-bold text-neutral-600">{data.before}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                        <ArrowRight size={16} />
                      </div>
                      <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                        <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">{field.replace('_', ' ')}</p>
                        <p className="text-sm font-black text-blue-700">{data.after}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 bg-white text-rose-500 border border-rose-100 hover:bg-rose-50 rounded-2xl h-14 font-black flex items-center justify-center gap-2 shadow-sm"
                >
                  <X size={20} />
                  <span>Reject</span>
                </Button>
                <Button 
                  onClick={() => {
                    alert("System: Profile Updated Successfully!");
                    setSelectedRequest(null);
                  }}
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl h-14 font-black flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
                >
                  <Check size={20} />
                  <span>Approve Update</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
