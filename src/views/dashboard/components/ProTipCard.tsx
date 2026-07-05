import { Target } from "lucide-react";

export function ProTipCard({ userName }: { userName: string }) {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl md:rounded-[40px] p-8 text-white relative overflow-hidden group shadow-2xl shadow-slate-200">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all duration-700" />
      <div className="relative z-10 space-y-4">
        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
          <Target size={20} className="text-blue-400" />
        </div>
        <h4 className="text-lg font-bold tracking-tight">Pro Tip</h4>
        <p className="text-slate-300 text-sm font-medium leading-relaxed italic">
          &quot;Efficiency is doing things right; effectiveness is doing the right things.&quot;
        </p>
        <div className="pt-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
            Keep it up, {userName || "Team"}!
          </p>
        </div>
      </div>
    </div>
  );
}
