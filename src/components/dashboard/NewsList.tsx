import type { NewsSummary } from "@prisma/client";

export function NewsList({ news }: { news: NewsSummary[] }) {
  return (
    <ul className="space-y-3">
      {news.map((n) => (
        <li key={n.id} className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium text-white">{n.title}</h3>
            <span className="rounded-full bg-slate-800/70 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-300 ring-1 ring-inset ring-slate-600/40">
              {n.category}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-slate-400">{n.summary}</p>
          {n.sourceUrl && (
            <a
              href={n.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-[11px] font-medium text-indigo-300 hover:text-indigo-200"
            >
              Source ↗
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
