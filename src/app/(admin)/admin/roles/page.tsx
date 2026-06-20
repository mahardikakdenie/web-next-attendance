import PlatformRolesView from "@/views/admin/PlatformRoles";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roles & Permissions | System Governance",
  description: "Manage global system roles, capabilities, and role-based access control policies.",
};

export default function PlatformRolesPage() {
  return <PlatformRolesView />;
}
