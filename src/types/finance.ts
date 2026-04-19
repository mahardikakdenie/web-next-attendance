export type ExpenseStatus = "Pending" | "Approved" | "Rejected";
export type ExpenseCategory = "Travel" | "Medical" | "Supplies" | "Equipment" | "Other";

export interface ExpenseClaim {
  id: number;
  claimID: string; // Display ID like EXP-001
  employeeName: string;
  avatar: string | null;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
  receiptUrl?: string;
  status: ExpenseStatus;
}

export type LoanStatus = "Active" | "Paid" | "Pending" | "Rejected";

export interface EmployeeLoan {
  id: string;
  employeeName: string;
  avatar: string | null;
  principalAmount: number;
  monthlyInstallment: number;
  remainingBalance: number;
  interestRate: number; // e.g., 0 for cash advance
  tenorMonths: number;
  paidMonths: number;
  status: LoanStatus;
  startDate: string;
}
