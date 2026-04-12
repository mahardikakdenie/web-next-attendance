"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { 
  Clock, 
  Plus, 
  Search, 
  Filter,
  ChevronLeft, 
  ChevronRight,
  Settings2,
  Moon,
  Sun,
  Info,
  Briefcase,
  Copy,
  Edit,
  Check,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { WorkShift, EmployeeSchedule } from "@/types/schedules";
import { getShifts, getRoster, saveRoster } from "@/service/schedules";
import { toast } from "sonner";
import dayjs from "dayjs";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function SchedulesView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [roster, setRoster] = useState<EmployeeSchedule[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(dayjs().startOf("week"));

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [shiftsResp, rosterResp] = await Promise.all([
        getShifts(),
        getRoster(
          currentWeekStart.format("YYYY-MM-DD"),
          currentWeekStart.endOf("week").format("YYYY-MM-DD")
        )
      ]);

      if (shiftsResp.data) setShifts(shiftsResp.data);
      if (rosterResp.data) setRoster(rosterResp.data);
    } catch (error) {
      console.error("Failed to fetch schedule data:", error);
      toast.error("Gagal mengambil data jadwal");
    } finally {
      setIsLoading(false);
    }
  }, [currentWeekStart]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveRoster = async () => {
    try {
      setIsSaving(true);
      const payload = {
        start_date: currentWeekStart.format("YYYY-MM-DD"),
        assignments: roster.map(emp => ({
          user_id: emp.id,
          roster: emp.weeklyRoster
        }))
      };
      const resp = await saveRoster(payload);
      if (resp.success) {
        toast.success("Roster berhasil disimpan");
      }
    } catch (error) {
      console.error("Failed to save roster:", error);
      toast.error("Gagal menyimpan roster");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredRoster = useMemo(() => {
    return roster.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = selectedDept === "All Departments" || emp.department === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [roster, searchTerm, selectedDept]);

  const getShift = (id: string) => {
    if (id === "off") return { name: "Day Off", color: "bg-slate-200", startTime: "-", endTime: "-", type: "Flexible" as const };
    return shifts.find(s => s.id === id) || { name: "Unknown", color: "bg-slate-100", startTime: "-", endTime: "-", type: "Office" as const };
  };

  const navigateWeek = (direction: "next" | "prev") => {
    setCurrentWeekStart(prev => direction === "next" ? prev.add(1, "week") : prev.subtract(1, "week"));
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12 animate-in fade-in duration-700 relative">
      
      {isLoading && (
        <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-xs z-50 flex items-center justify-center rounded-[40px]">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <Clock size={20} strokeWidth={2.5} />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Operations</span>
          </div>
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Work Schedules</h1>
          <p className="text-neutral-500 font-medium text-lg">Assign shifts and manage weekly rosters for your workforce.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" className="px-5 rounded-2xl">
            <Settings2 size={18} />
            <span className="font-bold text-sm">Shift Templates</span>
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 px-5 rounded-2xl">
            <Plus size={18} strokeWidth={3} />
            <span className="font-bold text-sm">Create Roster</span>
          </Button>
        </div>
      </section>

      {/* Quick Shift Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {shifts.map((shift) => (
          <div key={shift.id} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex flex-col gap-4 group hover:border-blue-200 transition-all">
            <div className="flex justify-between items-start">
              <div className={`w-10 h-10 rounded-xl ${shift.color} text-white flex items-center justify-center shadow-lg`}>
                {shift.type === "Morning" ? <Sun size={20} /> : shift.type === "Night" ? <Moon size={20} /> : <Briefcase size={20} />}
              </div>
              <button className="text-slate-300 hover:text-slate-600"><Edit size={14} /></button>
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 leading-none mb-1">{shift.name}</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{shift.startTime} - {shift.endTime}</p>
            </div>
          </div>
        ))}
        <button className="border-2 border-dashed border-slate-200 rounded-[28px] p-5 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
           <Plus size={24} className="group-hover:scale-110 transition-transform" />
           <span className="text-[10px] font-black uppercase tracking-widest">Add Shift</span>
        </button>
      </div>

      {/* Roster Toolbar */}
      <div className="bg-white rounded-[32px] border border-slate-200 p-4 shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-4 w-full xl:w-auto">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-2xl">
            <button onClick={() => navigateWeek("prev")} className="p-1 hover:bg-white rounded-lg transition-all"><ChevronLeft size={16} /></button>
            <span className="text-xs font-black uppercase tracking-widest px-4">
              {currentWeekStart.format("DD MMM")} - {currentWeekStart.endOf("week").format("DD MMM YYYY")}
            </span>
            <button onClick={() => navigateWeek("next")} className="p-1 hover:bg-white rounded-lg transition-all"><ChevronRight size={16} /></button>
          </div>
          <div className="h-8 w-px bg-slate-200 hidden md:block" />
          <div className="flex items-center gap-2">
             <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">Weekly</button>
             <button className="px-4 py-2 bg-white text-slate-400 hover:text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Monthly</button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="relative flex-1 xl:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search employee..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full xl:w-64 h-11 pl-10 pr-4 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" 
            />
          </div>
          <select 
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="h-11 px-4 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-500/5 appearance-none pr-10 relative cursor-pointer"
          >
            <option>All Departments</option>
            <option>Engineering</option>
            <option>Operations</option>
            <option>HR</option>
          </select>
          <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"><Filter size={18} /></button>
        </div>
      </div>

      {/* ROSTER GRID */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-6 text-left min-w-[240px] sticky left-0 bg-slate-50/50 backdrop-blur-md z-10 border-r border-slate-100/50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee Name</span>
                </th>
                {DAYS.map((day, idx) => (
                  <th key={day} className="p-6 text-center min-w-[140px] border-r border-slate-100/50 last:border-none">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{day.substring(0, 3)}</span>
                    <p className="text-sm font-black text-slate-900 mt-1">{currentWeekStart.add(idx, 'day').format("DD")}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRoster.map((emp) => (
                <tr key={emp.id} className="group hover:bg-blue-50/30 transition-colors">
                  <td className="p-6 sticky left-0 bg-white group-hover:bg-blue-50/30 transition-colors z-10 border-r border-slate-100/50 shadow-[4px_0_15px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-4">
                      <div className="relative w-10 h-10 shrink-0 shadow-md shadow-slate-200">
                        <Image src={emp.avatar} fill alt={emp.name} className="rounded-xl object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-sm text-slate-900 truncate">{emp.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{emp.department}</p>
                      </div>
                    </div>
                  </td>
                  
                  {DAYS.map((day) => {
                    const shiftId = (emp.weeklyRoster as Record<string, string>)[day.toLowerCase()];
                    const shift = getShift(shiftId);
                    const isOff = shiftId === "off";

                    return (
                      <td key={day} className="p-4 border-r border-slate-50 last:border-none">
                        <div className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer group/shift ${isOff ? 'bg-slate-50/50 border-dashed border-slate-200 text-slate-300' : `${shift.color} border-transparent text-white shadow-md shadow-slate-200/50 hover:scale-105 active:scale-95 hover:shadow-lg`}`}>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isOff ? 'text-slate-400' : 'text-white'}`}>{shift.name.split(' ')[0]}</span>
                          {!isOff && <span className="text-[9px] font-bold mt-1 opacity-80">{shift.startTime} - {shift.endTime}</span>}
                          
                          {/* Quick Change Action Overlay */}
                          <div className="absolute inset-0 bg-slate-900/10 rounded-2xl opacity-0 group-hover/shift:opacity-100 transition-opacity flex items-center justify-center">
                             <div className="bg-white p-1 rounded-lg shadow-xl translate-y-2 group-hover/shift:translate-y-0 transition-transform">
                                <Edit size={12} className="text-slate-600" />
                             </div>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info for table */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-6">
              {shifts.map(s => (
                <div key={s.id} className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${s.color}`} />
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.name}</span>
                </div>
              ))}
           </div>
           
           <div className="flex gap-2">
              <Button variant="secondary" className="px-4 py-2 h-9 rounded-xl shadow-xs">
                <Copy size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Copy Last Week</span>
              </Button>
              <Button 
                disabled={isSaving}
                onClick={handleSaveRoster}
                className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 h-9 rounded-xl"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={3} />}
                <span className="text-[10px] font-black uppercase tracking-widest">Save Roster</span>
              </Button>
           </div>
        </div>
      </div>

      {/* Legend / Tips */}
      <div className="bg-blue-50/50 rounded-[32px] p-8 border border-blue-100/50 flex items-start gap-6">
         <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/20 shrink-0">
            <Info size={24} strokeWidth={2.5} />
         </div>
         <div className="space-y-2 pt-1">
            <h4 className="text-lg font-black text-blue-900 tracking-tight leading-none">Rostering Intelligence</h4>
            <p className="text-sm text-blue-800/70 font-medium leading-relaxed max-w-2xl">
               Drag and drop shifts or click on a cell to quickly swap schedules. The attendance engine will automatically adjust the &quot;Late&quot; and &quot;Absent&quot; triggers based on the shift hours defined here.
            </p>
         </div>
      </div>

    </div>
  );
}
