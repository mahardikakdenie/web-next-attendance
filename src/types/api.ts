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
  base_role: 'SUPERADMIN' | 'ADMIN' | 'HR' | 'FINANCE' | 'EMPLOYEE';
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
  ptkp_status: string;
  expense_quota: number;
  shift?: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    type: string;
    color: string;
    isDefault: boolean;
  };
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
  status: "On Time" | "Late" | "Absent" | "No Record" | "On Leave";
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

export interface AttendanceRecord {
  id: string;
  user_id: number;
  clock_in_time: string;
  clock_out_time: string;
  clock_in_latitude: number;
  clock_in_longitude: number;
  clock_in_media_url: string;
  status: string;
  created_at: string;
  user: UserData,
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
  delegate_id: number | undefined;
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

export interface OwnerStats {
  id: number;
  name: string;
  email: string;
  tenant_id: number;
  tenant_name: string;
  tenant_code: string;
  employee_count: number;
  attendance_count: number;
  leave_count: number;
  overtime_count: number;
  payroll_count: number;
  expense_count: number;
  created_at: string;
}

export interface OwnerStatsResponse {
  items: OwnerStats[];
  total: number;
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

/**
 * PAYROLL
 */

export interface PayrollCalculatePayload {
  basicSalary: number;
  fixedAllowances: number;
  dailyMealAllowance: number;
  dailyTransportAllowance: number;
  attendanceDays: number;
  workingDaysInMonth: number;
  overtimeHours: number;
  unpaidLeaveDays: number;
  ptkpStatus: string;
}

export interface PayrollCalculationResult {
  grossIncome: number;
  pph21Amount: number;
  netSalary: number;
  totalDeductions: number;
  totalCompanyCost: number;
  breakdown: {
    proratedBasic: number;
    fixedAllowances: number;
    variableAllowances: number;
    unpaidLeaveDeduction: number;
    overtimePay: number;
    grossIncome: number;
    pph21Amount: number;
    terRate: number;
    bpjs: {
      health: { employee: number; company: number };
      jht: { employee: number; company: number };
      jp: { employee: number; company: number };
      jkk: number;
      jkm: number;
    };
  };
}

export interface PayrollSummaryStats {
  total_net_payout: number;
  total_tax_liability: number;
  total_bpjs_provision: number;
  attendance_sync_rate: number;
  payout_diff_percentage: number;
}

export interface CompanyContext {
  name: string;
  logo_url: string;
  address: string;
}

export interface PayrollUser {
  full_name: string;
  employee_id: string;
  position: string;
  department: string;
  ptkp_status: string;
  bank_name: string;
  bank_account_number: string;
}

export interface PayrollEarnings {
  basic_salary: number;
  fixed_allowances: number;
  variable_allowances: number;
  overtime_pay: number;
  incentives: number;
  bonus: number;
  gross_income: number;
}

export interface PayrollDeductions {
  pph21_amount: number;
  unpaid_leave_deduction: number;
  bpjs_health_employee: number;
  bpjs_jht_employee: number;
  bpjs_jp_employee: number;
  total_deductions: number;
}

export interface EmployerContributions {
  bpjs_health_company: number;
  bpjs_jht_company: number;
  bpjs_jp_company: number;
  bpjs_jkk: number;
  bpjs_jkm: number;
  total_employer_cost: number;
}

export interface PayrollBreakdown {
  earnings: PayrollEarnings;
  deductions: PayrollDeductions;
  employer_contributions: EmployerContributions;
}

export interface PayrollRecord {
  id: number;
  company_context: CompanyContext;
  user: PayrollUser;
  breakdown: PayrollBreakdown;
  net_salary: number;
  period_text: string;
  attendance_days: string;
  working_days: string;
  unpaid_leave_days: number;
  status: 'Draft' | 'Published' | string;
}

export interface EmployeeBaseline {
  user_id: number;
  employee_name: string;
  department: string;
  ptkp_status: string;
  basic_salary: number;
  fixed_allowances: number;
}

export interface AttendanceSyncData {
  period: string;
  working_days_in_month: number;
  attendance_days: number;
  unpaid_leave_days: number;
  overtime_hours: number;
}

export interface SavePayrollPayload {
  period: string;
  basic_salary: number;
  fixed_allowances: number;
  daily_meal_allowance: number;
  daily_transport_allowance: number;
  attendance_days: number;
  working_days_in_month: number;
  overtime_hours: number;
  unpaid_leave_days: number;
  ptkp_status: string;
  status: 'Draft' | 'Published';
}

/**
 * ATTENDANCE CORRECTION
 */

export interface AttendanceCorrectionPayload {
  attendance_id?: string;
  date: string;
  clock_in_time: string;
  clock_out_time: string;
  reason: string;
}

export interface AttendanceCorrectionData {
  id: string;
  attendance_id?: string;
  user_id: number;
  date: string;
  clock_in_time: string;
  clock_out_time: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  admin_notes?: string;
  user?: UserData;
  created_at: string;
  updated_at: string;
}

export interface ApprovalPayload {
  admin_notes: string;
}

/**
 * PERFORMANCE MANAGEMENT
 */

export type GoalType = 'KPI' | 'OKR';
export type GoalStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface PerformanceGoal {
  id: number;
  user_id: number;
  title: string;
  description: string;
  type: GoalType;
  target_value: number;
  current_progress: number;
  unit: string; // e.g., "%", "IDR", "Tasks"
  start_date: string;
  end_date: string;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export interface PerformanceCycle {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
}

export interface Appraisal {
  id: number;
  cycle_id: number;
  user_id: number;
  self_score: number;
  manager_score: number;
  final_score: number;
  final_rating: string;
  status: 'PENDING' | 'SELF_REVIEW' | 'MANAGER_REVIEW' | 'COMPLETED';
  comments: string;
}

export interface CustomApiError extends Error {
  response?: {
    data?: {
      meta?: {
        message?: string;
      };
    };
  };
}
