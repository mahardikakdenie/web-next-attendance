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
import { RefreshProvider } from "@/lib/RefreshContext";

export default function UserDashboardPage() {
  return (
    <RefreshProvider>
      <div className="flex flex-col gap-6 md:gap-8 w-full max-w-7xl mx-auto pb-10">
        
        {/* 1. Header Section */}
        <section>
          <GreetingCard />
        </section>

        {/* 2. Main Bento Grid Section */}
        <section className="flex flex-col gap-6 lg:gap-8">
          
          {/* ROW 1: Primary Action & Immediate Context */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            <div className="lg:col-span-8 h-full">
              <ClockCard />
            </div>
            <div className="lg:col-span-4">
              <TodayStatusCard />
            </div>
          </div>

          {/* ROW 2: At-a-Glance Information (Overview Data) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            <div className="flex flex-col h-full">
              <LeaveBalanceCard />
            </div>
            <div className="flex flex-col h-full">
              <QuickInfoCard />
            </div>
            <div className="flex flex-col h-full">
              <RecentActivityCard />
            </div>
          </div>

          {/* ROW 3: Secondary Actions (Requests / Forms) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            <div className="lg:col-span-8 h-full">
              <LeaveRequestCard />
            </div>
            <div className="lg:col-span-4 h-full">
              <OvertimeRequestCard />
            </div>
          </div>
          
        </section>

        {/* 3. Data/Table Section */}
        <section className="mt-4">
          <RecentAttendance />
        </section>

      </div>
    </RefreshProvider>
  );
}
