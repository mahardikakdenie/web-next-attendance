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
  Edit2,
  Users,
  AlertTriangle,
  Search,
  UserPlus,
  UserMinus
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { getCalendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, CalendarEvent, EventCategory } from "@/service/calendar";
import { getDataUserslist } from "@/service/users";
import { UserData } from "@/types/api";
import { toast } from "sonner";
import dayjs from "dayjs";
import { useAuthStore, ROLES } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

export default function HolidayCalendarView() {
  const { user, loading: authLoading } = useAuthStore();
  const router = useRouter();
  
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isFetching, setIsFetching] = useState(true); 
  const [viewDate, setViewDate] = useState(dayjs());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const [availableUsers, setAvailableUsers] = useState<UserData[]>([]);
  const [userSearch, setUserSearch] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    type: "National Holiday",
    category: "OFFICE_CLOSED" as EventCategory,
    description: "",
    is_paid: true,
    is_all_users: true,
    user_ids: [] as number[]
  });

  const fetchCalendarEvents = useCallback(async () => {
    try {
      setIsFetching(true);
      const resp = await getCalendarEvents(viewDate.year());
      if (resp.data) {
        setEvents(resp.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load calendar events");
    } finally {
      setIsFetching(false);
    }
  }, [viewDate]);

  const fetchUsers = useCallback(async () => {
    if (!user) return;
    try {
      const resp = await getDataUserslist({ user_id: user.id, limit: 100 });
      if (resp.data) {
        setAvailableUsers(resp.data);
      }
    } catch (error) {
      console.error(error);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      const allowedRoles = [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR];
      if (!user.role?.name || !allowedRoles.includes(user.role.name as typeof ROLES.SUPERADMIN)) {
        router.replace("/");
        return;
      }
      Promise.resolve().then(() => {
        fetchCalendarEvents();
        fetchUsers();
      });
    }
  }, [fetchCalendarEvents, fetchUsers, authLoading, user, router]);

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
      const dayEvents = events.filter(h => dayjs(h.date).format("YYYY-MM-DD") === dateStr);
      grid.push({ date, currentMonth: true, events: dayEvents });
    }

    const remainingSlots = 42 - grid.length;
    const nextMonth = viewDate.add(1, "month");
    for (let i = 1; i <= remainingSlots; i++) {
      grid.push({ date: nextMonth.date(i), currentMonth: false });
    }
    
    return grid;
  }, [viewDate, events]);

  const handleOpenCreate = (date?: string) => {
    setEditingEvent(null);
    setFormData({
      name: "",
      date: date || dayjs().format("YYYY-MM-DD"),
      type: "National Holiday",
      category: "OFFICE_CLOSED",
      description: "",
      is_paid: true,
      is_all_users: true,
      user_ids: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      date: dayjs(event.date).format("YYYY-MM-DD"),
      type: event.type,
      category: event.category || "OFFICE_CLOSED",
      description: event.description || "",
      is_paid: event.is_paid,
      is_all_users: event.is_all_users ?? true,
      user_ids: event.user_ids || []
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      setIsSubmitting(true);
      const resp = await deleteCalendarEvent(id);
      if (resp.success) {
        toast.success("Deleted");
        fetchCalendarEvents();
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
      const resp = editingEvent 
        ? await updateCalendarEvent(editingEvent.id, formData)
        : await createCalendarEvent(formData);

      if (resp.success) {
        toast.success("Saved");
        setIsModalOpen(false);
        fetchCalendarEvents();
      }
    } catch (error) {
      toast.error("Error");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "National Holiday": return <PartyPopper size={10} />;
      case "Meeting": return <Users size={10} />;
      default: return <Info size={10} />;
    }
  };

  const getEventColorClass = (category: EventCategory) => {
    return category === "OFFICE_CLOSED" 
      ? "bg-rose-50 text-rose-700 border-rose-100" 
      : "bg-blue-50 text-blue-700 border-blue-100";
  };

  const toggleUser = (userId: number) => {
    setFormData(prev => {
      const isSelected = prev.user_ids.includes(userId);
      if (isSelected) {
        return { ...prev, user_ids: prev.user_ids.filter(id => id !== userId) };
      } else {
        return { ...prev, user_ids: [...prev.user_ids, userId] };
      }
    });
  };

  const filteredUsers = availableUsers.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.employee_id.toLowerCase().includes(userSearch.toLowerCase())
  );

  const groupedEvents = useMemo(() => {
    const groups: Record<string, CalendarEvent[]> = {};
    events.forEach(h => {
      const month = dayjs(h.date).format("MMMM");
      if (!groups[month]) groups[month] = [];
      groups[month].push(h);
    });
    
    return Object.entries(groups).sort((a, b) => {
      return dayjs(a[0], "MMMM").month() - dayjs(b[0], "MMMM").month();
    });
  }, [events]);

  if (authLoading) return null;

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto p-4 animate-in fade-in duration-700">
      
      {/* Header Nav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-lg">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {viewDate.format("MMMM YYYY")}
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calendar & Events</p>
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
            <span className="text-xs uppercase tracking-widest">Add Event</span>
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
                    {cell.events?.map((h) => (
                      <div 
                        key={h.id} 
                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(h); }}
                        className={`px-2 py-1 rounded-lg text-[9px] font-bold truncate border flex items-center gap-1.5 group/item ${getEventColorClass(h.category)}`}
                        title={h.description}
                      >
                        {getEventIcon(h.type)}
                        <span className="truncate">{h.name}</span>
                        <Edit2 size={8} className="opacity-0 group-hover/item:opacity-100 shrink-0 ml-auto" />
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
                {groupedEvents.find(([month]) => month === viewDate.format("MMMM"))?.[1]?.map(h => (
                  <div key={h.id} className="flex items-center gap-4 group p-2 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                    <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl shrink-0 ${h.category === 'OFFICE_CLOSED' ? 'bg-rose-600' : 'bg-slate-900'} text-white`}>
                      <span className="text-xs font-black">{dayjs(h.date).date()}</span>
                      <span className="text-[8px] font-bold uppercase opacity-60">{dayjs(h.date).format("MMM")}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-slate-900 truncate tracking-tight">{h.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{h.type}</span>
                        <span className={`text-[8px] font-black px-1.5 rounded-md border ${h.category === 'OFFICE_CLOSED' ? 'text-rose-500 border-rose-100 bg-rose-50' : 'text-blue-500 border-blue-100 bg-blue-50'}`}>
                          {h.category === 'OFFICE_CLOSED' ? 'OFF' : 'INFO'}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <Users size={10} className="text-slate-300" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                          {h.is_all_users ? "All Employees" : `${h.user_ids?.length || 0} Targeted`}
                        </span>
                      </div>
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
            <h4 className="text-sm font-black uppercase tracking-widest mb-2">Event Categories</h4>
            <div className="space-y-3 mt-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-rose-500 mt-1" />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  <strong>Office Closed:</strong> Attendance system locked for all employees.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1" />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  <strong>Information Only:</strong> Internal events/meetings. Attendance remains open.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-2xl shadow-[0_0_100px_rgba(0,0,0,0.2)] border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
              {/* FIXED HEADER */}
              <div className="p-8 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <CalendarIcon size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingEvent ? "Update Event" : "New Event"}</h2>
                </div>
                {!isSubmitting && (
                  <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"><X size={24} /></button>
                )}
              </div>

              {/* SCROLLABLE BODY */}
              <div className="p-8 pt-6 overflow-y-auto flex-1 custom-scrollbar space-y-8 min-h-0">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Event Name</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl h-14 px-5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:bg-white transition-all outline-none" placeholder="e.g. Strategy Meeting Q2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Date</label>
                      <input type="date" required disabled={!!editingEvent} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl h-14 px-5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:bg-white outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Type</label>
                      <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl h-14 px-5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:bg-white outline-none appearance-none">
                        <option value="National Holiday">National Holiday</option>
                        <option value="Meeting">Meeting</option>
                        <option value="Company Event">Company Event</option>
                        <option value="Mandatory Leave">Mandatory Leave</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, category: 'OFFICE_CLOSED'})}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-1 ${formData.category === 'OFFICE_CLOSED' ? 'bg-rose-50 border-rose-500' : 'bg-slate-50 border-slate-100'}`}
                      >
                        <span className={`text-xs font-black ${formData.category === 'OFFICE_CLOSED' ? 'text-rose-700' : 'text-slate-400'}`}>OFFICE CLOSED</span>
                        <span className="text-[8px] font-medium text-slate-400">Lock Attendance</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, category: 'INFORMATION'})}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-1 ${formData.category === 'INFORMATION' ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-slate-100'}`}
                      >
                        <span className={`text-xs font-black ${formData.category === 'INFORMATION' ? 'text-blue-700' : 'text-slate-400'}`}>INFORMATION ONLY</span>
                        <span className="text-[8px] font-medium text-slate-400">Open Attendance</span>
                      </button>
                    </div>
                    {formData.category === 'OFFICE_CLOSED' && (
                      <div className="flex items-start gap-2 p-3 bg-rose-50 rounded-xl border border-rose-100 animate-in fade-in slide-in-from-top-1">
                        <AlertTriangle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                        <p className="text-[9px] font-bold text-rose-600 leading-tight">
                          Employees will not be able to clock in/out on this date.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Audience Selection */}
                  <div className="space-y-4 p-5 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Audience</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Who should see this event?</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, is_all_users: !prev.is_all_users}))}
                        className={`w-14 h-8 rounded-full transition-all relative p-1 ${formData.is_all_users ? 'bg-blue-600' : 'bg-slate-300'}`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${formData.is_all_users ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {!formData.is_all_users && (
                      <div className="space-y-4 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="relative">
                          <input 
                            value={userSearch}
                            onChange={e => setUserSearch(e.target.value)}
                            className="w-full bg-white border-2 border-slate-200 rounded-xl h-11 pl-10 pr-4 text-xs font-bold focus:border-blue-600 outline-none transition-all"
                            placeholder="Search by name or Employee ID..."
                          />
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        </div>

                        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          {filteredUsers.map(u => {
                            const isSelected = formData.user_ids.includes(u.id);
                            return (
                              <div 
                                key={u.id}
                                onClick={() => toggleUser(u.id)}
                                className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 overflow-hidden relative">
                                    {u.media_url ? (
                                      <Image 
                                        src={u.media_url} 
                                        fill 
                                        alt={u.name} 
                                        className="object-cover" 
                                        sizes="32px"
                                      />
                                    ) : u.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-xs font-black text-slate-900 leading-none mb-1">{u.name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">{u.employee_id} • {u.department}</p>
                                  </div>
                                </div>
                                {isSelected ? (
                                  <UserMinus size={16} className="text-rose-500" />
                                ) : (
                                  <UserPlus size={16} className="text-blue-500" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                        
                        {formData.user_ids.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase mr-1 mt-1.5">Selected:</span>
                            {formData.user_ids.map(id => {
                              const u = availableUsers.find(au => au.id === id);
                              if (!u) return null;
                              return (
                                <div key={id} className="flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded-lg">
                                  <span className="text-[9px] font-bold text-slate-700">{u.name}</span>
                                  <X size={10} className="text-slate-400 cursor-pointer hover:text-rose-500" onClick={(e) => { e.stopPropagation(); toggleUser(id); }} />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
                    <textarea 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:bg-white outline-none min-h-[100px] resize-none"
                      placeholder="Enter event details or agenda..."
                    />
                  </div>

                  <div className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border-2 border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900 uppercase">Paid Event</span>
                      <span className="text-[10px] font-bold text-slate-400">Calculated in payroll cycle</span>
                    </div>
                    <button type="button" onClick={() => setFormData({...formData, is_paid: !formData.is_paid})} className={`w-14 h-8 rounded-full transition-all relative p-1 ${formData.is_paid ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${formData.is_paid ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* FIXED FOOTER */}
              <div className="p-8 bg-slate-50 flex gap-4 shrink-0 border-t border-slate-200">
                <button type="button" disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all bg-white border border-slate-200">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin text-white" /> : <CheckCircle2 size={18} />}
                  <span>{editingEvent ? "Update Event" : "Save Event"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
