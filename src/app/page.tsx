"use client";

import { useState } from "react";
import { Send, Loader2, AlertCircle, CheckCircle2, Plus, Trash2, ChevronDown } from "lucide-react";

// --- UI Components (inline for zero external deps) ---

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 px-5 pt-5 pb-0 sm:px-6 sm:pt-6", className)}>{children}</div>;
}

function CardTitle({ className, children }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-semibold text-lg tracking-tight", className)}>{children}</h3>;
}

function CardContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-4 sm:p-6 sm:pt-4", className)}>{children}</div>;
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-lg border border-[var(--input)] bg-transparent px-3 py-2 text-sm shadow-sm transition-colors",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-[var(--muted-foreground)]",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-lg border border-[var(--input)] bg-transparent px-3 py-2 text-sm shadow-sm transition-colors",
        "placeholder:text-[var(--muted-foreground)]",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-10 w-full appearance-none rounded-lg border border-[var(--input)] bg-transparent px-3 py-2 pr-8 text-sm shadow-sm transition-colors",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
    </div>
  );
}

function Label({ className, children, required }: { className?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className={cn("mb-1.5 block text-sm font-medium", className)}>
      {children}
      {required && <span className="ml-0.5 text-[var(--destructive)]">*</span>}
    </label>
  );
}

function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        className,
      )}
    >
      {children}
    </span>
  );
}

function Button({ className, variant = "default", loading, children, ...props }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "ghost" | "destructive";
    loading?: boolean;
  }) {
  const variants: Record<string, string> = {
    default:
      "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 shadow-sm",
    outline:
      "border border-[var(--border)] bg-transparent hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
    ghost: "hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
    destructive:
      "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

// --- Types ---

interface TransactionRow {
  transaction_id: string;
  type: string;
  amount: string;
  status: string;
  timestamp: string;
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
}

interface ApiError {
  error: string;
  details?: { field: string; message: string }[];
}

// --- Constants ---

const SEVERITY_STYLES: Record<string, string> = {
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  critical: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const VERDICT_STYLES: Record<string, string> = {
  consistent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  inconsistent: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  insufficient_data: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
};

const CASE_TYPE_LABELS: Record<string, string> = {
  phishing_or_social_engineering: "Phishing / Social Engineering",
  duplicate_payment: "Duplicate Payment",
  agent_cash_in_issue: "Agent Cash-in Issue",
  merchant_settlement_delay: "Merchant Settlement Delay",
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

const EMPTY_TX: TransactionRow = {
  transaction_id: "",
  type: "send_money",
  amount: "",
  status: "completed",
  timestamp: "",
};

// --- Page ---

export default function DashboardPage() {
  const [ticketId, setTicketId] = useState("");
  const [complaint, setComplaint] = useState("");
  const [language, setLanguage] = useState("");
  const [transactions, setTransactions] = useState<TransactionRow[]>([{ ...EMPTY_TX }]);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);

  function addTransaction() {
    setTransactions([...transactions, { ...EMPTY_TX }]);
  }

  function updateTransaction(index: number, field: keyof TransactionRow, value: string) {
    setTransactions(transactions.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  }

  function removeTransaction(index: number) {
    const next = transactions.filter((_, i) => i !== index);
    setTransactions(next.length === 0 ? [{ ...EMPTY_TX }] : next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    setError(null);

    const validTxns = transactions.filter((t) => t.transaction_id.trim() && t.amount.trim());
    const body: Record<string, unknown> = { ticket_id: ticketId.trim(), complaint: complaint.trim() };
    if (language.trim()) body.language = language.trim();
    if (validTxns.length > 0) {
      body.transaction_history = validTxns.map((t) => ({
        transaction_id: t.transaction_id.trim(),
        type: t.type,
        amount: parseFloat(t.amount) || 0,
        status: t.status,
        timestamp: t.timestamp || new Date().toISOString(),
      }));
    }

    try {
      const res = await fetch("/analyze-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data as ApiError);
      } else {
        setResponse(data as ApiResponse);
      }
    } catch {
      setError({ error: "Unable to reach the server. Is it running?" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      {/* Header */}
      <header className="mb-8 text-center sm:mb-10">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">QueueStorm Investigator</h1>
        <p className="mt-1.5 text-sm text-[var(--muted-foreground)] sm:text-base">
          Submit a support ticket for automated analysis
        </p>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Ticket Details */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label required>Ticket ID</Label>
              <Input
                placeholder="e.g. TKT-001"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Language</Label>
              <Input
                placeholder="e.g. en, bn (optional)"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
            </div>
            <div>
              <Label required>Complaint</Label>
              <Textarea
                placeholder="Describe the issue in detail..."
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transaction History</CardTitle>
              <Button type="button" variant="outline" onClick={addTransaction}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Row</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {transactions.map((tx, i) => (
              <div
                key={i}
                className="grid grid-cols-1 gap-2 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-6 sm:gap-2"
              >
                <Input
                  placeholder="Tx ID"
                  className="sm:col-span-1"
                  value={tx.transaction_id}
                  onChange={(e) => updateTransaction(i, "transaction_id", e.target.value)}
                />
                <Select
                  className="sm:col-span-1"
                  value={tx.type}
                  onChange={(e) => updateTransaction(i, "type", e.target.value)}
                >
                  <option value="send_money">Send Money</option>
                  <option value="cash_in">Cash In</option>
                  <option value="cash_out">Cash Out</option>
                  <option value="payment">Payment</option>
                  <option value="refund">Refund</option>
                  <option value="transfer">Transfer</option>
                </Select>
                <Input
                  placeholder="Amount"
                  type="number"
                  min="0"
                  className="sm:col-span-1"
                  value={tx.amount}
                  onChange={(e) => updateTransaction(i, "amount", e.target.value)}
                />
                <Select
                  className="sm:col-span-1"
                  value={tx.status}
                  onChange={(e) => updateTransaction(i, "status", e.target.value)}
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="disputed">Disputed</option>
                  <option value="reversed">Reversed</option>
                </Select>
                <Input
                  placeholder="Timestamp (ISO)"
                  className="sm:col-span-1"
                  value={tx.timestamp}
                  onChange={(e) => updateTransaction(i, "timestamp", e.target.value)}
                />
                <div className="flex items-center justify-end sm:col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-10 w-10 p-0 text-red-500"
                    onClick={() => removeTransaction(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-center">
          <Button
            type="submit"
            loading={loading}
            disabled={loading || !ticketId.trim() || !complaint.trim()}
            className="min-w-[200px]"
          >
            {!loading && <Send className="h-4 w-4" />}
            {loading ? "Analyzing..." : "Analyze Ticket"}
          </Button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <Card className="mt-6 border-red-300 dark:border-red-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
              <CardTitle>Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 dark:text-red-400">{error.error}</p>
            {error.details && error.details.length > 0 && (
              <ul className="mt-2 space-y-1">
                {error.details.map((d, i) => (
                  <li key={i} className="text-xs text-[var(--muted-foreground)]">
                    <span className="font-medium">{d.field}</span>: {d.message}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* Response */}
      {response && (
        <div className="mt-8 space-y-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
            <h2 className="text-lg font-semibold sm:text-xl">Analysis Result</h2>
          </div>

          {/* Badge row — wraps on mobile */}
          <div className="flex flex-wrap gap-1.5">
            <Badge className={VERDICT_STYLES[response.evidence_verdict] ?? ""}>
              {response.evidence_verdict.replace(/_/g, " ")}
            </Badge>
            <Badge className={SEVERITY_STYLES[response.severity] ?? ""}>
              {response.severity}
            </Badge>
            <Badge className="bg-[var(--accent)] text-[var(--accent-foreground)]">
              {CASE_TYPE_LABELS[response.case_type] ?? response.case_type.replace(/_/g, " ")}
            </Badge>
            <Badge className="bg-[var(--accent)] text-[var(--accent-foreground)]">
              {DEPARTMENT_LABELS[response.department] ?? response.department.replace(/_/g, " ")}
            </Badge>
            {response.human_review_required && (
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                needs human review
              </Badge>
            )}
          </div>

          {response.relevant_transaction_id && (
            <p className="text-sm text-[var(--muted-foreground)]">
              Matched transaction: <code className="rounded bg-[var(--accent)] px-1 py-0.5 font-mono text-xs">{response.relevant_transaction_id}</code>
            </p>
          )}

          {/* Agent Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{response.agent_summary}</p>
            </CardContent>
          </Card>

          {/* Recommended Next Action */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Next Action</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-line">{response.recommended_next_action}</p>
            </CardContent>
          </Card>

          {/* Customer Reply */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Reply</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-line">{response.customer_reply}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
