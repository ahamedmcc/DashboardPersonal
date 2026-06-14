import { z } from "zod";
import { TaskPriority, TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { combineLocalToUtc } from "./hermes-meetings";

/**
 * Hermes (running on Hostinger) writes tasks to a JSON file (tasks.json).
 * The exact shape isn't published, so we accept the same family of inputs as
 * meetings — array, `{ items: [] }`, `{ tasks: [] }`, or `{ "id": {...} }`
 * map — and look for any of several plausible field names per task.
 *
 * Hermes-synced rows have `source = "hermes:<external id>"` so they can be
 * identified, upserted, and pruned. (Same prefix as meetings, but Task is a
 * different table so there's no collision.)
 */

export const HERMES_SOURCE_PREFIX = "hermes:";

const PRIORITY_MAP: Record<string, TaskPriority> = {
  low: TaskPriority.LOW,
  medium: TaskPriority.MEDIUM,
  normal: TaskPriority.MEDIUM,
  high: TaskPriority.HIGH,
  urgent: TaskPriority.URGENT,
  critical: TaskPriority.URGENT,
};

const STATUS_MAP: Record<string, TaskStatus> = {
  pending: TaskStatus.PENDING,
  scheduled: TaskStatus.PENDING,
  todo: TaskStatus.PENDING,
  open: TaskStatus.PENDING,
  in_progress: TaskStatus.IN_PROGRESS,
  "in-progress": TaskStatus.IN_PROGRESS,
  inprogress: TaskStatus.IN_PROGRESS,
  doing: TaskStatus.IN_PROGRESS,
  wip: TaskStatus.IN_PROGRESS,
  completed: TaskStatus.COMPLETED,
  done: TaskStatus.COMPLETED,
  finished: TaskStatus.COMPLETED,
  cancelled: TaskStatus.CANCELLED,
  canceled: TaskStatus.CANCELLED,
};

function normalizePriority(value: string | undefined): TaskPriority {
  if (!value) return TaskPriority.MEDIUM;
  return PRIORITY_MAP[value.toLowerCase().trim()] ?? TaskPriority.MEDIUM;
}

function normalizeStatus(value: string | undefined): TaskStatus {
  if (!value) return TaskStatus.PENDING;
  return STATUS_MAP[value.toLowerCase().trim()] ?? TaskStatus.PENDING;
}

/** Lightweight `string | undefined` selector for raw object access. */
function pickString(
  obj: Record<string, unknown>,
  ...keys: string[]
): string | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim().length > 0) return v;
  }
  return undefined;
}

export type HermesTaskInput = {
  id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  timezone?: string;
  due_date?: string;
  dueDate?: string;
  priority?: string;
  status?: string;
  category?: string;
  source?: string;
  reminder_job_id?: string;
};

/** Loose schema — keep it permissive; we coerce in code. */
export const hermesTaskSchema = z
  .object({
    id: z.string().min(1).optional(),
    title: z.string().trim().min(1).optional(),
    name: z.string().trim().min(1).optional(),
    task: z.string().trim().min(1).optional(),
    description: z.string().optional(),
    notes: z.string().optional(),
    date: z.string().optional(),
    time: z.string().optional(),
    timezone: z.string().optional(),
    tz: z.string().optional(),
    due_date: z.string().optional(),
    dueDate: z.string().optional(),
    due: z.string().optional(),
    deadline: z.string().optional(),
    priority: z.string().optional(),
    status: z.string().optional(),
    state: z.string().optional(),
    category: z.string().optional(),
    tag: z.string().optional(),
    source: z.string().optional(),
    reminder_job_id: z.string().optional(),
    job_id: z.string().optional(),
  })
  .passthrough();

export const hermesTasksPayloadSchema = z.union([
  z.array(hermesTaskSchema),
  z.object({ items: z.array(hermesTaskSchema) }),
  z.object({ tasks: z.array(hermesTaskSchema) }),
  z.record(z.string(), hermesTaskSchema).transform((rec) =>
    Object.entries(rec).map(([k, v]) => ({ ...v, id: v.id ?? k })),
  ),
]);

/** Try to derive a `Date` for the task's due date from any of several shapes. */
function deriveDueDate(item: z.infer<typeof hermesTaskSchema>): Date | null {
  const tz = item.timezone ?? item.tz ?? "UTC";
  const date = item.date;
  const time = item.time;
  if (date && time) {
    try {
      return combineLocalToUtc(date, time, tz);
    } catch {
      return null;
    }
  }
  // single-string fallbacks
  for (const s of [item.due_date, item.dueDate, item.due, item.deadline, date]) {
    if (!s) continue;
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

export type SyncResult = {
  total: number;
  inserted: number;
  updated: number;
  pruned: number;
  errors: Array<{ id?: string; error: string }>;
};

export async function syncHermesTasks(
  rawItems: Array<z.infer<typeof hermesTaskSchema>>,
): Promise<SyncResult> {
  const result: SyncResult = {
    total: rawItems.length,
    inserted: 0,
    updated: 0,
    pruned: 0,
    errors: [],
  };

  const seenSourceKeys = new Set<string>();

  for (const raw of rawItems) {
    // Pull title from any of several aliases.
    const title =
      raw.title ?? raw.name ?? raw.task ?? "(untitled task from Hermes)";
    // Need an id to upsert reliably. Generate one from title+date if missing.
    const itemId =
      raw.id ?? `${title}-${raw.date ?? raw.due_date ?? raw.dueDate ?? ""}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const sourceKey = HERMES_SOURCE_PREFIX + itemId;
    seenSourceKeys.add(sourceKey);

    const status = normalizeStatus(raw.status ?? raw.state);
    if (status === TaskStatus.CANCELLED) {
      const del = await prisma.task.deleteMany({ where: { source: sourceKey } });
      if (del.count > 0) result.pruned += del.count;
      continue;
    }

    try {
      const dueDate = deriveDueDate(raw);
      const priority = normalizePriority(raw.priority);
      const obj = raw as unknown as Record<string, unknown>;

      const noteParts: string[] = [];
      const desc = pickString(obj, "description", "notes");
      if (desc) noteParts.push(desc);
      const origin = pickString(obj, "source");
      if (origin) noteParts.push(`Origin: ${origin}`);
      const job = pickString(obj, "reminder_job_id", "job_id");
      if (job) noteParts.push(`Hermes job: ${job}`);
      const description = noteParts.length ? noteParts.join(" · ") : null;

      const data = {
        title,
        description,
        status,
        priority,
        dueDate,
        category: raw.category ?? raw.tag ?? null,
        source: sourceKey,
      };

      const existing = await prisma.task.findFirst({
        where: { source: sourceKey },
        select: { id: true },
      });

      if (existing) {
        await prisma.task.update({ where: { id: existing.id }, data });
        result.updated += 1;
      } else {
        await prisma.task.create({ data });
        result.inserted += 1;
      }
    } catch (err) {
      result.errors.push({
        id: itemId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Prune Hermes-sourced tasks no longer present in the file.
  if (seenSourceKeys.size > 0) {
    const stale = await prisma.task.deleteMany({
      where: {
        source: { startsWith: HERMES_SOURCE_PREFIX },
        NOT: { source: { in: Array.from(seenSourceKeys) } },
      },
    });
    result.pruned += stale.count;
  } else {
    const stale = await prisma.task.deleteMany({
      where: { source: { startsWith: HERMES_SOURCE_PREFIX } },
    });
    result.pruned += stale.count;
  }

  return result;
}
