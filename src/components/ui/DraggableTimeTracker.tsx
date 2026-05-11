"use client";

import React, { useState, useEffect, useRef } from "react";
import { Square, Loader2, Clock, Play } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import { createTimesheetEntry } from "@/service/timesheet";

export default function DraggableTimeTracker() {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Relative position
  const [isDragging, setIsDragging] = useState(false);
  const trackerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial check for active timer
    const startTime = localStorage.getItem("timesheet_start_time");
    if (startTime) {
      setIsActive(true);
      setSeconds(Math.floor((Date.now() - parseInt(startTime)) / 1000));
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const handleStop = async () => {
    setLoading(true);
    const durationHours = Math.max(0.1, parseFloat((seconds / 3600).toFixed(2)));
    try {
      await createTimesheetEntry({
        project_id: Number(localStorage.getItem("active_project_id") || 0),
        task_name: localStorage.getItem("active_task_name") || "Auto-logged",
        description: `Tracked via global timer: ${formatTime(seconds)}`,
        duration_hours: durationHours,
        date: dayjs().toISOString(),
      });
      localStorage.removeItem("timesheet_start_time");
      localStorage.removeItem("active_project_id");
      localStorage.removeItem("active_task_name");
      setIsActive(false);
      setSeconds(0);
      toast.success("Time tracked successfully!");
    } catch {
      toast.error("Failed to stop tracker");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
  };

  // Draggable logic (basic implementation)
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    // Logic for dragging
  };

  if (!isActive) return null;

  return (
    <div
      ref={trackerRef}
      className="fixed bottom-6 right-6 z-[9999] cursor-move bg-slate-950 text-white rounded-[2rem] p-4 shadow-2xl flex items-center gap-4 border border-white/10 select-none"
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      onMouseDown={onMouseDown}
    >
      <div className="bg-blue-600 rounded-xl p-2 animate-pulse">
        <Clock size={16} />
      </div>
      <div className="font-mono text-lg font-black tracking-tighter">
        {formatTime(seconds)}
      </div>
      <button
        onClick={handleStop}
        disabled={loading}
        className="bg-white/10 hover:bg-rose-600 p-2 rounded-xl transition-all"
      >
        {loading ? <Loader2 className="animate-spin" size={16} /> : <Square size={16} fill="currentColor" />}
      </button>
    </div>
  );
}
