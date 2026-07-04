import { TrendingUp } from "lucide-react";
import TimeTracker from "@/components/timesheet/TimeTracker";
import { useQueryClient } from "@tanstack/react-query";

interface TimesheetTabProps {
  projects: any[];
}

export default function TimesheetTab({ projects }: TimesheetTabProps) {
  const queryClient = useQueryClient();

  return (
    <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <TimeTracker 
        projects={projects} 
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["timesheet-report"] })} 
      />
      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-[2.5rem] p-8 flex items-center gap-6">
         <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <TrendingUp size={24} />
         </div>
         <div>
            <h4 className="font-black text-blue-900">Advanced Project Tracking</h4>
            <p className="text-sm text-blue-700 font-medium">To see your full history and breakdown, visit the <a href="/timesheet" className="underline font-black">Timesheet Module</a>.</p>
         </div>
      </div>
    </div>
  );
}
