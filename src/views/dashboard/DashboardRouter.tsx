"use client";

import { useAuthStore, ROLES } from "@/store/auth.store";
import UserDashboardPage from "./UserDashboard";
import AdminDashboardPage from "./AdminDashboard";
import HrDashboardPage from "./HrDashboard";
import FinanceDashboardPage from "./FinanceDashboard";

export default function DashboardRouter() {
  const { user } = useAuthStore();

  if (!user) return <UserDashboardPage />;

  switch (user.role?.name) {
    case ROLES.SUPERADMIN:
    case ROLES.ADMIN:
      return <AdminDashboardPage />;
    case ROLES.HR:
      return <HrDashboardPage />;
    case ROLES.FINANCE:
      return <FinanceDashboardPage />;
    case ROLES.USER:
    default:
      return <UserDashboardPage />;
  }
}
