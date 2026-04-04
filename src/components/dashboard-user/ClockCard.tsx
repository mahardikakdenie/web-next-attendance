"use client";

import { useEffect, useMemo, useState } from "react";
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
import { getDataAttendances, recordAttendances } from "@/service/attendance";
import { uploadMedia } from "@/service/media";

type AttendanceType = "clockIn" | "clockOut";

type AttendanceItem = {
  type: AttendanceType;
  image: string;
  time: string;
  location: string;
};

type Coordinates = {
  latitude: string;
  longitude: string;
};


const dataUrlToFile = async (dataUrl: string) => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const extension = blob.type.split("/")[1] || "png";
  return new File([blob], `attendance-${Date.now()}.${extension}`, { type: blob.type || "image/png" });
};
const EMPTY_IMAGE =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360'%3E%3Crect width='100%25' height='100%25' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2364758b' font-size='24'%3ENo+Image%3C/text%3E%3C/svg%3E";

const toClockType = (value?: string): AttendanceType | null => {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized.includes("in")) return "clockIn";
  if (normalized.includes("out")) return "clockOut";
  return null;
};

const extractAttendanceList = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const raw = payload as Record<string, unknown>;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.items)) return raw.items;
    if (Array.isArray(raw.attendances)) return raw.attendances;
  }
  return [];
};

const mapApiAttendance = (item: unknown): AttendanceItem | null => {
  if (!item || typeof item !== "object") return null;
  const source = item as Record<string, unknown>;
  const action =
    typeof source.action === "string"
      ? source.action
      : typeof source.type === "string"
      ? source.type
      : undefined;
  const type = toClockType(action);
  if (!type) return null;

  const createdAtRaw =
    typeof source.created_at === "string"
      ? source.created_at
      : typeof source.createdAt === "string"
      ? source.createdAt
      : typeof source.time === "string"
      ? source.time
      : undefined;
  const parsedDate = createdAtRaw ? dayjs(createdAtRaw) : null;
  const time = parsedDate && parsedDate.isValid() ? parsedDate.format("HH:mm:ss") : "--:--:--";

  const latitudeRaw =
    typeof source.latitude === "number"
      ? source.latitude.toString()
      : typeof source.latitude === "string"
      ? source.latitude
      : "-";
  const longitudeRaw =
    typeof source.longitude === "number"
      ? source.longitude.toString()
      : typeof source.longitude === "string"
      ? source.longitude
      : "-";

  const mediaUrl =
    typeof source.media_url === "string"
      ? source.media_url
      : typeof source.mediaUrl === "string"
      ? source.mediaUrl
      : typeof source.image === "string"
      ? source.image
      : EMPTY_IMAGE;

  return {
    type,
    image: mediaUrl,
    time,
    location: `${latitudeRaw}, ${longitudeRaw}`,
  };
};

export default function ClockCard() {
  const [attendance, setAttendance] = useState<AttendanceItem[]>([]);
  const [now, setNow] = useState(dayjs());
  const [openCamera, setOpenCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "camera" | "processing">("idle");
  const [coords, setCoords] = useState<Coordinates>({ latitude: "0", longitude: "0" });
  const [location, setLocation] = useState<string>(
    typeof navigator === "undefined" || !navigator.geolocation
      ? "Location not supported"
      : "Mencari lokasi..."
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(dayjs());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const res = await getDataAttendances();
        const mapped = extractAttendanceList(res).map(mapApiAttendance).filter((item): item is AttendanceItem => item !== null);
        mapped.sort((a, b) => (a.type === "clockIn" ? -1 : 1) - (b.type === "clockIn" ? -1 : 1));
        setAttendance(mapped.slice(0, 2));
      } catch {
        toast.error("Gagal mengambil data absensi");
      }
    };

    fetchAttendances();
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latitude = pos.coords.latitude.toFixed(6);
        const longitude = pos.coords.longitude.toFixed(6);
        setCoords({ latitude, longitude });
        setLocation(`${latitude}, ${longitude}`);
      },
      () => {
        setLocation("Akses lokasi ditolak");
        toast.error("Location access denied");
      }
    );
  }, []);

  const loadImage = (img: HTMLImageElement) =>
    new Promise<void>((resolve, reject) => {
      img.onload = () => {
        if (img.width === 0 || img.height === 0) reject(new Error("Empty image"));
        else resolve();
      };
      img.onerror = () => reject(new Error("Image load failed"));
    });

  const action = useMemo(() => {
    if (attendance.length === 0) return "clock_in";
    return "clock_out";
  }, [attendance.length]);

  const handleClockClick = () => {
    if (attendance.length === 2) {
      toast.info("Anda sudah menyelesaikan absensi hari ini");
      return;
    }
    setStatus("camera");
    setOpenCamera(true);
  };

  const handleCapture = async (img: string) => {
    try {
      setLoading(true);
      setStatus("processing");

      const mediaFile = await dataUrlToFile(img);
      const mediaUrl = await uploadMedia(mediaFile);

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
        setStatus("idle");
        return;
      }

      if (!profileAnalysis.ok) {
        toast.error("Foto referensi profil tidak valid untuk verifikasi wajah");
        setStatus("idle");
        return;
      }

      const result = compareFace(selfieAnalysis.metrics.descriptor, profileAnalysis.metrics.descriptor);

      if (!result.isMatch) {
        toast.error("Wajah tidak cocok dengan data profil Anda");
        setStatus("idle");
        return;
      }

      await recordAttendances({
        action,
        latitude: coords.latitude,
        longitude: coords.longitude,
        media_url: mediaUrl,
      });

      const payload: AttendanceItem = {
        type: action === "clock_in" ? "clockIn" : "clockOut",
        image: mediaUrl,
        time: dayjs().format("HH:mm:ss"),
        location,
      };

      setAttendance((prev) => [...prev, payload]);
      toast.success(payload.type === "clockIn" ? "Berhasil Clock In!" : "Berhasil Clock Out!");
      setStatus("idle");
    } catch (error) {
      if (error instanceof Error && error.message.includes("Media upload")) {
        toast.error("Upload foto selfie gagal");
      } else {
        toast.error("Terjadi kesalahan saat verifikasi wajah");
      }
      setStatus("idle");
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = () => {
    if (status === "processing") return "Memverifikasi wajah Anda...";
    if (status === "camera") return "Posisikan wajah di dalam bingkai";
    if (attendance.length === 0) return "Silakan mulai hari kerja Anda";
    if (attendance.length === 1) return "Sedang dalam jam kerja";
    return "Kerja bagus! Absensi hari ini selesai.";
  };

  const getButtonText = () => {
    if (loading) return "Memproses...";
    if (attendance.length === 0) return "Clock In Sekarang";
    if (attendance.length === 1) return "Clock Out Sekarang";
    return "Absensi Selesai";
  };

  return (
    <>
      <div className="relative w-full mx-auto rounded-4xl p-6 sm:p-8 bg-white border border-slate-100 shadow-2xl flex flex-col gap-8 overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-slate-400">Status Hari Ini</p>
            <h2 className="text-2xl font-bold text-slate-800">
              {attendance.length === 2 ? "Selesai" : attendance.length === 1 ? "Sedang Bekerja" : "Belum Hadir"}
            </h2>
          </div>
        </div>

        <div className="text-center">
          <div className="text-6xl font-black">{now.format("HH:mm")}</div>
          <p className="text-slate-500 mt-2">{now.format("dddd, DD MMMM YYYY")}</p>
          <p className="mt-4 text-sm text-slate-600">{getStatusText()}</p>
        </div>

        <div className="grid gap-6">
          {attendance.map((item, idx) => (
            <div key={idx} className="relative rounded-3xl overflow-hidden shadow-lg">
              <div className="relative w-full h-64">
                <Image src={item.image} alt="attendance" fill className="object-cover" unoptimized />
              </div>

              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

              <div className="absolute bottom-0 p-4 text-white w-full">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm opacity-80">{item.type === "clockIn" ? "Clock In" : "Clock Out"}</p>
                    <p className="text-lg font-bold flex items-center gap-2">
                      <Clock size={16} /> {item.time}
                    </p>
                    <p className="text-xs opacity-80 flex items-center gap-2 truncate">
                      <MapPin size={14} /> {item.location}
                    </p>
                  </div>

                  <div className="bg-emerald-500 p-2 rounded-full">
                    <ShieldCheck size={16} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleClockClick}
          disabled={loading || attendance.length === 2}
          className="w-full py-4 rounded-2xl text-white font-semibold flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
          {getButtonText()}
        </button>
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
