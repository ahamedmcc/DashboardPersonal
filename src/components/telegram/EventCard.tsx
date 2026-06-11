"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import {
  TelegramStatusBadge,
  TelegramTypeBadge,
} from "@/components/telegram/StatusBadge";

type Event = {
  id: string;
  telegramMessageId: string | null;
  rawMessage: unknown;
  classifiedType: string | null;
  processedStatus: string;
  errorMessage: string | null;
  createdAt: string | Date;
};

function previewText(raw: unknown): string {
  if (!raw || typeof raw !== "object") return "—";
  const obj = raw as Record<string, unknown>;
  const candidates: unknown[] = [
    obj.title,
    obj.summary,
    obj.bookTitle,
    obj.content,
    obj.text,
    (obj.message as Record<string, unknown> | undefined)?.text,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim().length > 0) {
      return c.length > 140 ? c.slice(0, 140) + "…" : c;
    }
  }
  return "(no text)";
}

function formatRelative(d: Date): string {
  const ms = Date.now() - d.getTime();
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.round(h / 24);
  return `${days}d ago`;
}

function safePrettyJson(raw: unknown): string {
  try {
    return JSON.stringify(raw, null, 2);
  } catch {
    return String(raw);
  }
}

export function TelegramEventCard({ event }: { event: Event }) {
  const [open, setOpen] = useState(false);
  const created = new Date(event.createdAt);
  const ChevIcon = open ? ChevronDown : ChevronRight;

  return (
    <li className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <TelegramStatusBadge status={event.processedStatus} />
        <TelegramTypeBadge type={event.classifiedType} />
        <span className="text-xs text-slate-500" title={created.toISOString()}>
          {formatRelative(created)}
        </span>
        {event.telegramMessageId && (
          <span className="text-xs text-slate-500">
            · msg <code className="text-slate-400">{event.telegramMessageId}</code>
          </span>
        )}
      </div>

      <p className="mt-2 text-sm text-slate-200">{previewText(event.rawMessage)}</p>

      {event.errorMessage && (
        <div className="mt-2 flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-200">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none" />
          <pre className="whitespace-pre-wrap break-words font-mono leading-relaxed">
            {event.errorMessage}
          </pre>
        </div>
      )}

      <button
        type="button"
        className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
        onClick={() => setOpen((v) => !v)}
      >
        <ChevIcon className="h-3.5 w-3.5" />
        {open ? "Hide raw payload" : "Show raw payload"}
      </button>

      {open && (
        <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-slate-950/70 p-3 font-mono text-[11px] leading-relaxed text-slate-300 ring-1 ring-inset ring-slate-800">
          {safePrettyJson(event.rawMessage)}
        </pre>
      )}
    </li>
  );
}

export type { Event as TelegramEventDTO };
