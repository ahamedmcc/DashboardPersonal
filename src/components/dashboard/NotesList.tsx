import type { KnowledgeNote } from "@prisma/client";

export function NotesList({ notes }: { notes: KnowledgeNote[] }) {
  return (
    <ul className="space-y-3">
      {notes.map((n) => (
        <li key={n.id} className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-3">
          <h3 className="text-sm font-medium text-white">{n.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-slate-400">{n.content}</p>
          {n.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {n.tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-slate-800/70 px-2 py-0.5 text-[10px] text-slate-300 ring-1 ring-inset ring-slate-600/40"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
