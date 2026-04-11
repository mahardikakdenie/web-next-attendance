"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Users, FileDown, Plus, Eye, MoreVertical, MapPin, Smartphone } from "lucide-react";
import AttendanceFilter from "@/components/attendance/AttendanceFilter";
import SummarySection from "@/components/attendance/SummarySection";
import { useAuthStore, ROLES } from "@/store/auth.store";
import { Button } from "@/components/ui/Button";
import { TableSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { getDataAttendances } from "@/service/attendance";
import { DataTable, Column } from "@/components/ui/DataTable";
import { UserAttendance } from "@/types/api";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "On Time": "bg-emerald-50 text-emerald-700 border-emerald-100",
    "Late": "bg-amber-50 text-amber-700 border-amber-100",
    "Absent": "bg-rose-50 text-rose-700 border-rose-100",
    "On Leave": "bg-blue-50 text-blue-700 border-blue-100",
    "Done": "bg-emerald-50 text-emerald-700 border-emerald-100"
  };

  const dots: Record<string, string> = {
    "On Time": "bg-emerald-500",
    "Late": "bg-amber-500",
    "Absent": "bg-rose-500",
    "On Leave": "bg-blue-500",
    "Done": "bg-emerald-500"
  };

  const safeStatus = typeof status === "string" ? status : "No Record";
  const currentStyle = styles[safeStatus] || "bg-neutral-50 text-neutral-700 border-neutral-100";
  const currentDot = dots[safeStatus] || "bg-neutral-500";

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-black uppercase tracking-wider rounded-full border ${currentStyle}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${currentDot}`} />
      {safeStatus}
    </span>
  );
}

export default function AttendancesView() {
  const { user, loading: authLoading } = useAuthStore();
  const router = useRouter();

  const [data, setData] = useState<UserAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const resp = await getDataAttendances(page, 10);
      if (resp && resp.data) {
        const rawData = Array.isArray(resp.data) ? resp.data : [];

        const normalizedData: UserAttendance[] = rawData.map((item) => {
          const userObj = item.user;
          let employeeId = String(item.user_id);

          if (userObj && typeof userObj === "object") {
             if (userObj.employee_id) {
               employeeId = userObj.employee_id;
             }
          }

          return {
            ...item,
            user_id: Number(employeeId) || item.user_id
          };
        });

        setData(normalizedData);
        
        if (resp.meta) {
          if (resp.meta.pagination) {
            setTotalPages(resp.meta.pagination.last_page);
            setCurrentPage(resp.meta.pagination.current_page);
          } else if (resp.meta.last_page) {
            setTotalPages(resp.meta.last_page);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching attendances:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user && user.role?.name === ROLES.USER) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, fetchData]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns: Column<UserAttendance>[] = [
    {
      header: "Employee",
      accessor: (item) => (
        <div className="flex items-center gap-4">
          <div className="relative w-10 h-10 shrink-0">
            <Image
              src={(item.user && item.user.media_url) || "/profile.jpg"} 
              fill
              sizes="40px"
              alt={(item.user && item.user.name) || "User"}
              className="rounded-xl object-cover ring-2 ring-white shadow-sm"
            />
          </div>
          <div>
            <p className="text-sm font-black text-neutral-900 group-hover:text-blue-600 transition-colors">
              {item.user ? item.user.name : "Unknown"}
            </p>
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-tight">   
              ID: {item.user ? item.user.employee_id : item.user_id}
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
      header: "ClockIn Latitude",
      accessor: (item) => (
        <div className="flex items-center gap-1.5 text-neutral-500">
          <MapPin size={14} className="text-neutral-300" />
          <span className="text-xs font-bold">
            {item.clock_in_latitude}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Status",
      accessor: (item) => <StatusBadge status={item.status} />,
      sortable: true,
    },
  ];

  const actions = () => (
    <div className="flex items-center justify-end gap-2">
      <button className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
        <Eye size={18} />
      </button>
      <button className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all">
        <MoreVertical size={18} />
      </button>
    </div>
  );

  if (authLoading || (user && user.role?.name === ROLES.USER)) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">        
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-10 w-64 rounded-xl" />
            <Skeleton className="h-4 w-96 rounded-full" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-12 w-32 rounded-2xl" />
            <Skeleton className="h-12 w-40 rounded-2xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 rounded-4xl" />
          <Skeleton className="h-40 rounded-4xl" />
          <Skeleton className="h-40 rounded-4xl" />
        </div>

        <Skeleton className="h-16 w-full rounded-3xl" />

        <div className="bg-white rounded-4xl border border-neutral-200 p-8">
          <TableSkeleton rows={6} cols={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">  
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Users size={20} strokeWidth={2.5} />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Attendance System</span>
          </div>
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Real-time Activity</h1>
          <p className="text-neutral-500 font-medium">Monitor and manage employee presence across all work locations.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button className="flex items-center gap-2 bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 shadow-sm px-5 py-2.5 rounded-2xl transition-all active:scale-95">
            <FileDown size={18} />
            <span className="font-bold">Export Logs</span>
          </Button>
          <Button className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 px-5 py-2.5 rounded-2xl transition-all active:scale-95">
            <Plus size={18} />
            <span className="font-bold">Add Manual Entry</span>
          </Button>
        </div>
      </div>

      <SummarySection />

      <div className="space-y-4">
        <AttendanceFilter />
        <DataTable
          data={data}
          columns={columns}
          searchKey="status"
          searchPlaceholder="Search attendance status..."
          actions={actions}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
