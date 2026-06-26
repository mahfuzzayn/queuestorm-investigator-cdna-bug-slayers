# QueueStorm Investigator — Team cDNA_Bug_Slayers

A Next.js (App Router) + TypeScript + zod application for the SUST Hackathon 2026 QueueStorm Preliminary Round. Analyzes mobile financial service (MFS) support tickets — classifies complaint type, cross-references transaction history, assesses severity, routes to the correct department, generates deterministic responses with optional LLM refinement, and provides a full-featured dashboard.

**Live URL:** https://queuestorm-investigator.vercel.app/

---

## Setup

```bash
npm install
cp .env.example .env.local   # configure as needed
npm run dev                   # http://localhost:3000
```

### Environment Variables (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ENABLE_LLM_REFINEMENT` | No | `false` | Set `true` to enable optional LLM polish on text fields |
| `OPENROUTER_API_KEY` | If LLM enabled | — | OpenRouter API key for LLM refinement |
| `LLM_MODEL` | No | `nvidia/llama-3.1-nemotron-70b-instruct:free` | OpenRouter model identifier |

LLM is **disabled by default**. The system scores well with rules-only execution (~500ms response time).

---

## Frontend Dashboard

A single-page dashboard at `/` with neobrutalism design, accessible without any login.

### Features

- **Form / JSON toggle** — switch between structured form input and raw JSON pasting
- **Ticket form** — ticket ID, language, user type, campaign context, complaint text
- **Transaction history** — dynamic rows (ID, type, amount, status, timestamp, counterparty), add/remove rows
- **Quick-load templates** — 10 pre-built sample case buttons that instantly populate the form
- **Two-column layout** — form on the left, results on the right (large screens); stacks on mobile
- **Analysis result display** — verdict, severity, case type, department, confidence %, reason codes, timer, agent summary, next action, customer reply
- **Collapsible raw JSON** — toggle to view the full API response
- **Health link** — top-right button navigates to `/health`
- **Team page** — `/team` with member cards, roles, and GitHub links
- **Footer** — project info + team name link across all pages

### Input Modes

**Form mode:** Fill in structured fields with dynamic transaction rows. Optional fields (language, user_type, campaign_context, counterparty) can be left blank — the analysis works without them.

**JSON mode:** Paste a complete ticket JSON object directly into a monospace textarea. Validates on submit.

---

## API

### `GET /health`

Health check — returns JSON status.

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
  "user_type": "customer",
  "campaign_context": "cashback promo",
  "complaint": "I received a call from someone claiming to be from bKash customer care. They asked me for my OTP and PIN. I gave them the OTP and now money is missing from my account.",
  "transaction_history": [
    {
      "transaction_id": "TXN-001",
      "type": "send_money",
      "amount": 15000,
      "currency": "BDT",
      "status": "completed",
      "timestamp": "2026-06-24T14:30:00Z",
      "counterparty": "019XXXXXXXX"
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
  "evidence_verdict": "consistent",
  "relevant_transaction_id": "TXN-001",
  "human_review_required": true,
  "agent_summary": "Ticket TKT-001 involves a report of a phishing/social engineering attempt. The complaint states that the customer received a call from someone impersonating bKash customer care and was tricked into sharing their OTP and PIN, resulting in a loss of 15,000 BDT. The transaction TXN-001 matches the complaint details (exact amount, send_money type) and shows a completed status. This is classified as a phishing/social engineering case under the fraud and security department with high severity.",
  "recommended_next_action": "Immediately escalate this case to the fraud and security team. Advise the customer to change their PIN and MPIN immediately. Temporarily restrict the account if possible. File a formal dispute for transaction TXN-001. Monitor for any further unauthorized activity. Remind the customer that bKash will never ask for OTP or PIN over the phone.",
  "customer_reply": "Dear Customer,\n\nWe have received your report regarding unauthorized access to your bKash account. Your case has been assigned to our Fraud & Security team for immediate investigation.\n\nFor your security:\n• Do not share your OTP, PIN, or MPIN with anyone\n• bKash will never call and ask for these details\n• Change your PIN and MPIN immediately\n\nWe will investigate transaction TXN-001 and take appropriate action. Any eligible amount will be returned through official channels as per our investigation findings.\n\nIf you notice any further suspicious activity, please contact our customer support immediately.\n\nBest regards,\nbKash Customer Support",
  "confidence": 0.65,
  "reason_codes": [
    "EXACT_AMOUNT_MATCH",
    "TYPE_MATCH",
    "COUNTERPARTY_MATCH",
    "PHISHING_KEYWORDS_DETECTED",
    "EVIDENCE_CONSISTENT"
  ]
}
```

**Optional request fields** (all can be omitted):
- `language` — hint for complaint language
- `user_type` — e.g. "customer", "agent", "merchant"
- `campaign_context` — e.g. "cashback promo", "fee waiver"
- `counterparty` (per transaction) — phone number or merchant name
- `currency` (per transaction) — defaults to "BDT"
- `sender` / `receiver` / `description` / `channel` (per transaction)

**Error responses:** `400` (bad JSON / missing required fields), `422` (invalid data shape), `500` (internal error — no stack traces leaked).

---

## Testing

```bash
npm test                  # run all tests (vitest)
npm run test:watch        # watch mode
```

Test suites:
- `sample-cases.test.ts` — functional equivalence for all 10 public sample cases
- `safety.test.ts` — adversarial: injection, credential bait, refund bait, third-party bait
- `schema.test.ts` — zod round-trip + enum strictness
- `edge-cases.test.ts` — empty history, missing fields, Bangla-only, malformed JSON

---

## Architecture

```
app/
  page.tsx                # Frontend dashboard (client component)
  layout.tsx              # Root layout with footer
  team/page.tsx           # Team page with member cards
  health/route.ts         # GET /health
  analyze-ticket/route.ts # POST /analyze-ticket (thin: parse → orchestrate → respond)

lib/
  site-data.ts            # Centralized project + team data
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

---

## Processing Pipeline

1. **Evidence reasoning** — extract signals (amount, type, counterparty) from complaint text, score against `transaction_history`, determine `relevant_transaction_id` and confidence score
2. **Evidence verdict** — `consistent` / `inconsistent` / `insufficient_data` based on transaction match quality and complaint narrative
3. **Classification** — rule-based keyword matching (EN + BN + Banglish) in priority order: phishing > duplicate_payment > agent_cash_in_issue > merchant_settlement_delay > payment_failed > wrong_transfer > refund_request > other
4. **Severity** — amount thresholds, escalated for phishing / inconsistent verdicts; determines `human_review_required`
5. **Routing** — `case_type` → `department` lookup
6. **Reason codes** — collected from evidence matching, classification triggers, and verdict reasoning (deduplicated)
7. **Confidence** — normalized from match score to 0–1 range
8. **Text generation** — deterministic templates filled with case facts (the default and primary output path)
9. **Safety pipeline** — runs unconditionally on every response (see Safety Logic below)
10. **Optional LLM** — if `ENABLE_LLM_REFINEMENT=true`, calls OpenRouter to polish `agent_summary` / `customer_reply`; 4s timeout, fails safe to rule text; LLM output re-filtered through safety pipeline

---

## MODELS

| Component | Model / Engine | Location | Why chosen |
|-----------|---------------|----------|------------|
| Classification | Rules + keyword lexicons (EN, BN, Banglish) | `lib/classification/` | Fast (~500ms total), deterministic, no API dependency; handles all 7 case types + fallback |
| Evidence matching | Weighted scoring algorithm | `lib/evidence/` | Simple weighted scoring — no ML needed for transaction ↔ complaint matching |
| Safety pipeline | Regex + replacement rules | `lib/safety/` | Runs unconditionally; must be deterministic and auditable |
| Text generation | Template-based | `lib/text/` | Zero-latency fallback; produces spec-compliant output without any external call |
| LLM refinement (optional) | OpenRouter — `nvidia/llama-3.1-nemotron-70b-instruct:free` | `lib/llm/` | Free tier; used only for tone polish on text fields; disabled by default; 4s timeout with silent fallback to rule text |

The system is designed to score well with rules-only execution (LLM disabled). The LLM layer is a caged optional enhancement — it never touches structured fields, never gates correctness, and its output is always re-validated through the safety pipeline.

**Recommendation:** Keep LLM disabled for judging. Rules-only response time is ~500ms. Enabling LLM adds 4s+ latency with no scoring benefit (only cosmetic text polish).

---

## Safety Logic

The safety pipeline is the last step before response emission and runs unconditionally on ALL responses, regardless of whether the LLM path was used:

1. **Injection guard** runs first — detects and neutralizes embedded directives in complaint text (patterns like "ignore previous instructions", "system:", role-play overrides). Complaint text is treated as **data only**, never as instructions.
2. **Credential filter** scans generated text for any OTP/PIN/password/card-number solicitation patterns, including indirect phrasing ("please confirm your one-time code"). Respects negation context — warnings like "do not share your OTP" are preserved. If detected in a draft, strips/replaces with safe equivalents.
3. **Promise filter** catches and replaces any unauthorized refund, unblock, or approval language ("we will refund you", "your account is unblocked", "approved") with spec-compliant phrasing: *"any eligible amount will be returned through official channels"*.
4. **Third-party filter** ensures all contact instructions reference only official support channels — bans redirection to non-official contacts.

The pipeline runs identically on both rule-generated and LLM-refined text — no shortcuts for LLM output.

---

## Data

This repository contains **no real customer data**. All sample cases in `data/QueueStorm_Preli_Sample_Cases.json` are synthetic examples created for testing and demonstration purposes.

---

## Deliverables

- `public-sample-output/sample-output.json` — real output from processing a public sample case
- `.env.example` — environment variable template
- All test files in `__tests__/` (sample cases, safety, schema, edge cases)

---

## Known Limitations

- Amount extraction from Bengali numerals may miss edge-case formatting (e.g. mixed Bengali/Arabic numerals)
- Classification thresholds are tuned for the provided sample set; borderline or adversarial inputs may need adjustment
- LLM refinement (if enabled) depends on OpenRouter free tier availability and adds ~4s latency
- No rate limiting implemented (add if deploying publicly)
- Frontend is a demo/judge-convenience surface — not scored, core API is the graded artifact
- Confidence and reason_codes are approximations based on match scores and rule triggers; not a probabilistic model

---

## Team

**cDNA_Bug_Slayers** — SUST Hackathon 2026

| Member | Role |
|--------|------|
| Mushfique Raiyan | Team Leader |
| Mahfuz Zayn | Engineer 2 |
| Md. Rabbi Islam | Engineer 3 |

See `/team` page for details and GitHub links.
