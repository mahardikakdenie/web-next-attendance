# Frontend Task: Real-time Notifications (SSE Integration)

## 📌 Context
We have implemented a real-time notification system using **Server-Sent Events (SSE)**. This allows the dashboard to receive instant updates (e.g., Leave Approval, Payroll Published) without refreshing. The system is backed by Redis Pub/Sub for scalability.

---

## 🎯 API Specifications & Types

### 1. The Real-time Stream
**Endpoint:** `GET /api/v1/notifications/stream`
**Mechanism:** Server-Sent Events (SSE)
**Connection:** Use `EventSource` with `withCredentials: true`.

**Expected JSON Data (Event Payload):**
```typescript
interface NotificationPayload {
  id: number;
  title: string;
  message: string;
  type: 'leave' | 'overtime' | 'expense' | 'payroll' | 'profile' | 'support' | 'system';
  is_read: boolean;
  created_at: string; // ISO 8601
}
```

### 2. Fetch Notification History
**Endpoint:** `GET /api/v1/notifications?limit=20`
**Response Type:**
```typescript
interface NotificationListResponse {
  success: boolean;
  data: NotificationPayload[];
  meta: {
    unread_count: number;
  };
}
```

### 3. Mark as Read
- **Single:** `PATCH /api/v1/notifications/{id}/read`
- **All:** `PATCH /api/v1/notifications/read-all`

---

## 🎨 UI/UX Requirements

### 1. Navbar Notification Bell
- Display a "Bell" icon with a red badge indicating the `unread_count`.
- Clicking the bell should open a dropdown list showing the latest 10-20 notifications.
- Each notification item should have an icon based on its `type` (e.g., a "wallet" icon for payroll, "calendar" for leave).

### 2. Real-time Toast Notifications
- When a new event arrives via the SSE stream:
  1. Play a subtle notification sound (optional).
  2. Display a "Toast" or "Snackbar" at the top-right corner.
  3. Increment the unread badge count immediately.
  4. Append the new notification to the top of the history list.

### 3. Navigation Logic
- Clicking on a notification should redirect the user to the relevant page:
  - `type: 'payroll'` -> Redirect to `/payroll/my-slips`
  - `type: 'leave'` -> Redirect to `/leaves/history`
  - `type: 'profile'` -> Redirect to `/settings/profile`

---

## 🛠️ Implementation Guide (Strict Typing)

### Establishing the Connection
```typescript
const connectNotifications = () => {
  const eventSource = new EventSource('/api/v1/notifications/stream', { 
    withCredentials: true 
  });

  eventSource.onmessage = (event: MessageEvent) => {
    try {
      const newNotif: NotificationPayload = JSON.parse(event.data);
      // 1. Update Global State (e.g., Redux/Zustand)
      // 2. Trigger Toast Component
      showNotificationToast(newNotif);
    } catch (err) {
      console.error("Failed to parse notification:", err);
    }
  };

  eventSource.onerror = () => {
    console.error("SSE Connection lost. Retrying...");
    eventSource.close();
    // Implement exponential backoff for reconnection if needed
  };
};
```

---

## ✅ Success Criteria
- [ ] Bell badge updates in real-time when an event is triggered in backend.
- [ ] Notifications are stored in persistent state (don't lose unread items on refresh).
- [ ] "Mark as Read" correctly updates the backend and local UI.
- [ ] No `any` types used in the notification service/components.
- [ ] SSE connection is properly closed when the user logs out or the component unmounts.

---

## 🔗 References
- Backend PR: Implemented SSE with Redis Pub/Sub
- Swagger: `/docs/index.html#/notifications`
