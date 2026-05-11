"use client";

import { useAuthStore } from "@/store/auth.store";
import { AlertCircle, X } from "lucide-react";
import { useState } from "react";

export default function BillingHealthBanner() {
  const { user } = useAuthStore();
  const [isVisible, setIsVisible] = useState(true);

  if (!user?.billing_health?.warning_message || !isVisible) {
    return null;
  }

  return (
    <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex items-center justify-between animate-in slide-in-from-top duration-500">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm border border-amber-200">
          <AlertCircle size={16} strokeWidth={2.5} />
        </div>
        <p className="text-xs font-black text-amber-900 uppercase tracking-tight">
          {user.billing_health.warning_message}
        </p>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="p-1.5 hover:bg-amber-100 rounded-lg text-amber-400 hover:text-amber-600 transition-all"
      >
        <X size={14} strokeWidth={3} />
      </button>
    </div>
  );
}
