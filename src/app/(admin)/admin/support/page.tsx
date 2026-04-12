import SupportDeskView from "@/views/admin/SupportDesk";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support Desk | Platform Admin",
  description: "Customer Success, Trial Management, and Tenant Provisioning.",
};

export default function SupportDeskPage() {
  return <SupportDeskView />;
}
