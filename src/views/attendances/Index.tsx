"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, FileDown, Plus } from "lucide-react";
import AttendanceFilter from "@/components/attendance/AttendanceFilter";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";
import SummarySection from "@/components/attendance/SummarySection";
import { useAuthStore, ROLES } from "@/store/auth.store";
import { Button } from "@/components/ui/Button";
import { TableSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function AttendancesView() {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && user.role.name === ROLES.USER) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading || (user && user.role.name === ROLES.USER)) {
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
          <Skeleton className="h-40 rounded-[32px]" />
          <Skeleton className="h-40 rounded-[32px]" />
          <Skeleton className="h-40 rounded-[32px]" />
        </div>

        <Skeleton className="h-16 w-full rounded-[24px]" />
        
        <div className="bg-white rounded-[32px] border border-neutral-200 p-8">
          <TableSkeleton rows={6} cols={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Dynamic Header */}
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
        <AttendanceTable />
      </div>
    </div>
  );
}