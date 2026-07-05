import GreetingCard from "@/components/dashboard-user/GreetingCard";
import MobileQuickActions from "@/components/dashboard-user/MobileQuickActions";
import { LayoutGrid } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="flex flex-col gap-3 pt-4">
      <div className="flex items-center gap-2 text-blue-600 mb-1">
        <LayoutGrid size={18} strokeWidth={2.5} />
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600/80">
          Employee Dashboard
        </span>
      </div>
      <GreetingCard />
      <MobileQuickActions />
    </header>
  );
}
