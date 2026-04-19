# Task: Dynamic Permission Modules Integration

## Status
- **Priority:** High
- **Type:** Refactoring / API Integration
- **Objective:** Replace the hardcoded `PERMISSION_MODULES` in `TenantRoles.tsx` with dynamic data fetched from the Backend to ensure consistency between available system capabilities and the UI.

## Context
Currently, `src/views/tenant-settings/TenantRoles.tsx` uses a static constant `PERMISSION_MODULES` to render the permissions matrix. This leads to UI-Backend desync if new permissions are added to the database but not manually updated in the React code.

## Requirements

### 1. API Service Extension
- Add a new function in `src/service/roles.ts` to fetch the master permission list.
- **Endpoint:** `GET /v1/permissions` (or as defined in the BE task `GET /api/v1/superadmin/permissions`).
- **Response Shape:** Should return modules grouped by category or a flat list that the FE can group.

### 2. Type Definition
- Ensure `src/types/permissions.ts` matches the structure returned by the Backend.
- If the BE returns a flat list, implement a helper function to group permissions by their prefix (e.g., `user.*` goes to "User Management").

### 3. UI Implementation (`TenantRoles.tsx`)
- [ ] Add `allPermissions` state to `TenantRolesView`.
- [ ] Fetch the master permissions list inside `useEffect` (parallel with `fetchRoles`).
- [ ] Replace usage of the static `PERMISSION_MODULES` with the fetched state.
- [ ] Implement a loading state for the permissions matrix to prevent "flicker" or empty views while loading.

### 4. Robustness
- Handle cases where a role has a permission ID that no longer exists in the master list (graceful degradation).
- Add icons mapping based on module names (since BE might not return Lucide icon components).

## Proposed Execution Steps
1. **Modify Service:**
   ```typescript
   export const getAllPermissions = () => {
     return secureRequest<APIResponse<PermissionModule[]>>("get", "/v1/permissions");
   };
   ```
2. **Update View State:**
   ```typescript
   const [permissionModules, setPermissionModules] = useState<PermissionModule[]>([]);
   ```
3. **Data Mapping:** If BE returns flat permissions, map them:
   - `attendance.*` -> "Attendance & Monitoring"
   - `payroll.*` -> "Payroll & Finance"
   - etc.

## Verification
- [ ] Role permissions toggle still works correctly.
- [ ] Adding a new permission in the DB automatically appears in the UI after refresh.
- [ ] Loading skeletons/spinners appear correctly.
