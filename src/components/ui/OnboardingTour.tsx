"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useOnboardingStore } from "@/store/onboarding.store";
import { useAuthStore } from "@/store/auth.store";
import { ChevronRight, ChevronLeft, Wand2 } from "lucide-react";
import dayjs from "dayjs";
import { usePathname } from "next/navigation";

export default function OnboardingTour() {
  const { user } = useAuthStore();
  const pathname = usePathname();
  const { 
    isActive, 
    currentStep, 
    steps, 
    isDismissed, 
    startTour, 
    nextStep, 
    prevStep, 
    dismissTour 
  } = useOnboardingStore();

  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [cardPos, setCardPos] = useState({ top: 0, left: 0 });
  const [isLocked, setIsLocked] = useState(false);
  const tourRef = useRef<HTMLDivElement>(null);

  // 1. Auto-start logic
  useEffect(() => {
    const isHomePage = pathname === "/";
    if (user && !isDismissed && !isActive && isHomePage) {
      const daysSinceCreated = dayjs().diff(dayjs(user.created_at), 'day');
      if (daysSinceCreated < 3) {
        const timer = setTimeout(startTour, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [user, isDismissed, isActive, startTour, pathname]);

  // 2. "PATEN" Position Calculation - RUNS ONLY ONCE PER STEP
  const capturePosition = useCallback(() => {
    const step = steps[currentStep];
    const element = document.getElementById(step.targetId);
    
    if (element) {
      // Element found, proceed with scroll and capture
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      setTimeout(() => {
        const rect = element.getBoundingClientRect();
        if (rect.width > 0) {
          setCoords({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          });

          const vh = window.innerHeight;
          const vw = window.innerWidth;
          const cardW = 340;
          const cardH = 220; 
          
          let t = 0;
          let l = 0;

          if (rect.top + rect.height + cardH + 40 < vh) {
            t = rect.top + rect.height + 24;
          } else if (rect.top > cardH + 40) {
            t = rect.top - cardH - 24;
          } else {
            t = (vh / 2) - (cardH / 2);
          }

          l = rect.left + (rect.width / 2) - (cardW / 2);
          l = Math.max(16, Math.min(l, vw - cardW - 16));

          setCardPos({ top: t, left: l });
          setIsLocked(true);
        }
      }, 700);
    } else {
      // SAFETY: Element not found on this page
      console.warn(`Tour target #${step.targetId} not found.`);
      // Jika elemen tidak ada, otomatis lanjut ke step berikutnya (jika masih ada)
      if (currentStep < steps.length - 1) {
        nextStep();
      } else {
        dismissTour();
      }
    }
  }, [currentStep, steps, nextStep, dismissTour]);

  useEffect(() => {
    if (!isActive) {
      const timer = setTimeout(() => {
        setIsLocked(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setIsLocked(false);
      capturePosition();
    }, 0);
    return () => clearTimeout(timer);
  }, [isActive, capturePosition]);

  if (!isActive || !isLocked) return null;

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[10001] pointer-events-none">
      {/* 
          OVERLAY - ABSOLUTELY FIXED
          clipPath menggunakan koordinat snapshot yang tidak pernah berubah saat scroll.
      */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-[1.5px] pointer-events-auto transition-opacity duration-500"
        style={{
          boxShadow: `0 0 0 9999px rgba(2, 6, 23, 0.5)`,
          clipPath: `inset(${coords.top - 12}px ${window.innerWidth - (coords.left + coords.width + 12)}px ${window.innerHeight - (coords.top + coords.height + 12)}px ${coords.left - 12}px round 32px)`,
        }}
        onClick={(e) => e.stopPropagation()}
      />

      {/* 
          HALO - ABSOLUTELY FIXED
      */}
      <div 
        className="fixed rounded-[32px] border-2 border-blue-400/50 shadow-[0_0_40px_rgba(59,130,246,0.6)] animate-pulse"
        style={{
          top: coords.top - 12,
          left: coords.left - 12,
          width: coords.width + 24,
          height: coords.height + 24,
        }}
      />

      {/* 
          MODAL CARD - ABSOLUTELY FIXED
      */}
      <div 
        ref={tourRef}
        className="fixed z-20 w-[90vw] max-w-[340px] bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_25px_70px_rgba(0,0,0,0.4)] border border-white p-8 pointer-events-auto animate-in fade-in zoom-in-95 duration-500"
        style={{
          top: cardPos.top,
          left: cardPos.left,
        }}
      >
        <div className="absolute -top-6 left-8 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/40 ring-4 ring-white">
          <Wand2 size={20} />
        </div>

        <div className="mt-4 space-y-3 mb-8">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none">
              {currentStepData.title}
            </h4>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase">
              {currentStep + 1} / {steps.length}
            </span>
          </div>
          <p className="text-[13px] font-medium text-slate-600 leading-relaxed italic">
            &ldquo;{currentStepData.content}&rdquo;
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-500 ${i === currentStep ? 'w-8 bg-blue-600' : 'w-1.5 bg-slate-200'}`} 
              />
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <button 
                onClick={prevStep}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 rounded-xl"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <button 
              onClick={nextStep}
              className="flex items-center gap-2 bg-slate-900 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-900/10"
            >
              <span>{currentStep === steps.length - 1 ? "Start Now" : "Next"}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <button 
          onClick={dismissTour}
          className="mt-8 w-full py-4 text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest border-t border-slate-100/50 pt-4 transition-all hover:tracking-[0.2em]"
        >
          Got it, dismiss tutorial
        </button>
      </div>
    </div>
  );
}
