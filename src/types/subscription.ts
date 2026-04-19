export type SubscriptionPlan = "Starter" | "Business" | "Enterprise" | "Custom";
export type SubscriptionStatus = "Active" | "Past Due" | "Canceled" | "Trial";

export interface TenantSubscription {
  id: number;
  tenant_id: number;
  tenant_name: string;
  tenant_code: string;
  tenant_logo: string;
  plan: SubscriptionPlan;
  billing_cycle: "Monthly" | "Annually";
  amount: number;
  status: SubscriptionStatus;
  next_billing_date: string;
  active_employees: number;
  created_at: string;
}

export interface SubscriptionStats {
  mrr: number; // Monthly Recurring Revenue
  mrr_growth: string;
  active_tenants: number;
  active_tenants_growth: string;
  past_due_amount: number;
  past_due_growth: string;
}

export interface SubscriptionsResponse {
  items: TenantSubscription[];
  total: number;
  stats: SubscriptionStats;
}
