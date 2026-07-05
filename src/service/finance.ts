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

/**
 * @route POST /api/v1/finance/expenses
 * @description Endpoint ini digunakan untuk mensubmit atau membuat pengajuan expense claim baru oleh user.
 * 
 * @payload (Request Body JSON)
 * - category (string): [Required] Kategori pengeluaran (misal: "Travel", "Meals", "Transport").
 * - amount (number): [Required] Jumlah nominal pengeluaran.
 * - date (string): [Required] Tanggal pengeluaran dengan format YYYY-MM-DD.
 * - description (string): [Required] Deskripsi atau catatan detail pengeluaran.
 * - receipt (File | string): [Optional] URL/Base64 gambar struck atau object File untuk upload multipart.
 * 
 * @sideEffects
 * 1. Validasi Kuota: Backend akan menolak (HTTP 500) jika total amount klaim ini melebihi sisa kuota bulanan user.
 * 2. Database Insert: Data disimpan ke database dengan status awal "Pending".
 * 3. Activity Logging: Mencatat aktivitas pengajuan ke tabel RecentActivity.
 * 
 * @returns {Promise<APIResponse<ExpenseClaim>>} Mengembalikan object data claim jika berhasil (HTTP 201).
 * @throws {Error} Mengembalikan error JSON jika kuota tidak cukup atau payload tidak valid.
 */
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
