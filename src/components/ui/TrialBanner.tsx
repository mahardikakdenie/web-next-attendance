"use client";

import { useAuthStore } from "@/store/auth.store";
import { CreditCard, ArrowRight, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export default function TrialBanner() {
  const { user } = useAuthStore();
  const router = useRouter();

  const subscription = user?.subscription;
  const isTrial = subscription?.plan_name === "Trial" || subscription?.status === "Trial";

  const daysRemaining = useMemo(() => {
    if (!subscription?.next_billing_date) return 0;
    
    const now = new Date();
    const expiry = new Date(subscription.next_billing_date);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  }, [subscription]);

  if (!isTrial) return null;

  return (
    <div className="w-full bg-gradient-to-r from-amber-500 via-orange-600 to-amber-500 text-white py-2 px-4 shadow-md relative overflow-hidden group">
      {/* Animated background element */}
      <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
      
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
            <Clock size={16} className="text-white animate-pulse" />
          </div>
          <p className="text-xs sm:text-sm font-bold tracking-tight">
            Your <span className="underline decoration-2 decoration-amber-200 underline-offset-2">Free Trial</span> expires in <span className="text-lg px-1">{daysRemaining}</span> days. Upgrade to keep your team running smoothly!
          </p>
        </div>
        
        <button 
          onClick={() => router.push('/tenant-settings/billing')}
          className="flex items-center gap-2 bg-white text-orange-600 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider hover:bg-orange-50 transition-all shadow-sm shrink-0 whitespace-nowrap"
        >
          <CreditCard size={14} />
          Upgrade Now
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
