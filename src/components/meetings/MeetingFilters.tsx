"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, type ChangeEvent } from "react";
import { MEETING_WINDOWS, type MeetingWindow } from "@/lib/schemas/meeting";
import { Button } from "@/components/ui/Button";

const WINDOW_LABEL: Record<MeetingWindow, string> = {
  all: "All",
  upcoming: "Upcoming",
  today: "Today",
  this_week: "This week",
  past: "Past",
};

export function MeetingFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    startTransition(() => {
      const qs = next.toString();
      router.push(qs ? `/meetings?${qs}` : "/meetings");
    });
  };

  const window = (searchParams.get("window") ?? "upcoming") as MeetingWindow;
  const q = searchParams.get("q") ?? "";

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-800/60 bg-slate-900/40 p-3">
      <Filter label="Window">
        <div className="flex flex-wrap gap-1">
          {MEETING_WINDOWS.map((w) => {
            const active = window === w;
            return (
              <button
                key={w}
                type="button"
                onClick={() => setParam("window", w === "upcoming" ? null : w)}
                className={
                  "rounded-md px-2.5 py-1.5 text-xs font-medium transition " +
                  (active
                    ? "bg-indigo-500/15 text-indigo-200 ring-1 ring-inset ring-indigo-400/30"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white")
                }
              >
                {WINDOW_LABEL[w]}
              </button>
            );
          })}
        </div>
      </Filter>

      <Filter label="Search">
        <input
          className="w-56 rounded-md border border-slate-700/60 bg-slate-900 px-2.5 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          value={q}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setParam("q", e.target.value || null)
          }
          placeholder="Title, agenda, notes…"
        />
      </Filter>

      {(window !== "upcoming" || q) && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            startTransition(() => {
              router.push("/meetings");
            })
          }
        >
          Reset
        </Button>
      )}

      {isPending && <span className="text-xs text-slate-500">Updating…</span>}
    </div>
  );
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}
