import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  children: ReactNode;
  emptyState?: ReactNode;
  isEmpty?: boolean;
};

export function SectionCard({
  title,
  description,
  viewAllHref,
  viewAllLabel = "View all",
  children,
  emptyState,
  isEmpty,
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5">
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-300 hover:text-indigo-200"
          >
            {viewAllLabel}
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </header>

      {isEmpty ? (
        <div className="rounded-xl border border-dashed border-slate-700/70 bg-slate-950/40 p-5 text-center text-xs text-slate-500">
          {emptyState ?? "Nothing to show yet."}
        </div>
      ) : (
        children
      )}
    </section>
  );
}
