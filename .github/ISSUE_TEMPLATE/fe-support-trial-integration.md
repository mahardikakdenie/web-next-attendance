# 🌐 [FRONTEND-TASK] CS Hub & Automated Provisioning Integration

## 📝 1. Overview
Integrate the customer acquisition and support pipeline. This includes the public Trial Request form on the Landing Page, the Admin Support Inbox, and the Superadmin Provisioning Engine.

---

## 🛠️ 2. Integration Modules

### 📝 A. Public Trial Request (Lead Capture)
Captures prospective client data. No authentication required.

- **Endpoint**: `POST /api/v1/public/trial-request`
- **Payload**:
```json
{
  "company_name": "Acme Corp",
  "contact_name": "John Doe",
  "email": "john@acme.com",
  "phone_number": "0812...",
  "employee_count_range": "11-50", 
  "industry": "Technology"
}
```

### 📥 B. Support Management (Tenant ID 1)
Manage trials and inbound help messages.

- **GET** `/api/v1/admin/support/trials` -> Qualification list.
- **PATCH** `/api/v1/admin/support/trials/{id}` -> Approve leads.
- **GET** `/api/v1/admin/support/inbox` -> Messages from other tenants.

### ⚡ C. Automated Provisioning (Superadmin Only)
Triggers the actual creation of a new SaaS instance.

- **GET** `/api/v1/admin/support/provisioning` -> Activation tickets.
- **POST** `/api/v1/admin/support/provisioning/{id}/execute` -> **ACTIVATE**.
- **UX Requirement**: Display a full-page loading overlay during execution as this performs heavy DB transactions.

---

## 🏗️ 3. Implementation Checklist
- [x] Connect `LoginView` (Trial Mode) to public lead capture.
- [x] Wire up `SupportDeskView` tabs (Inbox, Trials, Filters, Tickets) to corresponding APIs.
- [x] Implement robust error handling for `403 Forbidden` (Signature mismatches).
- [x] Display automated credentials delivery success toast.
- [x] Fix UI styling clashes (Button consistency).

---
**Status**: ✅ FRONTEND INTEGRATION COMPLETE
**Reference**: [See Backend Issue Support Spec](backend-issue-support.md)
