# 🚀 [FRONTEND-TASK] Advanced HR Ops, Dynamic Attendance & Tenant Branding

## 📝 1. Overview
Integrate advanced workforce management modules and implement dynamic tenant branding. This update makes the attendance system shift-aware and allows each tenant to have their own corporate identity.

---

## 🛠️ 2. Integration Modules

### 🏗️ A. Advanced HR (Shift & Roster)
- [x] **Shift Management**: `GET /api/v1/hr/shifts` integrated.
- [x] **Weekly Roster**: `GET /api/v1/hr/roster` integrated with week-to-week navigation.
- [x] **Roster Persistence**: `POST /api/v1/hr/roster/save` connected to "Save Roster" button.

### ⚙️ B. Shift-Aware Attendance
- [x] **Dynamic Status**: Lateness calculation now depends on assigned Shift start time (BE side).
- [x] **Off-Day Banner**: `ClockCard` detects "off" status from roster and shows a warning banner.
- [x] **Holiday Awareness**: Backend blockers for holidays now show user-friendly toasts in `ClockCard`.

### 🎨 C. Tenant Branding & UI Identity
- [x] **Dynamic Logo**: Sidebar & TopNavbar multi-tenant switcher load `tenant_logo` from profile.
- [x] **Company Name**: Sidebar displays the actual tenant name instead of "Attendance".
- [x] **Settings UI**: Added logo URL input in **System Settings** form.

---

## 🏗️ 3. Implementation Status
- [x] Create `src/service/schedules.ts` for Shifts & Roster APIs.
- [x] Create `src/service/calendar.ts` for Holiday APIs.
- [x] Update `src/views/schedules/Index.tsx` to use live API data.
- [x] Enhance `ClockCard.tsx` with error interceptors and Roster checking.
- [x] Standardize UI components (Button variants) for consistent branding.

---
**Status**: ✅ FRONTEND INTEGRATION COMPLETE
**Target**: Production-Ready SaaS UI
