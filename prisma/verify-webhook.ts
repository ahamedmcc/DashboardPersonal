/**
 * Phase 5 webhook verification.
 *  - confirms each smoke-test row exists in the right table
 *  - confirms TelegramEvent audit log captured both processed and failed events
 *  - cleans up the smoke-test rows (anything with title containing "Webhook smoke")
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tasks = await prisma.task.findMany({
    where: { OR: [{ title: { contains: "Webhook smoke" } }] },
    select: { id: true, title: true, priority: true, source: true },
  });
  const notes = await prisma.knowledgeNote.findMany({
    where: { title: { contains: "Webhook smoke" } },
    select: { id: true, title: true, source: true },
  });
  const meetings = await prisma.meeting.findMany({
    where: { title: { contains: "Webhook smoke" } },
    select: { id: true, title: true, source: true },
  });
  const books = await prisma.bookSummary.findMany({
    where: { bookTitle: { contains: "Webhook smoke" } },
    select: { id: true, bookTitle: true },
  });
  const news = await prisma.newsSummary.findMany({
    where: { title: { contains: "Webhook smoke" } },
    select: { id: true, title: true, category: true },
  });

  console.log("[rows]", { tasks, notes, meetings, books, news });

  // Recent telegram events (smoke test created at least 9001-9006 + failed banana).
  const events = await prisma.telegramEvent.findMany({
    where: { telegramMessageId: { in: ["9001", "9002", "9003", "9004", "9005", "9006"] } },
    select: { telegramMessageId: true, classifiedType: true, processedStatus: true },
    orderBy: { createdAt: "asc" },
  });
  const failed = await prisma.telegramEvent.findMany({
    where: { processedStatus: "failed" },
    select: {
      classifiedType: true,
      processedStatus: true,
      errorMessage: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  console.log("[smoke events]", events);
  console.log("[recent failed]", failed);

  // Cleanup
  const del = await Promise.all([
    prisma.task.deleteMany({ where: { id: { in: tasks.map((t) => t.id) } } }),
    prisma.knowledgeNote.deleteMany({ where: { id: { in: notes.map((n) => n.id) } } }),
    prisma.meeting.deleteMany({ where: { id: { in: meetings.map((m) => m.id) } } }),
    prisma.bookSummary.deleteMany({ where: { id: { in: books.map((b) => b.id) } } }),
    prisma.newsSummary.deleteMany({ where: { id: { in: news.map((n) => n.id) } } }),
  ]);
  console.log("[cleanup deleted]", {
    tasks: del[0].count,
    notes: del[1].count,
    meetings: del[2].count,
    books: del[3].count,
    news: del[4].count,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
