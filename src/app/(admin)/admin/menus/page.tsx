import MenuManagementView from "@/views/admin/MenuManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Navigation Builder | Platform Superadmin",
  description: "Configure dynamic navigation ecosystem layout, routing, and hierarchy.",
};

export default function MenuManagementPage() {
  return <MenuManagementView />;
}
