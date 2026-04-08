import AttendancesView from "@/views/attendances/Index";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attendances | Attendance Management",
  description: "View and manage employee attendance records.",
};

export default function AttendancesPage() {
  return <AttendancesView />;
}