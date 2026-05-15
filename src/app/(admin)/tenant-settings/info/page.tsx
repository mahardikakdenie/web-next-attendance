import TenantInfoView from "@/views/tenant-settings/TenantInfoView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organization Info | AttendancePro",
  description: "View and manage your organization's core identity and settings.",
};

export default function TenantInfoPage() {
  return <TenantInfoView />;
}
