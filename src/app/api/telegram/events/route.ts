import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fromZodError, serverError } from "@/lib/api/errors";

/**
 * GET /api/telegram/events
 *
 * List recent TelegramEvent rows so the dashboard can show what Hermes is
 * pushing to us in (near) real time. Supports light filtering and pagination.
 *
 * Query params:
 *   - status:    pending | processed | failed | any
 *   - type:      task | meeting | note | knowledge | book | news | reminder | unknown
 *   - q:         substring match against rawMessage (case-insensitive, JSON path)
 *   - limit:     1..100   (default 50)
 *   - cursor:    event id to paginate from (returns events older than the cursor)
 */

const statusSchema = z
  .enum(["pending", "processed", "failed", "any"])
  .default("any");

const querySchema = z.object({
  status: statusSchema.optional(),
  type: z.string().min(1).max(40).optional(),
  q: z.string().min(1).max(120).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().min(1).optional(),
});

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const raw = Object.fromEntries(url.searchParams.entries());
  const parsed = querySchema.safeParse(raw);
  if (!parsed.success) return fromZodError(parsed.error);

  const { status, type, q, limit, cursor } = parsed.data;
  const take = limit ?? 50;

  const where: Prisma.TelegramEventWhereInput = {};
  if (status && status !== "any") where.processedStatus = status;
  if (type) where.classifiedType = type;
  // q: simple substring match on JSON-stringified rawMessage. Done in app
  // memory after fetch since Postgres jsonb full-text would require an
  // expression index we haven't created yet.

  try {
    const events = await prisma.telegramEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: take + 1, // fetch one extra to detect if there are more
      ...(cursor
        ? { skip: 1, cursor: { id: cursor } }
        : {}),
    });

    let filtered = events;
    if (q) {
      const needle = q.toLowerCase();
      filtered = events.filter((e) => {
        try {
          return JSON.stringify(e.rawMessage).toLowerCase().includes(needle);
        } catch {
          return false;
        }
      });
    }

    const hasMore = filtered.length > take;
    const page = hasMore ? filtered.slice(0, take) : filtered;
    const nextCursor = hasMore ? page[page.length - 1].id : null;

    return NextResponse.json({
      events: page,
      nextCursor,
      counts: await getCounts(),
    });
  } catch (err) {
    return serverError(err);
  }
}

async function getCounts() {
  const groups = await prisma.telegramEvent.groupBy({
    by: ["processedStatus"],
    _count: { _all: true },
  });
  const totals = { processed: 0, pending: 0, failed: 0, total: 0 };
  for (const g of groups) {
    const k = g.processedStatus as keyof typeof totals;
    if (k === "processed" || k === "pending" || k === "failed") {
      totals[k] = g._count._all;
    }
    totals.total += g._count._all;
  }
  return totals;
}
