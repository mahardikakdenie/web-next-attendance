# 🚀 [BACKEND-TASK] Advanced HR Operations (Shifts, Calendar & Lifecycle)

## 📝 1. Overview
Implement the core infrastructure for enterprise-grade workforce management. This module allows HR to move beyond fixed office hours into dynamic shift rostering, recognize national holidays, and track employee onboarding/offboarding progress.

---

## 🛠️ 2. API Contract Specification

### 📅 A. Shift Management
Manage master data for available work shifts within a company.

- **GET** `/api/v1/hr/shifts` -> List available shifts.
- **POST** `/api/v1/hr/shifts` -> Create a new shift template.
- **Payload Structure**:
```json
{
  "name": "Morning Shift",
  "startTime": "06:00",
  "endTime": "14:00",
  "type": "Morning",
  "color": "bg-emerald-500",
  "isDefault": false
}
```

### 🗓️ B. Weekly Rostering
Assign shifts to specific employees for a designated week.

- **GET** `/api/v1/hr/roster?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`
- **POST** `/api/v1/hr/roster/save` -> Bulk update assignments.
- **Technical Note**: If a user has no shift assigned for a day, the value should be `"off"`.

### 🏖️ C. Holiday & Event Calendar
- **GET** `/api/v1/hr/calendar?year=2026`
- **POST** `/api/v1/hr/calendar`
- **Logic**: Attendance engine **MUST** bypass "Absent" triggers for dates registered in this calendar.

### 🔄 D. Employee Lifecycle
- **GET** `/api/v1/hr/employees/{id}/lifecycle` -> Get checklist tasks.
- **PATCH** `/api/v1/hr/employees/{id}/lifecycle/tasks/{task_id}` -> Toggle completion.

---

## 🏗️ 3. Implementation Status (Frontend)
- [x] Create Advanced Roster UI (`/schedules`).
- [x] Implement API Service Layer for Shifts & Roster.
- [x] Setup Week-to-Week navigation logic.
- [x] Integrate Dynamic Tenant Branding (Logo).
- [ ] Backend database implementation.
- [ ] National holidays attendance bypass logic.

---
**Status**: 🎨 UI & API CONTRACT READY | 🔄 AWAITING BACKEND
**Priority**: 🔥 HIGH-PRIORITY
**Target**: Backend Engineering Team
