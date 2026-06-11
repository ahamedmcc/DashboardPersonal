"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, type ChangeEvent } from "react";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_WINDOWS,
  type TaskWindow,
} from "@/lib/schemas/task";
import { TaskPriority, TaskStatus } from "@prisma/client";
import { Button } from "@/components/ui/Button";

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

const WINDOW_LABEL: Record<TaskWindow, string> = {
  any: "Any time",
  today: "Today",
  this_week: "This week",
  this_month: "This month",
  overdue: "Overdue",
};

export function TaskFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    startTransition(() => {
      const qs = next.toString();
      router.push(qs ? `/tasks?${qs}` : "/tasks");
    });
  };

  const onSelect =
    (key: string) =>
    (e: ChangeEvent<HTMLSelectElement>): void => {
      setParam(key, e.target.value || null);
    };

  const selectClass =
    "rounded-md border border-slate-700/60 bg-slate-900 px-2.5 py-1.5 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400";

  const status = searchParams.get("status") ?? "";
  const priority = searchParams.get("priority") ?? "";
  const window = searchParams.get("window") ?? "";
  const hasAnyFilter = Boolean(status || priority || window);

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-800/60 bg-slate-900/40 p-3">
      <Filter label="Status">
        <select className={selectClass} value={status} onChange={onSelect("status")}>
          <option value="">Any</option>
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </Filter>

      <Filter label="Priority">
        <select className={selectClass} value={priority} onChange={onSelect("priority")}>
          <option value="">Any</option>
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABEL[p]}
            </option>
          ))}
        </select>
      </Filter>

      <Filter label="Due">
        <select className={selectClass} value={window} onChange={onSelect("window")}>
          <option value="">Any time</option>
          {TASK_WINDOWS.filter((w) => w !== "any").map((w) => (
            <option key={w} value={w}>
              {WINDOW_LABEL[w]}
            </option>
          ))}
        </select>
      </Filter>

      {hasAnyFilter && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            startTransition(() => {
              router.push("/tasks");
            })
          }
        >
          Clear filters
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
