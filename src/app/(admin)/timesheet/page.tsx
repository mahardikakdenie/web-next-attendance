import TimesheetView from "@/views/timesheet/Index";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Timesheet | Attendance Management",
  description: "Log your daily work hours and view reports.",
};

export default function TimesheetPage() {
  return <TimesheetView />;
}
