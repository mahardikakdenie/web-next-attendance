"use client";

import GreetingCard from "@/components/dashboard-user/GreetingCard";
import ClockCard from "@/components/dashboard-user/ClockCard";
import TodayStatusCard from "@/components/dashboard-user/TodayStatusCard";
import { QuickInfoCard } from "@/components/dashboard-user/QuickInfoCard";
import { RecentAttendance } from "@/components/dashboard-user/RecentAttendance";
import { OvertimeRequestCard } from "@/components/dashboard-user/OvertimeRequestCard";
import { RecentActivityCard } from "@/components/dashboard-user/RecentlyActivity";
import { LeaveBalanceCard } from "@/components/dashboard-user/LeaveBalanceCard";
import { LeaveRequestCard } from "@/components/dashboard-user/LeaveRequestCard";

export default function UserDashboardPage() {
  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-7xl mx-auto pb-10">
      
      {/* 1. Header Section */}
      <section>
        <GreetingCard />
      </section>

      {/* 2. Main Bento Grid Section */}
      <section className="flex flex-col gap-6 lg:gap-8">
        
        {/* Row 1: Primary Actions (Clock Action & Overtime Request) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          <div className="lg:col-span-7 xl:col-span-8 h-full">
            <ClockCard />
          </div>
          <div className="lg:col-span-5 xl:col-span-4 h-full">
            <OvertimeRequestCard />
          </div>
        </div>

        {/* Row 2: Leave Management (Balance & Request) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          <div className="lg:col-span-4 h-full">
            <LeaveBalanceCard />
          </div>
          <div className="lg:col-span-8 h-full">
            <LeaveRequestCard />
          </div>
        </div>

        {/* Row 3: Information & Summary (Bento Sub-items) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="flex flex-col">
            <TodayStatusCard />
          </div>
          <div className="flex flex-col">
            <QuickInfoCard />
          </div>
          <div className="flex flex-col">
            <RecentActivityCard />
          </div>
        </div>
        
      </section>

      {/* 3. Data/Table Section */}
      <section className="mt-4">
        <RecentAttendance />
      </section>

    </div>
  );
}
