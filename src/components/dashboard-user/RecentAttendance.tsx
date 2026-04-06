"use client";

import { useAuthStore } from "@/store/auth.store";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  ChevronDown,
  MapPin,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useState, useMemo } from "react";
import Image from "next/image";

// --- Types & Interfaces ---

interface AttendanceItem {
  clock_in_time?: string;
  clock_out_time?: string;
  clock_in_media_url?: string;
  clock_out_media_url?: string;
  clock_in_latitude?: string | number;
  clock_in_longitude?: string | number;
  clock_out_latitude?: string | number;
  clock_out_longitude?: string | number;
}

interface FormattedAttendance {
  date: string;
  in: string;
  out: string;
  status: "Late" | "On Time";
  inImg: string;
  outImg: string;
  inLat: string | number;
  inLng: string | number;
  outLat: string | number;
  outLng: string | number;
}

// --- Main Component ---

export function RecentAttendance() {
  const { user } = useAuthStore();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const safeDate = (value?: string): Date | null => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  // Ekstrak referensi ke variabel terpisah untuk menghindari error React Compiler
  const attendances = user?.attendances;

  const attendanceData: FormattedAttendance[] = useMemo(() => {
    const formatDate = (dateString?: string): string => {
      const date = safeDate(dateString);
      if (!date) return "-";
      return date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      });
    };

    const formatTime = (dateString?: string): string => {
      const date = safeDate(dateString);
      if (!date) return "-";
      return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    if (!attendances) return [];

    return [...attendances]
      .sort((a, b) => {
        const dateA = safeDate(a.clock_in_time)?.getTime() || 0;
        const dateB = safeDate(b.clock_in_time)?.getTime() || 0;
        return dateB - dateA;
      })
      .slice(0, 5)
      .map((item: AttendanceItem) => {
        const dateObj = safeDate(item.clock_in_time);
        const hour = dateObj?.getHours() ?? 0;

        return {
          date: formatDate(item.clock_in_time),
          in: formatTime(item.clock_in_time),
          out: formatTime(item.clock_out_time),
          status: hour > 9 ? "Late" : "On Time",
          inImg: item.clock_in_media_url
            ? `/api/image?url=${encodeURIComponent(item.clock_in_media_url)}`
            : "",
          outImg: item.clock_out_media_url
            ? `/api/image?url=${encodeURIComponent(item.clock_out_media_url)}`
            : "",
          inLat: item.clock_in_latitude ?? "-",
          inLng: item.clock_in_longitude ?? "-",
          outLat: item.clock_out_latitude ?? "-",
          outLng: item.clock_out_longitude ?? "-",
        };
      });
  }, [attendances]);

  return (
    <div className="w-full space-y-6 p-1">
      <div className="flex items-end justify-between px-2">
        <div>
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
            Activity Log
          </h2>
          <p className="text-sm font-medium text-neutral-500">
            Your recent attendance records
          </p>
        </div>
        <button className="group flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-neutral-800 active:scale-95">
          VIEW ALL
          <ExternalLink
            size={14}
            className="opacity-70 transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>

      <div className="grid gap-4">
        {attendanceData.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-4xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 py-12">
            <Clock className="mb-2 text-neutral-300" size={32} />
            <p className="text-sm font-medium text-neutral-400">No data found</p>
          </div>
        ) : (
          attendanceData.map((item, i) => (
            <BentoItem
              key={`${item.date}-${i}`}
              item={item}
              isOpen={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// --- Sub-components ---

interface BentoItemProps {
  item: FormattedAttendance;
  isOpen: boolean;
  onClick: () => void;
}

function BentoItem({ item, isOpen, onClick }: BentoItemProps) {
  const isLate = item.status === "Late";

  return (
    <div
      className={`group overflow-hidden rounded-3xl border transition-all duration-300 ${
        isOpen
          ? "border-neutral-300 bg-white shadow-xl shadow-neutral-200/50"
          : "border-neutral-200 bg-neutral-50/50 hover:border-neutral-300 hover:bg-white hover:shadow-md"
      }`}
    >
      <div
        className="flex cursor-pointer items-center justify-between p-4 sm:p-5"
        onClick={onClick}
      >
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner transition-colors ${
              isLate ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-500"
            }`}
          >
            <Calendar size={22} strokeWidth={2.2} />
          </div>

          <div className="flex flex-col">
            <span className="text-base font-bold leading-tight text-neutral-900">
              {item.date}
            </span>
            <div className="mt-1 flex items-center gap-3">
              <div className="flex items-center gap-1 text-[13px] font-bold text-blue-600/80">
                <ArrowDownRight size={14} strokeWidth={3} />
                {item.in}
              </div>
              <div className="h-1 w-1 rounded-full bg-neutral-300" />
              <div className="flex items-center gap-1 text-[13px] font-bold text-orange-500/80">
                <ArrowUpRight size={14} strokeWidth={3} />
                {item.out}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`hidden rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider sm:block ${
              isLate
                ? "border-rose-200 bg-rose-100/50 text-rose-700"
                : "border-emerald-200 bg-emerald-100/50 text-emerald-700"
            }`}
          >
            {item.status}
          </div>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
              isOpen
                ? "rotate-180 bg-neutral-900 text-white"
                : "bg-neutral-200/50 text-neutral-500"
            }`}
          >
            <ChevronDown size={18} />
          </div>
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 gap-3 p-4 pt-0 md:grid-cols-2 sm:p-5 sm:pt-0">
            <DetailCard
              label="Clock In"
              time={item.in}
              img={item.inImg}
              lat={item.inLat}
              lng={item.inLng}
            />
            <DetailCard
              label="Clock Out"
              time={item.out}
              img={item.outImg}
              lat={item.outLat}
              lng={item.outLng}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface DetailCardProps {
  label: string;
  time: string;
  img: string;
  lat: string | number;
  lng: string | number;
}

function DetailCard({ label, time, img, lat, lng }: DetailCardProps) {
  return (
    <div className="group/card relative flex flex-col gap-2 rounded-2xl border border-neutral-100 bg-white p-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-100 shadow-inner md:aspect-4/3">
        {img ? (
          <Image
            src={img}
            alt={label}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover/card:scale-110"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-neutral-400">
            <Clock size={24} />
            <span className="text-[10px] font-medium">No Image</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-2">
          <div className="flex items-center gap-1 text-[9px] font-medium text-white/90">
            <MapPin size={10} className="shrink-0" />
            <span className="truncate">
              {lat}, {lng}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-1 pb-1">
        <span className="text-[10px] font-black uppercase tracking-tighter text-neutral-400">
          {label}
        </span>
        <span className="text-xs font-bold text-neutral-800">{time}</span>
      </div>
    </div>
  );
}
