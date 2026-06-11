"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { TelegramEventCard, type TelegramEventDTO } from "./EventCard";
import { cn } from "@/lib/cn";

const STATUS_OPTIONS = [
  { value: "any", label: "All" },
  { value: "processed", label: "Processed" },
  { value: "failed", label: "Failed" },
  { value: "pending", label: "Pending" },
] as const;

const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "task", label: "Task" },
  { value: "meeting", label: "Meeting" },
  { value: "note", label: "Note" },
  { value: "knowledge", label: "Knowledge" },
  { value: "book", label: "Book" },
  { value: "news", label: "News" },
  { value: "reminder", label: "Reminder" },
  { value: "unknown", label: "Unknown" },
] as const;

type Props = {
  initialEvents: TelegramEventDTO[];
  initialCounts: { processed: number; pending: number; failed: number; total: number };
};

export function TelegramInboxClient({ initialEvents, initialCounts }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") ?? "any";
  const type = searchParams.get("type") ?? "";
  const q = searchParams.get("q") ?? "";

  const [events, setEvents] = useState(initialEvents);
  const [counts, setCounts] = useState(initialCounts);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [, startTransition] = useTransition();
  const seenIds = useRef(new Set(initialEvents.map((e) => e.id)));

  const refresh = async () => {
    setRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (status && status !== "any") params.set("status", status);
      if (type) params.set("type", type);
      if (q) params.set("q", q);
      params.set("limit", "50");
      const res = await fetch(`/api/telegram/events?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data: {
        events: TelegramEventDTO[];
        counts: typeof initialCounts;
      } = await res.json();
      setEvents(data.events);
      setCounts(data.counts);
      seenIds.current = new Set(data.events.map((e) => e.id));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!autoRefresh) return;
    const id = window.setInterval(refresh, 5000);
    return () => window.clearInterval(id);
    // refresh closes over latest filter values via the call site; eslint happy
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, status, type, q]);

  const setFilter = (key: "status" | "type" | "q", value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value && value !== "any" && value !== "") next.set(key, value);
    else next.delete(key);
    startTransition(() => {
      router.replace(`/telegram?${next.toString()}`);
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <CountTile label="Total" value={counts.total} tone="slate" />
        <CountTile label="Processed" value={counts.processed} tone="emerald" />
        <CountTile label="Failed" value={counts.failed} tone="rose" />
        <CountTile label="Pending" value={counts.pending} tone="amber" />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800/60 bg-slate-900/40 p-3">
        <div className="flex flex-wrap items-center gap-1">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilter("status", opt.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs ring-1 ring-inset transition",
                status === opt.value
                  ? "bg-indigo-500/20 text-indigo-100 ring-indigo-400/40"
                  : "bg-slate-800/50 text-slate-300 ring-slate-700/60 hover:bg-slate-800",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <select
          value={type}
          onChange={(e) => setFilter("type", e.target.value)}
          className="rounded-md border border-slate-700/70 bg-slate-900/60 px-2 py-1 text-xs text-slate-200"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <input
          type="search"
          defaultValue={q}
          onBlur={(e) => setFilter("q", e.currentTarget.value.trim())}
          onKeyDown={(e) => {
            if (e.key === "Enter") setFilter("q", e.currentTarget.value.trim());
          }}
          placeholder="Search payload…"
          className="min-w-[160px] flex-1 rounded-md border border-slate-700/70 bg-slate-900/60 px-2 py-1 text-xs text-slate-200 placeholder:text-slate-500"
        />

        <label className="ml-auto inline-flex items-center gap-2 text-xs text-slate-400">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-900 text-indigo-400"
          />
          Auto-refresh
        </label>

        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1 rounded-md border border-slate-700/70 bg-slate-900/60 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/30 p-10 text-center">
          <p className="text-sm text-slate-300">No Telegram events yet.</p>
          <p className="mt-1 text-xs text-slate-500">
            Configure Hermes to POST to{" "}
            <code className="rounded bg-slate-800/80 px-1 py-0.5 text-slate-300">
              /api/telegram/webhook
            </code>{" "}
            with header{" "}
            <code className="rounded bg-slate-800/80 px-1 py-0.5 text-slate-300">
              x-webhook-secret
            </code>
            . See the panel below for the public URL and payload schema.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {events.map((e) => (
            <TelegramEventCard key={e.id} event={e} />
          ))}
        </ul>
      )}
    </div>
  );
}

function CountTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "slate" | "emerald" | "rose" | "amber";
}) {
  const toneClass = {
    slate: "text-slate-200",
    emerald: "text-emerald-300",
    rose: "text-rose-300",
    amber: "text-amber-200",
  }[tone];
  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        {label}
      </p>
      <p className={cn("mt-1 text-2xl font-semibold tabular-nums", toneClass)}>
        {value}
      </p>
    </div>
  );
}
