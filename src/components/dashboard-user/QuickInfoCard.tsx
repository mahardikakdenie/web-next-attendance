import { MapPin, Briefcase, Clock } from "lucide-react";

export function QuickInfoCard() {
  return (
    <div className="bg-slate-100/80 rounded-2xl p-5 flex flex-col gap-4">

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Today Info</p>
        <span className="text-xs text-slate-400">Work Details</span>
      </div>

      <div className="flex flex-col gap-3">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Briefcase size={16} className="text-slate-400" />
            <span className="text-sm text-slate-500">Work Type</span>
          </div>
          <span className="text-sm font-bold text-slate-900">
            WFO
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-slate-400" />
            <span className="text-sm text-slate-500">Office</span>
          </div>
          <span className="text-sm font-medium text-slate-900">
            Bandung HQ
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-slate-400" />
            <span className="text-sm text-slate-500">Shift</span>
          </div>
          <span className="text-sm font-medium text-slate-900">
            09:00 - 17:00
          </span>
        </div>

      </div>
    </div>
  );
}
