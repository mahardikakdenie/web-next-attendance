"use client";

import { useState, useMemo } from "react";
import { 
  Clock, 
  CheckCircle2, 
  MoreHorizontal,
  Plus,
  Timer,
  Search,
  Check,
  X,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuthStore, ROLES } from "@/store/auth.store";
import { Badge } from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";

const MOCK_OVERTIME = [
  {
    id: 1,
    employeeName: "Bagus Fikri",
    avatar: null,
    date: "2024-03-08",
    startTime: "18:00",
    endTime: "21:00",
    hours: 3,
    status: "Approved",
    reason: "Project deadline deployment",
  },
  {
    id: 2,
    employeeName: "Ihdizein",
    avatar: null,
    date: "2024-03-05",
    startTime: "17:30",
    endTime: "19:30",
    hours: 2,
    status: "Approved",
    reason: "Monthly report preparation",
  },
  {
    id: 3,
    employeeName: "Mufti Hidayat",
    avatar: null,
    date: "2024-04-02",
    startTime: "18:00",
    endTime: "20:00",
    hours: 2,
    status: "Pending",
    reason: "Urgent bug fixing",
  },
];

export default function OvertimeView() {
  const { user } = useAuthStore();
  const isAdmin = user?.role?.name === ROLES.SUPERADMIN || user?.role?.name === ROLES.ADMIN || user?.role?.name === ROLES.HR;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved">("all");

  const filteredOvertime = useMemo(() => {
    return MOCK_OVERTIME.filter(item => {
      const matchesSearch = item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.reason.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === "all" || item.status.toLowerCase() === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [searchTerm, activeTab]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <Timer size={20} strokeWidth={2.5} />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Overtime Management</span>
          </div>
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight">
            {isAdmin ? "Overtime Approval" : "My Overtime"}
          </h1>
          <p className="text-neutral-500 font-medium">
            {isAdmin ? "Review and validate employee extra work hours." : "Keep track of your extra hours and compensation."}
          </p>
        </div>

        {!isAdmin && (
          <Button className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 px-6 py-3 rounded-2xl transition-all active:scale-95">
            <Plus size={18} />
            <span className="font-bold">Claim Overtime</span>
          </Button>
        )}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm group hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <Timer size={28} />
            </div>
            <div>
              <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">Total Hours (MTD)</p>
              <h3 className="text-2xl font-black text-neutral-900">15.5 Hours</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm group hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">Approved</p>
              <h3 className="text-2xl font-black text-neutral-900">8 Requests</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm group hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <Clock size={28} />
            </div>
            <div>
              <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">Pending Review</p>
              <h3 className="text-2xl font-black text-neutral-900">1 Request</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Table Area */}
      <div className="bg-white rounded-[32px] border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="relative w-full lg:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or reason..."
              className="w-full pl-12 pr-4 h-12 bg-neutral-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 bg-neutral-100/50 p-1 rounded-[18px]">
            {(["all", "pending", "approved"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all ${
                  activeTab === tab 
                    ? "bg-white text-amber-600 shadow-sm" 
                    : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50/50 border-b border-neutral-100">
                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Employee</th>
                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Duration</th>
                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Total</th>
                <th className="px-6 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-right font-black text-neutral-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filteredOvertime.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={item.avatar} name={item.employeeName} className="w-10 h-10 rounded-xl" />
                      <div>
                        <p className="text-sm font-black text-neutral-900">{item.employeeName}</p>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight line-clamp-1 max-w-[150px]">{item.reason}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-neutral-700">{new Date(item.date).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-neutral-300" />
                      <span className="text-sm font-bold text-neutral-700">{item.startTime} - {item.endTime}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className="bg-amber-50 text-amber-700 border-none font-black text-[11px] px-3 py-1 rounded-lg">
                      {item.hours} Hours
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={`border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      item.status === "Approved" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                    }`}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      {isAdmin && item.status === "Pending" ? (
                        <>
                          <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Approve">
                            <Check size={18} strokeWidth={3} />
                          </button>
                          <button className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Reject">
                            <X size={18} strokeWidth={3} />
                          </button>
                        </>
                      ) : (
                        <button className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                          <FileText size={18} />
                        </button>
                      )}
                      <button className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
