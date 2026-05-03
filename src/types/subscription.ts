export type PlanType = "Starter" | "Business" | "Enterprise" | "Custom";
export type SubscriptionStatus = "Active" | "Past Due" | "Canceled" | "Trial";

/**
 * Global Subscription Plan (CRUD)
 */
export interface SubscriptionPlan {
  id: number;
  name: string;
  max_employees: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePlanPayload {
  name: string;
  max_employees: number;
  features: string[];
  is_active: boolean;
}

export type UpdatePlanPayload = Partial<CreatePlanPayload>;

/**
 * Tenant Subscription (List & Override)
 */
export interface TenantSubscription {
  id: number;
  tenant_id: number;
  tenant_name: string;
  tenant_code: string;
  tenant_logo: string;
  plan: PlanType | string;
  billing_cycle: "Monthly" | "Annually";
  amount: number;
  status: SubscriptionStatus;
  next_billing_date: string;
  active_employees: number;
  created_at: string;
}

export interface OverrideSubscriptionPayload {
  plan_id?: number;
  status?: SubscriptionStatus;
  amount?: number;
  next_billing_date?: string;
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
