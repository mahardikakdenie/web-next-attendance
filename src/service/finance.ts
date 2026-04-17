import { secureRequest } from "@/lib/axios";
import { APIResponse } from "@/types/api";
import { ExpenseClaim, ExpenseStatus } from "@/types/finance";

export interface ExpenseFilterParams {
  status?: ExpenseStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ExpenseSummaryStats {
  pendingAmount: number;
  approvedThisMonthAmount: number;
  topCategory: {
    name: string;
    percentage: number;
  };
}

export interface CreateExpensePayload {
  category: string;
  amount: number;
  date: string;
  description: string;
  receipt?: File | string;
}

export const getExpenses = async (params: ExpenseFilterParams) => {
  return secureRequest<APIResponse<ExpenseClaim[]>>("get", "/v1/finance/expenses", params);
};

export const getExpensesSummary = async () => {
  return secureRequest<APIResponse<ExpenseSummaryStats>>("get", "/v1/finance/expenses/summary");
};

export const createExpense = async (payload: CreateExpensePayload) => {
  // Use FormData if there is a file (receipt)
  if (payload.receipt instanceof File) {
    const formData = new FormData();
    formData.append("category", payload.category);
    formData.append("amount", payload.amount.toString());
    formData.append("date", payload.date);
    formData.append("description", payload.description);
    formData.append("receipt", payload.receipt);

    return secureRequest<APIResponse<ExpenseClaim>>("post", "/v1/finance/expenses", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  return secureRequest<APIResponse<ExpenseClaim>>("post", "/v1/finance/expenses", payload);
};

export const approveExpense = async (id: number) => {
  return secureRequest<APIResponse<null>>("patch", `/v1/finance/expenses/${id}/approve`);
};

export const rejectExpense = async (id: number, reason: string) => {
  return secureRequest<APIResponse<null>>("patch", `/v1/finance/expenses/${id}/reject`, { reason });
};

export const updateUserQuota = async (userId: number, quota: number) => {
  return secureRequest<APIResponse<null>>("patch", `/v1/finance/quotas/${userId}`, { quota });
};
