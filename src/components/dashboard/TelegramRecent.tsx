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
  createdAt: Date;
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
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim().length > 0) {
      return c.length > 80 ? c.slice(0, 80) + "…" : c;
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

export function TelegramRecent({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <p className="text-xs text-slate-500">
        Nothing has arrived from Hermes yet.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {events.map((e) => (
        <li
          key={e.id}
          className="rounded-lg border border-slate-800/60 bg-slate-950/40 p-2.5"
        >
          <div className="flex flex-wrap items-center gap-2">
            <TelegramStatusBadge status={e.processedStatus} />
            <TelegramTypeBadge type={e.classifiedType} />
            <span
              className="text-[11px] text-slate-500"
              title={e.createdAt.toISOString()}
            >
              {formatRelative(e.createdAt)}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-slate-300">
            {previewText(e.rawMessage)}
          </p>
          {e.errorMessage && (
            <p className="mt-1 truncate text-[11px] text-rose-300/80">
              {e.errorMessage}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
