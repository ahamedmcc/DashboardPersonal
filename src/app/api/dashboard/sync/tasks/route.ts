import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { serverError } from "@/lib/api/errors";
import { hermesTaskSchema, syncHermesTasks } from "@/lib/sync/hermes-tasks";

/**
 * POST /api/dashboard/sync/tasks
 *
 * Receives the raw contents of Hermes's tasks.json (running on Hostinger) and
 * reconciles it into the Task table.
 *
 * Auth: shared `x-webhook-secret` header.
 * Audit: every call writes a TelegramEvent row with classifiedType
 * "hermes-sync-tasks" — including failed validations, so the raw payload is
 * always visible in /telegram for debugging.
 */

function unauthorized(reason: string) {
  return NextResponse.json(
    { error: { code: "unauthorized", message: reason } },
    { status: 401 },
  );
}

/**
 * Pull task-like records out of any reasonable JSON shape:
 *   - top-level array
 *   - { items: [...] } / { tasks: [...] } / { data: [...] } / { records: [...] }
 *   - record-of-objects keyed by id: { "task-1": {...}, "task-2": {...} }
 *   - a single task object → wrap as [task]
 */
function extractTaskCandidates(body: unknown): {
  items: unknown[];
  shape: string;
} {
  if (Array.isArray(body)) return { items: body, shape: "array" };
  if (body && typeof body === "object") {
    const obj = body as Record<string, unknown>;
    for (const key of ["items", "tasks", "data", "records", "list", "results"]) {
      const v = obj[key];
      if (Array.isArray(v)) return { items: v, shape: `wrapped:${key}` };
    }
    // record-of-objects
    const values = Object.values(obj);
    if (values.length > 0 && values.every((v) => v && typeof v === "object" && !Array.isArray(v))) {
      const items = Object.entries(obj).map(([k, v]) => ({
        ...(v as Record<string, unknown>),
        id: (v as Record<string, unknown>).id ?? k,
      }));
      return { items, shape: "record-of-objects" };
    }
    // single object → treat as one task
    return { items: [obj], shape: "single-object" };
  }
  return { items: [], shape: "unknown" };
}

export async function POST(request: NextRequest) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (expected) {
    const provided = request.headers.get("x-webhook-secret");
    if (provided !== expected) return unauthorized("Invalid webhook secret");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "bad_request", message: "Invalid JSON body" } },
      { status: 400 },
    );
  }

  // Always log the raw payload first so /telegram surfaces what arrived,
  // even if downstream validation fails.
  const event = await prisma.telegramEvent.create({
    data: {
      rawMessage: body as Prisma.InputJsonValue,
      classifiedType: "hermes-sync-tasks",
      processedStatus: "pending",
    },
  });

  const { items: candidates, shape } = extractTaskCandidates(body);

  // Validate each candidate individually. Skip invalid ones rather than failing
  // the whole batch — Hermes adds new fields all the time and the parser is
  // permissive (every field is optional).
  const valid: Array<ReturnType<typeof hermesTaskSchema.parse>> = [];
  const skipped: Array<{ index: number; error: string }> = [];
  candidates.forEach((c, i) => {
    const r = hermesTaskSchema.safeParse(c);
    if (r.success) valid.push(r.data);
    else skipped.push({ index: i, error: r.error.message.slice(0, 240) });
  });

  try {
    const summary = await syncHermesTasks(valid);
    const allErrors = [
      ...summary.errors,
      ...skipped.map((s) => ({ id: `index-${s.index}`, error: s.error })),
    ];
    await prisma.telegramEvent.update({
      where: { id: event.id },
      data: {
        processedStatus: allErrors.length > 0 ? "failed" : "processed",
        errorMessage:
          allErrors.length > 0
            ? JSON.stringify(allErrors).slice(0, 1000)
            : null,
      },
    });
    return NextResponse.json(
      {
        ok: true,
        eventId: event.id,
        shape,
        candidates: candidates.length,
        validated: valid.length,
        skipped: skipped.length,
        summary,
      },
      { status: 200 },
    );
  } catch (err) {
    await prisma.telegramEvent.update({
      where: { id: event.id },
      data: {
        processedStatus: "failed",
        errorMessage: err instanceof Error ? err.message : String(err),
      },
    });
    return serverError(err);
  }
}

export const dynamic = "force-dynamic";
