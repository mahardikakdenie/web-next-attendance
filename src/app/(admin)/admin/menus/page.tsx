import MenuManagementView from "@/views/admin/MenuManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu Management | Platform Superadmin",
  description: "Configure dynamic navigation ecosystem and role-based access control.",
};

export default function MenuManagementPage() {
  return <MenuManagementView />;
}
