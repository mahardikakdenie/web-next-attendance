import { useState, useEffect } from "react";

export type DashboardTab = "absen" | "timesheet" | "requests" | "actions" | "analytics";

export function useDashboardTab(initialTab: DashboardTab = "absen") {
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);

  useEffect(() => {
    const handleTabChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab?: DashboardTab }>;
      if (customEvent.detail?.tab) {
        setActiveTab(customEvent.detail.tab);
      }
    };
    window.addEventListener("onboarding-change-tab", handleTabChange);
    return () => window.removeEventListener("onboarding-change-tab", handleTabChange);
  }, []);

  return { activeTab, setActiveTab };
}
