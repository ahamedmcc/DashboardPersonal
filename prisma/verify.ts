/**
 * Tiny verification script for the Phase 1 data check checklist items.
 * Not part of the runtime app — safe to delete, kept for re-running locally.
 *
 *   npx tsx prisma/verify.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const erpTask = await prisma.task.findFirst({
    where: { title: "Prepare ERP meeting note" },
  });
  console.log("[Task] Prepare ERP meeting note ->", {
    found: Boolean(erpTask),
    priority: erpTask?.priority,
    status: erpTask?.status,
    source: erpTask?.source,
  });

  const failedEvent = await prisma.telegramEvent.findFirst({
    where: { processedStatus: "failed" },
  });
  console.log("[TelegramEvent] failed event ->", {
    found: Boolean(failedEvent),
    classifiedType: failedEvent?.classifiedType,
    errorMessage: failedEvent?.errorMessage,
  });

  const counts = {
    users: await prisma.user.count(),
    tasks: await prisma.task.count(),
    meetings: await prisma.meeting.count(),
    knowledgeNotes: await prisma.knowledgeNote.count(),
    emailSummaries: await prisma.emailSummary.count(),
    newsSummaries: await prisma.newsSummary.count(),
    bookSummaries: await prisma.bookSummary.count(),
    telegramEvents: await prisma.telegramEvent.count(),
  };
  console.log("[counts]", counts);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
