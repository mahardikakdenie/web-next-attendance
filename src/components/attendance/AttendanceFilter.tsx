"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar, Filter, Search, RotateCcw, ChevronRight } from "lucide-react";
import Input from "../ui/Input";
import { AttendanceFilterParams } from "@/types/api";

interface AttendanceFilterProps {
  currentFilters: AttendanceFilterParams;
  onFilterChange: (filters: Partial<AttendanceFilterParams>) => void;
}

// Menyesuaikan dengan status dari Backend: working, done, late
type FilterStatus = "All" | "Working" | "Late" | "Done";
const FILTERS: FilterStatus[] = ["All", "Working", "Late", "Done"];

export default function AttendanceFilter({
  currentFilters,
  onFilterChange,
}: AttendanceFilterProps) {
  const [searchTerm, setSearchTerm] = useState(currentFilters.search || "");
  const isInitialMount = useRef(true);

  /**
   * FIX: ESLint react-hooks/set-state-in-effect
   * Menyinkronkan state internal dengan props search saat render phase.
   * Ini adalah pola yang direkomendasikan React 18+ untuk menggantikan useEffect
   * dalam hal sinkronisasi state dari props (misal saat tombol Reset diklik di parent).
   */
  const [prevSearchProp, setPrevSearchProp] = useState(currentFilters.search);
  if (currentFilters.search !== prevSearchProp) {
    setSearchTerm(currentFilters.search || "");
    setPrevSearchProp(currentFilters.search);
  }

  // Handler for Status Filter (Maps UI labels to BE constants)
  const handleStatusClick = (status: FilterStatus) => {
    const statusValue = status === "All" ? "" : status.toLowerCase();
    onFilterChange({ status: statusValue });
  };

  // Handler for Date Changes
  const handleDateChange = (type: "from" | "to", value: string) => {
    onFilterChange({ 
      [type === "from" ? "date_from" : "date_to"]: value 
    });
  };

  // Reset all filters
  const handleReset = () => {
    setSearchTerm("");
    onFilterChange({
      status: "",
      date_from: "",
      date_to: "",
      search: ""
    });
  };

  // Improved Debounce for Search
  useEffect(() => {
    // Lewati pemanggilan pertama saat mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const delayDebounceFn = setTimeout(() => {
       // Hanya kirim ke parent jika berbeda dengan nilai prop saat ini
       if (searchTerm !== (currentFilters.search || "")) {
         onFilterChange({ search: searchTerm });
       }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, onFilterChange, currentFilters.search]);

  return (
    <div className="flex flex-col gap-4">
      {/* Top Row: Search and Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-center">
        <div className="xl:col-span-8 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5 group-focus-within:text-blue-600 transition-colors z-10" />
          <Input
            type="search"
            placeholder="Search by employee name, ID, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-4 h-14 bg-white border-slate-200 rounded-[22px] shadow-sm focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-sm"
          />
        </div>
        
        <div className="xl:col-span-4 flex gap-3">
          <button 
            onClick={handleReset}
            className="flex-1 h-14 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-[22px] transition-all active:scale-95 font-black text-xs uppercase tracking-widest"
          >
            <RotateCcw size={16} strokeWidth={3} />
            Reset
          </button>
          <div className="hidden xl:flex h-14 w-14 items-center justify-center bg-blue-50 text-blue-600 rounded-[22px] border border-blue-100 shadow-inner">
            <Filter size={20} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* Bottom Row: Advanced Filters */}
      <div className="bg-white/60 backdrop-blur-md rounded-[32px] border border-slate-200 p-3 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          {/* Date Range Picker */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 rounded-[24px] border border-slate-200/50 w-full lg:w-auto">
            <div className="flex items-center gap-2 px-3 h-10 bg-white rounded-2xl shadow-sm border border-slate-200/60 transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
              <Calendar className="text-blue-500 w-3.5 h-3.5" />
              <input
                type="date"
                value={currentFilters.date_from || ""}
                onChange={(e) => handleDateChange("from", e.target.value)}
                className="bg-transparent border-none outline-none text-[11px] font-black text-slate-700 focus:ring-0 cursor-pointer w-28 uppercase"
              />
            </div>
            <div className="text-slate-400">
              <ChevronRight size={14} strokeWidth={3} />
            </div>
            <div className="flex items-center gap-2 px-3 h-10 bg-white rounded-2xl shadow-sm border border-slate-200/60 transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
              <Calendar className="text-blue-500 w-3.5 h-3.5" />
              <input
                type="date"
                value={currentFilters.date_to || ""}
                onChange={(e) => handleDateChange("to", e.target.value)}
                className="bg-transparent border-none outline-none text-[11px] font-black text-slate-700 focus:ring-0 cursor-pointer w-28 uppercase"
              />
            </div>
          </div>

          {/* Status Segmented Control */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-[24px] border border-slate-200/50 overflow-x-auto no-scrollbar w-full lg:w-auto justify-center lg:justify-start">
            {FILTERS.map((item) => {
              // Logic to determine active state based on BE values
              const itemValue = item === "All" ? "" : item.toLowerCase();
              const isActive = currentFilters.status === itemValue;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleStatusClick(item)}
                  className={`px-5 py-2.5 rounded-[18px] text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${
                    isActive
                      ? "bg-white text-blue-600 shadow-md shadow-blue-500/10 border border-slate-200/50 scale-105"
                      : "text-slate-400 hover:text-slate-600 hover:bg-white/40"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
