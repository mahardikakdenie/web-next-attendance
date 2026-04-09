import OvertimeView from "@/views/overtime/Index";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overtime | Attendance Management",
  description: "View and manage overtime requests.",
};

export default function OvertimePage() {
  return <OvertimeView />;
}
