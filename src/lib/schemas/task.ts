import { TaskPriority, TaskStatus } from "@prisma/client";
import { z } from "zod";

export const taskStatusEnum = z.nativeEnum(TaskStatus);
export const taskPriorityEnum = z.nativeEnum(TaskPriority);

export const TASK_STATUSES: TaskStatus[] = [
  TaskStatus.PENDING,
  TaskStatus.IN_PROGRESS,
  TaskStatus.COMPLETED,
  TaskStatus.CANCELLED,
];

export const TASK_PRIORITIES: TaskPriority[] = [
  TaskPriority.LOW,
  TaskPriority.MEDIUM,
  TaskPriority.HIGH,
  TaskPriority.URGENT,
];

export const TASK_WINDOWS = ["any", "today", "this_week", "this_month", "overdue"] as const;
export type TaskWindow = (typeof TASK_WINDOWS)[number];

const trimmed = z.string().trim();

const optionalDateString = z
  .string()
  .trim()
  .min(1, "Due date cannot be empty")
  .refine((v) => !Number.isNaN(Date.parse(v)), { message: "Invalid date" })
  .optional()
  .nullable()
  .or(z.literal(""));

/** Body shape accepted by `POST /api/tasks`. */
export const createTaskSchema = z.object({
  title: trimmed.min(1, "Title is required").max(200, "Title is too long"),
  description: trimmed.max(2000).optional().nullable(),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  dueDate: optionalDateString,
  category: trimmed.max(64).optional().nullable(),
  source: trimmed.max(32).optional(),
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

/** Body shape accepted by `PATCH /api/tasks/:id`. */
export const updateTaskSchema = createTaskSchema.partial();
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

/** Query-string shape for `GET /api/tasks` (and the /tasks page). */
export const taskFiltersSchema = z.object({
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  window: z.enum(TASK_WINDOWS).optional(),
  q: trimmed.max(100).optional(),
});
export type TaskFilters = z.infer<typeof taskFiltersSchema>;
