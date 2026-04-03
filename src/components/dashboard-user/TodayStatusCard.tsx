import { LogIn, LogOut, Timer } from "lucide-react";

export default function TodayStatusCard() {
  return (
    <div className="w-full max-w-sm rounded-[28px] border border-neutral-200 bg-white p-5 sm:p-6">
      
      {/* Header Section */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-neutral-800">
          Today&apos;s Summary
        </h2>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600 uppercase tracking-wide">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          On Time
        </div>
      </div>

      {/* Grid Layout (Bento Style) */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* Card: Clock In */}
        <div className="flex flex-col justify-between rounded-[20px] bg-blue-50/50 border border-blue-100 p-4 min-h-[110px]">
          <div className="flex items-start justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <LogIn size={16} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider bg-blue-100/50 px-2 py-0.5 rounded-md">
              Done
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-neutral-900 tracking-tight">
              09:02 <span className="text-xs font-bold text-neutral-500">AM</span>
            </p>
            <p className="text-xs font-semibold text-neutral-500 mt-0.5">Clock In</p>
          </div>
        </div>

        {/* Card: Clock Out */}
        <div className="flex flex-col justify-between rounded-[20px] bg-neutral-50 border border-neutral-100 p-4 min-h-[110px]">
          <div className="flex items-start justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200/60 text-neutral-500">
              <LogOut size={16} strokeWidth={2.5} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-neutral-300 tracking-tight">
              --:--
            </p>
            <p className="text-xs font-semibold text-neutral-400 mt-0.5">Clock Out</p>
          </div>
        </div>

      </div>

      {/* Footer: Working Duration */}
      <div className="mt-3 flex items-center justify-between rounded-[20px] border border-neutral-100 bg-neutral-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-700">
            <Timer size={18} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500">Working Duration</p>
            <p className="text-lg font-black text-neutral-900 tracking-tight">2h 12m</p>
          </div>
        </div>
        <div className="text-[11px] font-bold text-neutral-400 bg-white border border-neutral-200 px-2 py-1 rounded-lg">
          In Progress
        </div>
      </div>

    </div>
  );
}
