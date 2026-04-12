/**
 * BASE API TYPES
 */

export interface MetaResponse {
  message: string;
  code: number;
  status: string;
  pagination?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
  // Legacy fields for backward compatibility if needed
  total?: number;
  current_page?: number;
  last_page?: number;
  per_page?: number;
}

export interface APIResponse<T> {
  success: boolean;
  meta: MetaResponse;
  data: T;
}

/**
 * RBAC 2.0 TYPES
 */

export interface Permission {
  id: string; // e.g., "attendance.view"
  module: string;
  action: string;
}

export interface Role {
  id: number;
  tenant_id: number | null; // NULL for System Roles, ID for Custom Tenant Roles
  name: 'superadmin' | 'admin' | 'hr' | 'finance' | 'employee' | string;
  description: string;
  base_role: 'ADMIN' | 'HR' | 'FINANCE' | 'EMPLOYEE';
  is_system: boolean;
  permissions?: Permission[];
}

/**
 * USER DATA
 */

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
  tenant_logo?: string;
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
  tenant?: UserTenantNested;
}

export interface UserTenant {
  id: number;
  name: string;
  tenant_settings: UserTenantSettings;
}

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
  user?: UserData;
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
  base_role?: 'SUPERADMIN' | 'ADMIN' | 'HR' | 'FINANCE' | 'EMPLOYEE';
  role?: Role;
  permissions?: string[]; // Array of strings from BE for easy UI toggling
  is_owner: boolean;
  base_salary: number;
  manager_id?: number;
  delegate_id?: number;
  tenant?: UserTenant;
  tenant_setting?: UserTenantSettings;
  attendances?: UserAttendance[];
  recent_activities?: UserRecentActivity[];
}

export interface UsersListResponse {
  data: UserData[];
  meta: MetaResponse;
}

/**
 * ATTENDANCE
 */

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

/**
 * LEAVE
 */

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

/**
 * OVERTIME
 */

export interface OvertimeRequestPayload {
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
}

/**
 * ACTIVITY & DASHBOARD
 */

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
  tenant_logo?: string;
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

/**
 * DASHBOARD & HEATMAP TYPES
 */

export interface MappedUser {
  id: number;
  name: string;
  avatar: string;
  department?: string;
  score?: number;
  request_count?: number;
  total_days?: number;
  note?: string; // e.g., "Annual Leave" in heatmap
}

export interface LeaveTrendSeries {
  name: string;
  data: number[];
}

export interface HrDashboardPerformanceMatrix {
  id: number;
  name: string;
  avatar: string;
  department: string;
  score: number;
  total_late: number;
  avg_clock_in: string;
  status: string;
  overtime_hours: number;
  leave_balance: number;
}

export interface HrDashboardData {
  stats: {
    presence_rate: number;
    avg_overtime: number;
    pending_leave: number;
    at_risk_staff: number;
    at_risk_users: MappedUser[];
  };
  top_performers: HrDashboardPerformanceMatrix[];
  need_attention: HrDashboardPerformanceMatrix[];
  performance_matrix: HrDashboardPerformanceMatrix[];
  leave_distribution: {
    label: string;
    value: number;
    users: MappedUser[];
  }[];
  leave_trends: LeaveTrendSeries[];
}

export interface HeatmapItem {
  day: string;
  time: string;
  value: number; // 0-100
  users: MappedUser[];
}

export interface HeatmapQueryParams {
  type: string;
  user_id?: number;
  date_from?: string;
  date_to?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  employee_id: string;
  department: string;
  phone_number: string;
  address: string;
  base_salary: number;
  role_id: number;
  password?: string;
}

export interface AttendanceSummary {
  total_record: number;
  total_record_diff: number;
  ontime_summary: number;
  ontime_summary_diff: number;
  late_summary: number;
  late_summary_diff: number;
}

export interface AttendanceFilterParams {
  status: string;
  date_from: string;
  date_to: string;
  search?: string;
}
