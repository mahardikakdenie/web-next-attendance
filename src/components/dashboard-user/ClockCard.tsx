"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Clock, Camera } from "lucide-react";
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
            : "Getting location..."
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
                setLocation("Location denied");
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
            toast.info("Anda sudah melakukan absensi hari ini");
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
                toast.error("Wajah tidak cocok dengan data");
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
                    toast.success("Berhasil Clock In");
                    return { ...prev, clockIn: payload };
                } else {
                    toast.success("Berhasil Clock Out");
                    return { ...prev, clockOut: payload };
                }
            });

            setStatus("idle");
        } catch (err) {
            console.log(err);

            toast.error("Terjadi kesalahan saat verifikasi");
            setStatus("idle");
        } finally {
            setLoading(false);
        }
    };

    const getStatusText = () => {
        if (status === "processing") return "Memverifikasi wajah...";
        if (status === "camera") return "Posisikan wajah lalu ambil foto";
        if (!attendance.clockIn) return "Silakan Clock In";
        if (!attendance.clockOut) return "Silakan Clock Out";
        return "Absensi hari ini selesai";
    };

    const getButtonText = () => {
        if (loading) return "Processing...";
        if (!attendance.clockIn) return "Clock In";
        if (!attendance.clockOut) return "Clock Out";
        return "Selesai";
    };

    return (
        <>
            <div className="rounded-2xl p-6 flex flex-col gap-6 bg-slate-100/80">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-slate-500">Today Status</p>
                        <h2 className="text-xl font-semibold text-slate-900">
                            {attendance.clockOut
                                ? "Completed"
                                : attendance.clockIn
                                    ? "Working"
                                    : "Not Checked In"}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 text-xs bg-white px-2 py-1 rounded-full text-slate-500">
                        <Clock size={14} />
                        Live
                    </div>
                </div>

                <div className="text-4xl font-bold text-slate-900">
                    {now.format("HH:mm")}
                </div>

                <div className="text-sm text-center bg-white p-3 rounded-xl text-slate-600">
                    {getStatusText()}
                </div>

                <div className="flex flex-col gap-3">
                    {attendance.clockIn && (
                        <div className="bg-white p-3 rounded-xl flex gap-3 items-center">
                            <Image
                                src={attendance.clockIn.image}
                                width={80}
                                height={80}
                                alt="clockin"
                                className="rounded-lg object-cover"
                                unoptimized
                            />
                            <div className="text-xs">
                                <p className="font-semibold text-slate-700">Clock In</p>
                                <p>🕒 {attendance.clockIn.time}</p>
                                <p>📍 {attendance.clockIn.location}</p>
                            </div>
                        </div>
                    )}

                    {attendance.clockOut && (
                        <div className="bg-white p-3 rounded-xl flex gap-3 items-center">
                            <Image
                                src={attendance.clockOut.image}
                                width={80}
                                height={80}
                                alt="clockout"
                                className="rounded-lg object-cover"
                                unoptimized
                            />
                            <div className="text-xs">
                                <p className="font-semibold text-slate-700">Clock Out</p>
                                <p>🕒 {attendance.clockOut.time}</p>
                                <p>📍 {attendance.clockOut.location}</p>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleClockClick}
                    disabled={loading || !!attendance.clockOut}
                    className="py-3 rounded-xl bg-slate-900 text-white flex justify-center items-center gap-2 disabled:opacity-50"
                >
                    <Camera size={16} />
                    {getButtonText()}
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
