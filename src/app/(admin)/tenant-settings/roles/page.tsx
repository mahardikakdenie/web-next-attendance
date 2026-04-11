import TenantRolesView from "@/views/tenant-settings/TenantRoles";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organization Roles | Organization Settings",
  description: "Configure custom roles, permissions, and hierarchical reporting for your organization.",
};

export default function TenantRolesPage() {
  return <TenantRolesView />;
}
