import PayrollView from "@/views/payroll/Index";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payroll | Attendance Management",
  description: "View and download your monthly payslips.",
};

export default function PayrollPage() {
  return <PayrollView />;
}
