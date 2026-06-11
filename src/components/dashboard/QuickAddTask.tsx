"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { TaskPriority } from "@prisma/client";
import { Button } from "@/components/ui/Button";

const inputClass =
  "w-full rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400";

const selectClass =
  "rounded-md border border-slate-700/60 bg-slate-950 px-2.5 py-2 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400";

type DueOption = "today" | "tomorrow" | "none";

function dueDateForOption(opt: DueOption): string | null {
  if (opt === "none") return null;
  const d = new Date();
  if (opt === "tomorrow") d.setDate(d.getDate() + 1);
  d.setHours(17, 0, 0, 0);
  return d.toISOString();
}

export function QuickAddTask() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [due, setDue] = useState<DueOption>("today");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMessage, setOkMessage] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    setOkMessage(null);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          priority,
          dueDate: dueDateForOption(due),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? `Request failed (${res.status})`);
      }
      setTitle("");
      setOkMessage("Added");
      router.refresh();
      // Clear "Added" hint after a moment.
      setTimeout(() => setOkMessage(null), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
          Quick add
        </h2>
        {okMessage && (
          <span className="text-xs text-emerald-300">{okMessage}</span>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <input
          className={`${inputClass} flex-1`}
          placeholder="What needs to get done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          aria-label="Task title"
        />
        <div className="flex flex-wrap items-center gap-2">
          <select
            className={selectClass}
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            aria-label="Priority"
          >
            <option value={TaskPriority.LOW}>Low</option>
            <option value={TaskPriority.MEDIUM}>Medium</option>
            <option value={TaskPriority.HIGH}>High</option>
            <option value={TaskPriority.URGENT}>Urgent</option>
          </select>
          <select
            className={selectClass}
            value={due}
            onChange={(e) => setDue(e.target.value as DueOption)}
            aria-label="Due"
          >
            <option value="today">Due today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="none">No date</option>
          </select>
          <Button type="submit" disabled={submitting} iconLeft={<Plus className="h-4 w-4" />}>
            {submitting ? "Adding…" : "Add"}
          </Button>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-xs text-rose-300" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
