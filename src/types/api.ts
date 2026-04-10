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

export interface TenantApiData {
  id: number;
  tenant_id: number;
  office_latitude: number;
  office_longitude: number;
  max_radius_meter: number;
  allow_remote: boolean;
  require_location: boolean;
  clock_in_start_time: string;
  clock_in_end_time: string;
  late_after_minute: number;
  clock_out_start_time: string;
  clock_out_end_time: string;
  require_selfie: boolean;
  allow_multiple_check: boolean;
  created_at: string;
  updated_at: string;
  tenant?: {
    ID: number;
    Name: string;
    Code: string;
    CreatedAt: string;
    UpdatedAt: string;
  };
}

export interface UpdateTenantSettingPayload {
  allow_multiple_check: boolean;
  allow_remote: boolean;
  clock_in_end_time: string;
  clock_in_start_time: string;
  clock_out_end_time: string;
  clock_out_start_time: string;
  created_at: string;
  id: number;
  late_after_minute: number;
  max_radius_meter: number;
  office_latitude: number;
  office_longitude: number;
  require_location: boolean;
  require_selfie: boolean;
  tenant_id: number;
  updated_at: string;
}
