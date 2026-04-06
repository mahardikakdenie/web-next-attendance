"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, RefreshCw, AlertCircle, X } from "lucide-react";

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

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || startedRef.current) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        streamRef.current = stream;
        startedRef.current = true;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Wait for video metadata to load before considering it ready
          videoRef.current.onloadedmetadata = () => {
            setIsCameraReady(true);
            videoRef.current?.play().catch(console.error);
          };
        }
      } catch (err) {
        console.error("Camera error:", err);
        setCameraError("Akses kamera ditolak atau tidak tersedia. Pastikan Anda memberikan izin akses.");
        toast.error("Akses kamera ditolak atau tidak tersedia");
      }
    };

    // Reset state before starting camera (setTimeout ensures it's not synchronous in the effect)
    setTimeout(() => {
      setCameraError(null);
      setIsCameraReady(false);
      startCamera();
    }, 0);

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      startedRef.current = false;
      
      // Delay cleanup state to avoid synchronous effect update
      setTimeout(() => {
        setIsCameraReady(false);
      }, 0);
    };
  }, [open]);

  const handleCapture = () => {
    if (loading || !isCameraReady || cameraError) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Mirror the canvas context so the saved image matches the mirrored video preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const image = canvas.toDataURL("image/png");

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    startedRef.current = false;

    onCapture(image);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-md transition-all duration-300 sm:p-6">
      <div className="relative flex w-full max-w-2xl flex-col gap-6 overflow-hidden rounded-[2.5rem] bg-white p-6 shadow-2xl sm:p-8 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
              <Camera size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-neutral-900">
                Ambil Foto Absensi
              </h2>
              <p className="text-xs font-medium text-neutral-500">
                Posisikan wajah Anda di dalam bingkai
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
                streamRef.current = null;
              }
              startedRef.current = false;
              onClose();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-50 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 active:scale-95"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Video Container */}
        <div className="relative flex h-[50vh] w-full items-center justify-center overflow-hidden rounded-4xl bg-neutral-950 ring-1 ring-neutral-200/50 sm:h-[60vh]">
          
          {cameraError ? (
            <div className="flex flex-col items-center justify-center gap-4 p-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20 text-rose-500">
                <AlertCircle size={32} strokeWidth={2} />
              </div>
              <p className="text-sm font-medium text-rose-200 max-w-xs">{cameraError}</p>
            </div>
          ) : (
            <>
              {!isCameraReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-900 z-10">
                  <RefreshCw size={28} className="animate-spin text-blue-500" />
                  <p className="text-sm font-semibold tracking-wide text-neutral-400">Menyiapkan Kamera...</p>
                </div>
              )}

              <video 
                ref={videoRef} 
                playsInline 
                muted 
                className={`h-full w-full object-cover transition-opacity duration-500 ${isCameraReady ? "opacity-100" : "opacity-0"} -scale-x-100`} 
              />

              {/* Overlay Bingkai Wajah */}
              {isCameraReady && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className="h-72 w-56 rounded-[100px] border-4 border-white/40 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] sm:h-80 sm:w-64 transition-all duration-300 animate-pulse-slow"></div>
                </div>
              )}
            </>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            disabled={loading || !isCameraReady || !!cameraError}
            onClick={handleCapture}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-neutral-900 py-4 text-base font-bold text-white transition-all hover:bg-neutral-800 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <Camera size={20} className="transition-transform group-hover:scale-110" />
                <span>Ambil Foto</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
