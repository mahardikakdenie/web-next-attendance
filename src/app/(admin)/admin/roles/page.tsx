import PlatformRolesView from "@/views/admin/PlatformRoles";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform Roles | System Governance",
  description: "Manage global system roles, master permissions, and ecosystem-wide reporting hierarchies.",
};

export default function PlatformRolesPage() {
  return <PlatformRolesView />;
}
