import BillingView from "@/views/tenant-settings/Billing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plan & Billing | AttendancePro",
  description: "Manage your organization's subscription plan, view billing history, and scale your workforce capabilities.",
};

export default function BillingPage() {
  return <BillingView />;
}
