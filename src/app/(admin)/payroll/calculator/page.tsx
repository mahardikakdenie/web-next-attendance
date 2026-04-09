import SalaryCalculatorView from "@/views/payroll/calculator/Index";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Salary Calculator | Attendance Management",
  description: "Calculate take home pay with latest TER tax regulations.",
};

export default function SalaryCalculatorPage() {
  return <SalaryCalculatorView />;
}
