# QueueStorm Investigator — Team cDNA Bug Slayers

A Next.js (App Router) + TypeScript + zod API service for the SUST Hackathon 2026 QueueStorm Preliminary Round. Analyzes mobile financial service (MFS) support tickets — classifies complaint type, cross-references transaction history, assesses severity, routes to the correct department, and generates deterministic responses with optional LLM refinement.

**Live URL:** (deploy to Vercel and add here)

---

## Setup

```bash
npm install
cp .env.example .env.local   # configure as needed
npm run dev                   # http://localhost:3000
```

## API

### `GET /health`

Health check.

```json
{ "status": "ok" }
```

### `POST /analyze-ticket`

Analyze a support ticket.

**Request:**

```json
{
  "ticket_id": "TKT-001",
  "language": "en",
  "complaint": "I received a call asking for my OTP...",
  "transaction_history": [
    {
      "transaction_id": "TXN-001",
      "type": "send_money",
      "amount": 5000,
      "currency": "BDT",
      "status": "completed",
      "timestamp": "2026-06-25T10:00:00Z"
    }
  ]
}
```

**Response:**

```json
{
  "ticket_id": "TKT-001",
  "case_type": "phishing_or_social_engineering",
  "department": "fraud_and_security",
  "severity": "high",
  "evidence_verdict": "insufficient_data",
  "relevant_transaction_id": null,
  "human_review_required": true,
  "agent_summary": "Ticket TKT-001: possible phishing / social engineering attempt...",
  "recommended_next_action": "Immediately escalate to the fraud and security team...",
  "customer_reply": "Dear Customer,\n\nWe have received your report..."
}
```

**Error responses:** `400` (bad JSON / missing required fields), `422` (invalid data shape), `500` (internal error — no stack traces leaked).

## Testing

```bash
npm test                  # run all tests
npm run test:watch        # watch mode
```

## Architecture

```
app/
  health/route.ts         # GET /health
  analyze-ticket/route.ts # POST /analyze-ticket (thin: parse → orchestrate → respond)

lib/
  schema/                 # zod request/response schemas + enums
  evidence/               # transaction matching + verdict logic
  classification/         # case_type classifier + severity rules
  routing/                # case_type → department mapping
  safety/                 # credential/promise/third-party/injection filters
  text/                   # deterministic template-based text generation
  llm/                    # optional OpenRouter refinement (disabled by default)
  orchestrator.ts         # single entry point: evidence → classify → route → generate → safety
  errors.ts               # typed error → HTTP status mapping
```

## Processing Pipeline

1. **Evidence reasoning** — extract signals (amount, type, counterparty) from complaint text, score against transaction_history, determine relevant_transaction_id
2. **Evidence verdict** — consistent / inconsistent / insufficient_data based on transaction match quality and complaint narrative
3. **Classification** — rule-based keyword matching (EN + BN + Banglish) in priority order: phishing > duplicate_payment > agent_cash_in_issue > merchant_settlement_delay > payment_failed > wrong_transfer > refund_request > other
4. **Severity** — amount thresholds, escalated for phishing / inconsistent verdicts
5. **Routing** — case_type → department lookup
6. **Text generation** — deterministic templates filled with case facts (the default and primary output path)
7. **Safety pipeline** — runs unconditionally on every response:
   - Credential filter: strips OTP/PIN/password solicitation patterns (with negation guard — warnings like "do not share your OTP" are preserved)
   - Unauthorized promise filter: replaces refund/unblock/approval guarantees with safe phrasing
   - Third-party redirect filter: ensures only official support channels are referenced
   - Injection guard: detects embedded directives in complaint text
8. **Optional LLM** — if `ENABLE_LLM_REFINEMENT=true`, calls OpenRouter to polish agent_summary / customer_reply; 4s timeout, fails safe to rule text; LLM output re-filtered through safety pipeline

## MODELS

| Component | Model / Engine | Location | Why chosen |
|-----------|---------------|----------|------------|
| Classification | Rules + keyword lexicons (EN, BN, Banglish) | `lib/classification/` | Fast, deterministic, no API dependency; handles all 7 case types + fallback |
| Evidence matching | Scoring algorithm | `lib/evidence/` | Simple weighted scoring — no ML needed for transaction ↔ complaint matching |
| Safety pipeline | Regex + replacement rules | `lib/safety/` | Runs unconditionally; must be deterministic and auditable |
| Text generation | Template-based | `lib/text/` | Zero-latency fallback; produces spec-compliant output without any external call |
| LLM refinement (optional) | OpenRouter — `nvidia/llama-3.1-nemotron-70b-instruct:free` | `lib/llm/` | Free tier; used only for tone polish on text fields; disabled by default; 4s timeout with silent fallback to rule text |

The system is designed to score well with rules-only execution (LLM disabled). The LLM layer is a caged optional enhancement — it never touches structured fields, never gates correctness, and its output is always re-validated through the safety pipeline.

## Known Limitations

- Amount extraction from Bengali numerals may miss edge-case formatting
- Classification thresholds may need tuning for borderline cases
- LLM refinement (if enabled) depends on OpenRouter free tier availability and latency
- No rate limiting implemented (add if deploying publicly)

## Safety Logic

The safety pipeline is the last step before response emission and runs unconditionally on ALL responses, regardless of whether the LLM path was used:

1. **Injection guard** runs first — detects embedded directives in complaint text (but preserves text for classification context)
2. **Credential filter** scans generated text for any OTP/PIN/password/card-number solicitation, respecting negation context (warnings like "do not share your OTP" are safe)
3. **Promise filter** catches and replaces any unauthorized refund, unblock, or approval language with spec-compliant phrasing
4. **Third-party filter** ensures all contact instructions reference only official support channels

## Data

This repository contains **no real customer data**. All sample cases in `data/QueueStorm_Preli_Sample_Cases.json` are synthetic examples created for testing and demonstration purposes.

## Deliverables

- `public-sample-output/sample-output.json` — real output from processing a public sample case
- `.env.example` — environment variable template
- All test files in `__tests__/`

## Team

**cDNA Bug Slayers** — SUST Hackathon 2026
