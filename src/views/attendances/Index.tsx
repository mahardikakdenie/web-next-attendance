"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Eye, 
  MoreVertical, 
  MapPin, 
  Smartphone,
  SearchX,
  RotateCcw,
  Download,
  CalendarDays,
  FileEdit,
  History,
  CheckCircle2
} from "lucide-react";
import AttendanceFilter from "@/components/attendance/AttendanceFilter";
import SummarySection from "@/components/attendance/SummarySection";
import { useAuthStore, ROLES } from "@/store/auth.store";
import { Button } from "@/components/ui/Button";
import { Can } from "@/components/auth/PermissionGuard";
import { TableSkeleton, Skeleton } from "@/components/ui/Skeleton";
import Avatar from "@/components/ui/Avatar";
import { getProfileImage } from "@/lib/utils";
import { getDataAttendances, getDataSummary } from "@/service/attendance";
import { DataTable, Column } from "@/components/ui/DataTable";
import { AttendanceFilterParams, AttendanceRecord } from "@/types/api";
import CorrectionRequestModal from "@/components/attendance/CorrectionRequestModal";
import CorrectionsView from "./Corrections";
import { useQuery } from "@tanstack/react-query";

export interface SummaryData {
  total_record: number;
  total_record_diff: number;
  ontime_summary: number;
  ontime_summary_diff: number;
  late_summary: number;
  late_summary_diff: number;
}

function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status?.toLowerCase() || "unknown";

  const config: Record<string, { label: string, container: string, dot: string }> = {
    working: {
      label: "Working",
      container: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-500/10",
      dot: "bg-emerald-500 animate-pulse"
    },
    done: {
      label: "Completed",
      container: "bg-blue-50 text-blue-700 border-blue-200 shadow-sm shadow-blue-500/10",
      dot: "bg-blue-500"
    },
    late: {
      label: "Late Arrival",
      container: "bg-amber-50 text-amber-700 border-amber-200 shadow-sm shadow-amber-500/10",
      dot: "bg-amber-500"
    },
    absent: {
      label: "Absent",
      container: "bg-rose-50 text-rose-700 border-rose-200 shadow-sm shadow-rose-500/10",
      dot: "bg-rose-500"
    },
    on_leave: {
      label: "On Leave",
      container: "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm shadow-indigo-500/10",
      dot: "bg-indigo-500"
    }
  };

  const displayConfig = config[normalizedStatus] || 
    (normalizedStatus.includes("time") ? config.working : null) ||
    (normalizedStatus.includes("done") ? config.done : null) ||
    {
      label: status || "Unknown",
      container: "bg-slate-50 text-slate-600 border-slate-200",
      dot: "bg-slate-400"
    };

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 ${displayConfig.container} transition-all`}>
      <span className={`w-2 h-2 rounded-full ${displayConfig.dot}`} />
      {displayConfig.label}
    </span>
  );
}

export default function AttendancesView() {
  const { user, loading: authLoading } = useAuthStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"logs" | "corrections">("logs");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);

  const [filters, setFilters] = useState<AttendanceFilterParams>({
    status: '',
    date_from: '',
    date_to: '',
    search: ''
  });

  const offset = (currentPage - 1) * limit;

  // React Query: Summary Data
  const { data: summaryResp, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["attendance-summary", filters],
    queryFn: () => getDataSummary(filters),
    enabled: activeTab === "logs",
  });

  const summaryData = summaryResp?.data as unknown as SummaryData | null;

  // React Query: Attendance List
  const { data: attendanceResp, isLoading: isAttendanceLoading } = useQuery({
    queryKey: ["attendance-list", currentPage, filters],
    queryFn: () => getDataAttendances(
      limit,
      offset,
      filters.status.toLowerCase(), 
      filters.date_from, 
      filters.date_to,
      filters.search
    ),
    enabled: activeTab === "logs",
  });

  const rawData = useMemo(() => attendanceResp?.data || [], [attendanceResp?.data]);
  const meta = attendanceResp?.meta;
  const totalPages = meta ? meta?.pagination?.last_page : 1;

  const data: AttendanceRecord[] = useMemo(() => {
    return rawData.map((item) => ({
      ...item,
      id: item.id || `att-${item.user_id}-${item.clock_in_time}`,
      user: item.user || { 
        name: "Unknown User", 
        employee_id: String(item.user_id),
        media_url: null
      }
    } as AttendanceRecord));
  }, [rawData]);

  useEffect(() => {
    if (!authLoading && user && user.role?.name === ROLES.USER) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleFilterChange = useCallback((newFilters: Partial<AttendanceFilterParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

  const resetFilters = () => {
    setFilters({
      status: '',
      date_from: '',
      date_to: '',
      search: ''
    });
    setCurrentPage(1);
  };

  const columns: Column<AttendanceRecord>[] = useMemo(() => [
    {
      header: "Employee",
      accessor: (item) => (
        <div className="flex items-center gap-4">
          <Avatar 
            src={getProfileImage(item.user?.media_url)} 
            name={item.user?.name}
            className="w-10 h-10 rounded-xl"
          />
          <div>
            <p className="text-sm font-black text-neutral-900 group-hover:text-blue-600 transition-colors">
              {item.user?.name || "Unknown"}
            </p>
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-tight">   
              ID: {item.user?.employee_id || item.user_id}
            </p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Clock In",
      accessor: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-neutral-700">
            {item.clock_in_time ? new Date(item.clock_in_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}
          </span>
          <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-bold mt-0.5 uppercase">
            <Smartphone size={10} /> Mobile App
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Clock Out",
      accessor: (item) => (
        <span className="text-sm font-bold text-neutral-700">
          {item.clock_out_time ? new Date(item.clock_out_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}
        </span>
      ),
      sortable: true,
    },
    {
      header: "Status",
      accessor: (item) => <StatusBadge status={item.status} />,
      sortable: true,
    },
    {
      header: "Location",
      accessor: (item) => (
        <div className="flex items-center gap-1.5 text-neutral-500">
          <MapPin size={14} className="text-neutral-300" />
          <span className="text-xs font-bold truncate max-w-[120px]">
            {item.clock_in_latitude}, {item.clock_in_longitude}
          </span>
        </div>
      ),
    },
  ], []);

  const actions = useCallback(() => (
    <div className="flex items-center justify-end gap-2">
      <button className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
        <Eye size={18} />
      </button>
      <button className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all">
        <MoreVertical size={18} />
      </button>
    </div>
  ), []);

  if (authLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">        
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-10 w-64 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 rounded-4xl" />
          <Skeleton className="h-40 rounded-4xl" />
          <Skeleton className="h-40 rounded-4xl" />
        </div>
        <div className="bg-white rounded-4xl border border-neutral-200 p-8">
          <TableSkeleton rows={6} cols={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">  
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Users size={20} strokeWidth={2.5} />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Attendance System</span>
          </div>
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight">
            {activeTab === "logs" ? "Real-time Activity" : "Correction Requests"}
          </h1>
          <p className="text-neutral-500 font-medium">
            {activeTab === "logs" 
              ? "Monitor and manage employee presence across all work locations."
              : "Review and approve attendance adjustment requests from employees."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => setShowCorrectionModal(true)}
            variant="secondary" 
            className="px-5 py-2.5 rounded-2xl border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
          >
            <FileEdit size={18} />
            <span className="font-bold">Request Correction</span>
          </Button>
          <Can permission="attendance.export">
            <Button variant="secondary" className="px-5 py-2.5 rounded-2xl">
              <Download size={18} />
              <span className="font-bold">Export Logs</span>
            </Button>
          </Can>
          <Can permission="schedule.view">
            <Button 
              onClick={() => router.push("/schedules")}
              className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 px-5 py-2.5 rounded-2xl"
            >
              <CalendarDays size={18} />
              <span className="font-bold">View Schedules</span>
            </Button>
          </Can>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-[22px] border border-neutral-100 w-fit shadow-xs">
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-8 py-2.5 rounded-[18px] text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === "logs" 
              ? "bg-slate-900 text-white shadow-md" 
              : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          <History size={14} />
          Real-time Logs
        </button>
        <button
          onClick={() => setActiveTab("corrections")}
          className={`px-8 py-2.5 rounded-[18px] text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === "corrections" 
              ? "bg-slate-900 text-white shadow-md" 
              : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          <CheckCircle2 size={14} />
          Corrections
        </button>
      </div>

      {activeTab === "logs" ? (
        <>
          <SummarySection data={summaryData} isLoading={isSummaryLoading} />

          <div className="space-y-6">
            <AttendanceFilter onFilterChange={handleFilterChange} currentFilters={filters} />
            
            {data.length === 0 && !isAttendanceLoading ? (
              <div className="bg-white rounded-[40px] border border-neutral-100 p-20 flex flex-col items-center text-center shadow-sm animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-slate-50/50">
                  <SearchX size={48} className="text-slate-200" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">No Matching Records</h3>
                <p className="text-slate-400 font-medium max-w-sm leading-relaxed mb-10 text-sm">
                  We couldn&apos;t find any attendance logs matching your current filters. Try searching for something else or reset the view.
                </p>
                <Button 
                  onClick={resetFilters}
                  className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-8 py-4 rounded-2xl transition-all shadow-xl shadow-slate-200 active:scale-95"
                >
                  <RotateCcw size={18} strokeWidth={2.5} />
                  <span className="font-black uppercase tracking-widest text-xs">Reset All Filters</span>
                </Button>
              </div>
            ) : (
              <DataTable
                data={data}
                columns={columns}
                actions={actions}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={isAttendanceLoading}
                limit={limit}
                onLimitChange={(val) => {
                  setLimit(val);
                  setCurrentPage(1);
                }}
              />
            )}
          </div>
        </>
      ) : (
        <CorrectionsView />
      )}

      <CorrectionRequestModal
        open={showCorrectionModal}
        onClose={() => setShowCorrectionModal(false)}
        onSuccess={() => {
          // If we are on corrections tab, it will auto-refetch if we use react-query there too
          // Or we can use queryClient.invalidateQueries(["corrections-list"])
        }}
      />
    </div>
  );
}
