import { z } from "zod";

export const CaseType = z.enum([
  "phishing_or_social_engineering",
  "duplicate_payment",
  "agent_cash_in_issue",
  "merchant_settlement_delay",
  "payment_failed",
  "wrong_transfer",
  "refund_request",
  "other",
]);
export type CaseType = z.infer<typeof CaseType>;

export const Department = z.enum([
  "fraud_and_security",
  "payments_and_transactions",
  "agent_operations",
  "merchant_services",
  "settlement_and_reconciliation",
  "customer_support",
  "refunds_and_adjustments",
]);
export type Department = z.infer<typeof Department>;

export const Severity = z.enum(["low", "medium", "high", "critical"]);
export type Severity = z.infer<typeof Severity>;

export const EvidenceVerdict = z.enum([
  "consistent",
  "inconsistent",
  "insufficient_data",
]);
export type EvidenceVerdict = z.infer<typeof EvidenceVerdict>;

export const Channel = z.enum(["atmx", "agent", "app", "web", "unknown"]);
export type Channel = z.infer<typeof Channel>;

export const TransactionStatus = z.enum([
  "pending",
  "completed",
  "failed",
  "disputed",
  "reversed",
]);
export type TransactionStatus = z.infer<typeof TransactionStatus>;

export const TransactionType = z.enum([
  "cash_in",
  "cash_out",
  "send_money",
  "payment",
  "refund",
  "transfer",
  "unknown",
]);
export type TransactionType = z.infer<typeof TransactionType>;
