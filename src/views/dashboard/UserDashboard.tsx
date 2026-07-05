"use client";

// Custom Hook
import { useUserDashboard } from "./hooks/useUserDashboard";

// New Extracted Components
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardSection } from "./components/DashboardSection";
import { DesktopSidebar } from "./components/DesktopSidebar";

// Existing Components
import ClockCard from "@/components/dashboard-user/ClockCard";
import TodayStatusCard from "@/components/dashboard-user/TodayStatusCard";
import { QuickInfoCard } from "@/components/dashboard-user/QuickInfoCard";
import { RecentAttendance } from "@/components/dashboard-user/RecentAttendance";
import { OvertimeRequestCard } from "@/components/dashboard-user/OvertimeRequestCard";
import { LeaveBalanceCard } from "@/components/dashboard-user/LeaveBalanceCard";
import { LeaveRequestCard } from "@/components/dashboard-user/LeaveRequestCard";
import { ReimbursementRequestCard } from "@/components/dashboard-user/ReimbursementRequestCard";
import { UserGoalsSection } from "@/views/performance/UserGoals";

// Icons
import { Clock, FileText, Target, History } from "lucide-react";

export default function UserDashboardPage() {
  const { user, isMobile } = useUserDashboard();

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full pb-24 md:pb-16 animate-in fade-in duration-700 max-w-[1600px] mx-auto px-4 md:px-8 xl:px-0">

      {/* 1. WELCOME SECTION */}
      <DashboardHeader />

      {/* 2. MAIN LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10 items-start relative">

        {/* LEFT & CENTER CONTENT (8/12) */}
        <div className="xl:col-span-8 flex flex-col gap-10">

          <DashboardSection title="Daily Presence" icon={Clock} colorScheme="blue">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              <div className="lg:col-span-7 flex flex-col h-full">
                <div className="grid grid-cols-2 gap-5">
                  <div className="w-1/2">
                    <ClockCard />
                  </div>
                  <div className="w-1/2">
                    <TodayStatusCard />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-5 flex flex-col h-full">
                <TodayStatusCard />
              </div>
            </div>
          </DashboardSection>

          {/* QUICK INFO (Mobile only) */}
          {isMobile && (
            <section className="flex flex-col gap-5">
              <LeaveBalanceCard />
              <QuickInfoCard />
            </section>
          )}

          {/* REQUESTS & FORMS SECTION */}
          {!isMobile && (
            <DashboardSection title="Quick Actions" icon={FileText} colorScheme="indigo">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                <div id="tour-leave-request" className="md:col-span-2 flex flex-col h-full transition-transform hover:-translate-y-1 duration-300">
                  <LeaveRequestCard />
                </div>
                <div className="flex flex-col h-full transition-transform hover:-translate-y-1 duration-300">
                  <OvertimeRequestCard />
                </div>
                <div className="flex flex-col h-full transition-transform hover:-translate-y-1 duration-300">
                  <ReimbursementRequestCard />
                </div>
              </div>
            </DashboardSection>
          )}

          <DashboardSection title="Goals & Performance" icon={Target} colorScheme="emerald">
            <UserGoalsSection />
          </DashboardSection>

          <DashboardSection title="Attendance History" icon={History} colorScheme="slate">
            <div id="tour-attendance-log" className="bg-white rounded-3xl md:rounded-[40px] border border-slate-100 shadow-sm overflow-hidden p-2 md:p-4">
              <RecentAttendance />
            </div>
          </DashboardSection>

        </div>

        {/* RIGHT SIDEBAR (4/12) */}
        {!isMobile && (
          <DesktopSidebar userName={user?.name?.split(' ')[0] || ""} />
        )}

      </div>
    </div>
  );
}
