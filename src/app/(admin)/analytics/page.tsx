import DashboardRouter from "@/views/dashboard/DashboardRouter";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics | Attendance Management",
  description: "Employee analytics and reporting dashboard.",
};

export default function AnalyticsPage() {
  return <DashboardRouter />;
}
