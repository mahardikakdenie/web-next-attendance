import { useState, useEffect } from "react";
import { Calendar, Filter, Search } from "lucide-react";
import Input from "../ui/Input";
import { AttendanceFilterParams } from "@/types/api"; // Sesuaikan dengan path file type Anda

interface AttendanceFilterProps {
  currentFilters?: AttendanceFilterParams;
  onFilterChange: (filters: Partial<AttendanceFilterParams>) => void;
}

type FilterStatus = "All" | "On Time" | "Late" | "Absent" | "On Leave" | "Done";
const FILTERS: FilterStatus[] = ["All", "On Time", "Late", "Absent", "On Leave", "Done"];

export default function AttendanceFilter({
  currentFilters,
  onFilterChange,
}: AttendanceFilterProps) {
  const [activeFilter, setActiveFilter] = useState<string>(currentFilters?.status || "All");
  const [searchTerm, setSearchTerm] = useState("");

  // Handler untuk Status Filter
  const handleStatusClick = (status: FilterStatus) => {
    const statusValue = status === "All" ? "" : status;
    setActiveFilter(status);
    onFilterChange({ status: statusValue });
  };

  // Handler untuk Date Change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    // Mengasumsikan jika 1 tanggal dipilih, itu menjadi range untuk hari itu saja.
    // Anda bisa memodifikasi UI ini nanti untuk menerima rentang (date_from & date_to) yang lebih baik.
    onFilterChange({ 
      date_from: dateValue, 
      date_to: dateValue 
    });
  };

  // Debounce untuk Search (opsional, jika Anda menambah search ke backend nanti)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
       // Misalnya onFilterChange({ search: searchTerm }) 
       // jika endpoint Anda mendukung parameter search
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, onFilterChange]);

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 p-3 flex flex-col lg:flex-row gap-4 justify-between items-center shadow-sm">
      
      {/* Search Bar */}
      <div className="relative w-full lg:max-w-md group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 group-focus-within:text-blue-600 transition-colors" />
        <Input
          type="search"
          placeholder="Filter by employee name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="ghost"
          className="pl-12 pr-4 h-12 bg-neutral-50 rounded-2xl border-transparent focus:bg-white focus:border-blue-500/20 transition-all font-medium text-sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        
        {/* Date Picker */}
        <div className="flex items-center gap-2 h-12 px-4 bg-neutral-50 rounded-2xl border border-transparent focus-within:bg-white focus-within:border-blue-500/20 transition-all cursor-pointer group">
          <Calendar className="text-neutral-400 w-4 h-4 group-focus-within:text-blue-600" />
          <input
            type="date"
            onChange={handleDateChange}
            className="bg-transparent border-none outline-none text-sm font-bold text-neutral-600 focus:ring-0 cursor-pointer"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1 bg-neutral-100/50 p-1 rounded-[18px] border border-neutral-200/50">
          <div className="flex items-center px-2 text-neutral-400">
            <Filter size={14} strokeWidth={2.5} />
          </div>

          {FILTERS.map((item) => {
            const isActive = activeFilter === item || (item === "All" && activeFilter === "");

            return (
              <button
                key={item}
                type="button"
                onClick={() => handleStatusClick(item)}
                className={`px-5 py-2 rounded-2xl text-xs font-black transition-all uppercase tracking-wider ${
                  isActive
                    ? "bg-white text-blue-600 shadow-sm border border-neutral-200/50"
                    : "text-neutral-400 hover:text-neutral-600 hover:bg-white/60"
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
