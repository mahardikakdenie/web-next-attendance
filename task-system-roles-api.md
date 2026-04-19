# [BE] Platform System Roles & Permissions API Implementation

## 📝 Overview
Implement administrative endpoints to manage "System Roles". These are global roles (e.g., SUPERADMIN, ADMIN, HR, FINANCE) that serve as blueprints. Any changes here will affect all users linked to these system roles.

## 🛠 Technical Requirements

### 1. Database Scope
- Table: `roles`
- Filter: `tenant_id IS NULL` (indicating global/system level).
- Relation: Must include `permissions` many-to-many relationship.

### 2. API Endpoints
- **List System Roles:** `GET /api/v1/superadmin/system-roles`
    - Returns roles where `tenant_id` is null.
    - Must include `permissions` array for each role.
- **Get All Available Permissions:** `GET /api/v1/superadmin/permissions`
    - Returns a master list of all possible permissions in the system (e.g., `user.create`, `attendance.view`).
- **Create/Update System Role:** `POST` / `PUT` `/api/v1/superadmin/system-roles`
    - Payload: 
      ```json
      {
        "name": "FINANCE",
        "description": "Global financial management access",
        "permission_ids": ["payroll.view", "expense.approve"]
      }
      ```
- **Delete Role:** `DELETE /api/v1/superadmin/system-roles/:id`
    - **Logic:** Block deletion if the role is currently in use by any user.

### 3. Business Logic
- **Superadmin Only:** Strict middleware check for `SUPERADMIN` base role.
- **Immunity:** Certain roles (like `SUPERADMIN`) should be marked as `is_immutable` to prevent accidental permission stripping.

## ✅ Acceptance Criteria
- [ ] CRUD for system roles is fully functional.
- [ ] Updating permissions in a system role immediately affects all users with that role.
- [ ] Audit log records which superadmin modified the global permissions.
