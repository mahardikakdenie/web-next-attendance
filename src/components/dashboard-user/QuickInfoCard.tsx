"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Briefcase,
  ChevronRight,
  Ruler,
  LogIn,
  LogOut,
  Camera,
  Navigation
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

export function QuickInfoCard() {
  const [address, setAddress] = useState("Memuat lokasi...");

  const { user } = useAuthStore();
  const tenantSettings = user?.tenant?.tenant_settings;

  const lat = tenantSettings?.office_latitude;
  const lon = tenantSettings?.office_longitude;
  const maxRadius = tenantSettings?.max_radius_meter || 0;
  const allowRemote = tenantSettings?.allow_remote;
  const requireLocation = tenantSettings?.require_location;
  const requireSelfie = tenantSettings?.require_selfie;

  const workMode = allowRemote ? "Remote / WFA" : "Strict WFO";

  const clockInStart = tenantSettings?.clock_in_start_time || "-";
  const clockInEnd = tenantSettings?.clock_in_end_time || "-";
  const clockOutStart = tenantSettings?.clock_out_start_time || "-";
  const clockOutEnd = tenantSettings?.clock_out_end_time || "-";

  useEffect(() => {
    const fetchAddress = async () => {
      if (!lat || !lon) {
        setAddress("Lokasi kantor belum diatur");
        return;
      }

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        );
        const data = await response.json();

        if (data && data.address) {
          const { road, neighbourhood, suburb, city, state } = data.address;
          const shortAddress = [road || neighbourhood, suburb, city || state]
            .filter(Boolean)
            .join(", ");
          setAddress(shortAddress || data.display_name.split(",").slice(0, 3).join(", "));
        } else {
          setAddress("Lokasi tidak ditemukan");
        }
      } catch (error) {
        console.log(error);
        setAddress("Gagal memuat lokasi");
      }
    };

    fetchAddress();
  }, [lat, lon]);

  return (
    <div className="w-full rounded-[28px] border border-neutral-200 bg-white p-5 sm:p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-neutral-800">
          Today Info
        </h2>
        <div className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-bold text-neutral-500 uppercase tracking-wide shrink-0">
          Tenant Rules
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex flex-col justify-center rounded-[20px] border border-indigo-100 bg-indigo-50/50 p-4 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 mb-3">
            <Briefcase size={16} strokeWidth={2.5} />
          </div>
          <span className="text-xs font-semibold text-neutral-500 truncate">Work Mode</span>
          <span className="text-sm font-black text-neutral-900 mt-1 tracking-tight truncate">{workMode}</span>
        </div>

        <div className="flex flex-col justify-center rounded-[20px] border border-orange-100 bg-orange-50/50 p-4 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 mb-3">
            <Ruler size={16} strokeWidth={2.5} />
          </div>
          <span className="text-xs font-semibold text-neutral-500 truncate">Max Radius</span>
          <span className="text-sm font-black text-neutral-900 mt-1 tracking-tight truncate">{maxRadius} Meters</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex flex-col justify-center rounded-[20px] border border-emerald-100 bg-emerald-50/50 p-4 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <LogIn size={15} className="text-emerald-600 shrink-0" strokeWidth={2.5} />
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider truncate">Clock In</span>
          </div>
          <span className="text-sm font-black text-neutral-900 tracking-tight truncate">
            {clockInStart} - {clockInEnd}
          </span>
        </div>

        <div className="flex flex-col justify-center rounded-[20px] border border-rose-100 bg-rose-50/50 p-4 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <LogOut size={15} className="text-rose-600 shrink-0" strokeWidth={2.5} />
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider truncate">Clock Out</span>
          </div>
          <span className="text-sm font-black text-neutral-900 tracking-tight truncate">
            {clockOutStart} - {clockOutEnd}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {requireSelfie && (
          <div className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-bold text-neutral-600 whitespace-nowrap">
            <Camera size={13} strokeWidth={2.5} /> Require Selfie
          </div>
        )}
        {requireLocation && (
          <div className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-bold text-neutral-600 whitespace-nowrap">
            <Navigation size={13} strokeWidth={2.5} /> Require GPS
          </div>
        )}
      </div>

      <div className="flex items-center justify-between w-full rounded-[20px] border border-neutral-100 bg-neutral-50 p-4 hover:bg-neutral-100/50 transition-colors cursor-pointer group overflow-hidden">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border border-neutral-200 text-blue-500 group-hover:scale-105 transition-transform">
            <MapPin size={18} strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-xs font-semibold text-neutral-500 truncate">HQ Location</p>
            <p className="text-sm font-black text-neutral-900 truncate" title={address}>{address}</p>
          </div>
        </div>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-400 group-hover:text-neutral-900 transition-colors">
          <ChevronRight size={14} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}
