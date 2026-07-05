import { useState } from "react";
import { TrendingUp, Clock, Briefcase, Calendar as CalendarIcon, ChevronRight, FileEdit } from "lucide-react";
import TimeTracker from "@/components/timesheet/TimeTracker";
import LogWorkModal from "@/components/timesheet/LogWorkModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyTimesheetEntries } from "@/service/timesheet";
import dayjs from "dayjs";
import { formatDuration } from "@/lib/utils";
import { Project, TimesheetEntry } from "@/types/api";

interface TimesheetTabProps {
  projects: Project[];
}

export default function TimesheetTab({ projects }: TimesheetTabProps) {
  const queryClient = useQueryClient();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Fetch limited recent timesheet entries for shortcut view
  const { data: reportResp, isLoading } = useQuery({
    queryKey: ["timesheet-entries-shortcut"],
    queryFn: () => getMyTimesheetEntries({ 
      start_date: dayjs().startOf('month').format("YYYY-MM-DD"),
      end_date: dayjs().endOf('month').format("YYYY-MM-DD"),
      page: 1, 
      limit: 5 
    }),
  });

  const recentEntries = reportResp?.data?.entries || [];

  return (
    <div className="max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      
      {/* SECTION 1: Time Tracker (Create Data) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900">Track Time</h3>
            <p className="text-sm text-slate-500 font-medium">Log your current task activity quickly.</p>
          </div>
          <button 
            onClick={() => setIsLogModalOpen(true)}
            className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 bg-blue-50 px-4 py-2 rounded-xl transition-colors"
          >
            <FileEdit size={16} /> Manual Log
          </button>
        </div>
        <TimeTracker 
          projects={projects} 
          onSuccess={() => {
             queryClient.invalidateQueries({ queryKey: ["timesheet-report"] });
             queryClient.invalidateQueries({ queryKey: ["timesheet-entries-shortcut"] });
          }} 
        />
      </section>

      {/* SECTION 2: Recent Timesheet Data (Limited Read-Only Shortcut) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
             <h3 className="text-xl font-black text-slate-900">Recent Entries</h3>
             <p className="text-sm text-slate-500 font-medium">Your latest 5 logs for this month. (Read-only shortcut)</p>
          </div>
          <a href="/timesheet" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-4 py-2 rounded-xl transition-colors">
            View Full Module <ChevronRight size={16} />
          </a>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-2">
          {isLoading ? (
             <div className="p-8 text-center text-sm font-medium text-slate-400">Loading recent entries...</div>
          ) : recentEntries.length === 0 ? (
             <div className="p-8 text-center text-sm font-medium text-slate-400">No timesheet entries found for this month.</div>
          ) : (
             <div className="space-y-2">
               {recentEntries.map((entry: TimesheetEntry) => (
                 <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-[2rem] hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                   <div className="flex items-start gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-1 sm:mt-0">
                       <Clock size={20} />
                     </div>
                     <div>
                       <h4 className="font-bold text-slate-900 text-base">{entry.task_name || "Unknown Task"}</h4>
                       <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500 mt-1.5">
                         <span className="flex items-center gap-1.5"><Briefcase size={12} className="text-slate-400" /> {entry.project_name}</span>
                         <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                         <span className="flex items-center gap-1.5"><CalendarIcon size={12} className="text-slate-400" /> {dayjs(entry.date).format("MMM DD, YYYY")}</span>
                       </div>
                     </div>
                   </div>
                   <div className="mt-4 sm:mt-0 sm:text-right">
                     <div className="inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-slate-100 text-slate-700 font-bold text-sm">
                       {formatDuration(entry.duration_hours)}
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          )}
        </div>
      </section>

      {/* SECTION 3: Promotional Banner */}
      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-[2.5rem] p-8 flex items-center gap-6">
         <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
            <TrendingUp size={24} />
         </div>
         <div>
            <h4 className="font-black text-blue-900 text-lg">Advanced Project Tracking</h4>
            <p className="text-sm text-blue-700 font-medium mt-1">To see your full history, export data, and breakdown, visit the <a href="/timesheet" className="underline font-black hover:text-blue-800 transition-colors">Timesheet Module</a>.</p>
         </div>
      </div>

      {isLogModalOpen && (
        <LogWorkModal 
          isOpen={isLogModalOpen}
          onClose={() => setIsLogModalOpen(false)}
          projects={projects}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["timesheet-report"] });
            queryClient.invalidateQueries({ queryKey: ["timesheet-entries-shortcut"] });
          }}
        />
      )}

    </div>
  );
}


