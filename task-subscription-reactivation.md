# 📋 Backend Task: Subscription Reactivation Endpoint

## 📌 Context
Currently, when a tenant's subscription is marked as "Canceled", there is no direct way to restore it to an "Active" state without manual database intervention or creating a completely new subscription. We need a secure, auditable endpoint to allow Superadmins to reactivate these subscriptions.

## 🎯 Requirements

### 1. New Endpoint: Reactivate Subscription
- **URL:** `POST /api/v1/superadmin/subscriptions/{id}/reactivate`
- **Authentication:** Required (Superadmin Scope).
- **Logic:**
  1. Validate that the subscription ID exists.
  2. Validate that the current status is `Canceled`.
  3. Change the status to `Active`.
  4. Ensure the `is_suspended` flag in the associated `tenants` table is set to `false`.
  5. Recalculate the `next_billing_date` if the previous one has already passed (e.g., set to `current_date + plan_duration`).
  6. Create a system notification for the Tenant Owner informing them that their access has been restored.
  7. Log this action in the `audit_logs` table (Action: `SUBSCRIPTION_REACTIVATED`).

### 2. Validation & Edge Cases
- Return `403 Forbidden` if the user is not a Superadmin.
- Return `404 Not Found` if the subscription ID does not exist.
- Return `400 Bad Request` if the subscription is already `Active`, `Trial`, or `Past Due`.

### 🎯 Expected Result (Response 200 OK)
```json
{
  "success": true,
  "message": "Subscription reactivated successfully",
  "data": {
    "subscription_id": 123,
    "new_status": "Active",
    "next_billing_date": "2026-06-10T00:00:00Z"
  }
}
```

---
**Reference:** Frontend implementation completed in `src/service/subscription.ts` and `src/components/admin/SubscriptionManagement.tsx`.
