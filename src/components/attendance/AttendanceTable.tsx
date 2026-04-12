"use client";

import Image from "next/image";
import { Eye, MoreVertical, MapPin, Smartphone } from "lucide-react";
import { DataTable, Column } from "../ui/DataTable";
import { UserAttendance } from "@/types/api";
import dayjs from "dayjs";

type AttendanceStatus = "On Time" | "Late" | "Absent" | "On Leave";

interface AttendanceTableProps {
  data: UserAttendance[];
  total: number;
  limit: number;
  offset: number;
  onPageChange: (newOffset: number) => void;
  isLoading?: boolean;
}

function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = (status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()) as AttendanceStatus;
  
  const styles: Record<AttendanceStatus, string> = {
    "On Time": "bg-emerald-50 text-emerald-700 border-emerald-100",
    "Late": "bg-amber-50 text-amber-700 border-amber-100",
    "Absent": "bg-rose-50 text-rose-700 border-rose-100",
    "On Leave": "bg-blue-50 text-blue-700 border-blue-100"
  };

  const dots: Record<AttendanceStatus, string> = {
    "On Time": "bg-emerald-500",
    "Late": "bg-amber-500",
    "Absent": "bg-rose-500",
    "On Leave": "bg-blue-500"
  };

  const currentStyle = styles[normalizedStatus] || "bg-neutral-50 text-neutral-700 border-neutral-100";
  const currentDot = dots[normalizedStatus] || "bg-neutral-500";

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-black uppercase tracking-wider rounded-full border ${currentStyle}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${currentDot}`} />
      {normalizedStatus}
    </span>
  );
}

export function AttendanceTable({
  data,
  total,
  limit,
  offset,
  onPageChange,
  isLoading = false
}: AttendanceTableProps) {
  const columns: Column<UserAttendance>[] = [
    {
      header: "Employee",
      accessor: (item) => (
        <div className="flex items-center gap-4">
          <div className="relative w-10 h-10 shrink-0">
            <Image
              src={item.user?.media_url || "https://i.pravatar.cc/150"}
              fill
              sizes="40px"
              alt={item.user?.name || "User"}
              className="rounded-xl object-cover ring-2 ring-white shadow-sm"
            />
          </div>
          <div>
            <p className="text-sm font-black text-neutral-900 group-hover:text-blue-600 transition-colors">
              {item.user?.name || "Unknown"}
            </p>
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-tight">
              {item.user?.employee_id || "EMP-???"}
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
            {item.clock_in_time ? dayjs(item.clock_in_time).format("HH:mm A") : "--:--"}
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
          {item.clock_out_time ? dayjs(item.clock_out_time).format("HH:mm A") : "--:--"}
        </span>
      ),
      sortable: true,
    },
    {
      header: "Location",
      accessor: (item) => (
        <div className="flex items-center gap-1.5 text-neutral-500">
          <MapPin size={14} className="text-neutral-300" />
          <span className="text-xs font-bold">{item.location || "Office"}</span>
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

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return (
    <DataTable 
      data={data} 
      columns={columns} 
      searchKey="id" 
      searchPlaceholder="Search attendance..."
      actions={actions}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={(page) => onPageChange((page - 1) * limit)}
    />
  );
}
