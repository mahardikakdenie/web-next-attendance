# Backend Task: Advanced HR Operations (Shifts, Calendar & Lifecycle)

## 📝 Overview
To support enterprise-grade workforce management, the backend needs to implement three core operational modules: Shift Management, Public Holidays, and Employee Checklists.

---

## 🛠️ API Requirements

### 1. Shift & Schedule Management
- **Table**: `work_schedules` & `shift_assignments`
- **GET** `/api/v1/hr/schedules`: List all shift templates.
- **POST** `/api/v1/hr/schedules/assign`: Assign a shift to a specific user or department for a date range.
- **Logic**: Attendance calculation must compare `clock_in_time` against the assigned shift's `start_time` instead of the global tenant setting.

### 2. Company & Holiday Calendar
- **Table**: `company_holidays`
- **GET** `/api/v1/hr/calendar`: List all marked holidays.
- **POST** `/api/v1/hr/calendar`: Mark a date as a public holiday or company event.
- **Logic**: Attendance engine should skip "Absent" marking for users on these dates.

### 3. Employee Lifecycle (Onboarding/Offboarding)
- **Table**: `lifecycle_tasks`
- **GET** `/api/v1/hr/employees/{id}/lifecycle`: Get checklist status for an employee.
- **PATCH** `/api/v1/hr/employees/{id}/lifecycle/{task_id}`: Toggle task completion.

---

## 🚀 Key Integrations in Frontend
UI placeholders have been added to the Sidebar:
- `/schedules` -> Work Schedules UI
- `/tenant-settings/calendar` -> Holiday Management
- `/tenant-settings/lifecycle` -> Onboarding/Offboarding UI

---
**Status**: 🎨 UI Menu Integrated | 🔄 Awaiting API Endpoints
