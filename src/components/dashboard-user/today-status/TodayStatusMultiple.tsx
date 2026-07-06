import { LogIn, LogOut, Activity, ListOrdered, ChevronDown } from "lucide-react";
import { getBadgeClassName } from "./statusUtils";

interface TodayStatusMultipleProps {
  sessions: any[];
  expandedSessions: number[];
  toggleSession: (index: number) => void;
}

export default function TodayStatusMultiple({ sessions, expandedSessions, toggleSession }: TodayStatusMultipleProps) {
  return (
    <div className="flex flex-col gap-3 grow max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
      {sessions.map((session: any, index: number) => {
        const isExpanded = expandedSessions.includes(index);
        
        return (
          <div key={session.id || index} className="flex flex-col rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all duration-300 bg-white">
            <button 
              onClick={() => toggleSession(index)}
              className="w-full bg-slate-50/50 hover:bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100/50">
                  <ListOrdered size={12} className="text-indigo-500" />
                </div>
                <span className="text-xs font-black text-slate-700 tracking-wide">SESI {index + 1}</span>
              </div>
              <div className="flex items-center gap-3">
                {session.status && (
                  <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getBadgeClassName(session.status)}`}>
                    {session.status}
                  </div>
                )}
                <div className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDown size={16} strokeWidth={2.5} />
                </div>
              </div>
            </button>
            
            <div 
              className={`grid grid-cols-2 divide-x divide-slate-100 bg-white transition-all duration-300 origin-top overflow-hidden ${
                isExpanded ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-4 hover:bg-slate-50/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100/50 shadow-sm">
                    <LogIn size={14} strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In</span>
                </div>
                <p className="text-xl font-black text-slate-900 leading-none tabular-nums tracking-tighter ml-1">
                  {session.clock_in_time ? session.clock_in_time.substring(0, 5) : "--:--"}
                </p>
              </div>
              <div className="p-4 hover:bg-slate-50/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-xl border shadow-sm ${session.clock_out_time ? 'bg-orange-50 text-orange-500 border-orange-100/50' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                    <LogOut size={14} strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Out</span>
                </div>
                <p className={`text-xl font-black leading-none tabular-nums tracking-tighter ml-1 ${session.clock_out_time ? 'text-slate-900' : 'text-slate-300'}`}>
                  {session.clock_out_time ? session.clock_out_time.substring(0, 5) : "--:--"}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      {sessions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <Activity className="text-slate-300 mb-2" size={24} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Belum ada sesi absensi</p>
        </div>
      )}
    </div>
  );
}
