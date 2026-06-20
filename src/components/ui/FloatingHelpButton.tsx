"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { useOnboardingStore } from "@/store/onboarding.store";

const START_TOUR_FLAG = "floatingHelp_startTour";

export default function FloatingHelpButton() {
  const pathname = usePathname();
  const router = useRouter();
  const { isActive, resetTour } = useOnboardingStore();
  const [isHovered, setIsHovered] = useState(false);

  // Ketika navigasi ke "/" selesai, deteksi flag & mulai tour
  useEffect(() => {
    if (pathname !== "/") return;
    if (sessionStorage.getItem(START_TOUR_FLAG) !== "true") return;

    sessionStorage.removeItem(START_TOUR_FLAG);

    // Tunggu sebentar hingga DOM selesai re-render
    const timer = setTimeout(() => resetTour(), 300);
    return () => clearTimeout(timer);
  }, [pathname, resetTour]);

  if (isActive) return null;

  const handleStartTutorial = () => {
    setIsHovered(false);

    if (pathname !== "/") {
      // Redirect dulu ke "/", flag disimpan di sessionStorage
      sessionStorage.setItem(START_TOUR_FLAG, "true");
      router.push("/");
      return;
    }

    // Sudah di "/", langsung mulai
    resetTour();
  };

  return (
    <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end gap-3 group">
      <div
        className={`
        px-4 py-2 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl
        transition-all duration-300 origin-right
        ${isHovered ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-75 translate-x-4 pointer-events-none"}
      `}
      >
        {pathname === "/" ? "Mulai Tutorial" : "Ke Dashboard lalu Tutorial"}
      </div>

      <button
        onClick={handleStartTutorial}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Buka tutorial"
        className="
          w-14 h-14 rounded-[22px] bg-white border border-slate-200 shadow-[0_15px_40px_rgba(0,0,0,0.12)]
          flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100
          transition-all duration-500 hover:rotate-[360deg] active:scale-90 relative overflow-hidden
        "
      >
        <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" />
        <HelpCircle size={24} className="relative z-10" />

        <div className="absolute -top-1 -right-1">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        </div>
      </button>
    </div>
  );
}
