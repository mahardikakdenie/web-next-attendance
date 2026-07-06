"use client";

import { useTodayStatusLogic } from "./hooks/useTodayStatusLogic";
import TodayStatusSkeleton from "./today-status/TodayStatusSkeleton";
import TodayStatusSingle from "./today-status/TodayStatusSingle";
import TodayStatusMultiple from "./today-status/TodayStatusMultiple";
import TodayStatusDurationBar from "./today-status/TodayStatusDurationBar";
import { getBadgeClassName } from "./today-status/statusUtils";

export default function TodayStatusCard() {
  const {
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
  } = useTodayStatusLogic();

  if (isLoading || !mounted || !now) {
    return <TodayStatusSkeleton />;
  }

  return (
    <div className="w-full max-w-sm rounded-3xl border border-neutral-100 bg-white p-6 flex flex-col shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-semibold text-neutral-800 tracking-tight">Today&apos;s Summary</h2>
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider shadow-sm ${getBadgeClassName(displayStatus)}`}>
          <div className="h-1.5 w-1.5 rounded-full bg-current" />
          {displayStatus}
        </div>
      </div>

      {!allowMultipleCheck || sessions.length === 0 ? (
        <TodayStatusSingle clockInTime={clockInTime} clockOutTime={clockOutTime} />
      ) : (
        <TodayStatusMultiple 
          sessions={sessions} 
          expandedSessions={expandedSessions} 
          toggleSession={toggleSession} 
        />
      )}

      <TodayStatusDurationBar 
        isWorking={isWorking} 
        durationText={durationText} 
        clockOutTime={clockOutTime} 
      />
    </div>
  );
}
