"use client";

import { useState } from "react";
import { X, Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import NativeSelect from "@/components/ui/NativeSelect";
import Textarea from "@/components/ui/Textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExpense, CreateExpensePayload } from "@/service/finance";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";

interface CreateExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// 1. Definisikan tipe spesifik untuk Kategori
type ExpenseCategory = "Travel" | "Medical" | "Supplies" | "Equipment" | "Other";

// 2. Definisikan interface untuk Error Response (biasanya dari Axios)
interface ApiError {
  response?: {
    data?: {
      meta?: {
        message?: string;
      };
    };
  };
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

const CATEGORIES: ExpenseCategory[] = ["Travel", "Medical", "Supplies", "Equipment", "Other"];

export default function CreateExpenseModal({ open, onClose, onSuccess }: CreateExpenseModalProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [newClaim, setNewClaim] = useState<Partial<CreateExpensePayload>>({
    category: "Travel",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const isOverQuota = (newClaim.amount || 0) > (user?.expense_quota || 0);

  const createMutation = useMutation({
    mutationFn: (payload: CreateExpensePayload) => createExpense(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses-summary"] });
      toast.success("Expense claim submitted successfully!");
      onSuccess?.();
      onClose();
      setNewClaim({
        category: "Travel",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        description: "",
      });
    },
    onError: (error: unknown) => {
      const err = error as ApiError;
      toast.error(err?.response?.data?.meta?.message || "Failed to submit expense claim");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClaim.category && newClaim.amount && newClaim.date && newClaim.description) {
      if (isOverQuota) {
        toast.error("Amount exceeds your remaining monthly quota!");
        return;
      }
      createMutation.mutate(newClaim as CreateExpensePayload);
    } else {
      toast.error("Please fill all required fields");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 relative">
        {/* Loading Overlay */}
        {createMutation.isPending && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-sm font-medium text-slate-600 animate-pulse">Submitting claim...</p>
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Submit New Claim</h2>
              
              {/* UI Badge untuk Quota agar lebih rapi */}
              <div className={`inline-flex items-center gap-2 border px-3 py-1.5 rounded-full transition-all ${
                isOverQuota ? "bg-rose-50 border-rose-100" : "bg-indigo-50 border-indigo-100"
              }`}>
                <Wallet className={`w-4 h-4 ${isOverQuota ? "text-rose-600" : "text-indigo-600"}`} />
                <span className={`text-xs font-semibold ${isOverQuota ? "text-rose-900" : "text-indigo-900"}`}>
                  Sisa kuota bulan ini: <span className={isOverQuota ? "text-rose-600" : "text-indigo-600"}>{formatCurrency(user?.expense_quota || 0)}</span>
                </span>
              </div>
            </div>
            
            <button 
              onClick={onClose} 
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <NativeSelect
              required
              label="Category"
              value={newClaim.category}
              onChange={(e) => setNewClaim({ ...newClaim, category: e.target.value as ExpenseCategory })}
              options={CATEGORIES.map(cat => ({ label: cat, value: cat }))}
            />

            <Input
              required
              type="number"
              label="Amount (IDR)"
              value={newClaim.amount || ""}
              onChange={(e) => setNewClaim({ ...newClaim, amount: Number(e.target.value) })}
              placeholder="e.g. 500000"
              error={isOverQuota ? "Amount exceeds your remaining monthly quota!" : undefined}
            />

            <Input
              required
              type="date"
              label="Date"
              value={newClaim.date}
              onChange={(e) => setNewClaim({ ...newClaim, date: e.target.value })}
            />

            <Textarea
              required
              label="Description"
              value={newClaim.description}
              onChange={(e) => setNewClaim({ ...newClaim, description: e.target.value })}
              placeholder="Brief explanation of the expense..."
            />

            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                variant="secondary" 
                className="flex-1 h-12 rounded-xl font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700" 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || isOverQuota || !newClaim.amount} 
                className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-sm font-semibold text-white transition-all disabled:opacity-50"
              >
                {createMutation.isPending ? "Submitting..." : "Submit Claim"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
