import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hermesPayloadSchema } from "@/lib/schemas/hermes";
import { routeHermesPayload } from "@/services/hermes-router";
import { sendTelegramMessage } from "@/services/telegram";

/**
 * POST /api/telegram/webhook — entry point for Telegram input that arrives
 * via the Hermes agent (ChatGPT-authenticated upstream).
 *
 * Flow:
 *   1. Validate the shared secret on the X-Webhook-Secret header.
 *   2. Always log the raw payload as a TelegramEvent (audit trail per SRS §7.4).
 *   3. Parse the body against the Hermes schema.
 *   4. Route the typed payload into the correct table.
 *   5. Update the TelegramEvent with processed/failed status.
 *   6. Send a confirmation back to Telegram (no-op in dev without a token).
 */

function unauthorized(reason: string) {
  return NextResponse.json(
    { error: { code: "unauthorized", message: reason } },
    { status: 401 },
  );
}

function extractMessageId(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const obj = body as Record<string, unknown>;
  const direct = obj.telegramMessageId ?? obj.messageId;
  if (typeof direct === "string" || typeof direct === "number") return String(direct);
  // Telegram-native shape: { message: { message_id, ... } }
  const message = obj.message as Record<string, unknown> | undefined;
  if (message && typeof message === "object") {
    const id = message.message_id;
    if (typeof id === "string" || typeof id === "number") return String(id);
  }
  return null;
}

function extractChatId(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const obj = body as Record<string, unknown>;
  if (typeof obj.chatId === "string" || typeof obj.chatId === "number") {
    return String(obj.chatId);
  }
  const message = obj.message as Record<string, unknown> | undefined;
  const chat = message?.chat as Record<string, unknown> | undefined;
  if (chat && (typeof chat.id === "string" || typeof chat.id === "number")) {
    return String(chat.id);
  }
  return null;
}

export async function POST(request: NextRequest) {
  // 1) Secret check.
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (expected) {
    const provided = request.headers.get("x-webhook-secret");
    if (provided !== expected) return unauthorized("Invalid webhook secret");
  } else {
    console.warn(
      "[webhook] TELEGRAM_WEBHOOK_SECRET is not set — accepting all requests (dev only).",
    );
  }

  // 2) Read body and log raw event first (audit trail).
  const body = await request.json().catch(() => null);
  const rawForJson = (body ?? { error: "invalid_json" }) as Prisma.InputJsonValue;
  const event = await prisma.telegramEvent.create({
    data: {
      rawMessage: rawForJson,
      telegramMessageId: extractMessageId(body),
      processedStatus: "pending",
    },
  });

  if (!body || typeof body !== "object") {
    await prisma.telegramEvent.update({
      where: { id: event.id },
      data: {
        processedStatus: "failed",
        classifiedType: "unknown",
        errorMessage: "Body was not valid JSON",
      },
    });
    return NextResponse.json(
      {
        ok: false,
        eventId: event.id,
        error: { code: "bad_request", message: "Invalid JSON body" },
      },
      { status: 400 },
    );
  }

  // 3) Parse against the Hermes schema.
  const parsed = hermesPayloadSchema.safeParse(body);
  if (!parsed.success) {
    const candidateType =
      typeof (body as Record<string, unknown>).type === "string"
        ? String((body as Record<string, unknown>).type)
        : "unknown";
    const flat = (parsed.error as ZodError).flatten();
    await prisma.telegramEvent.update({
      where: { id: event.id },
      data: {
        processedStatus: "failed",
        classifiedType: candidateType,
        errorMessage: JSON.stringify(flat),
      },
    });
    return NextResponse.json(
      {
        ok: false,
        eventId: event.id,
        error: { code: "validation_failed", message: "Payload failed validation", details: flat },
      },
      { status: 400 },
    );
  }

  // 4) Route to the correct table.
  try {
    const result = await routeHermesPayload(parsed.data);

    // 5) Mark event processed.
    await prisma.telegramEvent.update({
      where: { id: event.id },
      data: { processedStatus: "processed", classifiedType: result.type },
    });

    // 6) Send confirmation back to Telegram (no-op without a token).
    const send = await sendTelegramMessage(
      result.confirmation,
      extractChatId(body),
    );

    return NextResponse.json(
      {
        ok: true,
        eventId: event.id,
        type: result.type,
        target: result.target,
        recordId: result.recordId,
        confirmation: { text: result.confirmation, ...send },
      },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[webhook] route failed:", err);
    await prisma.telegramEvent.update({
      where: { id: event.id },
      data: {
        processedStatus: "failed",
        classifiedType: parsed.data.type,
        errorMessage: message,
      },
    });
    return NextResponse.json(
      {
        ok: false,
        eventId: event.id,
        error: { code: "internal_error", message },
      },
      { status: 500 },
    );
  }
}
