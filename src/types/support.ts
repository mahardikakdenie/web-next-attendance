export type SupportStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TrialStatus = "NEW" | "QUALIFIED" | "APPROVED" | "REJECTED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

/**
 * Messages from Tenant Admins to CS
 */
export interface SupportMessage {
  id: string;
  tenant_id: number;
  tenant_name: string;
  sender_name: string;
  subject: string;
  message: string;
  category: "TECHNICAL" | "BILLING" | "FEATURE" | "OTHER";
  status: SupportStatus;
  created_at: string;
}

/**
 * Leads from landing page requesting a demo/trial
 */
export interface TrialRequest {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone_number: string;
  employee_count_range: '1-10' | '11-50' | '51-200' | '201+';
  industry: string;
  status: TrialStatus;
  requested_at: string;
}

/**
 * Request payload for submitting a new trial
 */
export interface CreateTrialPayload {
  company_name: string;
  contact_name: string;
  email: string;
  phone_number: string;
  employee_count_range: string;
  industry: string;
}

/**
 * Request payload for sending a support message (all tenants)
 */
export interface CreateSupportMessagePayload {
  subject: string;
  message: string;
  category: "TECHNICAL" | "BILLING" | "FEATURE" | "OTHER";
}

export type TicketStatus = "WAITING" | "EXECUTING" | "COMPLETED" | "FAILED";

/**
 * Provisioning Tickets for Superadmin
 */
export interface ProvisioningTicket {
  id: string;
  trial_request_id: string;
  company_name: string;
  admin_email: string;
  plan_type: "BASIC" | "PROFESSIONAL" | "ENTERPRISE";
  priority: TicketPriority;
  status: TicketStatus;
  is_executed: boolean;
  error_log?: string;
  created_at: string;
}
