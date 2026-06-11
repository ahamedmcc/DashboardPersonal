import { Badge } from "@/components/ui/Badge";

const STATUS_CLASSES: Record<string, string> = {
  processed: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  pending: "bg-amber-500/15 text-amber-200 ring-amber-400/30",
  failed: "bg-rose-500/15 text-rose-200 ring-rose-400/30",
};

const STATUS_LABEL: Record<string, string> = {
  processed: "Processed",
  pending: "Pending",
  failed: "Failed",
};

export function TelegramStatusBadge({ status }: { status: string }) {
  const cls = STATUS_CLASSES[status] ?? "bg-slate-700/40 text-slate-200 ring-slate-500/30";
  const label = STATUS_LABEL[status] ?? status;
  return <Badge className={cls}>{label}</Badge>;
}

const TYPE_CLASSES: Record<string, string> = {
  task: "bg-indigo-500/15 text-indigo-200 ring-indigo-400/30",
  meeting: "bg-sky-500/15 text-sky-200 ring-sky-400/30",
  note: "bg-violet-500/15 text-violet-200 ring-violet-400/30",
  knowledge: "bg-violet-500/15 text-violet-200 ring-violet-400/30",
  book: "bg-fuchsia-500/15 text-fuchsia-200 ring-fuchsia-400/30",
  news: "bg-orange-500/15 text-orange-200 ring-orange-400/30",
  reminder: "bg-amber-500/15 text-amber-200 ring-amber-400/30",
  unknown: "bg-slate-700/40 text-slate-300 ring-slate-500/30",
};

export function TelegramTypeBadge({ type }: { type: string | null | undefined }) {
  const t = type ?? "unknown";
  const cls = TYPE_CLASSES[t] ?? "bg-slate-700/40 text-slate-300 ring-slate-500/30";
  return <Badge className={cls}>{t}</Badge>;
}
