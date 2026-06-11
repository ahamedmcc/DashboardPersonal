import { z } from "zod";
import { prisma } from "@/lib/prisma";

/**
 * Hermes (running on Hostinger) writes meetings to a file like:
 *
 *   [
 *     {
 *       "id": "meeting-2026-06-15-1600",
 *       "title": "Meeting",
 *       "date": "2026-06-15",
 *       "time": "16:00",
 *       "timezone": "Asia/Dhaka",
 *       "source": "Telegram voice request",
 *       "reminder_job_id": "6db85d618c3d",
 *       "status": "scheduled"
 *     }
 *   ]
 *
 * We can't make Hermes call our HTTP webhook today, so instead we receive the
 * file's contents (any Hostinger cron / one-shot curl that pipes meetings.json
 * to /api/dashboard/sync/meetings will do) and reconcile it into the Meeting
 * table. Hermes-synced rows have `source = "hermes:<external id>"` so they can
 * be identified and pruned.
 */

export const HERMES_SOURCE_PREFIX = "hermes:";

export const hermesMeetingSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).default("Meeting"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  time: z
    .string()
    .regex(/^\d{1,2}:\d{2}(:\d{2})?$/, "time must be HH:MM (24h)"),
  timezone: z.string().min(1).default("UTC"),
  source: z.string().optional(),
  reminder_job_id: z.string().optional(),
  status: z.string().optional(),
  location: z.string().optional(),
  participants: z.array(z.string()).optional(),
  agenda: z.string().optional(),
  notes: z.string().optional(),
  actionItems: z.array(z.string()).optional(),
});

export type HermesMeeting = z.infer<typeof hermesMeetingSchema>;

/** Accept either an array, an `{ items: [] }` envelope, or `{ "id": {...} }` map. */
export const hermesMeetingsPayloadSchema = z.union([
  z.array(hermesMeetingSchema),
  z.object({ items: z.array(hermesMeetingSchema) }),
  z.object({ meetings: z.array(hermesMeetingSchema) }),
  z
    .record(z.string(), hermesMeetingSchema.omit({ id: true }).extend({
      id: z.string().optional(),
    }))
    .transform((rec) =>
      Object.entries(rec).map(([k, v]) => ({ ...v, id: v.id ?? k })),
    ),
]);

function tzOffsetMs(when: Date, tz: string): number {
  // Trick: format the same instant in `tz` and in `UTC`; the wall-clock delta
  // between the two parsed back is the offset of `tz` at that instant.
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const parts = fmt.formatToParts(when).reduce<Record<string, string>>(
      (acc, p) => {
        if (p.type !== "literal") acc[p.type] = p.value;
        return acc;
      },
      {},
    );
    const asLocal = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour) % 24,
      Number(parts.minute),
      Number(parts.second ?? "0"),
    );
    return asLocal - when.getTime();
  } catch {
    return 0;
  }
}

/** Combine `YYYY-MM-DD` + `HH:MM[:SS]` + IANA timezone into a real UTC Date. */
export function combineLocalToUtc(
  date: string,
  time: string,
  tz = "UTC",
): Date {
  const safeTime = time.length === 5 ? `${time}:00` : time;
  const naive = new Date(`${date}T${safeTime}Z`);
  if (Number.isNaN(naive.getTime())) {
    throw new Error(`invalid date/time: ${date} ${time}`);
  }
  if (!tz || tz === "UTC") return naive;
  const offset = tzOffsetMs(naive, tz);
  return new Date(naive.getTime() - offset);
}

export type SyncResult = {
  total: number;
  inserted: number;
  updated: number;
  pruned: number;
  errors: Array<{ id?: string; error: string }>;
};

export async function syncHermesMeetings(items: HermesMeeting[]): Promise<SyncResult> {
  const result: SyncResult = {
    total: items.length,
    inserted: 0,
    updated: 0,
    pruned: 0,
    errors: [],
  };

  // 1. Reconcile each incoming meeting (skip cancelled ones — Hermes drops
  //    those into the same file with status="cancelled").
  const seenSourceKeys = new Set<string>();

  for (const item of items) {
    const sourceKey = HERMES_SOURCE_PREFIX + item.id;
    seenSourceKeys.add(sourceKey);

    if ((item.status ?? "scheduled").toLowerCase() === "cancelled") {
      const del = await prisma.meeting.deleteMany({ where: { source: sourceKey } });
      if (del.count > 0) result.pruned += del.count;
      continue;
    }

    try {
      const dateTime = combineLocalToUtc(item.date, item.time, item.timezone);
      const noteParts: string[] = [];
      if (item.notes) noteParts.push(item.notes);
      if (item.source) noteParts.push(`Origin: ${item.source}`);
      if (item.reminder_job_id) noteParts.push(`Hermes job: ${item.reminder_job_id}`);
      const notes = noteParts.length ? noteParts.join(" · ") : null;

      const data = {
        title: item.title,
        dateTime,
        location: item.location ?? null,
        participants: item.participants ?? [],
        agenda: item.agenda ?? null,
        notes,
        actionItems: item.actionItems ?? [],
        source: sourceKey,
      };

      const existing = await prisma.meeting.findFirst({
        where: { source: sourceKey },
        select: { id: true },
      });

      if (existing) {
        await prisma.meeting.update({ where: { id: existing.id }, data });
        result.updated += 1;
      } else {
        await prisma.meeting.create({ data });
        result.inserted += 1;
      }
    } catch (err) {
      result.errors.push({
        id: item.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // 2. Prune Hermes-sourced meetings that are no longer in the file.
  if (seenSourceKeys.size > 0) {
    const stale = await prisma.meeting.deleteMany({
      where: {
        source: { startsWith: HERMES_SOURCE_PREFIX },
        NOT: { source: { in: Array.from(seenSourceKeys) } },
      },
    });
    result.pruned += stale.count;
  } else {
    // empty payload → wipe all hermes-sourced meetings
    const stale = await prisma.meeting.deleteMany({
      where: { source: { startsWith: HERMES_SOURCE_PREFIX } },
    });
    result.pruned += stale.count;
  }

  return result;
}
