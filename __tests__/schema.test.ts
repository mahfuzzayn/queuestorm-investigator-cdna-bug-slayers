import { describe, it, expect } from "vitest";
import { TicketRequestSchema } from "@/lib/schema/request";
import { TicketResponseSchema } from "@/lib/schema/response";
import {
  CaseType,
  Department,
  Severity,
  EvidenceVerdict,
  Channel,
  TransactionStatus,
  TransactionType,
} from "@/lib/schema/enums";

describe("Schema: Request", () => {
  it("accepts a valid request with all fields", () => {
    const result = TicketRequestSchema.safeParse({
      ticket_id: "TKT-001",
      language: "en",
      complaint: "My transaction failed",
      transaction_history: [
        {
          transaction_id: "TXN-001",
          type: "send_money",
          amount: 5000,
          currency: "BDT",
          status: "failed",
          timestamp: "2026-06-25T10:00:00Z",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid request with only required fields", () => {
    const result = TicketRequestSchema.safeParse({
      ticket_id: "TKT-002",
      complaint: "Help",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty complaint", () => {
    const result = TicketRequestSchema.safeParse({
      ticket_id: "TKT-003",
      complaint: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing ticket_id", () => {
    const result = TicketRequestSchema.safeParse({
      complaint: "Something",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty transaction_history (defaulted)", () => {
    const result = TicketRequestSchema.safeParse({
      ticket_id: "TKT-004",
      complaint: "Issue",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.transaction_history).toEqual([]);
    }
  });

  it("rejects invalid transaction type", () => {
    const result = TicketRequestSchema.safeParse({
      ticket_id: "TKT-005",
      complaint: "Issue",
      transaction_history: [
        {
          transaction_id: "TXN-005",
          type: "INVALID_TYPE",
          amount: 100,
          status: "completed",
          timestamp: "2026-06-25T10:00:00Z",
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = TicketRequestSchema.safeParse({
      ticket_id: "TKT-006",
      complaint: "Issue",
      transaction_history: [
        {
          transaction_id: "TXN-006",
          type: "send_money",
          amount: -100,
          status: "completed",
          timestamp: "2026-06-25T10:00:00Z",
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe("Schema: Response", () => {
  it("accepts a valid response", () => {
    const result = TicketResponseSchema.safeParse({
      ticket_id: "TKT-001",
      case_type: "payment_failed",
      department: "payments_and_transactions",
      severity: "high",
      evidence_verdict: "consistent",
      relevant_transaction_id: "TXN-001",
      human_review_required: true,
      agent_summary: "Summary text",
      recommended_next_action: "Action text",
      customer_reply: "Reply text",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null relevant_transaction_id", () => {
    const result = TicketResponseSchema.safeParse({
      ticket_id: "TKT-002",
      case_type: "other",
      department: "customer_support",
      severity: "low",
      evidence_verdict: "insufficient_data",
      relevant_transaction_id: null,
      human_review_required: false,
      agent_summary: "Summary",
      recommended_next_action: "Action",
      customer_reply: "Reply",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid enum values", () => {
    const result = TicketResponseSchema.safeParse({
      ticket_id: "TKT-003",
      case_type: "Phishing", // wrong casing
      department: "customer_support",
      severity: "low",
      evidence_verdict: "consistent",
      relevant_transaction_id: null,
      human_review_required: false,
      agent_summary: "Summary",
      recommended_next_action: "Action",
      customer_reply: "Reply",
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown severity", () => {
    const result = TicketResponseSchema.safeParse({
      ticket_id: "TKT-004",
      case_type: "other",
      department: "customer_support",
      severity: "extreme", // not in enum
      evidence_verdict: "consistent",
      relevant_transaction_id: null,
      human_review_required: false,
      agent_summary: "Summary",
      recommended_next_action: "Action",
      customer_reply: "Reply",
    });
    expect(result.success).toBe(false);
  });
});

describe("Enums", () => {
  it("CaseType has all expected values", () => {
    const values = CaseType.options;
    expect(values).toContain("phishing_or_social_engineering");
    expect(values).toContain("duplicate_payment");
    expect(values).toContain("payment_failed");
    expect(values).toContain("refund_request");
    expect(values).toContain("other");
    expect(values).toHaveLength(8);
  });

  it("EvidenceVerdict has all expected values", () => {
    const values = EvidenceVerdict.options;
    expect(values).toContain("consistent");
    expect(values).toContain("inconsistent");
    expect(values).toContain("insufficient_data");
  });

  it("Department has all expected values", () => {
    const values = Department.options;
    expect(values).toContain("fraud_and_security");
    expect(values).toContain("payments_and_transactions");
    expect(values).toContain("agent_operations");
    expect(values).toContain("merchant_services");
    expect(values).toContain("customer_support");
    expect(values).toContain("refunds_and_adjustments");
  });

  it("Severity has all expected values", () => {
    const values = Severity.options;
    expect(values).toContain("low");
    expect(values).toContain("medium");
    expect(values).toContain("high");
    expect(values).toContain("critical");
  });

  it("CaseType rejects wrong casing", () => {
    const result = CaseType.safeParse("Payment_Failed");
    expect(result.success).toBe(false);
  });

  it("CaseType rejects pluralizations", () => {
    const result = CaseType.safeParse("payments_failed");
    expect(result.success).toBe(false);
  });

  it("demonstrates how test will be written", () => {
    const cases = [
      { input: "phishing_or_social_engineering", expect: true },
      { input: "Phishing_Or_Social_Engineering", expect: false },
      { input: "payment_failed", expect: true },
      { input: "Payment_failed", expect: false },
    ];
    for (const c of cases) {
      expect(CaseType.safeParse(c.input).success).toBe(c.expect);
    }
  });
});
