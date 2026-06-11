"use client";

import { useState } from "react";
import { Check, Copy, Info } from "lucide-react";

type Props = {
  webhookUrl: string;
  secretSet: boolean;
};

const SAMPLE_PAYLOADS: Record<string, string> = {
  task: JSON.stringify(
    {
      type: "task",
      title: "Prep Q3 review deck",
      dueDate: "2026-06-20T10:00:00Z",
      priority: "HIGH",
      telegramMessageId: "1001",
    },
    null,
    2,
  ),
  meeting: JSON.stringify(
    {
      type: "meeting",
      title: "Sales sync with Acme",
      dateTime: "2026-06-12T15:00:00Z",
      location: "Zoom",
      participants: ["Mahir", "Acme - Jane"],
      agenda: "Pricing & rollout plan",
      actionItems: ["Send updated pricing", "Schedule follow-up"],
      telegramMessageId: "1002",
    },
    null,
    2,
  ),
  note: JSON.stringify(
    {
      type: "note",
      title: "Onboarding gotcha",
      content: "When seat count > 50, switch to enterprise SSO flow.",
      tags: ["onboarding", "sso"],
      telegramMessageId: "1003",
    },
    null,
    2,
  ),
  book: JSON.stringify(
    {
      type: "book",
      bookTitle: "Designing Data-Intensive Applications",
      summary: "Chapter 7 covers serializable transactions in depth.",
      keyIdeas: ["Snapshot isolation", "Two-phase locking"],
      telegramMessageId: "1004",
    },
    null,
    2,
  ),
  news: JSON.stringify(
    {
      type: "news",
      title: "Postgres 18 released",
      summary: "Major release with async I/O and improved partitioning.",
      category: "tech",
      telegramMessageId: "1005",
    },
    null,
    2,
  ),
};

export function HermesConfigPanel({ webhookUrl, secretSet }: Props) {
  const [active, setActive] = useState<keyof typeof SAMPLE_PAYLOADS>("meeting");
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignore — clipboard may be blocked
    }
  };

  const headerSnippet = `x-webhook-secret: <your TELEGRAM_WEBHOOK_SECRET>`;

  return (
    <section className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5">
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
            Hermes integration
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Point Hermes at this URL and it will land in the inbox above.
          </p>
        </div>
        <span
          className={`text-[11px] font-medium ${
            secretSet ? "text-emerald-300" : "text-amber-300"
          }`}
        >
          {secretSet ? "Secret set" : "TELEGRAM_WEBHOOK_SECRET not set (dev)"}
        </span>
      </header>

      <div className="space-y-3 text-xs text-slate-300">
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-widest text-slate-500">
            Endpoint
          </p>
          <div className="flex items-center gap-2 rounded-lg bg-slate-950/70 p-2 font-mono text-[12px] text-slate-200 ring-1 ring-inset ring-slate-800">
            <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
              POST
            </span>
            <span className="flex-1 break-all">{webhookUrl}</span>
            <button
              type="button"
              onClick={() => copy("url", webhookUrl)}
              className="inline-flex items-center gap-1 rounded border border-slate-700/70 bg-slate-900 px-1.5 py-0.5 text-[10px] hover:bg-slate-800"
            >
              {copied === "url" ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              Copy
            </button>
          </div>
        </div>

        <div>
          <p className="mb-1 text-[11px] uppercase tracking-widest text-slate-500">
            Required header
          </p>
          <div className="flex items-center gap-2 rounded-lg bg-slate-950/70 p-2 font-mono text-[12px] text-slate-200 ring-1 ring-inset ring-slate-800">
            <span className="flex-1 break-all">{headerSnippet}</span>
            <button
              type="button"
              onClick={() => copy("hdr", headerSnippet)}
              className="inline-flex items-center gap-1 rounded border border-slate-700/70 bg-slate-900 px-1.5 py-0.5 text-[10px] hover:bg-slate-800"
            >
              {copied === "hdr" ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              Copy
            </button>
          </div>
        </div>

        <div>
          <p className="mb-1 flex items-center gap-1 text-[11px] uppercase tracking-widest text-slate-500">
            <Info className="h-3 w-3" /> Sample payload
          </p>
          <div className="mb-2 flex flex-wrap gap-1">
            {(Object.keys(SAMPLE_PAYLOADS) as Array<keyof typeof SAMPLE_PAYLOADS>).map(
              (key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActive(key)}
                  className={`rounded-full px-2 py-0.5 text-[11px] ring-1 ring-inset transition ${
                    active === key
                      ? "bg-indigo-500/20 text-indigo-100 ring-indigo-400/40"
                      : "bg-slate-800/50 text-slate-300 ring-slate-700/60 hover:bg-slate-800"
                  }`}
                >
                  {key}
                </button>
              ),
            )}
          </div>
          <div className="relative">
            <pre className="max-h-60 overflow-auto rounded-lg bg-slate-950/70 p-3 font-mono text-[11px] leading-relaxed text-slate-300 ring-1 ring-inset ring-slate-800">
              {SAMPLE_PAYLOADS[active]}
            </pre>
            <button
              type="button"
              onClick={() => copy(`p-${active}`, SAMPLE_PAYLOADS[active])}
              className="absolute right-2 top-2 inline-flex items-center gap-1 rounded border border-slate-700/70 bg-slate-900 px-1.5 py-0.5 text-[10px] hover:bg-slate-800"
            >
              {copied === `p-${active}` ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              Copy
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
