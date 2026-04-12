import LoansView from "@/views/finance/Loans";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Employee Loans & Advances | Finance Operations",
  description: "Track employee cash advances and automatic payroll installments.",
};

export default function LoansPage() {
  return <LoansView />;
}
