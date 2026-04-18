"use client";

import { useState, useEffect } from "react";
import { Camera, RefreshCw, Loader2, User } from "lucide-react";
import Image from "next/image";
import Card from "@/components/ui/Card";
import CameraModal from "@/components/attendance/CameraModal";
import { toast } from "sonner";

import { uploadMedia } from "@/service/media";
import { uploadPhotos } from "@/service/auth.service";
import { getProfileImage } from "@/lib/utils";
import { 
  analyzeFace, 
  loadFaceModels, 
  getFaceAnalysisErrorMessage 
} from "@/lib/faceRecognition";
import { useAuthStore } from "@/store/auth.store";

interface ProfileImageUpdateProps {
  currentImage?: string | null;
}

export default function ProfileImageUpdate({ currentImage }: ProfileImageUpdateProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    loadFaceModels().catch((err) => {
      console.error("Failed to load face models:", err);
    });
  }, []);

  const handleCapture = async (image: string) => {
    setIsValidating(true);
    try {
      // Create HTMLImageElement to analyze
      const img = new (window.Image)();
      img.src = image;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const result = await analyzeFace(img);
      
      if (!result.ok) {
        toast.error(getFaceAnalysisErrorMessage(result.error));
        return;
      }

      setPreviewImage(image);
      toast.success("Wajah terdeteksi! Foto siap diunggah.");
    } catch (error) {
      console.error("Face analysis error:", error);
      toast.error("Gagal menganalisis wajah. Silakan coba lagi.");
    } finally {
      setIsValidating(false);
    }
  };

  const base64ToFile = (base64: string, filename: string) => {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleUpload = async () => {
    if (!previewImage) return;
    
    setIsUploading(true);
    try {
      const file = base64ToFile(previewImage, `profile-${Date.now()}.png`);
      const uploadedUrl = await uploadMedia(file);
      
      // Update profile photo in backend
      await uploadPhotos({ media_url: uploadedUrl });
      
      toast.success("Foto profil berhasil diperbarui!");
      setPreviewImage(null);
      
      // Refresh user data to update the UI everywhere
      await fetchUser(); 
    } catch (error) {
      console.error(error);
      toast.error("Gagal memperbarui foto profil");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-8! overflow-hidden relative">
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-blue-50/50 blur-3xl" />
      
      <div className="relative flex flex-col items-center md:flex-row md:items-start gap-8">
        {/* Image Preview Area */}
        <div className="relative group">
          <div className="h-40 w-40 overflow-hidden rounded-[2.5rem] border-4 border-white bg-neutral-100 shadow-2xl shadow-blue-500/10 ring-1 ring-neutral-200 flex items-center justify-center">
            {previewImage || getProfileImage(currentImage) ? (
              <Image
                src={previewImage || getProfileImage(currentImage)!}
                alt="Profile"
                width={160}
                height={160}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <User size={64} className="text-slate-300" />
            )}
            {(isUploading || isValidating) && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                <RefreshCw size={32} className="animate-spin text-blue-600" />
              </div>
            )}
          </div>
          
          <button
            onClick={() => setIsCameraOpen(true)}
            className="absolute -bottom-2 -right-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-xl transition-all hover:bg-blue-600 hover:scale-110 active:scale-95"
          >
            <Camera size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Text and Actions */}
        <div className="flex flex-1 flex-col justify-center gap-4 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              <h2 className="text-xl font-black tracking-tight text-neutral-900">
                Profile Verification Selfie
              </h2>
            </div>
            <p className="text-sm font-medium text-neutral-400 max-w-sm">
              Your profile photo is used for AI face recognition during attendance. 
              Please provide a clear selfie.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            {!previewImage ? (
              <button
                disabled={isValidating}
                onClick={() => setIsCameraOpen(true)}
                className="rounded-2xl bg-neutral-50 border border-neutral-200 px-6 py-3 text-sm font-bold text-neutral-900 transition-all hover:bg-white hover:shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {isValidating && <Loader2 size={16} className="animate-spin" />}
                {isValidating ? "Validating Face..." : "Take New Selfie"}
              </button>
            ) : (
              <>
                <button
                  disabled={isUploading || isValidating}
                  onClick={handleUpload}
                  className="rounded-2xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isUploading && <Loader2 size={16} className="animate-spin" />}
                  {isUploading ? "Uploading..." : "Save Changes"}
                </button>
                <button
                  disabled={isUploading || isValidating}
                  onClick={() => setPreviewImage(null)}
                  className="rounded-2xl bg-neutral-100 px-6 py-3 text-sm font-bold text-neutral-600 transition-all hover:bg-neutral-200 active:scale-95"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <CameraModal
        open={isCameraOpen}
        loading={isValidating}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapture}
      />
    </Card>
  );
}
