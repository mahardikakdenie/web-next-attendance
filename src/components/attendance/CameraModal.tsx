"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onCapture: (image: string) => void;
}

export default function CameraModal({ open, loading = false, onClose, onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!open || startedRef.current) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 24, max: 30 },
          },
        });

        streamRef.current = stream;
        startedRef.current = true;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        toast.error("Akses kamera ditolak atau tidak tersedia");
        onClose();
      }
    };

    startCamera();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      startedRef.current = false;
    };
  }, [onClose, open]);

  const handleCapture = () => {
    if (loading) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Capture video ke canvas
    ctx.drawImage(video, 0, 0);

    const image = canvas.toDataURL("image/png");

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    startedRef.current = false;

    onCapture(image);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-6">
      {/* Modal Container diperbesar menjadi max-w-3xl */}
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-5 md:p-8 flex flex-col gap-6">
        <div className="text-xl font-bold text-slate-800 text-center">
          Ambil Foto Absensi
        </div>

        {/* Video Container diperbesar tingginya menggunakan vh */}
        <div className="relative w-full h-[60vh] bg-black rounded-2xl overflow-hidden shadow-inner">
          {/* Efek scale-x-[-1] membuat kamera bertindak seperti cermin */}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover -scale-x-100" 
          />

          {/* 🔥 OVERLAY BINGKAI WAJAH 🔥 */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            {/* Teks Instruksi */}
            <div className="absolute top-8 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md">
              Posisikan wajah Anda di dalam bingkai
            </div>

            {/* Area Bingkai Kapsul Wajah */}
            {/* Trik shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] digunakan untuk menggelapkan area di luar bingkai */}
            <div className="w-56 h-72 md:w-64 md:h-80 border-4 border-white/70 border-dashed rounded-[120px] shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] animate-pulse-slow"></div>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex gap-4 mt-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              streamRef.current?.getTracks().forEach((t) => t.stop());
              streamRef.current = null;
              startedRef.current = false;
              onClose();
            }}
            className="flex-1 py-4 rounded-xl bg-slate-100 hover:bg-slate-200 transition text-slate-700 font-semibold text-lg disabled:opacity-60"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleCapture}
            className="flex-1 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 transition text-white font-semibold text-lg disabled:opacity-60 shadow-lg"
          >
            {loading ? "Memproses..." : "Ambil Foto"}
          </button>
        </div>
      </div>
    </div>
  );
}
