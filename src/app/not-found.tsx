"use client";

import Link from "next/link";
import { MoveLeft, ShieldAlert, Ghost, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
      
      <div className="relative z-10 w-full max-w-2xl text-center">
        {/* Ghost Icon with floating animation */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] shadow-2xl animate-bounce duration-[3000ms]">
              <Ghost size={80} className="text-indigo-400" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* 404 Header */}
        <div className="space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[11px] font-black tracking-[0.3em] uppercase text-indigo-400">
            <ShieldAlert size={16} />
            Anomaly Detected
          </div>
          <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-200 tracking-tight">
            The coordinate you&apos;re looking for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400 text-italic italic">doesn&apos;t exist</span>.
          </h2>
          <p className="text-slate-400 font-medium max-w-md mx-auto text-sm md:text-base leading-relaxed">
            The intelligence node at this address has been relocated or never existed in this timeline.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/" className="w-full sm:w-auto">
            <Button 
              className="w-full h-16 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <Home size={18} />
              Return to Intelligence
            </Button>
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto h-16 px-8 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 backdrop-blur-xl"
          >
            <MoveLeft size={18} />
            Go Back
          </button>
        </div>

        {/* Decorative elements */}
        <div className="mt-20 flex items-center justify-center gap-8 opacity-20 grayscale">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-white" />
            <div className="text-[10px] font-black tracking-widest text-white uppercase">System Integrity Check</div>
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-white" />
        </div>
      </div>
    </div>
  );
}
