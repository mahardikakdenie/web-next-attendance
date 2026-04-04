"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Clock, Camera, MapPin, ShieldCheck, Loader2 } from "lucide-react";
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
  upsertAttendance,
  type AttendanceItem,
  EMPTY_IMAGE,
} from "@/lib/todayAttendance";
import { recordAttendances } from "@/service/attendance";
import { uploadMedia } from "@/service/media";
import { useAuthStore } from "@/store/auth.store";

type Coordinates = {
  latitude: number;
  longitude: number;
};

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
  const [attendance, setAttendance] = useState<AttendanceItem[]>([]);
  const [now, setNow] = useState(dayjs());
  const [openCamera, setOpenCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "camera" | "processing">("idle");
  const [coords, setCoords] = useState<Coordinates>({ latitude: 0, longitude: 0 });
  const [location, setLocation] = useState<string>("Mencari lokasi...");
  const [selectedAction, setSelectedAction] = useState<"clock_in" | "clock_out" | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setAttendance(getTodayAttendanceItems(user));
  }, [user]);

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

      await recordAttendances({
        action: selectedAction ?? "",
        latitude: coords.latitude,
        longitude: coords.longitude,
        media_url: mediaUrl,
      });

      const payload: AttendanceItem = {
        type: selectedAction === "clock_in" ? "clockIn" : "clockOut",
        image: mediaUrl,
        time: dayjs().format("HH:mm:ss"),
        location,
      };

      setAttendance((prev) => upsertAttendance(prev, payload));
      setOpenCamera(false);
      toast.success(selectedAction === "clock_in" ? "Clock In berhasil" : "Clock Out berhasil");
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
      setStatus("idle");
    }
  };

  const statusText =
    status === "processing"
      ? "Memproses verifikasi wajah..."
      : status === "camera"
      ? "Ambil selfie untuk absensi"
      : attendance.length === 0
      ? "Belum ada absensi hari ini"
      : attendance.length === 1
      ? "Satu absensi terekam hari ini"
      : "Absensi hari ini telah lengkap";

  const hasClockIn = attendance.some((a) => a.type === "clockIn");
  const hasClockOut = attendance.some((a) => a.type === "clockOut");

  const isClockInDisabled = loading || hasClockIn;
  const isClockOutDisabled = loading || !hasClockIn || hasClockOut;

  return (
    <>
      <div className="w-full mx-auto rounded-4xl p-6 sm:p-10 bg-white shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col gap-10">
        
        {/* Header Section: Time & Location */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-blue-600 tracking-widest uppercase">
              {now.format("dddd, DD MMMM YYYY")}
            </h2>
            <div className="text-6xl sm:text-7xl font-extrabold tracking-tighter text-slate-900 tabular-nums">
              {now.format("HH:mm")}
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 w-full max-w-md mx-auto">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold tracking-wide">
              {statusText}
            </span>
            <div className="flex items-center justify-center gap-2.5 text-sm font-medium text-slate-700 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm w-full transition-all hover:border-slate-300">
              <MapPin className="text-rose-500 shrink-0" size={20} />
              <span className="truncate">{location}</span>
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Aktivitas Hari Ini
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {attendance.length === 0 ? (
              <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-14 px-6 text-center transition-colors hover:bg-slate-50">
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <Clock size={32} className="text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-500">
                  Belum ada data absensi untuk hari ini.
                </p>
              </div>
            ) : (
              attendance.map((item, idx) => (
                <div key={idx} className="group relative rounded-3xl overflow-hidden shadow-md shadow-slate-200/50 border border-slate-100 bg-white transition-all duration-300 hover:shadow-xl hover:shadow-slate-200 hover:-translate-y-1">
                  <div className="relative w-full h-48 sm:h-52">
                    <Image
                      src={item.image || EMPTY_IMAGE}
                      alt="Attendance"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      unoptimized
                    />
                  </div>

                  {/* Gradient Overlay fix */}
                  <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/30 to-transparent" />

                  <div className="absolute bottom-0 p-5 text-white w-full flex justify-between items-end">
                    <div className="flex flex-col gap-1.5 w-full pr-4">
                      <span className="inline-flex w-fit px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest border border-white/10">
                        {item.type === "clockIn" ? "Clock In" : "Clock Out"}
                      </span>
                      <p className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                        {item.time}
                      </p>
                      <p className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                        <MapPin size={12} className="shrink-0 text-rose-400" />
                        <span className="truncate">{item.location}</span>
                      </p>
                    </div>

                    <div className="bg-emerald-500/90 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-emerald-400/30 mb-1 shrink-0">
                      <ShieldCheck size={24} className="text-white" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* CLOCK IN BUTTON */}
          <button
            onClick={() => handleClockClick("clock_in")}
            disabled={isClockInDisabled}
            className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl p-6 transition-all duration-300
              ${
                isClockInDisabled
                  ? "bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 hover:-translate-y-1 active:translate-y-0"
              }`}
          >
            <div className={`p-3 rounded-full transition-colors ${isClockInDisabled ? "bg-slate-200/50 text-slate-400" : "bg-white/20 text-white"}`}>
              {loading && selectedAction === "clock_in" ? (
                <Loader2 className="animate-spin" size={28} />
              ) : (
                <Camera size={28} strokeWidth={2} />
              )}
            </div>
            <span className="font-semibold text-base tracking-wide">
              {hasClockIn ? "Sudah Clock In" : "Clock In"}
            </span>
          </button>

          {/* CLOCK OUT BUTTON */}
          <button
            onClick={() => handleClockClick("clock_out")}
            disabled={isClockOutDisabled}
            className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl p-6 transition-all duration-300
              ${
                isClockOutDisabled
                  ? "bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-orange-500 text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 hover:-translate-y-1 active:translate-y-0"
              }`}
          >
            <div className={`p-3 rounded-full transition-colors ${isClockOutDisabled ? "bg-slate-200/50 text-slate-400" : "bg-white/20 text-white"}`}>
              {loading && selectedAction === "clock_out" ? (
                <Loader2 className="animate-spin" size={28} />
              ) : (
                <Camera size={28} strokeWidth={2} />
              )}
            </div>
            <span className="font-semibold text-base tracking-wide">
              {!hasClockIn
                ? "Belum Clock In"
                : hasClockOut
                ? "Sudah Clock Out"
                : "Clock Out"}
            </span>
          </button>
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
