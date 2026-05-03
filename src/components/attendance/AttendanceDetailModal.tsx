"use client";

import { X, MapPin, Clock, Smartphone, Calendar, User, CheckCircle2, Navigation } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { getProfileImage } from "@/lib/utils";
import { AttendanceRecord } from "@/types/api";
import dayjs from "dayjs";

interface Props {
  open: boolean;
  onClose: () => void;
  attendance: AttendanceRecord | null;
}

export default function AttendanceDetailModal({ open, onClose, attendance }: Props) {
  if (!open || !attendance) return null;

  const clockInTime = attendance.clock_in_time ? dayjs(attendance.clock_in_time) : null;
  const clockOutTime = attendance.clock_out_time ? dayjs(attendance.clock_out_time) : null;
  const date = clockInTime ? clockInTime.format("DD MMMM YYYY") : dayjs(attendance.created_at).format("DD MMMM YYYY");

  const googleMapsUrl = `https://www.google.com/maps?q=${attendance.clock_in_latitude},${attendance.clock_in_longitude}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-500 border border-white ring-1 ring-slate-200/50">
        
        {/* Header */}
        <div className="relative overflow-hidden bg-slate-900 p-8 text-white shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <CheckCircle2 size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight leading-none">Attendance Detail</h2>
                <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-widest">{date}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Info */}
            <div className="space-y-8">
              {/* Employee Info */}
              <div className="flex items-center gap-4 p-5 rounded-3xl bg-white border border-slate-100 shadow-sm">
                <Avatar 
                  src={getProfileImage(attendance.user?.media_url)} 
                  name={attendance.user?.name}
                  className="w-16 h-16 rounded-2xl shadow-sm border-2 border-white ring-1 ring-slate-100"
                />
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">{attendance.user?.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {attendance.user?.employee_id || attendance.user_id}</p>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-tight">
                    {attendance.user?.department || "General"}
                  </div>
                </div>
              </div>

              {/* Time Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-3xl border border-neutral-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 text-emerald-600 mb-3">
                    <Clock size={16} strokeWidth={2.5} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Clock In</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900">
                    {clockInTime ? clockInTime.format("HH:mm:ss") : "--:--"}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Recorded Time</p>
                </div>
                <div className="p-5 rounded-3xl border border-neutral-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 text-rose-600 mb-3">
                    <Clock size={16} strokeWidth={2.5} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Clock Out</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900">
                    {clockOutTime ? clockOutTime.format("HH:mm:ss") : "--:--"}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Recorded Time</p>
                </div>
              </div>

              {/* Additional Metadata */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-2xl border border-neutral-100 bg-white shadow-xs">
                  <div className="flex items-center gap-3">
                    <Smartphone size={18} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-600 uppercase tracking-tight">Method</span>
                  </div>
                  <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">Mobile App</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl border border-neutral-100 bg-white shadow-xs">
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-600 uppercase tracking-tight">Status</span>
                  </div>
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg uppercase tracking-widest">
                    {attendance.status || "Completed"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Visuals */}
            <div className="space-y-6">
              {/* Selfie */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verification Photo</label>
                  {attendance.clock_in_media_url && (
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Verified</span>
                  )}
                </div>
                <div className="aspect-square rounded-4xl bg-slate-100 overflow-hidden border-4 border-white shadow-xl ring-1 ring-slate-100 group relative">
                  {attendance.clock_in_media_url ? (
                    <>
                      <img 
                        src={getProfileImage(attendance.clock_in_media_url) || ""} 
                        alt="Clock in selfie" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-[10px] font-black uppercase tracking-[0.2em] border-2 border-white px-4 py-2 rounded-xl">View Full Image</p>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                      <div className="p-6 rounded-full bg-slate-50 border-2 border-dashed border-slate-200">
                        <User size={48} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest">No photo available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Location Log</label>
                <a 
                  href={googleMapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group block p-5 rounded-3xl border border-slate-100 bg-white hover:bg-slate-900 hover:text-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <MapPin size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-black uppercase tracking-tight group-hover:text-white transition-colors">Open in Maps</p>
                        <Navigation size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">{attendance.clock_in_latitude}, {attendance.clock_in_longitude}</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-white border-t border-slate-100 shrink-0">
          <button 
            onClick={onClose}
            className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-2"
          >
            Close Detail
          </button>
        </div>
      </div>
    </div>
  );
}
