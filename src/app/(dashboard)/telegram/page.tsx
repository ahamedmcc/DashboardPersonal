import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { TelegramInboxClient } from "@/components/telegram/InboxClient";
import { HermesConfigPanel } from "@/components/telegram/HermesConfigPanel";

export const dynamic = "force-dynamic";

async function loadCounts() {
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

async function resolveWebhookUrl(): Promise<string> {
  // Prefer an explicit override (so prod / tunnel URL can be set in env).
  const fromEnv = process.env.PUBLIC_WEBHOOK_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "") + "/api/telegram/webhook";

  // Otherwise reflect the request host so the user sees a usable URL.
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}/api/telegram/webhook`;
}

export default async function TelegramInboxPage() {
  const [events, counts, webhookUrl] = await Promise.all([
    prisma.telegramEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    loadCounts(),
    resolveWebhookUrl(),
  ]);

  const secretSet = Boolean(process.env.TELEGRAM_WEBHOOK_SECRET?.trim());

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
          Inbox
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Telegram inbox
        </h1>
        <p className="text-sm text-slate-400">
          Every payload Hermes posts to{" "}
          <code className="rounded bg-slate-800/80 px-1 py-0.5 text-slate-300">
            /api/telegram/webhook
          </code>{" "}
          shows up here — including failures, so you can see exactly what is
          being sent.
        </p>
      </header>

      <TelegramInboxClient
        initialEvents={events.map((e) => ({
          id: e.id,
          telegramMessageId: e.telegramMessageId,
          rawMessage: e.rawMessage,
          classifiedType: e.classifiedType,
          processedStatus: e.processedStatus,
          errorMessage: e.errorMessage,
          createdAt: e.createdAt.toISOString(),
        }))}
        initialCounts={counts}
      />

      <HermesConfigPanel webhookUrl={webhookUrl} secretSet={secretSet} />
    </div>
  );
}
