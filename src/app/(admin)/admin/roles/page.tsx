import PlatformRolesView from "@/views/admin/PlatformRoles";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform Governance | System Admin",
  description: "Global system role management and master permission policies.",
};

export default function PlatformRolesPage() {
  return <PlatformRolesView />;
}
