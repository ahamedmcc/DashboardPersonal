import { Prisma, TaskStatus } from "@prisma/client";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "@/lib/date-windows";
import type { TaskFilters } from "@/lib/schemas/task";

/**
 * Translate a TaskFilters object into a Prisma `where` clause and `orderBy`.
 * Used by both the API route and the server-rendered /tasks page.
 */
export function buildTaskQuery(filters: TaskFilters): {
  where: Prisma.TaskWhereInput;
  orderBy: Prisma.TaskOrderByWithRelationInput[];
} {
  const where: Prisma.TaskWhereInput = {};
  const conditions: Prisma.TaskWhereInput[] = [];

  if (filters.status) conditions.push({ status: filters.status });
  if (filters.priority) conditions.push({ priority: filters.priority });

  if (filters.window && filters.window !== "any") {
    const now = new Date();
    if (filters.window === "today") {
      conditions.push({ dueDate: { gte: startOfDay(now), lte: endOfDay(now) } });
    } else if (filters.window === "this_week") {
      conditions.push({ dueDate: { gte: startOfWeek(now), lte: endOfWeek(now) } });
    } else if (filters.window === "this_month") {
      conditions.push({ dueDate: { gte: startOfMonth(now), lte: endOfMonth(now) } });
    } else if (filters.window === "overdue") {
      conditions.push({
        dueDate: { lt: startOfDay(now) },
        status: { notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] },
      });
    }
  }

  if (filters.q && filters.q.length > 0) {
    conditions.push({
      OR: [
        { title: { contains: filters.q, mode: "insensitive" } },
        { description: { contains: filters.q, mode: "insensitive" } },
      ],
    });
  }

  if (conditions.length > 0) where.AND = conditions;

  return {
    where,
    orderBy: [
      { dueDate: { sort: "asc", nulls: "last" } },
      { priority: "desc" },
      { createdAt: "desc" },
    ],
  };
}
