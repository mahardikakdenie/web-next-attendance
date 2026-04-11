# Frontend Integration Issue: HR Analytics & RBAC 2.0 Implementation

## 📝 Overview
This issue covers the full integration of the newly implemented Backend features, including the enhanced Dashboard Analytics, Standardized API Responses, and the updated RBAC 2.0 (Hierarchical Access Control) system.

---

## 🛠️ Task 1: Update Type Definitions
**Location:** `src/types/api.ts` (or relevant type files)

### 1.1 Standardized API Response
Update the base `APIResponse` to include the `success` field and the nested `pagination` object.

```typescript
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
}

export interface APIResponse<T> {
  success: boolean;
  meta: MetaResponse;
  data: T;
}
```

### 1.2 RBAC 2.0 & User Metadata
Add support for permissions and hierarchical info in the user profile.

```typescript
export interface Permission {
  id: string; // e.g., "attendance.view"
  module: string;
  action: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  base_role: 'ADMIN' | 'HR' | 'FINANCE' | 'EMPLOYEE';
  is_system: boolean;
  permissions?: Permission[];
}

export interface UserData {
  // ... existing fields
  role?: Role;
  permissions?: string[]; // Array of strings from BE for easy UI toggling
  is_owner: boolean;
  base_salary: number;
  manager_id?: number;
  delegate_id?: number;
}
```

### 1.3 Dashboard & Heatmap Types
```typescript
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

export interface HrDashboardData {
  stats: {
    presence_rate: number;
    avg_overtime: number;
    pending_leave: number;
    at_risk_staff: number;
    at_risk_users: MappedUser[];
  };
  top_performers: any[];
  need_attention: any[];
  performance_matrix: any[];
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
```

---

## 🚀 Task 2: API Service Integration
**Location:** `src/service/`

### 2.1 Dashboard Service (`src/service/dashboard.ts`)
Create a new service for the split dashboard endpoints.

```typescript
import { secureRequest } from "@/lib/axios";
import { APIResponse, HrDashboardData, HeatmapItem } from "@/types/api";

export const getHrDashboard = () => {
  return secureRequest<HrDashboardData>("get", "/v1/dashboards/hr");
};

export const getHeatmap = (params: { type: string; user_id?: number; date_from?: string; date_to?: string }) => {
  return secureRequest<HeatmapItem[]>("get", "/v1/dashboards/heatmap", params);
};
```

### 2.2 Leave Management (`src/service/leave.ts`)
Add approval and rejection methods.

```typescript
export const approveLeave = (id: number, notes?: string) => {
  return secureRequest<APIResponse<null>>("post", `/v1/leaves/approve/${id}`, { notes });
};

export const rejectLeave = (id: number, notes?: string) => {
  return secureRequest<APIResponse<null>>("post", `/v1/leaves/reject/${id}`, { notes });
};
```

### 2.3 Tenant Roles & Hierarchy (`src/service/roles.ts`)
Implement the new RBAC 2.0 management API.

```typescript
export const getTenantRoles = () => secureRequest("get", "/v1/tenant-roles");
export const createCustomRole = (data: any) => secureRequest("post", "/v1/tenant-roles", data);
export const saveRoleHierarchy = (parent_id: number, child_ids: number[]) => 
  secureRequest("post", "/v1/tenant-roles/hierarchy", { parent_role_id: parent_id, child_role_ids: child_ids });
```

---

## 🎨 Task 3: UI & Logic Implementation

### 3.1 Global DataTable Integration
*   Ensure all `DataTable` components use the updated `meta.pagination`.
*   Pass the `onPageChange` prop correctly to fetch the next set of data.

### 3.2 HR Dashboard Enhancements
*   **Leave Trends:** Connect the Area Chart to `leave_trends`.
*   **Heatmap Filters:** Implement a toggle/select for "Clock In", "Clock Out", and "Leave" to call the new `/heatmap` endpoint.
*   **Top Performers:** Map `top_performers` and `need_attention` arrays to the corresponding UI widgets.
*   **User Drill-down:** Since `users` lists are now enriched with `department` and `score`, ensure clicking a user in the Donut Chart or Heatmap displays their specific stats.

### 3.3 RBAC Middleware (Frontend)
*   Create a helper `hasPermission(perm: string)` that checks `user.permissions`.
*   Use this to hide/show buttons (e.g., "Approve" button should only show if `user.permissions.includes('leave.approve')`).

---

## 📌 Critical Notes
1.  **Avatar Fallback:** BE now automatically returns a `ui-avatars.com` URL if `media_url` is empty. You can remove any manual client-side fallback logic.
2.  **Performance:** The `/v1/dashboards/hr` response is cached for 5 minutes. If data seems stale during testing, perform a hard refresh or wait for the TTL to expire.
3.  **Heatmap Intensity:** When filtering by `user_id`, the intensity `value` will be strictly `0` or `100`. Design the UI to reflect this binary state (e.g., colored or empty).

---
**Acceptance Criteria:**
- [ ] No more mock data in HR Dashboard.
- [ ] Pagination working on all tables using the new BE structure.
- [ ] Leave Approval/Rejection buttons functional for authorized users.
- [ ] Heatmap filters by type and user working correctly.
