import DashboardRouter from "@/views/dashboard/DashboardRouter";
import UserInsightsView from "@/views/dashboard/UserInsights";
import { ROLES } from "@/store/auth.store";

interface AnalyticsTabProps {
  isManagement: boolean;
  user: any;
}

export default function AnalyticsTab({ isManagement, user }: AnalyticsTabProps) {
  const defaultAnalyticsTab = user?.role?.name === ROLES.FINANCE ? "finance" : "hr";
  
  if (isManagement) {
    return <DashboardRouter initialTab={defaultAnalyticsTab} />;
  }
  
  return <UserInsightsView />;
}
