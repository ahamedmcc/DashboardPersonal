import type { ReactNode } from "react";

type Props = {
  title: string;
  eyebrow?: string;
  description: string;
  comingInPhase?: string;
  bullets?: string[];
  children?: ReactNode;
};

export function PagePlaceholder({
  title,
  eyebrow,
  description,
  comingInPhase,
  bullets,
  children,
}: Props) {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-2xl text-slate-400">{description}</p>
      </header>

      {bullets && bullets.length > 0 && (
        <section className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            What this page will do
          </h2>
          <ul className="mt-3 space-y-2 text-slate-300">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <span
                  aria-hidden
                  className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-indigo-400"
                />
                <span className="text-sm">{b}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {children}

      {comingInPhase && (
        <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/30 p-5 text-sm text-slate-400">
          <span className="font-medium text-slate-200">Coming in {comingInPhase}.</span>{" "}
          This is a Phase 2 navigation stub — full functionality lands in the indicated phase.
        </div>
      )}
    </div>
  );
}
