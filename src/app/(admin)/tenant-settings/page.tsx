import TenantSettingsView from "@/views/tenant-settings/Index";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tenant Settings | Attendance Management",
  description: "Configure your organization attendance rules.",
};

export default function TenantSettingsPage() {
  return <TenantSettingsView />;
}