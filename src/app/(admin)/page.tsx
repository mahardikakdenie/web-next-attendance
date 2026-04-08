import UserDashboardPage from "@/views/dashboard/UserDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Attendance Management",
  description: "Employee attendance dashboard.",
};

export default function Page() {
  return <UserDashboardPage />;
}