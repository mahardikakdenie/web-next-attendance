import SchedulesView from "@/views/schedules/Index";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work Schedules | HR Operations",
  description: "Manage employee shifts, weekly rosters, and work assignments.",
};

export default function SchedulesPage() {
  return <SchedulesView />;
}
