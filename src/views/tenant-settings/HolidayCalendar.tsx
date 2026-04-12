"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  X,
  Calendar as CalendarIcon,
  PartyPopper,
  Info,
  CheckCircle2,
  Trash2,
  Edit2
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { getHolidays, createHoliday, updateHoliday, deleteHoliday, Holiday } from "@/service/calendar";
import { toast } from "sonner";
import dayjs from "dayjs";
import { useAuthStore, ROLES } from "@/store/auth.store";
import { useRouter } from "next/navigation";

export default function HolidayCalendarView() {
  const { user, loading: authLoading } = useAuthStore();
  const router = useRouter();
  
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isFetching, setIsFetching] = useState(true); 
  const [viewDate, setViewDate] = useState(dayjs());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    type: "National Holiday",
    is_paid: true
  });

  const fetchHolidays = useCallback(async () => {
    try {
      setIsFetching(true);
      const resp = await getHolidays(viewDate.year());
      if (resp.data) {
        setHolidays(resp.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load holiday data");
    } finally {
      setIsFetching(false);
    }
  }, [viewDate]);

  useEffect(() => {
    if (!authLoading && user) {
      const allowedRoles = [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR];
      if (!user.role?.name || !allowedRoles.includes(user.role.name as typeof ROLES.SUPERADMIN)) {
        router.replace("/");
        return;
      }
      fetchHolidays();
    }
  }, [fetchHolidays, authLoading, user, router]);

  const calendarGrid = useMemo(() => {
    const startOfMonth = viewDate.startOf("month");
    const daysInMonth = viewDate.daysInMonth();
    const startDay = startOfMonth.day();
    
    const grid = [];
    const prevMonth = viewDate.subtract(1, "month");
    const daysInPrevMonth = prevMonth.daysInMonth();

    for (let i = startDay - 1; i >= 0; i--) {
      grid.push({ date: prevMonth.date(daysInPrevMonth - i), currentMonth: false });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = viewDate.date(i);
      const dateStr = date.format("YYYY-MM-DD");
      const dayHolidays = holidays.filter(h => dayjs(h.date).format("YYYY-MM-DD") === dateStr);
      grid.push({ date, currentMonth: true, holidays: dayHolidays });
    }

    const remainingSlots = 42 - grid.length;
    const nextMonth = viewDate.add(1, "month");
    for (let i = 1; i <= remainingSlots; i++) {
      grid.push({ date: nextMonth.date(i), currentMonth: false });
    }
    
    return grid;
  }, [viewDate, holidays]);

  const handleOpenCreate = (date?: string) => {
    setEditingHoliday(null);
    setFormData({
      name: "",
      date: date || dayjs().format("YYYY-MM-DD"),
      type: "National Holiday",
      is_paid: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setFormData({
      name: holiday.name,
      date: dayjs(holiday.date).format("YYYY-MM-DD"),
      type: holiday.type,
      is_paid: holiday.is_paid
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      setIsSubmitting(true);
      const resp = await deleteHoliday(id);
      if (resp.success) {
        toast.success("Deleted");
        fetchHolidays();
      }
    } catch (error) {
      toast.error("Failed");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const resp = editingHoliday 
        ? await updateHoliday(editingHoliday.id, formData)
        : await createHoliday(formData);

      if (resp.success) {
        toast.success("Saved");
        setIsModalOpen(false);
        fetchHolidays();
      }
    } catch (error) {
      toast.error("Error");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- SKELETON COMPONENTS ---
  const CalendarSkeleton = () => (
    <div className="grid grid-cols-7 animate-pulse">
      {[...Array(35)].map((_, i) => (
        <div key={i} className="min-h-[130px] p-4 border-r border-b border-slate-100 bg-white">
          <Skeleton className="w-6 h-6 rounded-lg mb-3" />
          <Skeleton className="w-full h-4 rounded-md" />
        </div>
      ))}
    </div>
  );

  const SidebarSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-2">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-3/4 h-3 rounded" />
            <Skeleton className="w-1/2 h-2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  const groupedHolidays = useMemo(() => {
    const groups: Record<string, Holiday[]> = {};
    holidays.forEach(h => {
      const month = dayjs(h.date).format("MMMM");
      if (!groups[month]) groups[month] = [];
      groups[month].push(h);
    });
    
    return Object.entries(groups).sort((a, b) => {
      // Sort by month name using dayjs parsing
      return dayjs(a[0], "MMMM").month() - dayjs(b[0], "MMMM").month();
    });
  }, [holidays]);

  if (authLoading) return null;

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto p-4 animate-in fade-in duration-700">
      
      {/* Header Nav - Selalu Stabil */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-lg">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {viewDate.format("MMMM YYYY")}
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Holiday Management</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button onClick={() => setViewDate(viewDate.subtract(1, "month"))} className="p-2 hover:bg-white hover:text-blue-600 rounded-lg transition-all text-slate-600 active:scale-95"><ChevronLeft size={20} /></button>
            <button onClick={() => setViewDate(dayjs())} className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-900">Today</button>
            <button onClick={() => setViewDate(viewDate.add(1, "month"))} className="p-2 hover:bg-white rounded-lg transition-all text-slate-600 active:scale-95"><ChevronRight size={20} /></button>
          </div>
          
          <button 
            onClick={() => handleOpenCreate()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <Plus size={18} strokeWidth={3} />
            <span className="text-xs uppercase tracking-widest">Add Holiday</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Grid Section */}
        <div className="xl:col-span-3 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden min-h-[650px]">
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
              <div key={day} className={`py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] ${i === 0 || i === 6 ? 'text-rose-400' : 'text-slate-400'}`}>{day}</div>
            ))}
          </div>
          
          {isFetching ? (
            <CalendarSkeleton />
          ) : (
            <div className="grid grid-cols-7 animate-in fade-in duration-500">
              {calendarGrid.map((cell, idx) => (
                <div 
                  key={idx}
                  onClick={() => cell.currentMonth && handleOpenCreate(cell.date.format("YYYY-MM-DD"))}
                  className={`min-h-[130px] p-4 border-r border-b border-slate-100 transition-all relative group ${cell.currentMonth ? "bg-white cursor-pointer hover:bg-blue-50/30" : "bg-slate-50/30 opacity-30"} ${idx % 7 === 6 ? 'border-r-0' : ''}`}
                >
                  <span className={`text-sm font-black ${cell.date.isSame(dayjs(), "day") ? "bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg shadow-blue-200" : (cell.date.day() === 0 ? "text-rose-500" : "text-slate-400 group-hover:text-slate-900")}`}>{cell.date.date()}</span>
                  <div className="mt-3 space-y-1">
                    {cell.holidays?.map((h) => (
                      <div 
                        key={h.id} 
                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(h); }}
                        className={`px-2 py-1 rounded-lg text-[9px] font-bold truncate border flex items-center justify-between group/item ${h.is_paid ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}
                      >
                        <span>{h.name}</span>
                        <Edit2 size={8} className="opacity-0 group-hover/item:opacity-100" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Section */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm min-h-[300px]">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <PartyPopper size={16} className="text-blue-600" /> {viewDate.format("MMMM")} Events
            </h3>
            
            {isFetching ? (
              <SidebarSkeleton />
            ) : (
              <div className="space-y-4 animate-in fade-in duration-500">
                {groupedHolidays.find(([month]) => month === viewDate.format("MMMM"))?.[1]?.map(h => (
                  <div key={h.id} className="flex items-center gap-4 group p-2 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-slate-900 text-white rounded-xl shrink-0">
                      <span className="text-xs font-black">{dayjs(h.date).date()}</span>
                      <span className="text-[8px] font-bold uppercase opacity-60">{dayjs(h.date).format("MMM")}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-slate-900 truncate tracking-tight">{h.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{h.type}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenEdit(h)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(h.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={14} /></button>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-10 opacity-30"><CalendarIcon size={32} className="mx-auto mb-2" /><p className="text-[10px] font-black uppercase tracking-widest">No Events</p></div>
                )}
              </div>
            )}
          </div>

          <div className="bg-slate-900 p-8 rounded-[2rem] text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <Info className="text-blue-400 mb-4" size={24} />
            <h4 className="text-sm font-black uppercase tracking-widest mb-2">Policy Reminder</h4>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Holidays marked as <strong>Paid</strong> will be calculated as active days in the payroll cycle.
            </p>
          </div>
        </div>
      </div>

      {/* Modal - Full Solid Contrast */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_0_100px_rgba(0,0,0,0.2)] border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
            <form onSubmit={handleSubmit}>
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                      <CalendarIcon size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingHoliday ? "Update Record" : "New Record"}</h2>
                  </div>
                  {!isSubmitting && (
                    <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"><X size={24} /></button>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Event Name</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl h-14 px-5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:bg-white transition-all outline-none" placeholder="e.g. Eid Al-Fitr" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Date</label>
                      <input type="date" required disabled={!!editingHoliday} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl h-14 px-5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:bg-white outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Classification</label>
                      <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl h-14 px-5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:bg-white outline-none appearance-none">
                        <option value="National Holiday">National Holiday</option>
                        <option value="Company Event">Company Event</option>
                        <option value="Mandatory Leave">Mandatory Leave</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border-2 border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900 uppercase">Paid Holiday</span>
                      <span className="text-[10px] font-bold text-slate-400">Included in salary sync</span>
                    </div>
                    <button type="button" onClick={() => setFormData({...formData, is_paid: !formData.is_paid})} className={`w-14 h-8 rounded-full transition-all relative p-1 ${formData.is_paid ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${formData.is_paid ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-slate-50 flex gap-4">
                <button type="button" disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin text-white" /> : <CheckCircle2 size={18} />}
                  <span>{editingHoliday ? "Update Record" : "Save Record"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
