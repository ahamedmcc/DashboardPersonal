import type { EmailSummary } from "@prisma/client";
import { cn } from "@/lib/cn";

const IMPORTANCE_CLASSES: Record<string, string> = {
  high: "bg-rose-500/15 text-rose-200 ring-rose-400/30",
  medium: "bg-sky-500/15 text-sky-200 ring-sky-400/30",
  low: "bg-slate-700/40 text-slate-300 ring-slate-500/30",
};

export function EmailsList({ emails }: { emails: EmailSummary[] }) {
  return (
    <ul className="space-y-3">
      {emails.map((e) => (
        <li key={e.id} className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium text-white">{e.subject}</h3>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset",
                IMPORTANCE_CLASSES[e.importance] ?? IMPORTANCE_CLASSES.low,
              )}
            >
              {e.importance}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-500">{e.sender}</p>
          <p className="mt-1 line-clamp-2 text-xs text-slate-400">{e.summary}</p>
          {e.requiredAction && (
            <p className="mt-2 rounded-md bg-slate-900/70 px-2 py-1 text-[11px] text-slate-300 ring-1 ring-inset ring-slate-700/60">
              <span className="font-semibold text-slate-200">Action:</span>{" "}
              {e.requiredAction}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
