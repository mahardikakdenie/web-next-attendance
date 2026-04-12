"use client";

import React, { useState, useMemo } from "react";
import { 
  Clock, 
  Plus, 
  Calendar, 
  Users, 
  Filter, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal,
  Settings2,
  Moon,
  Sun,
  Info,
  Briefcase,
  Copy,
  Trash2,
  Edit,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Image from "next/image";
import { WorkShift, EmployeeSchedule } from "@/types/schedules";

// --- DUMMY DATA ---

const SHIFTS: WorkShift[] = [
  { id: "s1", name: "Regular Office", startTime: "08:00", endTime: "17:00", type: "Office", color: "bg-blue-500", isDefault: true },
  { id: "s2", name: "Morning Shift", startTime: "06:00", endTime: "14:00", type: "Morning", color: "bg-emerald-500", isDefault: false },
  { id: "s3", name: "Afternoon Shift", startTime: "14:00", endTime: "22:00", type: "Afternoon", color: "bg-amber-500", isDefault: false },
  { id: "s4", name: "Night Watch", startTime: "22:00", endTime: "06:00", type: "Night", color: "bg-slate-800", isDefault: false },
  { id: "off", name: "Day Off", startTime: "-", endTime: "-", type: "Flexible", color: "bg-slate-200", isDefault: false },
];

const ROSTER: EmployeeSchedule[] = [
  { 
    id: 1, name: "Bagus Fikri", avatar: "https://i.pravatar.cc/150?u=bagus", department: "Engineering",
    weeklyRoster: { monday: "s1", tuesday: "s1", wednesday: "s1", thursday: "s1", friday: "s1", saturday: "off", sunday: "off" }
  },
  { 
    id: 2, name: "Sarah Connor", avatar: "https://i.pravatar.cc/150?u=sarah", department: "Operations",
    weeklyRoster: { monday: "s2", tuesday: "s2", wednesday: "s3", thursday: "s3", friday: "s2", saturday: "s1", sunday: "off" }
  },
  { 
    id: 3, name: "John Doe", avatar: "https://i.pravatar.cc/150?u=john", department: "HR",
    weeklyRoster: { monday: "s1", tuesday: "s1", wednesday: "s1", thursday: "s1", friday: "s1", saturday: "off", sunday: "off" }
  },
  { 
    id: 4, name: "Linda Sari", avatar: "https://i.pravatar.cc/150?u=linda", department: "Operations",
    weeklyRoster: { monday: "s3", tuesday: "s3", wednesday: "off", thursday: "s2", friday: "s2", saturday: "s3", sunday: "s3" }
  },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function SchedulesView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");

  const filteredRoster = useMemo(() => {
    return ROSTER.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = selectedDept === "All Departments" || emp.department === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [searchTerm, selectedDept]);

  const getShift = (id: string) => SHIFTS.find(s => s.id === id) || SHIFTS[4];

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">
      
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
          <Button className="bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 px-5 rounded-2xl flex items-center gap-2 shadow-sm transition-all">
            <Settings2 size={18} />
            <span className="font-bold text-sm">Shift Templates</span>
          </Button>
          <Button className="bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/20 px-5 rounded-2xl flex items-center gap-2 transition-all">
            <Plus size={18} strokeWidth={3} />
            <span className="font-bold text-sm">Create Roster</span>
          </Button>
        </div>
      </section>

      {/* Quick Shift Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {SHIFTS.filter(s => s.id !== "off").map((shift) => (
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
            <button className="p-1 hover:bg-white rounded-lg transition-all"><ChevronLeft size={16} /></button>
            <span className="text-xs font-black uppercase tracking-widest px-4">15 Apr - 21 Apr 2024</span>
            <button className="p-1 hover:bg-white rounded-lg transition-all"><ChevronRight size={16} /></button>
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
                {DAYS.map((day) => (
                  <th key={day} className="p-6 text-center min-w-[140px] border-r border-slate-100/50 last:border-none">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{day.substring(0, 3)}</span>
                    <p className="text-sm font-black text-slate-900 mt-1">15</p> {/* Example static day */}
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
                    const shiftId = emp.weeklyRoster[day.toLowerCase() as keyof typeof emp.weeklyRoster];
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
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Morning</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-blue-500" />
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Office</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-amber-500" />
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Afternoon</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-slate-800" />
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Night</span>
              </div>
           </div>
           
           <div className="flex gap-2">
              <Button className="bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 px-4 py-2 h-9 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-xs">
                <Copy size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Copy Last Week</span>
              </Button>
              <Button className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 h-9 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-slate-200">
                <Check size={14} strokeWidth={3} />
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
