"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AttendanceFilter from "@/components/attendance/AttendanceFilter";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";
import SummarySection from "@/components/attendance/SummarySection";
import { useAuthStore, ROLES } from "@/store/auth.store";

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
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Attendance</h1>

      <SummarySection />
      <AttendanceFilter />
      <AttendanceTable />
    </div>
  );
}