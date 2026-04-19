import SubscriptionsView from "@/views/admin/Subscriptions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscriptions & Revenue | Superadmin Pro",
  description: "Advanced financial oversight for SaaS organization billing cycles and recurring revenue.",
};

export default function SubscriptionsPage() {
  return <SubscriptionsView />;
}
