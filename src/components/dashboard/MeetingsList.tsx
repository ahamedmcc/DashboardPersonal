import type { Meeting } from "@prisma/client";
import { CalendarClock, MapPin } from "lucide-react";

function formatDateTime(d: Date): string {
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function startOfTodayMs(): number {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
}

export function MeetingsList({ meetings }: { meetings: Meeting[] }) {
  const today = startOfTodayMs();
  return (
    <ul className="space-y-3">
      {meetings.map((m) => {
        const isToday = m.dateTime.getTime() >= today && m.dateTime.getTime() < today + 86_400_000;
        return (
          <li
            key={m.id}
            className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-medium text-white">{m.title}</h3>
              {isToday && (
                <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-300 ring-1 ring-inset ring-indigo-400/30">
                  Today
                </span>
              )}
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
              <CalendarClock className="h-3 w-3" />
              {formatDateTime(m.dateTime)}
            </p>
            {m.location && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="h-3 w-3" />
                {m.location}
              </p>
            )}
            {m.actionItems.length > 0 && (
              <p className="mt-1 text-[11px] text-amber-300">
                {m.actionItems.length} action item{m.actionItems.length === 1 ? "" : "s"}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
