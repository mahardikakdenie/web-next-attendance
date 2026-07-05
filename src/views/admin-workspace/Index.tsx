"use client";

import { useEffect, useState } from "react";
import { useDashboardTab } from "./hooks/useDashboardTab";
import { useDashboardPermissions } from "./hooks/useDashboardPermissions";
import { useActiveProjects } from "./hooks/useActiveProjects";

import DashboardLoadingState from "./components/DashboardLoadingState";
import DashboardNavigation from "./components/DashboardNavigation";

import AbsenTab from "./components/tabs/AbsenTab";
import TimesheetTab from "./components/tabs/TimesheetTab";
import RequestsTab from "./components/tabs/RequestsTab";
import ActionsTab from "./components/tabs/ActionsTab";
import AnalyticsTab from "./components/tabs/AnalyticsTab";

export default function AdminWorkspaceView() {
  const [mounted, setMounted] = useState(false);

  const { activeTab, setActiveTab } = useDashboardTab();
  const { user, loading, isManagement } = useDashboardPermissions();
  const { projects } = useActiveProjects(mounted);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || loading) {
    return <DashboardLoadingState />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "absen":
        return <AbsenTab />;
      case "timesheet":
        return <TimesheetTab projects={projects} />;
      case "requests":
        return <RequestsTab />;
      case "analytics":
        return <AnalyticsTab isManagement={isManagement} user={user} />;
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-8 pb-10">
      <DashboardNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="w-full">
        {renderTabContent()}
      </main>
    </div>
  );
}
