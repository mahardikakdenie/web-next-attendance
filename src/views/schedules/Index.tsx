"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { 
  Clock, 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Settings2,
  Moon,
  Sun,
  Briefcase,
  Check,
  Loader2,
  X,
  Calendar as CalendarIcon,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Image from "next/image";
import { WorkShift, EmployeeSchedule } from "@/types/schedules";
import { getShifts, getRoster, saveRoster, createShift } from "@/service/schedules";
import { toast } from "sonner";
import dayjs from "dayjs";
import { useAuthStore, ROLES } from "@/store/auth.store";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// --- CUSTOM SHIFT SELECTOR COMPONENT ---
interface ShiftSelectorProps {
  currentShiftId: string;
  shifts: WorkShift[];
  onSelect: (shiftId: string) => void;
  disabled?: boolean;
}

const ShiftSelector = ({ currentShiftId, shifts, onSelect, disabled }: ShiftSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentShift = useMemo(() => {
    if (currentShiftId === "off") return { name: "OFF", color: "bg-slate-200", startTime: "", endTime: "", type: "Flexible" };
    return shifts.find(s => s.id === currentShiftId) || { name: "???", color: "bg-slate-100", startTime: "", endTime: "", type: "Office" };
  }, [currentShiftId, shifts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-16 rounded-[24px] border-2 px-3 flex flex-col items-center justify-center transition-all duration-300 group relative
          ${currentShiftId === "off" 
            ? 'bg-slate-50 border-dashed border-slate-200 text-slate-400 hover:bg-slate-100' 
            : `${currentShift.color} border-transparent text-white shadow-lg shadow-slate-200/50 hover:scale-[1.02] active:scale-95`
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className="font-black uppercase text-[10px] tracking-widest leading-none">
          {currentShift.name.split(' ')[0]}
        </span>
        {currentShiftId !== "off" && (
          <span className="text-[9px] font-bold mt-1 opacity-80">{currentShift.startTime} - {currentShift.endTime}</span>
        )}
        {!disabled && (
          <ChevronDown 
            className={`absolute right-3 top-1/2 -translate-y-1/2 transition-transform duration-300 opacity-40 ${isOpen ? 'rotate-180' : ''}`} 
            size={14} 
          />
        )}
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 p-2 z-[100] animate-in zoom-in-95 duration-200 min-w-[200px]">
          <div className="max-h-[280px] overflow-y-auto custom-scrollbar space-y-1">
            <p className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400">Available Shifts</p>
            {shifts.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => { onSelect(s.id); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${currentShiftId === s.id ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
              >
                <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center text-white shadow-sm shrink-0`}>
                  {s.type === "Morning" ? <Sun size={16} /> : s.type === "Night" ? <Moon size={16} /> : <Briefcase size={16} />}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-[11px] font-black text-slate-900 leading-none mb-1 truncate">{s.name}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">{s.startTime} - {s.endTime}</p>
                </div>
                {currentShiftId === s.id && <Check size={14} className="text-blue-600" strokeWidth={3} />}
              </button>
            ))}
            <div className="h-px bg-slate-100 my-1 mx-2" />
            <button
              type="button"
              onClick={() => { onSelect("off"); setIsOpen(false); }}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${currentShiftId === "off" ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-dashed border-slate-200 shrink-0">
                <X size={16} />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-[11px] font-black text-slate-900 leading-none mb-1">Day Off</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Rest Period</p>
              </div>
              {currentShiftId === "off" && <Check size={14} className="text-blue-600" strokeWidth={3} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN VIEW ---
export default function SchedulesView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [roster, setRoster] = useState<EmployeeSchedule[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(dayjs().startOf("week").add(1, "day")); // Force Monday
  
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [newShift, setNewShift] = useState<Partial<WorkShift>>({
    name: "",
    startTime: "09:00",
    endTime: "17:00",
    type: "Office",
    color: "bg-blue-500",
    isDefault: false
  });

  const { user } = useAuthStore();
  const isAdmin = user?.role?.name === ROLES.SUPERADMIN || user?.role?.name === ROLES.ADMIN || user?.role?.name === ROLES.HR;

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [shiftsResp, rosterResp] = await Promise.all([
        getShifts(),
        getRoster(
          currentWeekStart.format("YYYY-MM-DD"),
          currentWeekStart.add(6, 'day').format("YYYY-MM-DD")
        )
      ]);

      if (shiftsResp.data) setShifts(shiftsResp.data);
      if (rosterResp.data) setRoster(rosterResp.data);
    } catch (error) {
      console.error("Failed to fetch schedule data:", error);
      toast.error("Failed to fetch schedule data");
    } finally {
      setIsLoading(false);
    }
  }, [currentWeekStart]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateRoster = (userId: number, day: string, shiftId: string) => {
    setRoster(prev => prev.map(emp => {
      if (emp.id === userId) {
        return {
          ...emp,
          weeklyRoster: {
            ...emp.weeklyRoster,
            [day.toLowerCase()]: shiftId
          }
        };
      }
      return emp;
    }));
  };

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
        toast.success("Roster saved successfully");
      }
    } catch (error) {
      console.error("Failed to save roster:", error);
      toast.error("Failed to save roster");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const resp = await createShift(newShift);
      if (resp.success) {
        toast.success("Shift template created");
        setIsShiftModalOpen(false);
        setShifts(prev => [...prev, resp.data]);
      }
    } catch (error) {
      console.error("Failed to create shift:", error);
      toast.error("Failed to create shift");
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

  const navigateWeek = (direction: "next" | "prev") => {
    setCurrentWeekStart(prev => direction === "next" ? prev.add(1, "week") : prev.subtract(1, "week"));
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12 animate-in fade-in duration-700 relative">
      
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-xs z-[60] flex items-center justify-center rounded-[40px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Grid...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <Clock size={20} strokeWidth={2.5} />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Operational Excellence</span>
          </div>
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Weekly Roster</h1>
          <p className="text-neutral-500 font-medium">Manage workforce shifts and optimize weekly operational coverage.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            onClick={() => setIsShiftModalOpen(true)}
            className="px-5 rounded-2xl bg-white border-slate-200 h-12 shadow-sm"
          >
            <Settings2 size={18} />
            <span className="font-bold text-sm">Shift Templates</span>
          </Button>
          <Button 
            onClick={handleSaveRoster}
            disabled={isSaving}
            className="bg-slate-900 hover:bg-black text-white shadow-xl px-8 h-12 rounded-2xl flex items-center gap-2"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} strokeWidth={3} />}
            <span className="font-bold text-sm uppercase tracking-widest">Save Changes</span>
          </Button>
        </div>
      </section>

      {/* Shift Overview List */}
      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {shifts.map((shift) => (
          <div key={shift.id} className="min-w-[220px] bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col gap-5 group hover:border-blue-200 transition-all">
            <div className="flex justify-between items-start">
              <div className={`w-12 h-12 rounded-2xl ${shift.color} text-white flex items-center justify-center shadow-lg shadow-slate-200`}>
                {shift.type === "Morning" ? <Sun size={24} /> : shift.type === "Night" ? <Moon size={24} /> : <Briefcase size={24} />}
              </div>
              <Badge className="bg-slate-50 text-slate-400 border-none font-black text-[8px] uppercase tracking-widest px-2">{shift.type}</Badge>
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 leading-none mb-1.5">{shift.name}</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{shift.startTime} - {shift.endTime}</p>
            </div>
          </div>
        ))}
        <button 
          onClick={() => setIsShiftModalOpen(true)}
          className="min-w-[220px] border-2 border-dashed border-slate-200 rounded-[32px] p-6 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
        >
           <Plus size={28} className="group-hover:scale-110 transition-transform" />
           <span className="text-[10px] font-black uppercase tracking-widest">Define New Shift</span>
        </button>
      </div>

      {/* Roster Grid Container */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-50 flex flex-col xl:flex-row gap-6 justify-between items-center bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <button onClick={() => navigateWeek("prev")} className="p-1.5 hover:bg-slate-50 rounded-lg transition-all text-slate-400 hover:text-slate-900"><ChevronLeft size={18} strokeWidth={3} /></button>
              <div className="w-px h-4 bg-slate-200 mx-2" />
              <div className="flex items-center gap-2">
                <CalendarIcon size={14} className="text-blue-500" />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  {currentWeekStart.format("DD MMM")} - {currentWeekStart.add(6, 'day').format("DD MMM YYYY")}
                </span>
              </div>
              <div className="w-px h-4 bg-slate-200 mx-2" />
              <button onClick={() => navigateWeek("next")} className="p-1.5 hover:bg-slate-50 rounded-lg transition-all text-slate-400 hover:text-slate-900"><ChevronRight size={18} strokeWidth={3} /></button>
            </div>
            <button 
              onClick={() => setCurrentWeekStart(dayjs().startOf('week').add(1, 'day'))}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-1 xl:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search staff..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full xl:w-64 h-11 pl-10 pr-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all outline-none" 
              />
            </div>
            <div className="relative group">
              <select 
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="h-11 px-5 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 outline-none focus:border-blue-600 appearance-none pr-12 cursor-pointer"
              >
                <option>All Departments</option>
                <option>Engineering</option>
                <option>Operations</option>
                <option>HR</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={14} />
            </div>
          </div>
        </div>

        {/* Grid Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-50">
                <th className="p-6 text-left min-w-[280px] sticky left-0 bg-white z-30 border-r border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee Directory</span>
                </th>
                {DAYS.map((day, idx) => (
                  <th key={day} className="p-6 text-center min-w-[180px] border-r border-slate-50 last:border-none">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{day.substring(0, 3)}</span>
                    <p className="text-sm font-black text-slate-900 mt-1">{currentWeekStart.add(idx, 'day').format("DD MMM")}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRoster.map((emp) => (
                <tr key={emp.id} className="group transition-colors">
                  <td className="p-6 sticky left-0 bg-white z-30 border-r border-slate-50 shadow-[4px_0_15px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 shrink-0">
                        <Image src={emp.avatar || "/profile.jpg"} fill alt={emp.name} className="rounded-2xl object-cover border-2 border-slate-50 shadow-sm" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-[14px] text-slate-900 truncate tracking-tight">{emp.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{emp.department}</p>
                      </div>
                    </div>
                  </td>
                  
                  {DAYS.map((day) => (
                    <td key={day} className="p-3 border-r border-slate-50 last:border-none">
                      <ShiftSelector 
                        currentShiftId={(emp.weeklyRoster as Record<string, string>)[day.toLowerCase()]}
                        shifts={shifts}
                        onSelect={(shiftId) => handleUpdateRoster(emp.id, day, shiftId)}
                        disabled={!isAdmin}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-slate-300 bg-slate-100" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Day Off</span>
              </div>
              {shifts.map(s => (
                <div key={s.id} className="flex items-center gap-2">
                   <div className={`w-2.5 h-2.5 rounded-full ${s.color} shadow-sm`} />
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.name}</span>
                </div>
              ))}
           </div>
           
           <div className="flex items-center gap-3">
              <p className="text-[10px] font-bold text-slate-400 italic mr-2">Unsaved changes will be lost</p>
              <Button 
                disabled={isSaving}
                onClick={handleSaveRoster}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-14 rounded-[24px] shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} strokeWidth={3} />}
                <span className="text-xs font-black uppercase tracking-widest">Publish Changes</span>
              </Button>
           </div>
        </div>
      </div>

      {/* SHIFT MODAL */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="relative bg-white rounded-[48px] w-full max-w-lg shadow-2xl overflow-hidden border border-white animate-in zoom-in-95 duration-500">
              <form onSubmit={handleCreateShift}>
                <div className="p-10 border-b border-slate-50">
                  <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                          <Plus size={24} strokeWidth={3} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">New Shift</h2>
                      </div>
                      <button type="button" onClick={() => setIsShiftModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400"><X size={24} /></button>
                  </div>
                  
                  <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Template Title</label>
                        <input 
                          required
                          value={newShift.name}
                          onChange={e => setNewShift(prev => ({ ...prev, name: e.target.value }))}
                          type="text" 
                          placeholder="e.g. Regular Shift" 
                          className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Start Time</label>
                            <input 
                              required
                              type="time" 
                              value={newShift.startTime}
                              onChange={e => setNewShift(prev => ({ ...prev, startTime: e.target.value }))}
                              className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 outline-none" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">End Time</label>
                            <input 
                              required
                              type="time" 
                              value={newShift.endTime}
                              onChange={e => setNewShift(prev => ({ ...prev, endTime: e.target.value }))}
                              className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 outline-none" 
                            />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Visual Style</label>
                        <div className="flex gap-3">
                           {["bg-emerald-500", "bg-blue-500", "bg-orange-500", "bg-purple-500", "bg-rose-500"].map(color => (
                             <button 
                              key={color}
                              type="button"
                              onClick={() => setNewShift(prev => ({ ...prev, color }))}
                              className={`w-10 h-10 rounded-xl ${color} transition-all ${newShift.color === color ? 'ring-4 ring-offset-2 ring-slate-900' : 'opacity-60 hover:opacity-100 scale-90 hover:scale-100'}`} 
                             />
                           ))}
                        </div>
                      </div>
                  </div>
                </div>
                <div className="p-8 bg-slate-50 flex gap-4">
                  <button type="button" onClick={() => setIsShiftModalOpen(false)} className="flex-1 h-14 rounded-2xl font-black text-sm text-slate-500 hover:bg-slate-100 transition-all uppercase tracking-widest">Cancel</button>
                  <Button 
                    disabled={isSaving}
                    type="submit" 
                    className="flex-1 h-14 rounded-2xl bg-slate-900 text-white hover:bg-black font-black text-sm shadow-xl flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check size={20} strokeWidth={3} />}
                    <span className="uppercase tracking-widest">Create Template</span>
                  </Button>
                </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}
