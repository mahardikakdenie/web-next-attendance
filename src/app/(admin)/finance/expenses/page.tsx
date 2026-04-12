import ExpensesView from "@/views/finance/Expenses";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Expenses & Reimbursements | Finance Operations",
  description: "Manage employee expense claims and operational reimbursements.",
};

export default function ExpensesPage() {
  return <ExpensesView />;
}
