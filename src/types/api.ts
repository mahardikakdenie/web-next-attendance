export interface APIResponse<T> {
  data: T;
  meta: MetaResponse;
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

export interface Balance {
  id: string;
  user_id: number;
  balance: number;
  leave_type: {
    name: string;
  }
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

// Users
export interface UserAttendance {
  id: string;
  clock_in_latitude: number;
  clock_in_longitude: number;
  clock_in_media_url: string;
  clock_in_time: string;
  clock_out_latitude: number;
  clock_out_longitude: number;
  clock_out_media_url: string;
  clock_out_time: string;
  status: string;
  user: UserData;
  user_id: number;
  location?: string;
}

export interface UserRecentActivity {
  id: number;
  action: string;
  title: string;
  status: string;
  created_at: string;
}

export interface UserRole {
  id: number;
  name: string;
}

export interface UserTenantNested {
  id: number;
  code: string;
  name: string;
  tenant_settings: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserTenantSettings {
  id: number;
  tenant_id: number;
  office_latitude: number;
  office_longitude: number;
  max_radius_meter: number;
  allow_remote: boolean;
  require_location: boolean;
  clock_in_start_time: string;
  clock_in_end_time: string;
  clock_out_start_time: string;
  clock_out_end_time: string;
  late_after_minute: number;
  require_selfie: boolean;
  allow_multiple_check: boolean;
  created_at: string;
  updated_at: string;
  tenant: UserTenantNested;
}

export interface UserTenant {
  id: number;
  name: string;
  tenant_settings: UserTenantSettings;
}

export interface UserData {
  id: number;
  employee_id: string;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  department: string;
  media_url: string;
  created_at: string;
  tenant_id: number;
  role: UserRole;
  tenant: UserTenant;
  attendances: UserAttendance[];
  recent_activities: UserRecentActivity[];
}

export interface MetaResponse {
  pagination?: {
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
  }
  code: number;
  message: string;
  status: string;
  total?: number;
  current_page?: number;
  last_page?: number;
  per_page?: number;
}

export interface UsersListResponse {
  data: UserData[];
  meta: MetaResponse;
}
