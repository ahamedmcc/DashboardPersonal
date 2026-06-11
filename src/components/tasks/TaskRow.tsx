"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { TaskStatus, type Task } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { TaskForm } from "./TaskForm";
import { cn } from "@/lib/cn";

function toLocalInputValue(d: Date | null): string {
  if (!d) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDue(d: Date | null): { label: string; overdue: boolean } | null {
  if (!d) return null;
  const now = new Date();
  const startOfTodayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const overdue = d.getTime() < startOfTodayMs;
  const label = d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return { label, overdue };
}

export function TaskRow({ task }: { task: Task }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completed = task.status === TaskStatus.COMPLETED;
  const cancelled = task.status === TaskStatus.CANCELLED;
  const due = formatDue(task.dueDate);
  const isOverdue = !!due?.overdue && !completed && !cancelled;

  const toggleComplete = async () => {
    setBusy(true);
    setError(null);
    const next = completed ? TaskStatus.PENDING : TaskStatus.COMPLETED;
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
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
    <li
      className={cn(
        "group flex flex-col gap-3 rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 transition hover:border-slate-700 hover:bg-slate-900/70 sm:flex-row sm:items-start sm:gap-4",
        completed && "opacity-70",
      )}
    >
      <button
        type="button"
        aria-label={completed ? "Mark as pending" : "Mark as completed"}
        onClick={toggleComplete}
        disabled={busy}
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
          completed
            ? "border-emerald-400 bg-emerald-500/30 text-emerald-200"
            : "border-slate-600 hover:border-emerald-400 hover:bg-emerald-500/10",
        )}
      >
        {completed ? "✓" : ""}
      </button>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3
            className={cn(
              "text-sm font-semibold text-white",
              completed && "line-through text-slate-300",
            )}
          >
            {task.title}
          </h3>
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

        {task.description && (
          <p className="text-sm text-slate-400">{task.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
          {due && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
                isOverdue
                  ? "bg-rose-500/15 text-rose-200 ring-rose-400/30"
                  : "bg-slate-800/70 text-slate-300 ring-slate-600/30",
              )}
            >
              {isOverdue ? "Overdue · " : "Due "}
              {due.label}
            </span>
          )}
          {task.category && (
            <span className="inline-flex items-center rounded-full bg-slate-800/70 px-2 py-0.5 text-[11px] text-slate-300 ring-1 ring-inset ring-slate-600/30">
              {task.category}
            </span>
          )}
          {task.source !== "manual" && (
            <span className="inline-flex items-center rounded-full bg-fuchsia-500/15 px-2 py-0.5 text-[11px] text-fuchsia-200 ring-1 ring-inset ring-fuchsia-400/30">
              from {task.source}
            </span>
          )}
        </div>

        {error && (
          <p className="text-xs text-rose-300" role="alert">
            {error}
          </p>
        )}
      </div>

      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit task"
        description="Update the task details below."
      >
        <TaskForm
          initial={{
            id: task.id,
            title: task.title,
            description: task.description ?? "",
            status: task.status,
            priority: task.priority,
            dueDate: toLocalInputValue(task.dueDate),
            category: task.category ?? "",
          }}
          onDone={() => setEditing(false)}
        />
      </Modal>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Delete this task?"
        description="This cannot be undone."
      >
        <div className="space-y-4">
          <p className="rounded-md border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-slate-200">
            {task.title}
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
              {busy ? "Deleting…" : "Delete task"}
            </Button>
          </div>
        </div>
      </Modal>
    </li>
  );
}
