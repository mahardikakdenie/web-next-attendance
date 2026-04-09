"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check - wrapped in timeout to avoid SSR hydration issues and setState in effect warning
    const initialCheck = setTimeout(() => {
      if (!navigator.onLine) setIsOffline(true);
    }, 0);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearTimeout(initialCheck);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] animate-in slide-in-from-top duration-500">
      <div className="bg-rose-600 text-white px-4 py-2 flex items-center justify-center gap-3 shadow-lg">
        <WifiOff size={18} />
        <span className="text-sm font-black uppercase tracking-widest">
          You are currently offline. Some features may be limited.
        </span>
        <button 
          onClick={() => window.location.reload()}
          className="ml-4 flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-all text-[10px] font-black uppercase"
        >
          <RefreshCw size={12} />
          <span>Retry</span>
        </button>
      </div>
    </div>
  );
}
