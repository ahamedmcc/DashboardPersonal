"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { TaskPriority, TaskStatus } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/schemas/task";

export type TaskFormValue = {
  id?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  category: string;
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

const inputClass =
  "w-full rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400";

const labelClass = "text-xs font-semibold uppercase tracking-widest text-slate-400";

export function TaskForm({
  initial,
  onDone,
}: {
  initial?: Partial<TaskFormValue>;
  onDone: () => void;
}) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [value, setValue] = useState<TaskFormValue>({
    id: initial?.id,
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    status: (initial?.status as TaskStatus) ?? TaskStatus.PENDING,
    priority: (initial?.priority as TaskPriority) ?? TaskPriority.MEDIUM,
    dueDate: initial?.dueDate ?? "",
    category: initial?.category ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = <K extends keyof TaskFormValue>(key: K, v: TaskFormValue[K]) =>
    setValue((prev) => ({ ...prev, [key]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!value.title.trim()) {
      setError("Title is required");
      return;
    }
    setSubmitting(true);
    setError(null);

    const payload: Record<string, unknown> = {
      title: value.title.trim(),
      description: value.description.trim() || null,
      status: value.status,
      priority: value.priority,
      dueDate: value.dueDate || null,
      category: value.category.trim() || null,
    };

    try {
      const url = isEdit ? `/api/tasks/${value.id}` : "/api/tasks";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? `Request failed with ${res.status}`);
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
        <label className={labelClass} htmlFor="task-title">
          Title
        </label>
        <input
          id="task-title"
          className={inputClass + " mt-1"}
          value={value.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Prepare ERP meeting note"
          maxLength={200}
          required
          autoFocus
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="task-description">
          Description
        </label>
        <textarea
          id="task-description"
          rows={3}
          className={inputClass + " mt-1 resize-y"}
          value={value.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Optional details, links, context"
          maxLength={2000}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="task-status">
            Status
          </label>
          <select
            id="task-status"
            className={inputClass + " mt-1"}
            value={value.status}
            onChange={(e) => handleChange("status", e.target.value as TaskStatus)}
          >
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="task-priority">
            Priority
          </label>
          <select
            id="task-priority"
            className={inputClass + " mt-1"}
            value={value.priority}
            onChange={(e) => handleChange("priority", e.target.value as TaskPriority)}
          >
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="task-due">
            Due
          </label>
          <input
            id="task-due"
            type="datetime-local"
            className={inputClass + " mt-1"}
            value={value.dueDate}
            onChange={(e) => handleChange("dueDate", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="task-category">
            Category
          </label>
          <input
            id="task-category"
            className={inputClass + " mt-1"}
            value={value.category}
            onChange={(e) => handleChange("category", e.target.value)}
            placeholder="work, personal, learning…"
            maxLength={64}
          />
        </div>
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
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Create task"}
        </Button>
      </div>
    </form>
  );
}
