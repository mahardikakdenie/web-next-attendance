"use client";

import { useState, useMemo } from "react";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  MoreHorizontal,
  Plus,
  Check,
  X,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuthStore, ROLES } from "@/store/auth.store";
import { Badge } from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { DataTable, Column } from "@/components/ui/DataTable";

interface LeaveRequest {
  id: number;
  employeeName: string;
  avatar: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  reason: string;
}

const MOCK_LEAVES: LeaveRequest[] = [
  {
    id: 1,
    employeeName: "Bagus Fikri",
    avatar: "https://i.pravatar.cc/150?u=bagus",
    type: "Annual Leave",
    startDate: "2024-03-10",
    endDate: "2024-03-12",
    days: 3,
    status: "Approved",
    reason: "Family vacation",
  },
  {
    id: 2,
    employeeName: "Ihdizein",
    avatar: "https://i.pravatar.cc/150?u=ihdizein",
    type: "Sick Leave",
    startDate: "2024-02-15",
    endDate: "2024-02-15",
    days: 1,
    status: "Approved",
    reason: "Fever",
  },
  {
    id: 3,
    employeeName: "Mufti Hidayat",
    avatar: "https://i.pravatar.cc/150?u=mufti",
    type: "Annual Leave",
    startDate: "2024-04-01",
    endDate: "2024-04-02",
    days: 2,
    status: "Pending",
    reason: "Personal business",
  },
];

export default function LeavesView() {
  const { user } = useAuthStore();
  const isAdmin = user?.role?.name === ROLES.SUPERADMIN || user?.role?.name === ROLES.ADMIN || user?.role?.name === ROLES.HR;
  
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved">("all");

  const filteredLeaves = useMemo(() => {
    return MOCK_LEAVES.filter(leave => {
      const matchesTab = activeTab === "all" || leave.status.toLowerCase() === activeTab;
      return matchesTab;
    });
  }, [activeTab]);

  const columns: Column<LeaveRequest>[] = [
    {
      header: "Employee",
      accessor: (leave) => (
        <div className="flex items-center gap-3">
          <Avatar src={leave.avatar} className="w-10 h-10 rounded-xl" />
          <div>
            <p className="text-sm font-black text-neutral-900">{leave.employeeName}</p>
            <p className="text-[10px] font-bold text-neutral-400 uppercase">EMP-00{leave.id}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Leave Type",
      accessor: (leave) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${leave.type.includes('Sick') ? 'bg-rose-500' : 'bg-blue-500'}`} />
          <span className="text-sm font-bold text-neutral-700">{leave.type}</span>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Duration",
      accessor: (leave) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-neutral-700">{leave.days} Days</span>
          <span className="text-[10px] text-neutral-400 font-medium">
            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Status",
      accessor: (leave) => (
        <Badge className={`border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
          leave.status === "Approved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
        }`}>
          {leave.status}
        </Badge>
      ),
      sortable: true,
    },
    {
      header: "Reason",
      accessor: (leave) => (
        <p className="text-sm text-neutral-500 font-medium line-clamp-1 max-w-[200px]">{leave.reason}</p>
      ),
    },
  ];

  const actions = (leave: LeaveRequest) => (
    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
      {isAdmin && leave.status === "Pending" ? (
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
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <Calendar size={20} strokeWidth={2.5} />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Time Off Management</span>
          </div>
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight">
            {isAdmin ? "Leave Requests" : "My Leaves"}
          </h1>
          <p className="text-neutral-500 font-medium">
            {isAdmin ? "Review and manage employee time-off applications." : "Track your leave balance and request history."}
          </p>
        </div>

        {!isAdmin && (
          <Button className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 px-6 py-3 rounded-2xl transition-all active:scale-95">
            <Plus size={18} />
            <span className="font-bold">Request Time Off</span>
          </Button>
        )}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm group hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <Calendar size={28} />
            </div>
            <div>
              <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">Total Balance</p>
              <h3 className="text-2xl font-black text-neutral-900">12 Days</h3>
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
              <h3 className="text-2xl font-black text-neutral-900">4 Requests</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm group hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
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
      <div className="space-y-4">
        <div className="flex items-center gap-1 bg-white p-1 rounded-[22px] border border-neutral-100 w-fit shadow-xs">
          {(["all", "pending", "approved"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2.5 rounded-[18px] text-[11px] font-black uppercase tracking-wider transition-all ${
                activeTab === tab 
                  ? "bg-neutral-900 text-white shadow-md" 
                  : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <DataTable 
          data={filteredLeaves} 
          columns={columns} 
          searchKey="employeeName" 
          searchPlaceholder="Search by name or type..."
          actions={actions}
        />
      </div>
    </div>
  );
}
