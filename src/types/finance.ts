export type ExpenseStatus = "Pending" | "Approved" | "Rejected";
export type ExpenseCategory = "Travel" | "Medical" | "Supplies" | "Equipment" | "Other";

export interface ExpenseClaim {
  id: string;
  employeeName: string;
  avatar: string;
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
  avatar: string;
  principalAmount: number;
  monthlyInstallment: number;
  remainingBalance: number;
  interestRate: number; // e.g., 0 for cash advance
  tenorMonths: number;
  paidMonths: number;
  status: LoanStatus;
  startDate: string;
}
