import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

type ColorScheme = "blue" | "indigo" | "emerald" | "slate";

interface DashboardSectionProps {
  title: string;
  icon: LucideIcon;
  colorScheme: ColorScheme;
  children: ReactNode;
}

const colorStyles: Record<ColorScheme, string> = {
  blue: "bg-blue-50 text-blue-600 border-blue-100/50",
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-100/50",
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-100/50",
  slate: "bg-slate-100 text-slate-600 border-slate-200/50",
};

export function DashboardSection({ title, icon: Icon, colorScheme, children }: DashboardSectionProps) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-3 px-1">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm border ${colorStyles[colorScheme]}`}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}
