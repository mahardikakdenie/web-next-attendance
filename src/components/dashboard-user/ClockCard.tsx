"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Clock, MapPin, ShieldCheck, Loader2, History, ArrowRightCircle, ArrowRight } from "lucide-react";
import CameraModal from "../attendance/CameraModal";
import Image from "next/image";
import { toast } from "sonner";
import {
  loadFaceModels,
  analyzeFace,
  compareFace,
  getFaceAnalysisErrorMessage,
} from "@/lib/faceRecognition";
import {
  getTodayAttendanceItems,
  type AttendanceItem,
  EMPTY_IMAGE,
} from "@/lib/todayAttendance";
import { clockAttendance } from "@/service/attendance";
import { uploadMedia } from "@/service/media";
import { getDataCurrentTenat } from "@/service/tenantSettings";
import { useAuthStore } from "@/store/auth.store";
import { useRefresh } from "@/lib/RefreshContext";
import { ApiResponse } from "../tenant-settings/TenantSettingForm";

type Coordinates = {
  latitude: number;
  longitude: number;
};

interface TenantSettingsData {
  allowMultipleCheck: boolean;
}

const dataUrlToFile = async (dataUrl: string) => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const extension = blob.type.split("/")[1] || "png";
  return new File([blob], `attendance-${Date.now()}.${extension}`, {
    type: blob.type || "image/png",
  });
};

export default function ClockCard() {
  const user = useAuthStore((state) => state.user);
  const { triggerRefresh } = useRefresh();
  const [mounted, setMounted] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceItem[]>([]);
  const [now, setNow] = useState<dayjs.Dayjs | null>(null);
  const [openCamera, setOpenCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "camera" | "processing">("idle");
  const [coords, setCoords] = useState<Coordinates>({ latitude: 0, longitude: 0 });
  const [location, setLocation] = useState<string>("Mencari lokasi...");
  const [selectedAction, setSelectedAction] = useState<"clock_in" | "clock_out" | null>(null);
  
  const [tenantSettings, setTenantSettings] = useState<TenantSettingsData>({
    allowMultipleCheck: false
  });

  useEffect(() => {
    setMounted(true);
    setNow(dayjs());
    const interval = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mounted) {
      setAttendance(getTodayAttendanceItems(user));
    }
  }, [user, mounted]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const resp = (await getDataCurrentTenat()) as ApiResponse;
        if (resp && resp.data) {
          setTenantSettings({
            allowMultipleCheck: Boolean(resp.data.allow_multiple_check)
          });
        }
      } catch (error) {
        console.error("Failed to fetch tenant settings:", error);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocation("Lokasi tidak didukung");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setCoords({ latitude: lat, longitude: lng });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();

          if (data?.address) {
            const { road, village, suburb, city, town } = data.address;
            const streetName = road || "";
            const areaName = village || suburb || city || town || "";

            const shortAddress = [streetName, areaName].filter(Boolean).join(", ");
            setLocation(shortAddress || data.display_name || `${lat}, ${lng}`);
          } else {
            setLocation(data.display_name || `${lat}, ${lng}`);
          }
        } catch {
          setLocation(`${lat}, ${lng}`);
        }
      },
      () => {
        setLocation("Akses lokasi ditolak");
      }
    );
  }, []);

  if (!mounted || !now) {
    return (
      <div className="w-full mx-auto rounded-4xl p-6 sm:p-10 bg-white shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col gap-10 animate-pulse">
        <div className="h-32 bg-slate-50 rounded-3xl w-full"></div>
        <div className="h-24 bg-slate-50 rounded-2xl w-full"></div>
        <div className="h-64 bg-slate-50 rounded-3xl w-full"></div>
      </div>
    );
  }

  const loadImage = (img: HTMLImageElement) =>
    new Promise<void>((resolve, reject) => {
      img.onload = () => (img.width === 0 ? reject() : resolve());
      img.onerror = () => reject();
    });

  const handleClockClick = (type: "clock_in" | "clock_out") => {
    setSelectedAction(type);
    setStatus("camera");
    setOpenCamera(true);
  };

  const handleCapture = async (img: string) => {
    try {
      setLoading(true);
      setStatus("processing");

      await loadFaceModels();

      const selfieImg = new window.Image();
      const profileImg = new window.Image();

      selfieImg.src = img;
      profileImg.src = "/profile.jpg";

      await Promise.all([loadImage(selfieImg), loadImage(profileImg)]);

      const selfieAnalysis = await analyzeFace(selfieImg);
      const profileAnalysis = await analyzeFace(profileImg);

      if (!selfieAnalysis.ok) {
        toast.error(getFaceAnalysisErrorMessage(selfieAnalysis.error));
        return;
      }

      if (!profileAnalysis.ok) {
        toast.error("Foto profil tidak valid");
        return;
      }

      const result = compareFace(
        selfieAnalysis.metrics.descriptor,
        profileAnalysis.metrics.descriptor
      );

      if (!result.isMatch) {
        toast.error("Wajah tidak cocok");
        return;
      }

      const file = await dataUrlToFile(img);
      const mediaUrl = await uploadMedia(file);

      await clockAttendance({
        action: selectedAction!,
        latitude: coords.latitude,
        longitude: coords.longitude,
        media_url: mediaUrl,
      });

      const payload: AttendanceItem = {
        type: selectedAction,
        image: mediaUrl,
        time: dayjs().format("HH:mm:ss"),
        location,
      };

      setAttendance((prev) => [...prev, payload]);
      
      setOpenCamera(false);
      triggerRefresh();
      toast.success(selectedAction === "clock_in" ? "Clock In berhasil" : "Clock Out berhasil");
    } catch (error: unknown) {
      const err = error as { response: { data: { message: string } } };
      if (err.response?.data?.message === "Request expired") {
        toast.error("Koneksi lambat. Silakan coba lagi.");
      } else {
        toast.error("Terjadi kesalahan saat absen.");
      }
    } finally {
      setLoading(false);
      setStatus("idle");
    }
  };

  const sortedAttendance = [...attendance].sort((a, b) => {
    return dayjs(b.time, "HH:mm:ss").unix() - dayjs(a.time, "HH:mm:ss").unix();
  });

  const latestLog = sortedAttendance.length > 0 ? sortedAttendance[0] : null;

  const canClockIn = tenantSettings.allowMultipleCheck
    ? (!latestLog || latestLog.type === "clock_out")
    : (!attendance.some(a => a.type === "clock_in"));

  const canClockOut = tenantSettings.allowMultipleCheck
    ? (latestLog && latestLog.type === "clock_in")
    : (attendance.some(a => a.type === "clock_in") && !attendance.some(a => a.type === "clock_out"));

  const isClockInDisabled = loading || !canClockIn;
  const isClockOutDisabled = loading || !canClockOut;

  const statusText = status === "processing"
    ? "Memproses verifikasi wajah..."
    : status === "camera"
      ? "Ambil selfie absensi"
      : attendance.length === 0
        ? "Sistem Absensi Aktif"
        : `Terekam ${attendance.length} Log Absensi`;

  return (
    <>
      <div className="w-full mx-auto rounded-4xl p-6 sm:p-8 bg-white shadow-2xl shadow-slate-200/40 border border-slate-100 flex flex-col gap-8 relative overflow-hidden">
        
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

        <div className="flex flex-col items-center text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">
            <Clock size={14} />
            {now.format("dddd, DD MMM YYYY")}
          </div>
          <div className="text-6xl sm:text-7xl font-black tracking-tighter text-slate-900 tabular-nums leading-none">
            {now.format("HH:mm")}
          </div>
          
          <div className="flex flex-col items-center gap-2.5 w-full max-w-sm mx-auto mt-2">
            <span className="text-sm font-semibold text-slate-500">
              {statusText}
            </span>
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 w-full truncate">
              <MapPin className="text-rose-500 shrink-0" size={16} />
              <span className="truncate">{location}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <button
            onClick={() => handleClockClick("clock_in")}
            disabled={isClockInDisabled}
            className={`relative flex items-center justify-center gap-3 rounded-2xl p-4 sm:p-5 transition-all duration-300
              ${isClockInDisabled
                ? "bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-linear-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
              }`}
          >
            {loading && selectedAction === "clock_in" ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <ArrowRight size={24} className="shrink-0" />
            )}
            <span className="font-bold text-sm sm:text-base tracking-wide">
              Clock In
            </span>
          </button>

          <button
            onClick={() => handleClockClick("clock_out")}
            disabled={isClockOutDisabled}
            className={`relative flex items-center justify-center gap-3 rounded-2xl p-4 sm:p-5 transition-all duration-300
              ${isClockOutDisabled
                ? "bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-linear-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-0.5"
              }`}
          >
            {loading && selectedAction === "clock_out" ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <ArrowRightCircle size={24} className="shrink-0 rotate-180" />
            )}
            <span className="font-bold text-sm sm:text-base tracking-wide">
              Clock Out
            </span>
          </button>
        </div>

        <div className="flex flex-col gap-3 relative z-10">
          <div className="flex items-center justify-between px-1 mb-1 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <History size={18} className="text-blue-500" />
              Log Aktivitas
            </h3>
            {tenantSettings.allowMultipleCheck && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                Multi-Log Active
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3 max-h-70 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            {sortedAttendance.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-10 text-center">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                  <Clock size={24} className="text-slate-300" />
                </div>
                <p className="text-xs font-semibold text-slate-400">
                  Belum ada rekaman absensi.
                </p>
              </div>
            ) : (
              sortedAttendance.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-stretch gap-4 p-3.5 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden shadow-inner border border-slate-200/50">
                    <Image
                      src={item.image || EMPTY_IMAGE}
                      alt="Log"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  
                  <div className="flex flex-col justify-center flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                        item.type === "clock_in" 
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                          : "bg-orange-50 text-orange-600 border border-orange-100"
                      }`}>
                        {item.type === "clock_in" ? "Clock In" : "Clock Out"}
                      </span>
                      <span className="text-sm font-black text-slate-800 tabular-nums">
                        {item.time}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin size={12} className="text-slate-400 shrink-0" />
                      <p className="text-[11px] font-medium text-slate-500 truncate">
                        {item.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center shrink-0 pr-1">
                    <ShieldCheck size={20} className="text-emerald-500" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <CameraModal
        open={openCamera}
        loading={loading}
        onClose={() => {
          setOpenCamera(false);
          setStatus("idle");
        }}
        onCapture={handleCapture}
      />
    </>
  );
}
