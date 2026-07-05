"use client";

import { useState } from "react";
import { Loader2, Wallet, CheckCircle2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExpense, CreateExpensePayload } from "@/service/finance";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import NativeSelect from "@/components/ui/NativeSelect";
import Textarea from "@/components/ui/Textarea";

type ExpenseCategory = "Travel" | "Medical" | "Supplies" | "Equipment" | "Other";
const CATEGORIES: ExpenseCategory[] = ["Travel", "Medical", "Supplies", "Equipment", "Other"];

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export function ReimbursementRequestCard() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [newClaim, setNewClaim] = useState<Partial<CreateExpensePayload>>({
    category: "Travel",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const quota = user?.expense_quota || 0;
  const isOverQuota = (newClaim.amount || 0) > quota;

  const createMutation = useMutation({
    mutationFn: (payload: CreateExpensePayload) => createExpense(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses-summary"] });
      toast.success("Expense claim berhasil disubmit!");
      setNewClaim({
        category: "Travel",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        description: "",
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.meta?.message || "Gagal melakukan submit expense claim");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClaim.category && newClaim.amount && newClaim.date && newClaim.description) {
      if (isOverQuota) {
        toast.error("Nominal yang dimasukkan melebihi sisa kuota Anda!");
        return;
      }
      createMutation.mutate(newClaim as CreateExpensePayload);
    } else {
      toast.error("Mohon lengkapi semua field yang wajib diisi");
    }
  };

  return (
    <div className="bg-white rounded-[2rem] sm:rounded-[40px] p-6 sm:p-8 shadow-xl shadow-slate-200/50 h-full flex flex-col relative overflow-hidden border border-slate-100">
      
      {/* HEADER SECTION */}
      <div className="mb-6 space-y-2">
        <h3 className="text-2xl font-black tracking-tight text-slate-900">
          Ajukan Expense Claim
        </h3>
        <p className="text-slate-500 text-sm font-medium leading-relaxed">
          Lengkapi form di bawah ini untuk mengajukan klaim pengeluaran (reimbursement). Pastikan nominal tidak melebihi sisa kuota bulanan Anda.
        </p>
      </div>

      {/* QUOTA DISPLAY (Peringatan Jelas) */}
      <div className={`mb-6 p-4 rounded-2xl flex items-center gap-4 border ${
        isOverQuota ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-indigo-50 border-indigo-100 text-indigo-700"
      }`}>
        <Wallet className={`w-8 h-8 flex-shrink-0 ${isOverQuota ? "text-rose-500" : "text-indigo-500"}`} />
        <div>
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">Sisa Kuota Anda Bulan Ini</p>
          <p className="text-xl font-black tracking-tight">{formatCurrency(quota)}</p>
        </div>
      </div>

      {/* FORM SECTION */}
      <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
        <NativeSelect
          required
          label="Kategori Pengeluaran"
          value={newClaim.category}
          onChange={(e) => setNewClaim({ ...newClaim, category: e.target.value as ExpenseCategory })}
          options={CATEGORIES.map(cat => ({ label: cat, value: cat }))}
        />

        <Input
          required
          type="number"
          label="Nominal (IDR)"
          value={newClaim.amount || ""}
          onChange={(e) => setNewClaim({ ...newClaim, amount: Number(e.target.value) })}
          placeholder="Contoh: 150000"
          error={isOverQuota ? "Nominal melebihi sisa kuota!" : undefined}
        />

        <Input
          required
          type="date"
          label="Tanggal Pengeluaran"
          value={newClaim.date}
          onChange={(e) => setNewClaim({ ...newClaim, date: e.target.value })}
        />

        <Textarea
          required
          label="Deskripsi Detail"
          value={newClaim.description}
          onChange={(e) => setNewClaim({ ...newClaim, description: e.target.value })}
          placeholder="Jelaskan secara singkat untuk apa pengeluaran ini dilakukan..."
        />

        <div className="pt-4 mt-auto">
          <Button 
            type="submit" 
            disabled={createMutation.isPending || isOverQuota || !newClaim.amount} 
            className={`w-full h-14 rounded-2xl font-bold shadow-lg transition-all ${
              isOverQuota 
                ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/25 text-white" 
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25 text-white"
            }`}
          >
            {createMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Sedang Memproses...
              </span>
            ) : isOverQuota ? (
              "Sisa Kuota Tidak Mencukupi"
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Submit Expense Claim
              </span>
            )}
          </Button>
        </div>
      </form>
      
    </div>
  );
}
