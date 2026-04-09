import LeavesView from "@/views/leaves/Index";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaves | Attendance Management",
  description: "View and manage leave requests.",
};

export default function LeavesPage() {
  return <LeavesView />;
}
