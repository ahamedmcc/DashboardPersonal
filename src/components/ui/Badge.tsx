import type { ReactNode } from "react";
import { TaskPriority, TaskStatus } from "@prisma/client";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  className?: string;
};

export function Badge({ children, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        className,
      )}
    >
      {children}
    </span>
  );
}

const STATUS_CLASSES: Record<TaskStatus, string> = {
  PENDING: "bg-slate-700/40 text-slate-200 ring-slate-500/30",
  IN_PROGRESS: "bg-amber-500/15 text-amber-200 ring-amber-400/30",
  COMPLETED: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  CANCELLED: "bg-slate-700/30 text-slate-400 ring-slate-600/30 line-through",
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <Badge className={STATUS_CLASSES[status]}>{STATUS_LABEL[status]}</Badge>;
}

const PRIORITY_CLASSES: Record<TaskPriority, string> = {
  LOW: "bg-slate-700/30 text-slate-300 ring-slate-500/30",
  MEDIUM: "bg-sky-500/15 text-sky-200 ring-sky-400/30",
  HIGH: "bg-orange-500/15 text-orange-200 ring-orange-400/30",
  URGENT: "bg-rose-500/20 text-rose-200 ring-rose-400/40",
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Badge className={PRIORITY_CLASSES[priority]}>{PRIORITY_LABEL[priority]}</Badge>;
}
