"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarClock, MapPin, Pencil, Trash2, Users } from "lucide-react";
import type { Meeting } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { MeetingForm } from "./MeetingForm";
import { cn } from "@/lib/cn";

function toLocalInputValue(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function relativeDayLabel(d: Date): { label: string; tone: "today" | "tomorrow" | "soon" | "past" | "future" } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86_400_000);

  if (diffDays === 0) return { label: "Today", tone: "today" };
  if (diffDays === 1) return { label: "Tomorrow", tone: "tomorrow" };
  if (diffDays === -1) return { label: "Yesterday", tone: "past" };
  if (diffDays > 1 && diffDays <= 6)
    return { label: d.toLocaleDateString("en-US", { weekday: "long" }), tone: "soon" };
  if (diffDays < -1)
    return {
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      tone: "past",
    };
  return {
    label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    tone: "future",
  };
}

export function MeetingRow({ meeting }: { meeting: Meeting }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const day = relativeDayLabel(meeting.dateTime);
  const time = meeting.dateTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const dayChip =
    day.tone === "today"
      ? "bg-indigo-500/15 text-indigo-200 ring-indigo-400/30"
      : day.tone === "tomorrow"
        ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30"
        : day.tone === "soon"
          ? "bg-sky-500/15 text-sky-200 ring-sky-400/30"
          : day.tone === "past"
            ? "bg-slate-700/40 text-slate-400 ring-slate-500/30"
            : "bg-slate-700/40 text-slate-200 ring-slate-500/30";

  const doDelete = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/meetings/${meeting.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error(`Failed (${res.status})`);
      setConfirming(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="group rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 transition hover:border-slate-700 hover:bg-slate-900/70">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ring-1 ring-inset",
                dayChip,
              )}
            >
              {day.label}
            </span>
            <h3 className="text-sm font-semibold text-white">{meeting.title}</h3>
            {meeting.source !== "manual" && (
              <span className="rounded-full bg-fuchsia-500/15 px-2 py-0.5 text-[10px] text-fuchsia-200 ring-1 ring-inset ring-fuchsia-400/30">
                from {meeting.source}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CalendarClock className="h-3 w-3" />
              {time} ·{" "}
              {meeting.dateTime.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {meeting.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                {meeting.location}
              </span>
            )}
            {meeting.participants.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Users className="h-3 w-3" />
                {meeting.participants.length} participant
                {meeting.participants.length === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {meeting.participants.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {meeting.participants.slice(0, 6).map((p) => (
                <span
                  key={p}
                  className="rounded-full bg-slate-800/70 px-2 py-0.5 text-[11px] text-slate-300 ring-1 ring-inset ring-slate-600/30"
                >
                  {p}
                </span>
              ))}
              {meeting.participants.length > 6 && (
                <span className="text-[11px] text-slate-500">
                  +{meeting.participants.length - 6} more
                </span>
              )}
            </div>
          )}

          {meeting.agenda && (
            <p className="line-clamp-2 text-sm text-slate-300">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                Agenda ·{" "}
              </span>
              {meeting.agenda}
            </p>
          )}

          {meeting.notes && (
            <p className="line-clamp-2 text-sm text-slate-400">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                Notes ·{" "}
              </span>
              {meeting.notes}
            </p>
          )}

          {meeting.actionItems.length > 0 && (
            <div className="mt-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                Action items ({meeting.actionItems.length})
              </p>
              <ul className="mt-1 space-y-0.5">
                {meeting.actionItems.slice(0, 3).map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-slate-300"
                  >
                    <span aria-hidden className="mt-1 inline-block h-1 w-1 rounded-full bg-amber-400" />
                    <span className="line-clamp-1">{item}</span>
                  </li>
                ))}
                {meeting.actionItems.length > 3 && (
                  <li className="pl-4 text-[11px] text-slate-500">
                    +{meeting.actionItems.length - 3} more
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setEditing(true)}
            iconLeft={<Pencil className="h-3.5 w-3.5" />}
          >
            Edit
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setConfirming(true)}
            iconLeft={<Trash2 className="h-3.5 w-3.5" />}
          >
            Delete
          </Button>
        </div>
      </div>

      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit meeting"
        description="Update meeting details below."
      >
        <MeetingForm
          initial={{
            id: meeting.id,
            title: meeting.title,
            dateTime: toLocalInputValue(meeting.dateTime),
            location: meeting.location ?? "",
            participants: meeting.participants.join(", "),
            agenda: meeting.agenda ?? "",
            notes: meeting.notes ?? "",
            actionItems: meeting.actionItems.join("\n"),
          }}
          onDone={() => setEditing(false)}
        />
      </Modal>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Delete this meeting?"
        description="This cannot be undone."
      >
        <div className="space-y-4">
          <p className="rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-slate-200">
            {meeting.title}
          </p>
          {error && (
            <p className="text-xs text-rose-300" role="alert">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirming(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={doDelete} disabled={busy}>
              {busy ? "Deleting…" : "Delete meeting"}
            </Button>
          </div>
        </div>
      </Modal>
    </li>
  );
}
