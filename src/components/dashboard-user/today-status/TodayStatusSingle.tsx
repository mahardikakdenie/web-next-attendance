import { LogIn, LogOut } from "lucide-react";

interface TodayStatusSingleProps {
  clockInTime?: string;
  clockOutTime?: string;
}

export default function TodayStatusSingle({ clockInTime, clockOutTime }: TodayStatusSingleProps) {
  return (
    <div className="grid grid-cols-2 gap-3.5 grow">
      <div className="flex flex-col justify-between rounded-[20px] border border-blue-100/60 bg-linear-to-br from-blue-50/80 to-blue-100/30 p-4 transition-all hover:bg-blue-50">
        <div className="flex items-start justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm border border-blue-100/50">
            <LogIn size={18} strokeWidth={2.5} />
          </div>
          {clockInTime && (
            <span className="rounded-md bg-blue-100/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Done
            </span>
          )}
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold tracking-tight text-neutral-900">
            {clockInTime ? clockInTime : "--:--"}
          </p>
          <p className="mt-0.5 text-xs font-medium text-neutral-500">Clock In</p>
        </div>
      </div>

      <div className={`flex flex-col justify-between rounded-[20px] border p-4 transition-all ${
        clockOutTime 
          ? "border-orange-100/60 bg-linear-to-br from-orange-50/80 to-orange-100/30 hover:bg-orange-50" 
          : "border-neutral-100 bg-neutral-50/50"
      }`}>
        <div className="flex items-start justify-between">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-sm border ${
            clockOutTime
              ? "bg-white text-orange-500 border-orange-100/50"
              : "bg-white text-neutral-400 border-neutral-100"
          }`}>
            <LogOut size={18} strokeWidth={2.5} />
          </div>
          {clockOutTime && (
            <span className="rounded-md bg-orange-100/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-600">
              Done
            </span>
          )}
        </div>
        <div className="mt-4">
          <p className={`text-2xl font-bold tracking-tight ${
              clockOutTime ? "text-neutral-900" : "text-neutral-300"
            }`}
          >
            {clockOutTime ? clockOutTime : "--:--"}
          </p>
          <p className={`mt-0.5 text-xs font-medium ${
              clockOutTime ? "text-neutral-500" : "text-neutral-400"
            }`}
          >
            Clock Out
          </p>
        </div>
      </div>
    </div>
  );
}
