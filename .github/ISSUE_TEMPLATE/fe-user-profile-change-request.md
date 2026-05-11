# Frontend Task: Employee Profile Update Workflow (Approval System)

## 📌 Context
We are implementing an approval workflow for employee profile updates. When an employee tries to update their profile via `PUT /api/v1/users/me`, the changes will not be applied immediately. Instead, a "Change Request" will be created. The Admin/HR must review and approve this request before the `users` table is actually updated.

We need the Frontend team to integrate this new API workflow. The UI for the edit profile form (`PUT /api/v1/users/me`) is reportedly ready, but we need new UI components for users to track their requests and for Admins to manage them.

---

## 🎯 Required API Integration

### 1. Submit Profile Update Request (Employee)
**Endpoint:** `PUT /v1/users/me`
**Action:** Submits the profile changes.
**Payload:**
```json
{
  "name": "Budi Santoso",
  "email": "budi.s@example.com",
  "department": "Engineering",
  "address": "Jl. Baru No 2",
  "phone_number": "08123456789"
}
```
**Response (201 Created or 200 OK):**
*Note: This no longer returns the updated User object immediately. It returns the Change Request object.*
```json
{
  "success": true,
  "message": "Change request submitted successfully",
  "data": {
    "id": 1,
    "status": "pending",
    ...
  }
}
```

### 2. Get My Change Requests (Employee)
**Endpoint:** `GET /v1/users/me/change-requests`
**Action:** Fetches a list of the current user's profile change requests.
**Response:** Array of requests with their current `status` (`pending`, `approved`, `rejected`, `cancelled`).

### 3. Cancel a Change Request (Employee)
**Endpoint:** `PATCH /v1/users/me/change-requests/{id}/cancel`
**Action:** Cancels a request if it is still `pending`.

### 4. Admin: Get All Change Requests (HR/Admin)
**Endpoint:** `GET /v1/users/change-requests`
**Query Params:** `?status=pending` (optional filter)
**Action:** Fetches all change requests across the tenant.

### 5. Admin: Approve/Reject (HR/Admin)
**Endpoints:** 
- `POST /v1/users/approve-change/{id}`
- `POST /v1/users/reject-change/{id}` (Body: `{"admin_notes": "Reason"}`)

---

## 🎨 UI/UX Requirements & Guidance

### For Employees (User Dashboard):
1. **Edit Profile Form:** 
   - Bind the existing UI to the `PUT /v1/users/me` endpoint.
   - **Important:** After submission, show a toast/modal explaining: *"Your profile update request has been submitted and is awaiting HR approval."* Do NOT automatically update the local UI state of the user's profile until the request is approved.
2. **"My Requests" History Table (NEW UI Needed):**
   - Create a new tab or section (e.g., under Settings > "Update Requests").
   - Display a table/list showing: Date Submitted, Fields Changed (e.g., Name, Phone), Status Badge (Pending, Approved, Rejected, Cancelled).
   - If status is `pending`, show a **"Cancel Request"** button calling the `PATCH` endpoint.
   - If status is `rejected`, show the `admin_notes` explaining why.

### For HR/Admin (Admin Dashboard):
1. **Profile Change Approvals Table (NEW UI Needed):**
   - Create a dedicated menu item (e.g., "Employee Requests" > "Profile Updates").
   - Show a table of all requests with filters (Pending, Approved, Rejected).
   - **Details View:** Clicking a row should show a comparison: **Current Data** vs **Requested Data**.
   - **Actions:** "Approve" (Green Button) and "Reject" (Red Button). If rejecting, prompt for an optional reason/note.

---

## ✅ Success Criteria
- [ ] Submitting the edit profile form creates a `pending` request.
- [ ] Employees can view their request history and cancel pending ones.
- [ ] Admins can view a list of all requests, compare old vs new data, and approve/reject.
- [ ] Approving a request automatically updates the main user profile everywhere in the app.
