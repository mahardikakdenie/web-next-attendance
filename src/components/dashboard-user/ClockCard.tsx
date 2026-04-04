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
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setCoords({ latitude: lat, longitude: lng });
        setLocation(`${lat}, ${lng}`);
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
        ? "Ambil selfie untuk lanjut absensi"
        : attendance.length === 0
          ? "Belum ada absensi hari ini"
          : attendance.length === 1
            ? "Satu absensi terekam hari ini"
            : "Clock In dan Clock Out hari ini sudah tampil";

  return (
    <>
      <div className="w-full mx-auto rounded-4xl p-6 bg-white shadow-2xl flex flex-col gap-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-5xl font-black">
            <Clock size={32} /> {now.format("HH:mm")}
          </div>
          <p className="text-slate-500">{now.format("dddd, DD MMMM YYYY")}</p>
          <p className="text-sm text-slate-500">{statusText}</p>

          <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
            <MapPin size={14} />
            {location}
          </div>
        </div>

        <div className="grid gap-4">
          {attendance.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              Belum ada data attendance untuk hari ini.
            </div>
          ) : (
            attendance.map((item, idx) => (
              <div key={idx} className="relative rounded-2xl overflow-hidden shadow-lg">
                <div className="relative w-full h-56">
                  <Image
                    src={item.image || EMPTY_IMAGE}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />

                <div className="absolute bottom-0 p-4 text-white w-full flex justify-between items-end">
                  <div>
                    <p className="text-sm">{item.type === "clockIn" ? "Clock In" : "Clock Out"}</p>
                    <p className="flex items-center gap-2 text-lg font-semibold">
                      <Clock size={14} /> {item.time}
                    </p>
                    <p className="flex items-center gap-2 text-xs opacity-80">
                      <MapPin size={12} /> {item.location}
                    </p>
                  </div>

                  <div className="bg-emerald-500 p-2 rounded-full">
                    <ShieldCheck size={16} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleClockClick("clock_in")}
            disabled={loading}
            className="py-4 rounded-xl bg-green-600 text-white flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && selectedAction === "clock_in" ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Camera size={18} />
            )}
            Clock In
          </button>

          <button
            onClick={() => handleClockClick("clock_out")}
            disabled={loading}
            className="py-4 rounded-xl bg-orange-500 text-white flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && selectedAction === "clock_out" ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Camera size={18} />
            )}
            Clock Out
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
