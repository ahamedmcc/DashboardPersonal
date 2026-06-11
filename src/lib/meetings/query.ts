import type { Prisma } from "@prisma/client";
import { endOfDay, endOfWeek, startOfDay, startOfWeek } from "@/lib/date-windows";
import type { MeetingFilters } from "@/lib/schemas/meeting";

export type ResolvedMeetingQuery = {
  where: Prisma.MeetingWhereInput;
  orderBy: Prisma.MeetingOrderByWithRelationInput[];
};

export function buildMeetingQuery(filters: MeetingFilters): ResolvedMeetingQuery {
  const where: Prisma.MeetingWhereInput = {};
  const conditions: Prisma.MeetingWhereInput[] = [];
  const window = filters.window ?? "upcoming";
  const now = new Date();

  if (window === "upcoming") {
    conditions.push({ dateTime: { gte: now } });
  } else if (window === "today") {
    conditions.push({
      dateTime: { gte: startOfDay(now), lte: endOfDay(now) },
    });
  } else if (window === "this_week") {
    conditions.push({
      dateTime: { gte: startOfWeek(now), lte: endOfWeek(now) },
    });
  } else if (window === "past") {
    conditions.push({ dateTime: { lt: now } });
  }
  // "all" → no time filter

  if (filters.q && filters.q.length > 0) {
    conditions.push({
      OR: [
        { title: { contains: filters.q, mode: "insensitive" } },
        { agenda: { contains: filters.q, mode: "insensitive" } },
        { notes: { contains: filters.q, mode: "insensitive" } },
        { location: { contains: filters.q, mode: "insensitive" } },
      ],
    });
  }

  if (conditions.length > 0) where.AND = conditions;

  // Past meetings: most recent first. Everything else: nearest first.
  const orderBy: Prisma.MeetingOrderByWithRelationInput[] =
    window === "past" || window === "all"
      ? [{ dateTime: "desc" }]
      : [{ dateTime: "asc" }];

  return { where, orderBy };
}
