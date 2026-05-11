"use client";

import { create } from "zustand";
import { NotificationPayload } from "@/types/api";
import { getNotifications, markAsRead, markAllAsRead } from "@/service/notification";
import { toast } from "sonner";
import { getSecurityHeaders } from "@/lib/axios";
import { useAuthStore } from "./auth.store";

interface NotificationState {
  notifications: NotificationPayload[];
  unreadCount: number;
  isLoading: boolean;
  eventSource: EventSource | null;

  // Actions
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: NotificationPayload) => void;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  connectSSE: () => void;
  disconnectSSE: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  eventSource: null,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await getNotifications();
      set({ 
        notifications: res.data || [], 
        unreadCount: res.meta?.unread_count || 0,
        isLoading: false 
      });
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      set({ isLoading: false });
    }
  },

  addNotification: (notification: NotificationPayload) => {
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50),
      unreadCount: state.unreadCount + 1
    }));
  },

  markRead: async (id: number) => {
    try {
      await markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) => 
          n.id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  },

  markAllRead: async () => {
    try {
      await markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0
      }));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  },

  connectSSE: () => {
    // Prevent duplicate connections
    if (get().eventSource) return;

    const security = getSecurityHeaders();
    const params = new URLSearchParams({
      'X-Timestamp': security['X-Timestamp'],
      'X-Request-ID': security['X-Request-ID']
    });

    const es = new EventSource(`/api/v1/notifications/stream?${params.toString()}`, {
      withCredentials: true,
    });

    // Native EventSource automatically reconnects on most errors.
    // We only need to manually restart if the connection is closed or fails catastrophically.

    es.onopen = () => {
      console.log("SSE Connection established");
    };

    // Standard EventSource event
    es.onmessage = (event) => {
      try {
        const newNotif: NotificationPayload = JSON.parse(event.data);
        get().addNotification(newNotif);
        
        if (newNotif.type === 'subscription' || newNotif.type === 'system') {
          void useAuthStore.getState().fetchUser();
          window.dispatchEvent(new Event('refresh-sidebar-menus'));
        }

        toast(newNotif.title, {
          description: newNotif.message,
          action: {
            label: "View",
            onClick: () => {
              window.dispatchEvent(new CustomEvent('navigate-notification', { detail: newNotif }));
            }
          }
        });
      } catch (err) {
        console.error("Failed to parse notification SSE data:", err);
      }
    };

    es.onerror = () => {
      // EventSource.readyState: 2 means CLOSED, 0 means CONNECTING
      if (es.readyState === 2) {
        console.error("SSE Connection closed. Attempting manual reconnect in 10s...");
        es.close();
        set({ eventSource: null });
        setTimeout(() => get().connectSSE(), 10000);
      } else {
        console.warn("SSE connection issue. Browser will attempt to reconnect automatically.");
      }
    };

    set({ eventSource: es });
  },

  disconnectSSE: () => {
    const es = get().eventSource;
    if (es) {
      es.close();
      set({ eventSource: null });
    }
  }
}));
