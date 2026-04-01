import { useState } from "react";
import { Calendar, Filter, Search } from "lucide-react";
import Input from "../ui/Input";

interface AttendanceFilterProps {
  onSearch?: (searchQuery: string) => void;
  onDateChange?: (date: string) => void;
  onFilterChange?: (filter: string) => void;
}

type FilterStatus = "All" | "On Time" | "Late";
const FILTERS: FilterStatus[] = ["All", "On Time", "Late"];

export default function AttendanceFilter({
  onSearch,
  onDateChange,
  onFilterChange,
}: AttendanceFilterProps) {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("All");

  const handleFilterClick = (status: FilterStatus) => {
    setActiveFilter(status);
    onFilterChange?.(status);
  };

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl px-4 py-4 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center mt-6">
      <div className="relative w-full xl:max-w-sm group">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-600 transition-colors" />
        <Input
          type="search"
          placeholder="Search employee..."
          onChange={(e) => onSearch?.(e.target.value)}
          variant="ghost"
          className="pl-11 pr-4"
        />
      </div>

      <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-3 items-center">
        <div className="flex items-center gap-2 h-11 px-3 bg-slate-100/80 rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <Calendar className="text-slate-400 w-4 h-4" />
          <Input
            type="date"
            onChange={(e) => onDateChange?.(e.target.value)}
            variant="ghost"
            className="h-full p-0 bg-transparent focus:ring-0 text-sm text-slate-700 cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
          <div className="flex items-center px-2 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
          </div>

          {FILTERS.map((item) => {
            const isActive = activeFilter === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => handleFilterClick(item)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/60"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
