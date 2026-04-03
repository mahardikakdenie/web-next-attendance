import GreetingCard from "@/components/dashboard-user/GreetingCard";
import ClockCard from "@/components/dashboard-user/ClockCard";
import TodayStatusCard from "@/components/dashboard-user/TodayStatusCard";
import { QuickInfoCard } from "@/components/dashboard-user/QuickInfoCard";
import { RecentAttendance } from "@/components/dashboard-user/RecentAttendance";

export default function UserDashboardPage() {
  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-7xl mx-auto pb-10">
      
      {/* 1. Header Section */}
      <section>
        <GreetingCard />
      </section>

      {/* 2. Main Bento Grid Section */}
      {/* Menggunakan grid 12 kolom untuk kontrol proporsi yang lebih presisi */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* Kolom Kiri: Fokus Utama (Clock Action) - Proporsi lebih besar (7/12) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <div className="h-full w-full flex items-center">
            <ClockCard />
          </div>
        </div>

        {/* Kolom Kanan: Ringkasan & Info - Proporsi lebih kecil (5/12) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 md:gap-8">
          <TodayStatusCard />
          <QuickInfoCard />
        </div>
        
      </section>

      {/* 3. Data/Table Section */}
      <section className="mt-2">
        <RecentAttendance />
      </section>

    </div>
  );
}
