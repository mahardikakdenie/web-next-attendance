"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useNotificationStore } from "@/store/notification.store";
import { useRouter } from "next/navigation";
import { NotificationPayload } from "@/types/api";

export default function NotificationBootstrap() {
  const { isAuthenticated } = useAuthStore();
  const { connectSSE, disconnectSSE, fetchNotifications } = useNotificationStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      connectSSE();
    } else {
      disconnectSSE();
    }

    return () => {
      disconnectSSE();
    };
  }, [isAuthenticated, connectSSE, disconnectSSE, fetchNotifications]);

  // Global Navigation Listener for Toast "View" clicks
  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<NotificationPayload>;
      const notif = customEvent.detail;
      switch (notif.type) {
        case 'payroll':
          router.push('/payroll');
          break;
        case 'leave':
          router.push('/leaves');
          break;
        case 'profile':
          router.push('/request-profile-update');
          break;
        case 'overtime':
          router.push('/overtime');
          break;
        case 'expense':
          router.push('/finance/expenses');
          break;
        case 'support':
          router.push('/admin/support');
          break;
        default:
          router.push('/');
      }
    };

    window.addEventListener('navigate-notification', handleNavigate);
    return () => window.removeEventListener('navigate-notification', handleNavigate);
  }, [router]);

  return null;
}
