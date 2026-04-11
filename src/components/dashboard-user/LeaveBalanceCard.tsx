"use client";

import { useEffect, useState, useCallback } from "react";
import { Calendar, Info } from "lucide-react";
import { getLeaveBalances } from "@/service/leave";
import { Balance } from "@/types/api";
import { useRefresh } from "@/lib/RefreshContext";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuthStore } from "@/store/auth.store";

export function LeaveBalanceCard() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const {user} = useAuthStore();
  const { refreshKey } = useRefresh();

  const fetchBalances = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getLeaveBalances();
      const found = res.data?.find(curr => curr.user_id === user?.id);
      console.log("🚀 ~ LeaveBalanceCard ~ found:", found)
      setBalances(found ? [found] : []);
    } catch (error) {
      console.error("Failed to fetch leave balances", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances, refreshKey]);

  if (loading) {
    return (
      <div className="w-full h-full rounded-[28px] border border-neutral-200 bg-white p-6 space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-4">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Default fallback if no data
  const displayBalances = balances?.length > 0 ? balances : [
    { leave_type: {name: "Annual Leave"}, balance: 0, }
  ];

  return (
    <div className="w-full h-full rounded-[28px] border border-neutral-200 bg-white p-6 flex flex-col shadow-sm transition-all hover:shadow-md">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="text-blue-600" size={20} />
          <h2 className="text-base font-bold text-neutral-800">Leave Balance</h2>
        </div>
        <button className="text-neutral-400 hover:text-neutral-600">
          <Info size={16} />
        </button>
      </div>

      <div className="space-y-5 grow">
        {displayBalances.map((balance, index) => {
          const percentage = (balance.balance / 12) * 100;
          
          return (
            <div key={index} className="space-y-3">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-1">{balance.leave_type.name}</p>
                  <h3 className="text-2xl font-black text-neutral-900 leading-none">
                    {balance.balance} <span className="text-sm font-bold text-neutral-400">/ 12 Days</span>
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase">Used</p>
                  <p className="text-sm font-black text-neutral-700">{balance.balance} Days</p>
                </div>
              </div>

              <div className="relative h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${100 - percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-5 border-t border-neutral-100 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-blue-600" />
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Remaining</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-neutral-200" />
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Used</span>
        </div>
      </div>
    </div>
  );
}
