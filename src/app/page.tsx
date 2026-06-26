"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import {
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  ChevronDown,
  Ticket,
  Sparkles,
  Terminal,
  Eye,
  EyeOff,
  HeartPulse,
  Clock,
  FileJson,
  FileText,
  Zap,
  User,
  Megaphone,
  Building2,
  BarChart3,
  ListChecks,
} from "lucide-react";

// ─── Utility ───────────────────────────────────────

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── Mac Window Dots (decorative) ───────────────────

function MacWindowDots() {
  return (
    <div className="absolute -top-[1px] -left-[1px] flex items-center gap-[5px] px-3 py-[9px] sm:px-4 sm:py-[11px]">
      <span className="h-[10px] w-[10px] rounded-full border border-black/20 bg-[#ff5f57] sm:h-3 sm:w-3" />
      <span className="h-[10px] w-[10px] rounded-full border border-black/20 bg-[#febc2e] sm:h-3 sm:w-3" />
      <span className="h-[10px] w-[10px] rounded-full border border-black/20 bg-[#28c840] sm:h-3 sm:w-3" />
    </div>
  );
}

// ─── Neobrutalism UI Primitives ────────────────────

function NeoCard({
  className,
  children,
  hover = false,
  macDots = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
  macDots?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative border-2 border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)]",
        "shadow-neo",
        "transition-[box-shadow,transform] duration-150 ease",
        hover && "press-inner",
        macDots && "pt-[34px] sm:pt-[38px]",
        className,
      )}
      {...props}
    >
      {macDots && <MacWindowDots />}
      {children}
    </div>
  );
}

function NeoCardHeader({
  className,
  children,
  macDots = false,
}: React.HTMLAttributes<HTMLDivElement> & { macDots?: boolean }) {
  return (
    <div
      className={cn(
        "relative border-b-2 border-[var(--border)] px-5 py-4 sm:px-6 sm:py-5",
        macDots && "pt-[34px] sm:pt-[38px]",
        className,
      )}
    >
      {macDots && <MacWindowDots />}
      {children}
    </div>
  );
}

function NeoCardTitle({
  className,
  children,
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-extrabold text-lg uppercase tracking-tight sm:text-xl",
        className,
      )}
    >
      {children}
    </h3>
  );
}

function NeoCardContent({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-5 py-4 sm:px-6 sm:py-5", className)}>
      {children}
    </div>
  );
}

function NeoInput({
  className,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { id?: string }) {
  return (
    <input
      id={id}
      className={cn(
        "block h-11 w-full border-2 border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm font-bold text-[var(--foreground)]",
        "placeholder:text-[var(--muted-foreground)] placeholder:font-normal",
        "focus:border-[var(--accent)] focus:shadow-[2px_2px_0px_0px_var(--accent)] focus:outline-none",
        "transition-[box-shadow,border-color] duration-120 ease",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--muted)]",
        className,
      )}
      {...props}
    />
  );
}

function NeoTextarea({
  className,
  id,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { id?: string }) {
  return (
    <textarea
      id={id}
      className={cn(
        "block min-h-[120px] w-full border-2 border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm font-bold text-[var(--foreground)]",
        "placeholder:text-[var(--muted-foreground)] placeholder:font-normal",
        "focus:border-[var(--accent)] focus:shadow-[2px_2px_0px_0px_var(--accent)] focus:outline-none",
        "transition-[box-shadow,border-color] duration-120 ease",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--muted)]",
        "resize-y",
        className,
      )}
      {...props}
    />
  );
}

function NeoSelect({
  className,
  id,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { id?: string }) {
  return (
    <div className="relative">
      <select
        id={id}
        className={cn(
          "block h-11 w-full appearance-none border-2 border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 pr-9 text-sm font-bold text-[var(--foreground)]",
          "focus:border-[var(--accent)] focus:shadow-[2px_2px_0px_0px_var(--accent)] focus:outline-none",
          "transition-[box-shadow,border-color] duration-120 ease",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
    </div>
  );
}

function NeoLabel({
  className,
  children,
  htmlFor,
  required,
}: {
  className?: string;
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]",
        className,
      )}
    >
      {children}
      {required && (
        <span className="ml-1 text-[var(--destructive)]">*</span>
      )}
    </label>
  );
}

function NeoButton({
  className,
  variant = "primary",
  loading,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "accent" | "outline" | "ghost" | "danger";
  loading?: boolean;
}) {
  const variants: Record<string, string> = {
    primary:
      "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--border)] hover:bg-[#2a2a2a]",
    accent:
      "bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--border)] hover:bg-[#e6c200]",
    outline:
      "bg-transparent text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--muted)]",
    ghost:
      "bg-transparent text-[var(--foreground)] border-transparent hover:bg-[var(--muted)]",
    danger:
      "bg-[var(--destructive)] text-[var(--destructive-foreground)] border-[var(--destructive)] hover:bg-[#c0392b]",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 border-2 px-5 py-2.5 text-sm font-bold uppercase tracking-wide",
        "shadow-neo-sm press-inner",
        "disabled:pointer-events-none disabled:opacity-40",
        variants[variant],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {!loading && children}
    </button>
  );
}

function NeoBadge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center border-2 border-[var(--border)] px-3 py-1 text-xs font-bold uppercase tracking-wider",
        className,
      )}
    >
      {children}
    </span>
  );
}

// ─── Types ─────────────────────────────────────────

interface TransactionRow {
  transaction_id: string;
  type: string;
  amount: string;
  status: string;
  timestamp: string;
  counterparty: string;
}

interface ApiResponse {
  ticket_id: string;
  case_type: string;
  department: string;
  severity: string;
  evidence_verdict: string;
  relevant_transaction_id: string | null;
  human_review_required: boolean;
  agent_summary: string;
  recommended_next_action: string;
  customer_reply: string;
  confidence?: number;
  reason_codes?: string[];
}

interface ApiError {
  error: string;
  details?: { field: string; message: string }[];
}

interface TicketTemplate {
  label: string;
  ticket_id: string;
  language: string;
  complaint: string;
  transaction_history: {
    transaction_id: string;
    type: string;
    amount: number;
    status: string;
    timestamp: string;
  }[];
}

// ─── Constants ─────────────────────────────────────

const SEVERITY_STYLES: Record<string, string> = {
  low: "bg-[var(--info)] text-white",
  medium: "bg-[var(--warning)] text-black",
  high: "bg-orange-500 text-white",
  critical: "bg-[var(--destructive)] text-white",
};

const VERDICT_STYLES: Record<string, string> = {
  consistent: "bg-[var(--success)] text-white",
  inconsistent: "bg-[var(--destructive)] text-white",
  insufficient_data: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const YELLOW_BADGE = "bg-[var(--accent)] text-black";

const CASE_TYPE_LABELS: Record<string, string> = {
  phishing_or_social_engineering: "Phishing",
  duplicate_payment: "Duplicate Payment",
  agent_cash_in_issue: "Agent Cash-in Issue",
  merchant_settlement_delay: "Merchant Settlement",
  payment_failed: "Payment Failed",
  wrong_transfer: "Wrong Transfer",
  refund_request: "Refund Request",
  other: "Other",
};

const DEPARTMENT_LABELS: Record<string, string> = {
  fraud_and_security: "Fraud & Security",
  payments_and_transactions: "Payments & Transactions",
  agent_operations: "Agent Operations",
  merchant_services: "Merchant Services",
  settlement_and_reconciliation: "Settlement & Reconciliation",
  customer_support: "Customer Support",
  refunds_and_adjustments: "Refunds & Adjustments",
};

const TX_TYPES = [
  { value: "send_money", label: "Send Money" },
  { value: "cash_in", label: "Cash In" },
  { value: "cash_out", label: "Cash Out" },
  { value: "payment", label: "Payment" },
  { value: "refund", label: "Refund" },
  { value: "transfer", label: "Transfer" },
];

const TX_STATUSES = [
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "disputed", label: "Disputed" },
  { value: "reversed", label: "Reversed" },
];

const EMPTY_TX: TransactionRow = {
  transaction_id: "",
  type: "send_money",
  amount: "",
  status: "completed",
  timestamp: "",
  counterparty: "",
};

// ─── Sample Templates ──────────────────────────────

const TICKET_TEMPLATES: TicketTemplate[] = [
  {
    label: "Phishing Call",
    ticket_id: "TKT-001",
    language: "en",
    complaint:
      "I received a call from someone claiming to be from bKash customer care. They asked me for my OTP and PIN. I gave them the OTP and now money is missing from my account.",
    transaction_history: [
      {
        transaction_id: "TXN-001",
        type: "send_money",
        amount: 15000,
        status: "completed",
        timestamp: "2026-06-24T14:30:00Z",
      },
    ],
  },
  {
    label: "Duplicate Deduction",
    ticket_id: "TKT-002",
    language: "bn",
    complaint:
      "আমার একাউন্ট থেকে দুইবার টাকা কেটেছে। আমি ৫০০০ টাকা পাঠিয়েছিলাম কিন্তু দুইবার কেটে গেছে।",
    transaction_history: [
      {
        transaction_id: "TXN-002a",
        type: "send_money",
        amount: 5000,
        status: "completed",
        timestamp: "2026-06-25T10:00:00Z",
      },
      {
        transaction_id: "TXN-002b",
        type: "send_money",
        amount: 5000,
        status: "completed",
        timestamp: "2026-06-25T10:01:00Z",
      },
    ],
  },
  {
    label: "Agent Cash-in",
    ticket_id: "TKT-003",
    language: "en",
    complaint:
      "I went to an agent to deposit 2000 taka into my bKash account. The agent took my cash but the money never arrived in my account.",
    transaction_history: [
      {
        transaction_id: "TXN-003",
        type: "cash_in",
        amount: 2000,
        status: "pending",
        timestamp: "2026-06-26T09:00:00Z",
      },
    ],
  },
  {
    label: "Merchant Settlement",
    ticket_id: "TKT-004",
    language: "en",
    complaint:
      "As a merchant, I have not received my settlement payment for the last 3 days. My customers have paid but the money is not showing in my merchant account.",
    transaction_history: [
      {
        transaction_id: "TXN-004",
        type: "payment",
        amount: 35000,
        status: "completed",
        timestamp: "2026-06-23T16:00:00Z",
      },
    ],
  },
  {
    label: "Failed Payment",
    ticket_id: "TKT-005",
    language: "en",
    complaint:
      "I tried to send 2500 taka to my friend but the transaction failed. However, the money was deducted from my account balance.",
    transaction_history: [
      {
        transaction_id: "TXN-005",
        type: "send_money",
        amount: 2500,
        status: "failed",
        timestamp: "2026-06-26T11:30:00Z",
      },
    ],
  },
  {
    label: "Wrong Transfer",
    ticket_id: "TKT-006",
    language: "en",
    complaint:
      "I sent 10000 taka to a wrong number by mistake. I misdialed one digit and now the money went to someone else. Please help me get it back.",
    transaction_history: [
      {
        transaction_id: "TXN-006",
        type: "send_money",
        amount: 10000,
        status: "completed",
        timestamp: "2026-06-26T08:15:00Z",
      },
    ],
  },
  {
    label: "Refund Request",
    ticket_id: "TKT-007",
    language: "en",
    complaint:
      "I would like to request a refund for a payment I made to a merchant. The product was not delivered and I want my money back.",
    transaction_history: [
      {
        transaction_id: "TXN-007",
        type: "payment",
        amount: 8000,
        status: "completed",
        timestamp: "2026-06-20T14:00:00Z",
      },
    ],
  },
  {
    label: "Unauthorized TX",
    ticket_id: "TKT-008",
    language: "bn",
    complaint:
      "আমার bKash অ্যাকাউন্ট থেকে ৭০০০ টাকা কেটে গেছে কিন্তু আমি কোনো ট্রানজেকশন করিনি। আমি কিছু কিনিনি বা কাউকে টাকা পাঠাইনি। দয়া করে আমার টাকা ফেরত দিন।",
    transaction_history: [
      {
        transaction_id: "TXN-008",
        type: "send_money",
        amount: 7000,
        status: "completed",
        timestamp: "2026-06-24T19:00:00Z",
      },
    ],
  },
  {
    label: "Just Checking",
    ticket_id: "TKT-009",
    language: "en",
    complaint: "I am just checking my account balance. Everything seems fine.",
    transaction_history: [],
  },
  {
    label: "ATM Cash-out",
    ticket_id: "TKT-010",
    language: "en",
    complaint:
      "Yesterday I tried to cash out 15000 taka from an ATM but the machine dispensed less money. It showed successful on screen but I only got 14000.",
    transaction_history: [
      {
        transaction_id: "TXN-010",
        type: "cash_out",
        amount: 15000,
        status: "completed",
        timestamp: "2026-06-25T13:00:00Z",
      },
    ],
  },
];

const JSON_TEMPLATE = JSON.stringify(
  {
    ticket_id: "TKT-001",
    language: "en",
    complaint: "Describe the issue here...",
    transaction_history: [
      {
        transaction_id: "TXN-001",
        type: "send_money",
        amount: 5000,
        status: "completed",
        timestamp: "2026-06-25T10:00:00Z",
      },
    ],
  },
  null,
  2,
);

const CONFIDENCE_COLOR: Record<string, string> = {
  high: "bg-[var(--success)] text-white",
  medium: "bg-[var(--warning)] text-black",
  low: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

// ─── Health Link ───────────────────────────────────

function HealthLink() {
  return (
    <Link
      href="/health"
      target="_blank"
      className={cn(
        "inline-flex items-center gap-2 border-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider",
        "shadow-neo-sm press-inner",
        "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)]",
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success)] opacity-40" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--success)]" />
      </span>
      <HeartPulse className="h-3.5 w-3.5" />
      Health
    </Link>
  );
}

// ─── JSON Output ───────────────────────────────────

function JsonOutput({ data }: { data: Record<string, unknown> }) {
  const [open, setOpen] = useState(false);

  return (
    <NeoCard macDots>
      <NeoCardHeader>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Terminal className="h-5 w-5 shrink-0" />
            <NeoCardTitle className="text-sm sm:text-base">
              Raw JSON Response
            </NeoCardTitle>
          </div>
          {open ? (
            <EyeOff className="h-4 w-4 text-[var(--muted-foreground)]" />
          ) : (
            <Eye className="h-4 w-4 text-[var(--muted-foreground)]" />
          )}
        </button>
      </NeoCardHeader>
      {open && (
        <NeoCardContent>
          <pre className="overflow-x-auto rounded border-2 border-[var(--input-border)] bg-[#fafaf5] p-4 text-xs leading-relaxed">
            <code>{JSON.stringify(data, null, 2)}</code>
          </pre>
        </NeoCardContent>
      )}
    </NeoCard>
  );
}

// ─── Page ──────────────────────────────────────────

export default function DashboardPage() {
  const [ticketId, setTicketId] = useState("");
  const [complaint, setComplaint] = useState("");
  const [language, setLanguage] = useState("");
  const [userType, setUserType] = useState("");
  const [campaignContext, setCampaignContext] = useState("");
  const [transactions, setTransactions] = useState<TransactionRow[]>([
    { ...EMPTY_TX },
  ]);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [rawJson, setRawJson] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputMode, setInputMode] = useState<"form" | "json">("form");
  const [jsonInput, setJsonInput] = useState(JSON_TEMPLATE);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const startTime = useRef<number>(0);
  // Keep previous response visible while loading to avoid UI glitch
  const [prevResponse, setPrevResponse] = useState<ApiResponse | null>(null);
  const [prevRawJson, setPrevRawJson] = useState<Record<string, unknown> | null>(null);
  const [prevElapsedMs, setPrevElapsedMs] = useState<number | null>(null);

  function fillTemplate(tpl: TicketTemplate) {
    setTicketId(tpl.ticket_id);
    setComplaint(tpl.complaint);
    setLanguage(tpl.language);
    setUserType("");
    setCampaignContext("");
    setTransactions(
      tpl.transaction_history.length > 0
        ? tpl.transaction_history.map((tx) => ({
            transaction_id: tx.transaction_id,
            type: tx.type,
            amount: String(tx.amount),
            status: tx.status,
            timestamp: tx.timestamp,
            counterparty: "",
          }))
        : [{ ...EMPTY_TX }],
    );
    setInputMode("form");
  }

  function addTransaction() {
    setTransactions([...transactions, { ...EMPTY_TX }]);
  }

  function updateTransaction(
    index: number,
    field: keyof TransactionRow,
    value: string,
  ) {
    setTransactions(
      transactions.map((t, i) => (i === index ? { ...t, [field]: value } : t)),
    );
  }

  function removeTransaction(index: number) {
    const next = transactions.filter((_, i) => i !== index);
    setTransactions(next.length === 0 ? [{ ...EMPTY_TX }] : next);
  }

  async function submitBody(body: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    setElapsedMs(null);
    // Don't clear response here — keep previous visible while loading
    startTime.current = performance.now();

    try {
      const res = await fetch("/analyze-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      const ms = Math.round(performance.now() - startTime.current);
      setElapsedMs(ms);
      setRawJson(data);
      if (!res.ok) {
        setResponse(null);
        setPrevResponse(null);
        setError(data as ApiError);
      } else {
        setResponse(data as ApiResponse);
        setPrevResponse(null);
      }
    } catch {
      const ms = Math.round(performance.now() - startTime.current);
      setElapsedMs(ms);
      setError({ error: "Unable to reach the server. Is it running?" });
    } finally {
      setLoading(false);
    }
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Save current response as previous so it stays visible during loading
    if (response) {
      setPrevResponse(response);
      setPrevRawJson(rawJson);
      setPrevElapsedMs(elapsedMs);
    }
    setResponse(null);
    setRawJson(null);

    const validTxns = transactions.filter(
      (t) => t.transaction_id.trim() && t.amount.trim(),
    );
    const body: Record<string, unknown> = {
      ticket_id: ticketId.trim(),
      complaint: complaint.trim(),
    };
    if (language.trim()) body.language = language.trim();
    if (userType.trim()) body.user_type = userType.trim();
    if (campaignContext.trim()) body.campaign_context = campaignContext.trim();
    if (validTxns.length > 0) {
      body.transaction_history = validTxns.map((t) => {
        const entry: Record<string, unknown> = {
          transaction_id: t.transaction_id.trim(),
          type: t.type,
          amount: parseFloat(t.amount) || 0,
          status: t.status,
          timestamp: t.timestamp || new Date().toISOString(),
        };
        if (t.counterparty.trim()) entry.counterparty = t.counterparty.trim();
        return entry;
      });
    }
    await submitBody(body);
  }

  async function handleJsonSubmit() {
    try {
      const parsed = JSON.parse(jsonInput);
      if (response) {
        setPrevResponse(response);
        setPrevRawJson(rawJson);
        setPrevElapsedMs(elapsedMs);
      }
      setResponse(null);
      setRawJson(null);
      await submitBody(parsed);
    } catch {
      setError({ error: "Invalid JSON. Please check your input." });
    }
  }

  const hasErrors =
    error &&
    error.details &&
    error.details.length > 0;

  // Determine what to show in the results column
  const displayResponse = response || prevResponse;
  const displayRawJson = rawJson || prevRawJson;
  const displayElapsedMs = elapsedMs ?? prevElapsedMs;

  // ── Templates row ──
  const templatesRow = (
    <div className="mb-5">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
        Quick load
      </p>
      <div className="flex flex-wrap gap-1.5">
        {TICKET_TEMPLATES.map((tpl) => (
          <button
            key={tpl.ticket_id}
            type="button"
            onClick={() => fillTemplate(tpl)}
            className={cn(
              "inline-flex items-center gap-1 border-2 border-[var(--border)] px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
              "shadow-neo-sm press-inner transition-all duration-150",
              "bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
            )}
          >
            <Zap className="h-2.5 w-2.5 shrink-0" />
            {tpl.label}
          </button>
        ))}
      </div>
    </div>
  );

  // ── Input mode toggle ──
  const modeToggle = (
    <div className="mb-5 flex gap-1.5">
      <button
        type="button"
        onClick={() => setInputMode("form")}
        className={cn(
          "inline-flex items-center gap-1.5 border-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-150",
          inputMode === "form"
            ? "border-[var(--border)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-neo-sm"
            : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)]",
        )}
      >
        <FileText className="h-3.5 w-3.5" />
        Form
      </button>
      <button
        type="button"
        onClick={() => setInputMode("json")}
        className={cn(
          "inline-flex items-center gap-1.5 border-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-150",
          inputMode === "json"
            ? "border-[var(--border)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-neo-sm"
            : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)]",
        )}
      >
        <FileJson className="h-3.5 w-3.5" />
        JSON
      </button>
    </div>
  );

  // ── Form ──
  const formSection = inputMode === "form" && (
    <form onSubmit={handleFormSubmit} className="space-y-6 sm:space-y-8">
      {/* Ticket Details */}
      <NeoCard macDots>
        <NeoCardHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 shrink-0" />
            <NeoCardTitle>Ticket Details</NeoCardTitle>
          </div>
        </NeoCardHeader>
        <NeoCardContent className="space-y-5">
          {templatesRow}
          <div>
            <NeoLabel htmlFor="ticketId" required>
              Ticket ID
            </NeoLabel>
            <NeoInput
              id="ticketId"
              placeholder="e.g. TKT-001"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              required
            />
          </div>
          <div>
            <NeoLabel htmlFor="language">Language</NeoLabel>
            <NeoInput
              id="language"
              placeholder="en, bn, or leave blank"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <NeoLabel htmlFor="userType">
                <span className="inline-flex items-center gap-1">
                  <User className="h-3 w-3" />
                  User Type
                </span>
              </NeoLabel>
              <NeoInput
                id="userType"
                placeholder="e.g. customer, agent, merchant"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
              />
            </div>
            <div>
              <NeoLabel htmlFor="campaignContext">
                <span className="inline-flex items-center gap-1">
                  <Megaphone className="h-3 w-3" />
                  Campaign Context
                </span>
              </NeoLabel>
              <NeoInput
                id="campaignContext"
                placeholder="e.g. cashback promo, fee waiver"
                value={campaignContext}
                onChange={(e) => setCampaignContext(e.target.value)}
              />
            </div>
          </div>
          <div>
            <NeoLabel htmlFor="complaint" required>
              Complaint
            </NeoLabel>
            <NeoTextarea
              id="complaint"
              placeholder="Describe the issue in detail..."
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              required
            />
          </div>
        </NeoCardContent>
      </NeoCard>

      {/* Transaction History */}
      <NeoCard macDots>
        <NeoCardHeader>
          <div className="flex items-center justify-between">
            <NeoCardTitle>Transaction History</NeoCardTitle>
            <NeoButton
              type="button"
              variant="accent"
              className="h-10 px-3 py-0 text-xs"
              onClick={addTransaction}
            >
              <Plus className="h-4 w-4" />
              Add Row
            </NeoButton>
          </div>
        </NeoCardHeader>
        <NeoCardContent className="space-y-3">
          {transactions.length === 0 && (
            <p className="py-4 text-center text-sm font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              No transactions — add one above
            </p>
          )}
          {transactions.map((tx, i) => (
            <div
              key={i}
              className="space-y-2 border-2 border-[var(--border)] bg-[var(--muted)] p-3 sm:p-3"
            >
              {/* Row 1: ID, Type, Amount, Status */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:gap-2">
                <div>
                  <NeoLabel
                    htmlFor={`tx-id-${i}`}
                    className="mb-0.5 text-[10px]"
                  >
                    ID
                  </NeoLabel>
                  <NeoInput
                    id={`tx-id-${i}`}
                    placeholder="TXN-001"
                    className="h-9 text-xs"
                    value={tx.transaction_id}
                    onChange={(e) =>
                      updateTransaction(i, "transaction_id", e.target.value)
                    }
                  />
                </div>
                <div>
                  <NeoLabel
                    htmlFor={`tx-type-${i}`}
                    className="mb-0.5 text-[10px]"
                  >
                    Type
                  </NeoLabel>
                  <NeoSelect
                    id={`tx-type-${i}`}
                    className="h-9 text-xs"
                    value={tx.type}
                    onChange={(e) =>
                      updateTransaction(i, "type", e.target.value)
                    }
                  >
                    {TX_TYPES.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </NeoSelect>
                </div>
                <div>
                  <NeoLabel
                    htmlFor={`tx-amt-${i}`}
                    className="mb-0.5 text-[10px]"
                  >
                    Amount
                  </NeoLabel>
                  <NeoInput
                    id={`tx-amt-${i}`}
                    placeholder="5000"
                    type="number"
                    min="0"
                    className="h-9 text-xs"
                    value={tx.amount}
                    onChange={(e) =>
                      updateTransaction(i, "amount", e.target.value)
                    }
                  />
                </div>
                <div>
                  <NeoLabel
                    htmlFor={`tx-status-${i}`}
                    className="mb-0.5 text-[10px]"
                  >
                    Status
                  </NeoLabel>
                  <NeoSelect
                    id={`tx-status-${i}`}
                    className="h-9 text-xs"
                    value={tx.status}
                    onChange={(e) =>
                      updateTransaction(i, "status", e.target.value)
                    }
                  >
                    {TX_STATUSES.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </NeoSelect>
                </div>
              </div>
              {/* Row 2: Timestamp, Counterparty, Remove */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-2">
                <div>
                  <NeoLabel
                    htmlFor={`tx-ts-${i}`}
                    className="mb-0.5 text-[10px]"
                  >
                    Timestamp
                  </NeoLabel>
                  <NeoInput
                    id={`tx-ts-${i}`}
                    placeholder="ISO date"
                    className="h-9 text-xs"
                    value={tx.timestamp}
                    onChange={(e) =>
                      updateTransaction(i, "timestamp", e.target.value)
                    }
                  />
                </div>
                <div>
                  <NeoLabel
                    htmlFor={`tx-cp-${i}`}
                    className="mb-0.5 text-[10px]"
                  >
                    <span className="inline-flex items-center gap-0.5">
                      <Building2 className="h-2.5 w-2.5" />
                      Counterparty
                    </span>
                  </NeoLabel>
                  <NeoInput
                    id={`tx-cp-${i}`}
                    placeholder="Phone/merchant"
                    className="h-9 text-xs"
                    value={tx.counterparty}
                    onChange={(e) =>
                      updateTransaction(i, "counterparty", e.target.value)
                    }
                  />
                </div>
                <div className="flex items-end justify-end sm:items-end">
                  <NeoButton
                    type="button"
                    variant="danger"
                    className="h-9 w-full px-0 text-xs sm:w-auto sm:px-3"
                    onClick={() => removeTransaction(i)}
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:mr-1" />
                    <span className="sm:hidden">Remove</span>
                  </NeoButton>
                </div>
              </div>
            </div>
          ))}
        </NeoCardContent>
      </NeoCard>

      {/* Submit */}
      <div className="flex justify-center">
        <NeoButton
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading || !ticketId.trim() || !complaint.trim()}
          className="min-w-[220px] text-base"
        >
          {!loading && <Send className="h-4 w-4" />}
          {loading ? "ANALYZING..." : "ANALYZE TICKET"}
        </NeoButton>
      </div>
    </form>
  );

  // ── JSON input mode ──
  const jsonSection = inputMode === "json" && (
    <div className="space-y-6 sm:space-y-8">
      <NeoCard macDots>
        <NeoCardHeader>
          <div className="flex items-center gap-3">
            <FileJson className="h-5 w-5 shrink-0" />
            <NeoCardTitle>JSON Input</NeoCardTitle>
          </div>
        </NeoCardHeader>
        <NeoCardContent>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            Paste a valid ticket JSON object directly
          </p>
          <NeoTextarea
            className="min-h-[320px] font-mono text-xs leading-relaxed"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='{"ticket_id": "TKT-001", ...}'
          />
        </NeoCardContent>
      </NeoCard>

      <div className="flex justify-center">
        <NeoButton
          type="button"
          variant="primary"
          loading={loading}
          disabled={loading}
          className="min-w-[220px] text-base"
          onClick={handleJsonSubmit}
        >
          {!loading && <Send className="h-4 w-4" />}
          {loading ? "ANALYZING..." : "ANALYZE TICKET"}
        </NeoButton>
      </div>
    </div>
  );

  // ── Results ──
  const resultsSection = (
    <div className="space-y-5 sm:space-y-6">
      {/* Loading overlay on previous response */}
      {loading && displayResponse && (
        <NeoCard>
          <NeoCardContent>
            <div className="flex items-center justify-center gap-3 py-4">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--accent)]" />
              <p className="text-sm font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                Analyzing next ticket&hellip;
              </p>
            </div>
          </NeoCardContent>
        </NeoCard>
      )}

      {/* Error */}
      {error && (
        <NeoCard hover macDots>
          <NeoCardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 shrink-0 text-[var(--destructive)]" />
              <NeoCardTitle className="text-sm sm:text-base">
                Error
              </NeoCardTitle>
            </div>
          </NeoCardHeader>
          <NeoCardContent>
            <p className="text-sm font-bold text-[var(--destructive)]">
              {error.error}
            </p>
            {hasErrors && (
              <ul className="mt-3 space-y-1" role="alert">
                {error.details!.map((d, i) => (
                  <li
                    key={i}
                    className="text-xs font-medium text-[var(--muted-foreground)]"
                  >
                    <span className="font-black uppercase">{d.field}</span>:{" "}
                    {d.message}
                  </li>
                ))}
              </ul>
            )}
          </NeoCardContent>
        </NeoCard>
      )}

      {/* Response */}
      {displayResponse && (
        <>
          {/* Result header + timer + confidence */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[var(--border)] pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-[var(--success)]" />
              <h2 className="text-xl font-black uppercase tracking-tight sm:text-2xl">
                Analysis Result
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {/* Confidence badge */}
              {displayResponse.confidence !== undefined && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 border-2 border-[var(--border)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-neo-sm",
                    displayResponse.confidence >= 0.7
                      ? CONFIDENCE_COLOR.high
                      : displayResponse.confidence >= 0.3
                        ? CONFIDENCE_COLOR.medium
                        : CONFIDENCE_COLOR.low,
                  )}
                >
                  <BarChart3 className="h-3 w-3" />
                  {Math.round(displayResponse.confidence * 100)}%
                </span>
              )}
              {/* Timer */}
              {displayElapsedMs !== null && (
                <span className="inline-flex shrink-0 items-center gap-1.5 border-2 border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-neo-sm">
                  <Clock className="h-3 w-3" />
                  {displayElapsedMs < 1000
                    ? `${displayElapsedMs}ms`
                    : `${(displayElapsedMs / 1000).toFixed(1)}s`}
                </span>
              )}
            </div>
          </div>

          {/* Reason codes */}
          {displayResponse.reason_codes &&
            displayResponse.reason_codes.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <ListChecks className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)]" />
                {displayResponse.reason_codes.map((code) => (
                  <span
                    key={code}
                    className="inline-flex items-center border-2 border-[var(--border)] bg-[var(--card)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                  >
                    {code.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            )}

          {/* Badges with title labels — stacked vertically */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 border-2 border-[var(--border)] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                Verdict
              </span>
              <NeoBadge
                className={
                  VERDICT_STYLES[displayResponse.evidence_verdict] ?? ""
                }
              >
                {displayResponse.evidence_verdict.replace(/_/g, " ")}
              </NeoBadge>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 border-2 border-[var(--border)] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                Severity
              </span>
              <NeoBadge
                className={SEVERITY_STYLES[displayResponse.severity] ?? ""}
              >
                {displayResponse.severity}
              </NeoBadge>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 border-2 border-[var(--border)] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                Case
              </span>
              <NeoBadge className={YELLOW_BADGE}>
                {CASE_TYPE_LABELS[displayResponse.case_type] ??
                  displayResponse.case_type.replace(/_/g, " ")}
              </NeoBadge>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 border-2 border-[var(--border)] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                Dept
              </span>
              <NeoBadge className={YELLOW_BADGE}>
                {DEPARTMENT_LABELS[displayResponse.department] ??
                  displayResponse.department.replace(/_/g, " ")}
              </NeoBadge>
            </div>

            {displayResponse.human_review_required && (
              <div className="flex items-center gap-1.5 sm:col-span-2">
                <span className="inline-flex items-center gap-1 border-2 border-[var(--border)] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Flag
                </span>
                <NeoBadge className="bg-orange-500 text-white">
                  Needs Human Review
                </NeoBadge>
              </div>
            )}
          </div>

          {/* Matched transaction */}
          {displayResponse.relevant_transaction_id && (
            <p className="text-sm font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Matched transaction:{" "}
              <code className="ml-1 border-2 border-[var(--border)] bg-[var(--accent)] px-2 py-0.5 font-mono text-xs text-black">
                {displayResponse.relevant_transaction_id}
              </code>
            </p>
          )}

          {/* Agent Summary */}
          <NeoCard macDots>
            <NeoCardHeader>
              <NeoCardTitle className="text-sm sm:text-base">
                Agent Summary
              </NeoCardTitle>
            </NeoCardHeader>
            <NeoCardContent>
              <p className="text-sm leading-relaxed font-medium">
                {displayResponse.agent_summary}
              </p>
            </NeoCardContent>
          </NeoCard>

          {/* Recommended Next Action */}
          <NeoCard macDots>
            <NeoCardHeader>
              <NeoCardTitle className="text-sm sm:text-base">
                Recommended Next Action
              </NeoCardTitle>
            </NeoCardHeader>
            <NeoCardContent>
              <p className="whitespace-pre-line text-sm leading-relaxed font-medium">
                {displayResponse.recommended_next_action}
              </p>
            </NeoCardContent>
          </NeoCard>

          {/* Customer Reply */}
          <NeoCard hover macDots>
            <NeoCardHeader>
              <NeoCardTitle className="text-sm sm:text-base">
                Customer Reply
              </NeoCardTitle>
            </NeoCardHeader>
            <NeoCardContent>
              <p className="whitespace-pre-line text-sm leading-relaxed font-medium">
                {displayResponse.customer_reply}
              </p>
            </NeoCardContent>
          </NeoCard>
        </>
      )}

      {/* Raw JSON */}
      {displayRawJson && <JsonOutput data={displayRawJson} />}
    </div>
  );

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Health check — top-right */}
      <div className="mb-4 flex items-start justify-end sm:mb-0 sm:absolute sm:right-6 sm:top-6 sm:z-10">
        <HealthLink />
      </div>

      {/* ── Hero ── */}
      <NeoCard className="mb-8 text-center sm:mb-10" macDots>
        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border-2 border-[var(--border)] bg-[var(--accent)] shadow-neo-sm">
            <Ticket className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">
            QueueStorm
            <br className="sm:hidden" /> Investigator
          </h1>
          <p className="mt-2 text-sm font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            Submit a support ticket for automated analysis
          </p>
        </div>
      </NeoCard>

      {/* ── Two-column layout on large screens ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Left: Form / JSON input */}
        <div className="min-w-0">
          {modeToggle}
          {formSection}
          {jsonSection}
        </div>

        {/* Right: Results */}
        <div className="min-w-0">
          {!displayResponse && !error && !displayRawJson && (
            <div className="sticky top-8">
              <NeoCard
                className="border-dashed border-[var(--input-border)] shadow-none"
                macDots
              >
                <NeoCardContent>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Terminal className="mb-4 h-10 w-10 text-[var(--muted-foreground)]" />
                    <p className="text-sm font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                      Results will appear here
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      Submit a ticket to see the analysis
                    </p>
                  </div>
                </NeoCardContent>
              </NeoCard>
            </div>
          )}
          {(displayResponse || error || displayRawJson !== null) &&
            resultsSection}
        </div>
      </div>
    </div>
  );
}
