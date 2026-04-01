import { Clock, LogIn, LogOut } from "lucide-react";

export default function TodayStatusCard() {
  return (
    <div className="rounded-2xl bg-slate-100/80 p-6 flex flex-col gap-6">
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Today&apos;s Summary</p>

        <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
          <span className="w-2 h-2 bg-emerald-500 rounded-full" />
          On Time
        </div>
      </div>

      <div className="flex flex-col gap-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogIn size={18} className="text-slate-400" />
            <span className="text-sm text-slate-500">Clock In</span>
          </div>

          <span className="text-sm font-semibold text-slate-900">
            09:02 AM
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogOut size={18} className="text-slate-400" />
            <span className="text-sm text-slate-500">Clock Out</span>
          </div>

          <span className="text-sm font-semibold text-slate-900">
            -
          </span>
        </div>

      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Clock size={16} />
          Working Duration
        </div>

        <span className="text-sm font-semibold text-slate-900">
          2h 12m
        </span>
      </div>
    </div>
  );
}
