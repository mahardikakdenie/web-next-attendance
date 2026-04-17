import OwnersStatsView from "@/views/admin/OwnersStats";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organization Monitoring | Superadmin Pro",
  description: "Comprehensive visibility into tenant performance, adoption, and usage statistics.",
};

export default function Page() {
  return <OwnersStatsView />;
}
