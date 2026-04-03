"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Clock, Camera, MapPin, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import CameraModal from "../attendance/CameraModal";
import Image from "next/image";
import { toast } from "sonner";
import {
    loadFaceModels,
    getFaceDescriptor,
    compareFace,
} from "@/lib/faceRecognition";

type AttendanceData = {
    clockIn?: {
        image: string;
        time: string;
        location: string;
    };
    clockOut?: {
        image: string;
        time: string;
        location: string;
    };
};

export default function ClockCard() {
    const [attendance, setAttendance] = useState<AttendanceData>({});
    const [now, setNow] = useState(dayjs());
    const [openCamera, setOpenCamera] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "camera" | "processing">("idle");

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
        if (typeof navigator === "undefined" || !navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
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
                if (img.width === 0 || img.height === 0) reject("Empty image");
                else resolve();
            };
            img.onerror = reject;
        });

    const handleClockClick = () => {
        if (attendance.clockIn && attendance.clockOut) {
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

            await loadFaceModels();

            const selfieImg = new window.Image();
            const profileImg = new window.Image();

            selfieImg.src = img;
            profileImg.src = "/profile.jpg";

            await Promise.all([loadImage(selfieImg), loadImage(profileImg)]);

            const selfieDesc = await getFaceDescriptor(selfieImg);
            const profileDesc = await getFaceDescriptor(profileImg);

            if (!selfieDesc || !profileDesc) {
                toast.error("Wajah tidak terdeteksi, coba lagi dengan pencahayaan cukup");
                setStatus("idle");
                return;
            }

            const result = compareFace(selfieDesc, profileDesc);

            if (!result.isMatch) {
                toast.error("Wajah tidak cocok dengan data profil Anda");
                setStatus("idle");
                return;
            }

            const payload = {
                image: img,
                time: dayjs().format("HH:mm:ss"),
                location,
            };

            setAttendance((prev) => {
                if (!prev.clockIn) {
                    toast.success("Berhasil Clock In!");
                    return { ...prev, clockIn: payload };
                } else {
                    toast.success("Berhasil Clock Out!");
                    return { ...prev, clockOut: payload };
                }
            });

            setStatus("idle");
        } catch (err) {
            console.log(err);
            toast.error("Terjadi kesalahan saat verifikasi wajah");
            setStatus("idle");
        } finally {
            setLoading(false);
        }
    };

    const getStatusText = () => {
        if (status === "processing") return "Memverifikasi wajah Anda...";
        if (status === "camera") return "Posisikan wajah di dalam bingkai";
        if (!attendance.clockIn) return "Silakan mulai hari kerja Anda";
        if (!attendance.clockOut) return "Sedang dalam jam kerja";
        return "Kerja bagus! Absensi hari ini selesai.";
    };

    const getButtonText = () => {
        if (loading) return "Memproses...";
        if (!attendance.clockIn) return "Clock In Sekarang";
        if (!attendance.clockOut) return "Clock Out Sekarang";
        return "Absensi Selesai";
    };

    return (
        <>
            {/* Card Container */}
            <div className="relative w-full mx-auto rounded-4xl p-6 sm:p-8 bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col gap-8 overflow-hidden">
                
                {/* Decorative Background Blob */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-blue-50 blur-3xl opacity-60 pointer-events-none" />

                {/* Header Section */}
                <div className="flex justify-between items-start relative z-10">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Status Hari Ini</p>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            {attendance.clockOut ? (
                                <span className="text-emerald-600 flex items-center gap-2">
                                    <CheckCircle2 size={24} /> Selesai
                                </span>
                            ) : attendance.clockIn ? (
                                <span className="text-blue-600 flex items-center gap-2">
                                    <Clock size={24} /> Sedang Bekerja
                                </span>
                            ) : (
                                <span className="text-slate-600">Belum Hadir</span>
                            )}
                        </h2>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full ring-1 ring-emerald-500/20 animate-fade-in">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live
                    </div>
                </div>

                {/* Time Display Section */}
                <div className="flex flex-col items-center justify-center py-4 relative z-10">
                    <div className="text-6xl sm:text-7xl font-black tracking-tighter bg-linear-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">
                        {now.format("HH:mm")}
                    </div>
                    <p className="text-slate-500 font-medium mt-2">{now.format("dddd, DD MMMM YYYY")}</p>
                    
                    <div className="mt-6 text-sm font-medium text-center bg-slate-50/80 px-6 py-2.5 rounded-2xl text-slate-600 border border-slate-100 w-full max-w-70">
                        {status === "processing" ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 size={16} className="animate-spin text-blue-500" />
                                {getStatusText()}
                            </span>
                        ) : (
                            getStatusText()
                        )}
                    </div>
                </div>

                {/* Logs Section */}
                <div className="flex flex-col gap-4 relative z-10">
                    {attendance.clockIn && (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-4 items-center transition-all hover:border-slate-200 hover:shadow-sm">
                            <div className="relative">
                                <Image
                                    src={attendance.clockIn.image}
                                    width={64}
                                    height={64}
                                    alt="clockin"
                                    className="rounded-xl object-cover ring-2 ring-white shadow-sm h-16 w-16"
                                    unoptimized
                                />
                                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
                                    <ShieldCheck size={12} />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 text-sm flex-1">
                                <p className="font-bold text-slate-800">Clock In</p>
                                <p className="text-slate-500 flex items-center gap-1.5">
                                    <Clock size={14} /> {attendance.clockIn.time}
                                </p>
                                <p className="text-slate-500 flex items-center gap-1.5 truncate pr-2">
                                    <MapPin size={14} className="shrink-0" /> 
                                    <span className="truncate">{attendance.clockIn.location}</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {attendance.clockOut && (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-4 items-center transition-all hover:border-slate-200 hover:shadow-sm">
                            <div className="relative">
                                <Image
                                    src={attendance.clockOut.image}
                                    width={64}
                                    height={64}
                                    alt="clockout"
                                    className="rounded-xl object-cover ring-2 ring-white shadow-sm h-16 w-16"
                                    unoptimized
                                />
                                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
                                    <ShieldCheck size={12} />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 text-sm flex-1">
                                <p className="font-bold text-slate-800">Clock Out</p>
                                <p className="text-slate-500 flex items-center gap-1.5">
                                    <Clock size={14} /> {attendance.clockOut.time}
                                </p>
                                <p className="text-slate-500 flex items-center gap-1.5 truncate pr-2">
                                    <MapPin size={14} className="shrink-0" /> 
                                    <span className="truncate">{attendance.clockOut.location}</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <button
                    onClick={handleClockClick}
                    disabled={loading || !!attendance.clockOut}
                    className="group relative w-full py-4 rounded-2xl text-white font-semibold flex justify-center items-center gap-2 overflow-hidden transition-all disabled:opacity-60 disabled:cursor-not-allowed
                    bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 disabled:shadow-none"
                >
                    {loading ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                        <Camera size={20} className="transition-transform group-hover:scale-110" />
                    )}
                    <span className="relative z-10">{getButtonText()}</span>
                </button>
            </div>

            <CameraModal
                open={openCamera}
                onClose={() => {
                    setOpenCamera(false);
                    setStatus("idle");
                }}
                onCapture={handleCapture}
            />
        </>
    );
}
