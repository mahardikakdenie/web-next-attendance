"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Calendar, 
  CheckCircle2, 
  MoreHorizontal,
  Plus,
  FileText,
  Loader2,
  AlertCircle,
  Search,
  ChevronDown,
  History
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuthStore, ROLES } from "@/store/auth.store";
import { Badge } from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { DataTable, Column } from "@/components/ui/DataTable";
import { getLeaveRequests, getLeaveBalances, LeaveRequestData } from "@/service/leave";
import LeaveApprovalModal from "@/components/leaves/LeaveApprovalModal";
import Input from "@/components/ui/Input";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function LeavesView() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isAdmin = user?.role?.name === ROLES.SUPERADMIN || user?.role?.name === ROLES.ADMIN || user?.role?.name === ROLES.HR;
  
  // 1. Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState(5);
  
  // 2. Tab & Modal State
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "rejected" | "ongoing">(
    isAdmin ? "pending" : "all"
  );
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequestData | null>(null);

  // 3. Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Helper to check if leave is ongoing
  const isOngoing = (startStr: string, endStr: string, status: string) => {
    if (status.toUpperCase() !== "APPROVED") return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = new Date(startStr);
    const end = new Date(endStr);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return now >= start && now <= end;
  };

  // Fetch Balances
  const { data: balancesData, isLoading: isBalanceLoading } = useQuery({
    queryKey: ["leave-balances"],
    queryFn: () => getLeaveBalances(),
  });

  const balances = balancesData?.data || [];

  // Fetch Requests (Data akan otomatis ter-update jika queryKey berubah)
  const { data: requestsData, isLoading: isRequestsLoading } = useQuery({
    queryKey: ["leave-requests", activeTab, limit, debouncedSearch, currentPage],
    queryFn: () => {
      let statusParam: string | undefined;
      
      if (activeTab === "all") {
        statusParam = undefined;
      } else if (activeTab === "ongoing") {
        statusParam = "approved"; // Fetch approved to filter locally
      } else {
        statusParam = activeTab.toLowerCase();
      }

      return getLeaveRequests({ 
        limit, 
        offset: (currentPage - 1) * limit, 
        status: statusParam,
        search: debouncedSearch,
        page: currentPage,
      });
    },
  });

  // Local filtering for "ongoing" tab
  const leaveRequests = useMemo(() => {
    const rawData = Array.isArray(requestsData?.data) ? requestsData.data : [];
    if (activeTab === "ongoing") {
      return rawData.filter(l => isOngoing(l.start_date, l.end_date, l.status));
    }
    return rawData;
  }, [requestsData, activeTab]);

  const total = requestsData?.meta?.total || 0;
  const isLoading = isRequestsLoading;

  // Handlers
  const handleTabChange = (tab: "all" | "pending" | "approved" | "rejected" | "ongoing") => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page on tab change
  };

  const handleSuccessAction = () => {
    // Invalidate queries to refetch data after approval/rejection
    queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
    queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
  };

  // Table Columns
  const columns: Column<LeaveRequestData>[] = [
    {
      header: "Employee",
      accessor: (leave) => (
        <div className="flex items-center gap-3">
          <Avatar 
            src={leave.user?.media_url || leave.user_avatar || "/profile.jpg"} 
            className="w-10 h-10 rounded-xl" 
          />
          <div>
            <p className="text-sm font-black text-neutral-900">
              {leave.user?.name || leave.user_name || 'Unknown'}
            </p>
            <p className="text-[10px] font-bold text-neutral-400 uppercase">
              {leave.user?.employee_id || 'STAFF'}
            </p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Leave Type",
      accessor: (leave) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            (leave.leave_type?.name || leave.leave_type_name || '').includes('Sick') 
              ? 'bg-rose-500' : 'bg-blue-500'
          }`} />
          <span className="text-sm font-bold text-neutral-700">
            {leave.leave_type?.name || leave.leave_type_name || 'Leave'}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Duration",
      accessor: (leave) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-neutral-700">{leave.total_days} Days</span>
          <span className="text-[10px] text-neutral-400 font-medium">
            {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Status",
      accessor: (leave) => {
        const status = leave.status.toUpperCase();
        const active = isOngoing(leave.start_date, leave.end_date, leave.status);
        
        const colors: Record<string, string> = {
          APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-100",
          PENDING: "bg-amber-50 text-amber-700 border-amber-100",
          REJECTED: "bg-rose-50 text-rose-700 border-rose-100",
        };
        const colorClass = colors[status] || "bg-slate-50 text-slate-700";

        return (
          <div className="flex flex-col gap-1.5">
            <Badge className={`border px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${colorClass}`}>
              {status}
            </Badge>
            {active && (
              <Badge className="bg-indigo-600 text-white border-none px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest w-fit animate-pulse">
                Running
              </Badge>
            )}
          </div>
        );
      },
      sortable: true,
    },
    {
      header: "Reason",
      accessor: (leave) => (
        <p className="text-sm text-neutral-500 font-medium line-clamp-1 max-w-[200px] italic">
          &quot;{leave.reason}&quot;
        </p>
      ),
    },
  ];

  const actions = (leave: LeaveRequestData) => (
    <div className="flex items-center justify-end gap-1">
      {isAdmin && leave.status.toUpperCase() === "PENDING" ? (
        <button 
          onClick={() => setSelectedRequest(leave)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" 
          title="Review Request"
        >
          <CheckCircle2 size={18} strokeWidth={2.5} />
        </button>
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 relative">
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-xs z-50 flex flex-col items-center justify-center rounded-[40px]">
           <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Data...</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <Calendar size={20} strokeWidth={2.5} />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Time Off Management</span>
          </div>
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight">
            {isAdmin ? "Approval Dashboard" : "My Leave History"}
          </h1>
          <p className="text-neutral-500 font-medium">
            {isAdmin 
              ? "Review and manage organizational leave requests." 
              : "Track your personal leave balance and application status."}
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
        {isBalanceLoading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-[32px]" />)
        ) : balances.length > 0 ? balances.map((bal, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm group hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                bal.leave_type.name.includes('Sick') ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
              }`}>
                <Calendar size={28} />
              </div>
              <div>
                <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">{bal.leave_type.name}</p>
                <h3 className="text-2xl font-black text-neutral-900">{bal.balance} Days Left</h3>
              </div>
            </div>
          </div>
        )) : (
          <div className="md:col-span-3 bg-slate-50 p-10 rounded-[32px] border border-dashed border-slate-200 text-center">
             <AlertCircle className="mx-auto text-slate-300 mb-3" size={32} />
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No active leave balances found</p>
          </div>
        )}
      </div>

      {/* Integrated Filters & Table Area */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white p-1.5 rounded-[22px] border border-neutral-100 w-fit shadow-xs">
            {isAdmin ? (
              (["pending", "ongoing", "approved", "rejected", "all"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-8 py-2.5 rounded-[18px] text-[11px] font-black uppercase tracking-wider transition-all ${
                    activeTab === tab 
                      ? "bg-neutral-900 text-white shadow-md" 
                      : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {tab}
                </button>
              ))
            ) : (
              <div className="px-8 py-2.5 rounded-[18px] text-[11px] font-black uppercase tracking-wider bg-neutral-900 text-white shadow-md flex items-center gap-2">
                <History size={14} />
                Application History
              </div>
            )}
          </div>

          {/* Search Input */}
          <div className="relative group min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <Input
              placeholder="Search by reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 bg-white border-neutral-200 rounded-2xl shadow-xs"
            />
          </div>
        </div>

        {/* Table Controls Info */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rows per page:</span>
            <div className="relative">
              <select 
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1); // Reset page on limit change
                }}
                className="appearance-none bg-white border border-neutral-200 rounded-lg pl-3 pr-8 py-1 text-xs font-bold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={12} />
            </div>
          </div>

          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Showing {leaveRequests.length} of {total} Records
          </p>
        </div>

        {/* Data Table */}
        <DataTable 
          data={leaveRequests} 
          columns={columns} 
          actions={actions}
          currentPage={currentPage}
          totalPages={requestsData?.meta?.pagination?.last_page || 1}
          onPageChange={(page) => setCurrentPage(page)}
          isLoading={isLoading}
        />
      </div>

      {/* Approval Modal */}
      {selectedRequest && (
        <LeaveApprovalModal 
          open={!!selectedRequest}
          leaveRequest={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSuccess={handleSuccessAction}
        />
      )}
    </div>
  );
}
