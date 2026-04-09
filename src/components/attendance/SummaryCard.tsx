import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from "lucide-react";

type Props = {
  title: string;
  value: number | string;
  change: number;
  icon?: React.ReactNode;
  description?: string;
};

export default function SummaryCard({ title, value, change, icon, description = "vs yesterday" }: Props) {
  const isPositive = change >= 0;

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-neutral-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 group">
      
      {/* Decorative Background Element */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-10 transition-colors duration-500 ${
        isPositive ? "bg-emerald-500 group-hover:bg-emerald-600" : "bg-rose-500 group-hover:bg-rose-600"
      }`} />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <p className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.15em] leading-none">
            {title}
          </p>
          <h2 className="text-3xl font-black mt-2 tracking-tight text-neutral-900 group-hover:text-blue-600 transition-colors">
            {value}
          </h2>
        </div>

        <div className={`flex items-center justify-center w-12 h-12 rounded-2xl shadow-inner transition-transform duration-500 group-hover:scale-110 ${
          isPositive 
            ? "bg-emerald-50 text-emerald-600" 
            : "bg-rose-50 text-rose-600"
        }`}>
          {icon ? icon : (isPositive ? <TrendingUp size={24} /> : <TrendingDown size={24} />)}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6 relative z-10">
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${
          isPositive 
            ? "bg-emerald-100 text-emerald-700" 
            : "bg-rose-100 text-rose-700"
        }`}>
          {isPositive ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
          <span>{Math.abs(change)}%</span>
        </div>

        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
          {description}
        </span>
      </div>
    </div>
  );
}
