"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";

const TIMEOUT_IN_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_IN_MS = 25 * 60 * 1000; // Warn after 25 minutes

export default function SessionTimeoutWatcher() {
  const { logout, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    
    setShowWarning(false);

    if (isAuthenticated) {
      warningRef.current = setTimeout(() => {
        setShowWarning(true);
        toast.info("Session will expire soon due to inactivity.", {
          duration: 5000,
        });
      }, WARNING_IN_MS);

      timerRef.current = setTimeout(async () => {
        await logout();
        router.push("/login?timeout=1");
        toast.error("Session expired. Please login again.");
      }, TIMEOUT_IN_MS);
    }
  }, [isAuthenticated, logout, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach((event) => window.addEventListener(event, handleActivity));
    
    // Initial setup
    const initialTimer = setTimeout(() => {
      resetTimer();
    }, 0);

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      clearTimeout(initialTimer);
    };
  }, [isAuthenticated, resetTimer]);

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right-10 duration-500">
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-2xl max-w-sm flex items-start gap-4">
        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
          <Clock size={24} />
        </div>
        <div className="space-y-3">
          <div>
            <h4 className="font-black text-neutral-900 tracking-tight">Session Inactivity</h4>
            <p className="text-sm text-neutral-500 leading-relaxed">
              You&apos;ve been inactive for a while. For your security, you&apos;ll be logged out soon.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={resetTimer}
              className="bg-blue-600 text-white px-4 py-2 text-xs rounded-xl"
            >
              Stay Logged In
            </Button>
            <button 
              onClick={async () => {
                await logout();
                router.push("/login");
              }}
              className="flex items-center gap-2 px-4 py-2 text-xs font-black text-neutral-400 hover:text-rose-600 transition-colors"
            >
              <LogOut size={14} />
              <span>Logout Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
