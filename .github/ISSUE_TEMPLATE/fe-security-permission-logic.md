# 🛡️ [FRONTEND-TASK] Security, Permissions & Hierarchical Scoping

## 📝 1. Overview
Integrate the Hybrid PBAC (Permission-Based Access Control) system. The UI must adapt dynamically based on the user's explicit permission array instead of relying on hardcoded role names.

---

## 🛠️ 2. Integration Modules

### 🔑 A. Global Identity Hook
Implement a centralized way to check permissions across any functional component.

- **Component**: `src/components/auth/PermissionGuard.tsx`
- **Hook**: `usePermission(id: string): boolean`
- [x] Hook implemented.
- [x] source of truth: `user.permissions` from `/v1/users/me`.

### 🛡️ B. PBAC UI Guard (The `Can` Component)
Wrap sensitive UI elements (Buttons, Menus) to prevent unauthorized rendering.

- [x] `Can` component created.
- [x] Integration in `Sidebar.tsx`.
- [x] Integration in `AttendancesView` (Export/Schedule protection).
- [x] Integration in `EmployeesView` (Add Employee protection).

### ⚙️ C. Dynamic Configuration (Tenant Settings)
Drive application behavior using the flattened `tenant_setting` object.

- [x] **Geofencing**: Client-side pre-check using `max_radius_meter` in `ClockCard`.
- [x] **Branding**: Dynamic company logo in Sidebar and Multi-tenant switcher.
- [x] **Selfie Check**: Toggle Face Recognition based on `require_selfie`.

---

## 🏗️ 3. Implementation Status
- [x] Refactor `UserData` types to include `base_role` and `tenant_setting`.
- [x] Implement dynamic logo loading in Sidebar.
- [x] Implement geofencing proximity warning in `ClockCard`.
- [x] Remove hardcoded "admin"/"hr" role checks for UI visibility.
- [ ] Router-level Middleware guard for explicit route protection (Next.js Middleware).

---
**Status**: ✅ PBAC CORE INTEGRATED
**Standard**: Enterprise PBAC (Permission-Based)
