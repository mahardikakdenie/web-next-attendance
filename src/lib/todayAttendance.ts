import dayjs from "dayjs";
import { UserData, UserAttendance } from "@/types/api";

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

const getTodayRecord = (user?: UserData | null): UserAttendance | null => {
  if (!user?.attendances?.length) return null;

  const today = dayjs().startOf("day");
  const todayRecords = user.attendances.filter((item: UserAttendance) => {
    const date = item.clock_in_time;
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

export const getTodayAttendanceItems = (user?: UserData | null): AttendanceItem[] => {
  if (!user?.attendances?.length) return [];

  const today = dayjs().startOf("day");
  const todayRecords = user.attendances.filter((item: UserAttendance) => {
    return dayjs(item.clock_in_time).isSame(today, "day");
  });

  // Sort by clock_in_time DESC so latest entries are at the top of the list/timeline
  const sortedRecords = [...todayRecords].sort((a, b) => dayjs(b.clock_in_time).valueOf() - dayjs(a.clock_in_time).valueOf());

  const items: AttendanceItem[] = [];
  for (const record of sortedRecords) {
    const outItem = mapClockOut(record);
    if (outItem) items.push(outItem);
    const inItem = mapClockIn(record);
    if (inItem) items.push(inItem);
  }

  return items;
};

export const getTodayAttendanceSummary = (user?: UserData | null): TodayAttendanceSummary => {
  if (!user?.attendances?.length) {
    return {
      items: [],
      clockIn: null,
      clockOut: null,
      workingMinutes: 0,
      badgeLabel: "Pending",
      progressLabel: "Waiting",
    };
  }

  const today = dayjs().startOf("day");
  const todayRecords = user.attendances.filter((item: UserAttendance) => {
    return dayjs(item.clock_in_time).isSame(today, "day");
  });

  const items = getTodayAttendanceItems(user);

  // For quick metrics, find the overall first clock_in and last clock_out (or active)
  const sortedRecordsAsc = [...todayRecords].sort((a, b) => dayjs(a.clock_in_time).valueOf() - dayjs(b.clock_in_time).valueOf());
  const firstRecord = sortedRecordsAsc[0];
  const lastRecord = sortedRecordsAsc[sortedRecordsAsc.length - 1];

  const clockIn = firstRecord ? mapClockIn(firstRecord) : null;
  const clockOut = lastRecord && lastRecord.clock_out_time ? mapClockOut(lastRecord) : null;

  // Calculate total working minutes across all sessions today
  let workingMinutes = 0;
  for (const record of todayRecords) {
    const start = record.clock_in_time ? dayjs(record.clock_in_time) : null;
    const end = record.clock_out_time
      ? dayjs(record.clock_out_time)
      : start
        ? dayjs()
        : null;
    if (start && end && start.isValid() && end.isValid()) {
      workingMinutes += Math.max(end.diff(start, "minute"), 0);
    }
  }

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
