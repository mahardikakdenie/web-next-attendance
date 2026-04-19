# [BE] Platform Accounts Management API Implementation

## 📝 Overview
Implement a set of administrative endpoints to manage high-level platform accounts (Superadmins, Support, Engineers). these endpoints will power the dashboard at `@src/app/(admin)/admin/accounts/page.tsx`.

## 🛠 Technical Requirements

### 1. API Endpoints
- **Fetch Accounts:** `GET /api/v1/superadmin/platform-accounts`
    - Supports pagination: `limit`, `offset`.
    - Supports search: `search` (filter by name or email).
- **Create Admin:** `POST /api/v1/superadmin/platform-accounts`
    - Payload: `{ "name", "email", "role_id", "password" (optional) }`.
    - **Logic:** If `password` is not provided, backend MUST auto-generate a secure password and send it via email to the user.
- **Update Admin:** `PUT /api/v1/superadmin/platform-accounts/:id`
    - Update name, email, or role.
- **Toggle Status:** `PATCH /api/v1/superadmin/platform-accounts/:id/status`
    - Payload: `{ "status": "active" | "suspended" }`.

### 2. Business Logic & Protection
- **Root Protection:** The account with **ID: 1** (Root Admin) MUST be protected. 
    - API must return `403 Forbidden` if a request tries to `SUSPEND` or `DELETE` account ID 1.
- **Access Control:** These endpoints must be strictly restricted to users with the `SUPERADMIN` base role.
- **Audit Logs:** Every change (Create, Update, Status Change) must be recorded in the system audit logs.

### 3. Expected Response Structure
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Super Admin Root",
      "email": "root@attendance.pro",
      "role": {
        "id": 1,
        "name": "SUPERADMIN"
      },
      "status": "active",
      "avatar": "https://...",
      "created_at": "2026-04-18T..."
    }
  ],
  "meta": {
    "total": 10,
    "limit": 10,
    "offset": 0
  }
}
```

## ✅ Acceptance Criteria
- [ ] List endpoint returns only platform-level accounts (Superadmin, Support, Engineer).
- [ ] Auto-password generation logic is working and emails are triggered.
- [ ] Attempting to suspend ID 1 results in a 403 error.
- [ ] Suspended accounts are immediately blocked from all authenticated routes (Token invalidation/check).
