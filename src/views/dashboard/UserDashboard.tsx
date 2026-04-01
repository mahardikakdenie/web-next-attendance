import GreetingCard from "@/components/dashboard-user/GreetingCard";
import ClockCard from "@/components/dashboard-user/ClockCard";
import TodayStatusCard from "@/components/dashboard-user/TodayStatusCard";
import { QuickInfoCard } from "@/components/dashboard-user/QuickInfoCard";
import { RecentAttendance } from "@/components/dashboard-user/RecentAttendance";

export default function UserDashboardPage() {
  return (
    <div className="space-y-6">

      <GreetingCard />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        <div className="lg:col-span-2">
          <ClockCard />
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <TodayStatusCard />
          <QuickInfoCard />
        </div>
      </div>

      <RecentAttendance />

    </div>
  );
}
