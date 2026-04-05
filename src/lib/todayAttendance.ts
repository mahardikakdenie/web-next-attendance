import dayjs from "dayjs";
import type { User, UserAttendance } from "@/store/auth.store";

export type AttendanceType = "clock_in" | "clock_out" | null;

export type AttendanceItem = {
  type: AttendanceType;
  image: string;
  time: string;
  location: string;
};

export type TodayAttendanceSummary = {
  items: AttendanceItem[];
  clockIn: AttendanceItem | null;
  clockOut: AttendanceItem | null;
  workingMinutes: number;
  badgeLabel: string;
  progressLabel: string;
};

export const EMPTY_IMAGE =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360'%3E%3Crect width='100%25' height='100%25' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2364758b' font-size='24'%3ENo+Image%3C/text%3E%3C/svg%3E";

const formatCoordinate = (value?: number | string) => value ?? "-";

const getTodayRecord = (user?: User | null): UserAttendance | null => {
  if (!user?.attendances?.length) return null;

  const today = dayjs().startOf("day");
  const todayRecords = user.attendances.filter((item) => {
    const date = item.clock_in_time || item.createdAt || item.created_at;
    return dayjs(date).isSame(today, "day");
  });

  return todayRecords.at(-1) ?? null;
};

const mapClockIn = (attendance: UserAttendance): AttendanceItem | null => {
  if (!attendance.clock_in_time) return null;

  return {
    type: "clock_in",
    image: attendance.clock_in_media_url || EMPTY_IMAGE,
    time: dayjs(attendance.clock_in_time).format("HH:mm:ss"),
    location: `${formatCoordinate(attendance.clock_in_latitude)}, ${formatCoordinate(attendance.clock_in_longitude)}`,
  };
};

const mapClockOut = (attendance: UserAttendance): AttendanceItem | null => {
  if (!attendance.clock_out_time) return null;

  return {
    type: "clock_out",
    image: attendance.clock_out_media_url || EMPTY_IMAGE,
    time: dayjs(attendance.clock_out_time).format("HH:mm:ss"),
    location: `${formatCoordinate(attendance.clock_out_latitude)}, ${formatCoordinate(attendance.clock_out_longitude)}`,
  };
};

export const getTodayAttendanceItems = (user?: User | null): AttendanceItem[] => {
  const todayRecord = getTodayRecord(user);
  if (!todayRecord) return [];

  const items = [mapClockIn(todayRecord), mapClockOut(todayRecord)].filter(
    (item): item is AttendanceItem => item !== null
  );

  return items;
};

export const getTodayAttendanceSummary = (user?: User | null): TodayAttendanceSummary => {
  const todayRecord = getTodayRecord(user);
  const clockIn = todayRecord ? mapClockIn(todayRecord) : null;
  const clockOut = todayRecord ? mapClockOut(todayRecord) : null;
  const items = [clockIn, clockOut].filter((item): item is AttendanceItem => item !== null);

  const start = todayRecord?.clock_in_time ? dayjs(todayRecord.clock_in_time) : null;
  const end = todayRecord?.clock_out_time
    ? dayjs(todayRecord.clock_out_time)
    : start
      ? dayjs()
      : null;
  const workingMinutes =
    start && end && start.isValid() && end.isValid() ? Math.max(end.diff(start, "minute"), 0) : 0;

  const badgeLabel = clockOut ? "Completed" : clockIn ? "In Progress" : "Pending";
  const progressLabel = clockOut ? "Finished" : clockIn ? "Active" : "Waiting";

  return {
    items,
    clockIn,
    clockOut,
    workingMinutes,
    badgeLabel,
    progressLabel,
  };
};

export const upsertAttendance = (
  currentAttendance: AttendanceItem[],
  nextAttendance: AttendanceItem
) => {
  const filtered = currentAttendance.filter((item) => item.type !== nextAttendance.type);
  const newList = [...filtered, nextAttendance];
  return newList.sort((left, right) =>
    left.type === right.type ? 0 : left.type === "clock_in" ? -1 : 1
  );
};

export const formatSummaryTime = (time?: string) => {
  if (!time) {
    return { value: "--:--", meridiem: "" };
  }

  const parsedTime = dayjs(`2000-01-01T${time}`);

  if (!parsedTime.isValid()) {
    return { value: "--:--", meridiem: "" };
  }

  return {
    value: parsedTime.format("hh:mm"),
    meridiem: parsedTime.format("A"),
  };
};

export const formatWorkingDuration = (minutes: number) => {
  if (minutes <= 0) return "0m";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;

  return `${hours}h ${remainingMinutes}m`;
};
