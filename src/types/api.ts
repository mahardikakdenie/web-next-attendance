export interface APIResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Attendance
export interface AttendanceToday {
  clock_in_time?: string;
  clock_out_time?: string;
  status: "On Time" | "Late" | "Absent" | "No Record";
  duration: string;
  date: string;
}

export interface AttendanceHistory {
  id: string;
  date: string;
  clock_in: string;
  clock_out: string;
  status: string;
}

export interface ClockPayload {
  action: "clock_in" | "clock_out";
  latitude: number;
  longitude: number;
  media_url: string;
}

// Leave
export interface LeaveBalance {
  total: number;
  used: number;
  remaining: number;
  type: string;
}

export interface LeaveRequestPayload {
  leave_type_id: number;
  start_date: string;
  end_date: string;
  reason: string;
}

// Overtime
export interface OvertimeRequestPayload {
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
}

// Activity
export interface RecentActivity {
  id: string;
  type: "announcement" | "approval" | "system";
  title: string;
  description: string;
  status?: string;
  created_at: string;
}

export interface QuickInfo {
  pending_leaves: number;
  pending_overtimes: number;
  notifications_count: number;
}
