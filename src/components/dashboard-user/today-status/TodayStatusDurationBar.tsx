import { Timer, Activity } from "lucide-react";

interface TodayStatusDurationBarProps {
  isWorking: boolean;
  durationText?: string;
  clockOutTime?: string;
}

export default function TodayStatusDurationBar({ isWorking, durationText, clockOutTime }: TodayStatusDurationBarProps) {
  return (
    <div className="mt-4 flex items-center justify-between rounded-[20px] border border-neutral-100 bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-3.5">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${
          isWorking ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-neutral-100 bg-neutral-50 text-neutral-600'
        }`}>
          {isWorking ? <Activity size={18} strokeWidth={2.5} /> : <Timer size={18} strokeWidth={2.5} />}
        </div>
        <div>
          <p className="text-xs font-medium text-neutral-500 mb-0.5">Working Duration</p>
          <p className="text-lg font-bold tracking-tight text-neutral-900 leading-none">
            {durationText || "--:--"}
          </p>
        </div>
      </div>
      
      {/* Status Label dengan Animasi Pulse jika sedang bekerja */}
      <div className="flex items-center gap-2 rounded-lg border border-neutral-100 bg-neutral-50 px-2.5 py-1.5">
        {isWorking && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        )}
        <span className={`text-[11px] font-bold uppercase tracking-wider ${
          clockOutTime ? "text-neutral-500" : isWorking ? "text-emerald-600" : "text-neutral-400"
        }`}>
          {clockOutTime ? "Finished" : isWorking ? "Working" : "Not Started"}
        </span>
      </div>
    </div>
  );
}
