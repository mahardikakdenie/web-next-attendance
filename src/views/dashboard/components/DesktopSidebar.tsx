import { LeaveBalanceCard } from "@/components/dashboard-user/LeaveBalanceCard";
import { QuickInfoCard } from "@/components/dashboard-user/QuickInfoCard";
import { RecentActivityCard } from "@/components/dashboard-user/RecentlyActivity";
import { ProTipCard } from "./ProTipCard";

export function DesktopSidebar({ userName }: { userName: string }) {
  return (
    <aside className="xl:col-span-4 flex flex-col gap-8 sticky top-8">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3 px-1">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            At a Glance
          </span>
        </div>
        <div className="flex flex-col gap-5">
          <LeaveBalanceCard />
          <QuickInfoCard />
          <RecentActivityCard />
        </div>
      </div>
      <ProTipCard userName={userName} />
    </aside>
  );
}
