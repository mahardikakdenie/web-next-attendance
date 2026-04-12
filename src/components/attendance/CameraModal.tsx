"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, RefreshCw, AlertCircle, X, Sparkles } from "lucide-react";

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
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        streamRef.current = stream;
        startedRef.current = true;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsCameraReady(true);
            videoRef.current?.play().catch(console.error);
          };
        }
      } catch {
        setCameraError("Akses kamera ditolak.");
        toast.error("Gagal mengakses kamera");
      }
    };

    const timer = setTimeout(() => {
      setCameraError(null);
      setIsCameraReady(false);
      startCamera();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      startedRef.current = false;
      setIsCameraReady(false);
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

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const image = canvas.toDataURL("image/png");
    onCapture(image);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={loading ? undefined : onClose}
      />

      {/* Modal Container */}
      <div className="relative flex w-full max-w-lg flex-col bg-white rounded-[3rem] shadow-[0_0_80px_-20px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              <Camera size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 leading-tight">
                Verifikasi Wajah
              </h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-500/70 mt-0.5">
                Attendance Protocol
              </p>
            </div>
          </div>
          {!loading && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-500 active:scale-90"
            >
              <X size={20} strokeWidth={3} />
            </button>
          )}
        </div>

        {/* Video Area */}
        <div className="px-8 py-4">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-inner ring-1 ring-slate-200">
            
            {cameraError ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center bg-slate-900">
                <AlertCircle size={40} className="text-rose-500" />
                <p className="text-sm font-medium text-slate-300 leading-relaxed">{cameraError}</p>
              </div>
            ) : (
              <>
                {!isCameraReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900 z-20">
                    <RefreshCw size={32} className="animate-spin text-blue-500 opacity-40" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Initialising Sensor...</p>
                  </div>
                )}

                <video 
                  ref={videoRef} 
                  playsInline 
                  muted 
                  className={`h-full w-full object-cover transition-opacity duration-700 ${isCameraReady ? "opacity-100" : "opacity-0"} -scale-x-100`} 
                />

                {/* Focus Mask */}
                {isCameraReady && (
                  <div className="absolute inset-0 pointer-events-none z-10">
                    <div className="absolute inset-0 bg-slate-950/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`relative h-72 w-72 sm:h-80 sm:w-80 rounded-full border-2 border-white/30 shadow-[0_0_0_999px_rgba(15,23,42,${loading ? '0.8' : '0.6'})] overflow-hidden transition-all duration-500`}>
                        {loading && (
                          <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                        )}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent blur-sm animate-scan" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="p-8 pt-4 space-y-4">
          <button
            type="button"
            disabled={loading || !isCameraReady || !!cameraError}
            onClick={handleCapture}
            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-3xl bg-slate-900 py-5 text-sm font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-blue-600 hover:shadow-xl active:scale-[0.98] disabled:opacity-20"
          >
            {loading ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                <span>Processing Identity...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} className="text-blue-400" />
                <span>Verify & Clock Now</span>
              </>
            )}
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(320px); opacity: 0; }
        }
        .animate-scan {
          position: absolute;
          animation: scan 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
