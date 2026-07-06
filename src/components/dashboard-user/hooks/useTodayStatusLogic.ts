import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { getTodayAttendance } from "@/service/attendance";
import { getTodayAttendanceSummary } from "@/lib/todayAttendance";
import { useAuthStore } from "@/store/auth.store";

export function useTodayStatusLogic() {
  const [now, setNow] = useState<dayjs.Dayjs | null>(null);
  const [mounted, setMounted] = useState(false);
  const [expandedSessions, setExpandedSessions] = useState<number[]>([]);
  
  const { user } = useAuthStore();
  const allowMultipleCheck = user?.tenant_setting?.allow_multiple_check || false;

  const { data: responseData, isLoading } = useQuery({
    queryKey: ['today-attendance'],
    queryFn: async () => {
      const res = await getTodayAttendance();
      return res.data;
    },
    refetchInterval: 60000,
  });

  const data = responseData;
  const summary = getTodayAttendanceSummary(user);

  let baseSessions: any[] = [];
  if (allowMultipleCheck && summary.items.length > 0) {
    const ascItems = [...summary.items].reverse();
    let currentSession: any = { clock_in_time: null, clock_out_time: null, status: "completed" };
    
    ascItems.forEach((item) => {
      if (item.type === 'clock_in') {
        if (currentSession.clock_in_time !== null) {
          baseSessions.push({ ...currentSession });
          currentSession = { clock_in_time: null, clock_out_time: null, status: "completed" };
        }
        currentSession.clock_in_time = item.time;
      } else if (item.type === 'clock_out') {
        currentSession.clock_out_time = item.time;
        baseSessions.push({ ...currentSession });
        currentSession = { clock_in_time: null, clock_out_time: null, status: "completed" };
      }
    });
    
    if (currentSession.clock_in_time !== null) {
      baseSessions.push(currentSession);
    }
  }

  const apiSessions = allowMultipleCheck && Array.isArray((data as any)?.sessions) ? (data as any).sessions : [];

  let sessions = [...baseSessions];
  
  if (apiSessions.length > 0) {
     if (apiSessions.length >= baseSessions.length) {
         sessions = apiSessions;
     } else {
         const startIdx = baseSessions.length - apiSessions.length;
         for (let i = 0; i < apiSessions.length; i++) {
             if (sessions[startIdx + i]) {
                 sessions[startIdx + i] = { ...sessions[startIdx + i], ...apiSessions[i] };
             }
         }
     }
  } else if (sessions.length === 0 && apiSessions.length > 0) {
     sessions = apiSessions;
  }

  useEffect(() => {
    setMounted(true);
    setNow(dayjs());
    
    const timer = setInterval(() => {
      setNow(dayjs());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (sessions.length > 0 && expandedSessions.length === 0) {
      setExpandedSessions([sessions.length - 1]);
    }
  }, [sessions.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSession = (index: number) => {
    setExpandedSessions(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const calculateDuration = () => {
    return data?.duration;
  };

  const clockInTime = data?.clock_in_time || (data as any)?.clock_in || (data as any)?.clockInTime;
  const clockOutTime = data?.clock_out_time || (data as any)?.clock_out || (data as any)?.clockOutTime;

  const durationText = calculateDuration();
  const isWorking = clockInTime && !clockOutTime;

  let overallStatus = "Belum bekerja";
  
  if (allowMultipleCheck) {
    if (sessions.length === 0) {
      overallStatus = "Belum bekerja";
    } else {
      const allDone = sessions.every((s: any) => s.clock_out_time);
      const isLocked = data?.status?.toLowerCase() === "done" || data?.status?.toLowerCase() === "completed";
      
      if (isLocked) {
        overallStatus = "Selesai";
      } else if (allDone) {
        overallStatus = "Selesai";
      } else {
        const currentActiveSession = sessions.find((s: any) => !s.clock_out_time);
        overallStatus = currentActiveSession?.status || "Sedang Bekerja";
      }
    }
  } else {
    if (!clockInTime) overallStatus = "Belum bekerja";
    else if (clockInTime && !clockOutTime) overallStatus = data?.status || "Sedang Bekerja";
    else overallStatus = "Selesai";
  }

  const displayStatus = overallStatus;

  return {
    now,
    mounted,
    isLoading,
    allowMultipleCheck,
    sessions,
    expandedSessions,
    toggleSession,
    clockInTime,
    clockOutTime,
    durationText,
    isWorking,
    displayStatus,
  };
}
