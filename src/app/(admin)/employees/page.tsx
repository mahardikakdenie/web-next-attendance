import EmployeesView from "@/views/employees/Index";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Employees | Attendance Management",
  description: "View organization employee directory.",
};

export default function EmployeesPage() {
  return <EmployeesView />;
}
