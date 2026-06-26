import { describe, it, expect } from "vitest";
import { orchestrator } from "@/lib/orchestrator";
import sampleCases from "../data/QueueStorm_Preli_Sample_Cases.json";

describe("Sample Cases — Functional Equivalence", () => {
  it.each(sampleCases)("$ticket_id: runs without error", async (sample) => {
    const response = await orchestrator(sample as any);

    expect(response.ticket_id).toBe(sample.ticket_id);
    expect(response.case_type).toBeDefined();
    expect(response.department).toBeDefined();
    expect(response.severity).toBeDefined();
    expect(response.evidence_verdict).toBeDefined();
    expect(typeof response.human_review_required).toBe("boolean");
    expect(typeof response.agent_summary).toBe("string");
    expect(response.agent_summary.length).toBeGreaterThan(0);
    expect(typeof response.recommended_next_action).toBe("string");
    expect(response.recommended_next_action.length).toBeGreaterThan(0);
    expect(typeof response.customer_reply).toBe("string");
    expect(response.customer_reply.length).toBeGreaterThan(0);

    // Key assertions per case_type
    const assertions: Record<string, { verdict?: string; caseType?: string }> = {
      "TKT-001": { caseType: "phishing_or_social_engineering" },
      "TKT-002": { caseType: "duplicate_payment" },
      "TKT-003": { caseType: "agent_cash_in_issue" },
      "TKT-004": { caseType: "merchant_settlement_delay" },
      "TKT-005": { caseType: "payment_failed" },
      "TKT-006": { caseType: "wrong_transfer" },
      "TKT-007": { caseType: "refund_request" },
      "TKT-008": { caseType: "other" },
    };

    const assertion = assertions[response.ticket_id];
    if (assertion) {
      if (assertion.caseType) {
        expect(response.case_type).toBe(assertion.caseType);
      }
    }

    // Safety: customer_reply must not contain credential solicitations
    expect(response.customer_reply.toLowerCase()).not.toContain("please provide your otp");
    expect(response.customer_reply.toLowerCase()).not.toContain("please share your pin");
  });

  it("TKT-001 identifies as phishing", async () => {
    const sample = sampleCases.find((s) => s.ticket_id === "TKT-001")!;
    const response = await orchestrator(sample as any);
    expect(response.case_type).toBe("phishing_or_social_engineering");
    expect(response.department).toBe("fraud_and_security");
    expect(response.severity).toBe("high");
    expect(response.human_review_required).toBe(true);
  });

  it("TKT-005 failed payment returns consistent with matched failed transaction", async () => {
    const sample = sampleCases.find((s) => s.ticket_id === "TKT-005")!;
    const response = await orchestrator(sample as any);
    expect(response.case_type).toBe("payment_failed");
    expect(response.evidence_verdict).toBe("consistent");
    expect(response.relevant_transaction_id).toBe("TXN-005");
  });

  it("TKT-009 (no history) returns insufficient_data", async () => {
    const sample = sampleCases.find((s) => s.ticket_id === "TKT-009")!;
    const response = await orchestrator(sample as any);
    expect(response.evidence_verdict).toBe("insufficient_data");
    expect(response.relevant_transaction_id).toBeNull();
  });

  it("TKT-008 (unauthorized transaction) classifies as other", async () => {
    const sample = sampleCases.find((s) => s.ticket_id === "TKT-008")!;
    const response = await orchestrator(sample as any);
    expect(response.case_type).toBe("other");
  });
});
