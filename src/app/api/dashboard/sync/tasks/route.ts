import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fromZodError, serverError } from "@/lib/api/errors";
import {
  hermesTasksPayloadSchema,
  syncHermesTasks,
} from "@/lib/sync/hermes-tasks";

/**
 * POST /api/dashboard/sync/tasks
 *
 * Receives the raw contents of Hermes's tasks.json (running on Hostinger) and
 * reconciles it into the Task table. See src/lib/sync/hermes-tasks.ts for the
 * accepted shapes.
 *
 * Auth: shared `x-webhook-secret` header (same as /api/telegram/webhook).
 * For audit, every sync also writes a TelegramEvent row with classifiedType
 * "hermes-sync" so the inbox surfaces it.
 */

function unauthorized(reason: string) {
  return NextResponse.json(
    { error: { code: "unauthorized", message: reason } },
    { status: 401 },
  );
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

  const parsed = hermesTasksPayloadSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  const items = Array.isArray(parsed.data)
    ? parsed.data
    : "items" in parsed.data
      ? parsed.data.items
      : "tasks" in parsed.data
        ? parsed.data.tasks
        : [];

  const event = await prisma.telegramEvent.create({
    data: {
      rawMessage: body as Prisma.InputJsonValue,
      classifiedType: "hermes-sync-tasks",
      processedStatus: "pending",
    },
  });

  try {
    const summary = await syncHermesTasks(items);
    await prisma.telegramEvent.update({
      where: { id: event.id },
      data: {
        processedStatus: summary.errors.length > 0 ? "failed" : "processed",
        errorMessage:
          summary.errors.length > 0
            ? JSON.stringify(summary.errors).slice(0, 1000)
            : null,
      },
    });
    return NextResponse.json(
      { ok: true, eventId: event.id, summary },
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
