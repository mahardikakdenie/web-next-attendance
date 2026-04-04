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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 flex flex-col gap-5">
        <div className="text-lg font-semibold text-slate-800">Ambil Foto Absensi</div>

        <div className="relative w-full h-100 bg-black rounded-2xl overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              streamRef.current?.getTracks().forEach((t) => t.stop());
              streamRef.current = null;
              startedRef.current = false;
              onClose();
            }}
            className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition text-slate-700 font-medium disabled:opacity-60"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleCapture}
            className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 transition text-white font-semibold disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Ambil Foto"}
          </button>
        </div>
      </div>
    </div>
  );
}
