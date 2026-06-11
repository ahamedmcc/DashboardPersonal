"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";

export type MeetingFormValue = {
  id?: string;
  title: string;
  dateTime: string; // datetime-local string
  location: string;
  participants: string; // comma-separated
  agenda: string;
  notes: string;
  actionItems: string; // one per line
};

const inputClass =
  "w-full rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400";

const labelClass = "text-xs font-semibold uppercase tracking-widest text-slate-400";

function splitParticipants(s: string): string[] {
  return s
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

function splitLines(s: string): string[] {
  return s
    .split(/\r?\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

export function MeetingForm({
  initial,
  onDone,
}: {
  initial?: Partial<MeetingFormValue>;
  onDone: () => void;
}) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [value, setValue] = useState<MeetingFormValue>({
    id: initial?.id,
    title: initial?.title ?? "",
    dateTime: initial?.dateTime ?? "",
    location: initial?.location ?? "",
    participants: initial?.participants ?? "",
    agenda: initial?.agenda ?? "",
    notes: initial?.notes ?? "",
    actionItems: initial?.actionItems ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = <K extends keyof MeetingFormValue>(
    key: K,
    v: MeetingFormValue[K],
  ) => setValue((prev) => ({ ...prev, [key]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!value.title.trim()) return setError("Title is required");
    if (!value.dateTime) return setError("Date and time are required");
    setSubmitting(true);
    setError(null);

    const payload: Record<string, unknown> = {
      title: value.title.trim(),
      dateTime: value.dateTime,
      location: value.location.trim() || null,
      participants: splitParticipants(value.participants),
      agenda: value.agenda.trim() || null,
      notes: value.notes.trim() || null,
      actionItems: splitLines(value.actionItems),
    };

    try {
      const url = isEdit ? `/api/meetings/${value.id}` : "/api/meetings";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? `Request failed (${res.status})`);
      }
      router.refresh();
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className={labelClass} htmlFor="m-title">
          Title
        </label>
        <input
          id="m-title"
          className={`${inputClass} mt-1`}
          value={value.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="ERP rollout sync"
          maxLength={200}
          required
          autoFocus
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="m-when">
            When
          </label>
          <input
            id="m-when"
            type="datetime-local"
            className={`${inputClass} mt-1`}
            value={value.dateTime}
            onChange={(e) => handleChange("dateTime", e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="m-where">
            Location
          </label>
          <input
            id="m-where"
            className={`${inputClass} mt-1`}
            value={value.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="Google Meet, Room 4B…"
            maxLength={200}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="m-people">
          Participants <span className="font-normal text-slate-500">(comma-separated)</span>
        </label>
        <input
          id="m-people"
          className={`${inputClass} mt-1`}
          value={value.participants}
          onChange={(e) => handleChange("participants", e.target.value)}
          placeholder="Tanvir, PM, Vendor lead"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="m-agenda">
          Agenda
        </label>
        <textarea
          id="m-agenda"
          rows={3}
          className={`${inputClass} mt-1 resize-y`}
          value={value.agenda}
          onChange={(e) => handleChange("agenda", e.target.value)}
          placeholder="Topics to cover"
          maxLength={4000}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="m-notes">
          Notes
        </label>
        <textarea
          id="m-notes"
          rows={3}
          className={`${inputClass} mt-1 resize-y`}
          value={value.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Decisions, summary, follow-ups"
          maxLength={8000}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="m-actions">
          Action items <span className="font-normal text-slate-500">(one per line)</span>
        </label>
        <textarea
          id="m-actions"
          rows={3}
          className={`${inputClass} mt-1 resize-y`}
          value={value.actionItems}
          onChange={(e) => handleChange("actionItems", e.target.value)}
          placeholder={"Send proposal to vendor\nSchedule follow-up next week"}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"
        >
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onDone} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Create meeting"}
        </Button>
      </div>
    </form>
  );
}
