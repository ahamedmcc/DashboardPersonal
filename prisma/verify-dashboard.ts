/**
 * Cross-check Phase 4 dashboard counts against the DB directly.
 * Disposable verification script — safe to delete.
 */

import { PrismaClient, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const open = [TaskStatus.PENDING, TaskStatus.IN_PROGRESS];

  const [openTotal, inProgress, dueToday, overdue] = await Promise.all([
    prisma.task.count({ where: { status: { in: open } } }),
    prisma.task.count({ where: { status: TaskStatus.IN_PROGRESS } }),
    prisma.task.count({
      where: { status: { in: open }, dueDate: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.task.count({
      where: { status: { in: open }, dueDate: { lt: todayStart } },
    }),
  ]);

  console.log("[stats]", { openTotal, inProgress, dueToday, overdue });

  const overdueRows = await prisma.task.findMany({
    where: { status: { in: open }, dueDate: { lt: todayStart } },
    select: { title: true, dueDate: true, priority: true },
  });
  console.log("[overdue rows]", overdueRows);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
