"use client";

import { create } from "zustand";
import { NotificationPayload } from "@/types/api";
import { getNotifications, markAsRead, markAllAsRead } from "@/service/notification";
import { toast } from "sonner";
import { getSecurityHeaders } from "@/lib/axios";
import { useAuthStore } from "./auth.store";

// ─── SSE Event Types (from backend spec) ─────────────────────────────────────
interface SSEEvent {
  type: "connected" | "notification" | "unread_count";
  unread_count: number;
  data?: NotificationPayload;
  event_id?: string;
  timestamp: number;
}

// ─── Store Interface ─────────────────────────────────────────────────────────
interface NotificationState {
  notifications: NotificationPayload[];
  unreadCount: number;
  isLoading: boolean;
  eventSource: EventSource | null;

  fetchNotifications: () => Promise<void>;
  addNotification: (notification: NotificationPayload) => void;
  setUnreadCount: (count: number) => void;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  connectSSE: () => void;
  disconnectSSE: () => void;
}

// ─── Last-Event-ID persistence ───────────────────────────────────────────────
const LAST_EVENT_ID_KEY = "sse_last_event_id";

const getLastEventId = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_EVENT_ID_KEY);
};

const saveLastEventId = (id: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(LAST_EVENT_ID_KEY, id);
  }
};

// ─── Reconnect config ────────────────────────────────────────────────────────
const RECONNECT_DELAY_MS = 10_000;

const playNotificationSound = () => {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    gainNode.gain.setValueAtTime(0.0001, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.22);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.22);

    oscillator.onended = () => {
      void context.close();
    };
  } catch (error) {
    console.warn("Notification sound blocked or unavailable:", error);
  }
};

// ─── Store ───────────────────────────────────────────────────────────────────
export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  eventSource: null,

  // ── Fetch initial list via REST ──────────────────────────────────────────
  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await getNotifications();
      set({
        notifications: res.data || [],
        unreadCount: res.meta?.unread_count || 0,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      set({ isLoading: false });
    }
  },

  // ── Prepend a new notification (capped at 50) ───────────────────────────
  addNotification: (notification: NotificationPayload) => {
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50),
    }));
  },

  // ── Authoritative unread count from SSE ─────────────────────────────────
  setUnreadCount: (count: number) => {
    set({ unreadCount: count });
  },

  // ── Mark single notification read ───────────────────────────────────────
  markRead: async (id: number) => {
    try {
      await markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  },

  // ── Mark all read ───────────────────────────────────────────────────────
  markAllRead: async () => {
    try {
      await markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  },

  // ── SSE Connection ──────────────────────────────────────────────────────
  connectSSE: () => {
    // Prevent duplicate connections
    if (get().eventSource) return;

    const security = getSecurityHeaders();
    const params = new URLSearchParams({
      "X-Timestamp": security["X-Timestamp"],
      "X-Request-ID": security["X-Request-ID"],
    });

    // Resume support — attach last known event ID
    const lastId = getLastEventId();
    if (lastId) {
      params.set("Last-Event-ID", lastId);
    }

    const es = new EventSource(
      `/api/v1/notifications/stream?${params.toString()}`,
      { withCredentials: true }
    );

    // ── 1. "connected" — initial handshake & badge sync ─────────────────
    es.addEventListener("connected", (event: MessageEvent) => {
      try {
        const payload: SSEEvent = JSON.parse(event.data);
        get().setUnreadCount(payload.unread_count);

        if (payload.event_id) {
          saveLastEventId(payload.event_id);
        }
      } catch (err) {
        console.error("SSE [connected] parse error:", err);
      }
    });

    // ── 2. "notification" — new notification pushed ─────────────────────
    es.addEventListener("notification", (event: MessageEvent) => {
      try {
        const payload: SSEEvent = JSON.parse(event.data);

        // Always sync badge from server-authoritative count
        get().setUnreadCount(payload.unread_count);

        // Persist event ID for reconnection resume
        if (payload.event_id) {
          saveLastEventId(payload.event_id);
        }

        // Add to local list if data present
        if (payload.data) {
          get().addNotification(payload.data);
          playNotificationSound();

          // Refresh auth/sidebar for subscription or system changes
          if (payload.data.type === "subscription" || payload.data.type === "system") {
            void useAuthStore.getState().fetchUser();
            window.dispatchEvent(new Event("refresh-sidebar-menus"));
          }

          // Show toast
          toast(payload.data.title, {
            description: payload.data.message,
            action: {
              label: "View",
              onClick: () => {
                window.dispatchEvent(
                  new CustomEvent("navigate-notification", { detail: payload.data })
                );
              },
            },
          });
        }
      } catch (err) {
        console.error("SSE [notification] parse error:", err);
      }
    });

    // ── 3. "unread_count" — cross-tab mark-as-read sync ─────────────────
    es.addEventListener("unread_count", (event: MessageEvent) => {
      try {
        const payload: SSEEvent = JSON.parse(event.data);
        get().setUnreadCount(payload.unread_count);

        if (payload.event_id) {
          saveLastEventId(payload.event_id);
        }
      } catch (err) {
        console.error("SSE [unread_count] parse error:", err);
      }
    });

    // ── Connection opened ───────────────────────────────────────────────
    es.onopen = () => {
      console.log("[SSE] Connection established");
    };

    // ── Error / reconnect handling ──────────────────────────────────────
    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) {
        console.error("[SSE] Connection closed. Reconnecting in 10s...");
        es.close();
        set({ eventSource: null });
        setTimeout(() => get().connectSSE(), RECONNECT_DELAY_MS);
      } else {
        // readyState CONNECTING — browser auto-reconnects
        console.warn("[SSE] Connection issue. Browser auto-reconnecting...");
      }
    };

    set({ eventSource: es });
  },

  // ── Disconnect SSE ────────────────────────────────────────────────────
  disconnectSSE: () => {
    const es = get().eventSource;
    if (es) {
      es.close();
      set({ eventSource: null });
    }
  },
}));
