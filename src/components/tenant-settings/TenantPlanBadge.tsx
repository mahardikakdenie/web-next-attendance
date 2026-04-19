"use client";

import { useQuery } from "@tanstack/react-query";
import { getDataCurrentTenat } from "@/service/tenantSettings";
import { Badge } from "@/components/ui/Badge";
import { Crown, Zap, Shield, Loader2 } from "lucide-react";

export function TenantPlanBadge() {
  const { data, isLoading } = useQuery({
    queryKey: ["current-tenant-setting"],
    queryFn: () => getDataCurrentTenat(),
  });

  if (isLoading) {
    return <Loader2 className="w-4 h-4 animate-spin text-slate-300" />;
  }

  const plan = data?.data?.tenant?.plan || "Starter";

  const getPlanStyles = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "enterprise":
        return {
          bg: "bg-indigo-600 shadow-lg shadow-indigo-200",
          text: "text-white",
          icon: <Crown size={12} className="fill-current" />,
        };
      case "business":
        return {
          bg: "bg-blue-500",
          text: "text-white",
          icon: <Zap size={12} className="fill-current" />,
        };
      default:
        return {
          bg: "bg-slate-100",
          text: "text-slate-600",
          icon: <Shield size={12} />,
        };
    }
  };

  const styles = getPlanStyles(plan);

  return (
    <Badge 
      className={`${styles.bg} ${styles.text} border-none font-black text-[10px] px-3 py-1 rounded-full flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-default uppercase tracking-widest`}
    >
      {styles.icon}
      {plan}
    </Badge>
  );
}
