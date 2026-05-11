import TimesheetMonitoringView from "@/views/timesheet/Monitoring";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Timesheet Monitoring | HR Dashboard",
  description: "Monitor and analyze employee work logs across the organization.",
};

export default function TimesheetMonitoringPage() {
  return <TimesheetMonitoringView />;
}
