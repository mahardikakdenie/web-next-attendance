import { LeaveRequestCard } from "@/components/dashboard-user/LeaveRequestCard";
import { OvertimeRequestCard } from "@/components/dashboard-user/OvertimeRequestCard";

export default function RequestsTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <LeaveRequestCard />
      <OvertimeRequestCard />
    </div>
  );
}
