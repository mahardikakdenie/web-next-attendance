import { SubscriptionPlan, SubscriptionStatus } from "./subscription";

export interface MySubscription {
  id: number;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  amount: number;
  next_billing_date: string;
  billing_cycle: "Monthly" | "Annually";
  features: string[];
}

export interface UpgradePayload {
  plan: SubscriptionPlan;
}
