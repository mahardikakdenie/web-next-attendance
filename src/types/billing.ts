import { SubscriptionPlan, SubscriptionStatus } from "./subscription";

export type InvoiceStatus = "Paid" | "Unpaid" | "Overdue" | "Canceled";

export interface Invoice {
  id: string;
  invoice_number: string;
  issued_date: string;
  due_date: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  description: string;
  pdf_url: string;
}

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
  plan_id?: number;
  plan?: string;
}
