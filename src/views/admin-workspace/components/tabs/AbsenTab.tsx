import { Clock } from "lucide-react";
import ClockCard from "@/components/dashboard-user/ClockCard";
import TodayStatusCard from "@/components/dashboard-user/TodayStatusCard";
import { RecentAttendance } from "@/components/dashboard-user/RecentAttendance";

export default function AbsenTab() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ClockCard />
        </div>
        <div className="lg:col-span-5">
          <TodayStatusCard />
        </div>
      </div>
      <div id="tour-attendance-log" className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Clock className="text-blue-600" size={20} />
          Recent Attendance Logs
        </h3>
        <RecentAttendance />
      </div>
    </div>
  );
}
