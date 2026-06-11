import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type Tone = "indigo" | "amber" | "rose" | "emerald" | "sky";

const TONE_CLASSES: Record<Tone, { ring: string; bg: string; icon: string }> = {
  indigo: {
    ring: "ring-indigo-400/30",
    bg: "bg-indigo-500/10",
    icon: "text-indigo-300",
  },
  amber: {
    ring: "ring-amber-400/30",
    bg: "bg-amber-500/10",
    icon: "text-amber-300",
  },
  rose: {
    ring: "ring-rose-400/30",
    bg: "bg-rose-500/10",
    icon: "text-rose-300",
  },
  emerald: {
    ring: "ring-emerald-400/30",
    bg: "bg-emerald-500/10",
    icon: "text-emerald-300",
  },
  sky: {
    ring: "ring-sky-400/30",
    bg: "bg-sky-500/10",
    icon: "text-sky-300",
  },
};

type Props = {
  label: string;
  value: number | string;
  helper?: string;
  icon: LucideIcon;
  tone?: Tone;
};

export function StatCard({ label, value, helper, icon: Icon, tone = "indigo" }: Props) {
  const t = TONE_CLASSES[tone];
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <span
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-md ring-1 ring-inset",
            t.bg,
            t.ring,
          )}
        >
          <Icon className={cn("h-3.5 w-3.5", t.icon)} />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
      {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
    </div>
  );
}
