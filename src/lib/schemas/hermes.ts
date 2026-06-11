import { TaskPriority } from "@prisma/client";
import { z } from "zod";

/**
 * Schemas for payloads we accept on `POST /api/telegram/webhook`.
 *
 * The dashboard receives data that has *already been processed by Hermes*
 * (which uses ChatGPT-authenticated flow upstream). The application backend
 * never calls OpenAI directly. See SRS §1.3.
 *
 * Each payload includes a `type` discriminator. Optional `telegramMessageId`,
 * `chatId`, and `raw` fields keep the original Telegram message for audit.
 */

const optionalString = z.string().trim().min(1).optional().nullable();
const isoDateString = z
  .string()
  .trim()
  .refine((v) => !Number.isNaN(Date.parse(v)), { message: "Invalid date string" });

const baseFields = {
  telegramMessageId: z.union([z.string(), z.number()]).optional().nullable(),
  chatId: z.union([z.string(), z.number()]).optional().nullable(),
  raw: z.unknown().optional(),
};

/** "high" / "High" / "HIGH" all map to TaskPriority.HIGH. */
const priorityField = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase())
  .refine((v): v is TaskPriority =>
    (Object.values(TaskPriority) as string[]).includes(v),
  )
  .optional()
  .nullable();

// Task or reminder — both map to the Task table.
const taskLikeSchema = z.object({
  type: z.enum(["task", "reminder"]),
  title: z.string().trim().min(1).max(200),
  description: optionalString,
  dueDate: isoDateString.optional().nullable(),
  priority: priorityField,
  category: z.string().trim().max(64).optional().nullable(),
  ...baseFields,
});

// Note / knowledge — both map to the KnowledgeNote table.
const noteLikeSchema = z.object({
  type: z.enum(["note", "knowledge"]),
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1),
  tags: z.array(z.string().trim()).optional(),
  category: z.string().trim().max(64).optional().nullable(),
  ...baseFields,
});

const meetingSchema = z.object({
  type: z.literal("meeting"),
  title: z.string().trim().min(1).max(200),
  dateTime: isoDateString,
  location: optionalString,
  participants: z.array(z.string().trim()).optional(),
  agenda: optionalString,
  notes: optionalString,
  actionItems: z.array(z.string().trim()).optional(),
  ...baseFields,
});

const bookSchema = z.object({
  type: z.literal("book"),
  bookTitle: z.string().trim().min(1).max(200),
  author: optionalString,
  chapter: optionalString,
  summary: z.string().trim().min(1),
  keyIdeas: z.array(z.string().trim()).optional(),
  actionPoints: z.array(z.string().trim()).optional(),
  reflection: optionalString,
  ...baseFields,
});

const newsSchema = z.object({
  type: z.literal("news"),
  title: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(64),
  summary: z.string().trim().min(1),
  sourceUrl: z.string().trim().url().optional().nullable(),
  ...baseFields,
});

/**
 * The discriminated union of all Hermes payloads. We expose the schema as a
 * union (not `z.discriminatedUnion`) so that note/task/reminder type-aliases
 * with multiple literal values work cleanly.
 */
export const hermesPayloadSchema = z.union([
  taskLikeSchema,
  noteLikeSchema,
  meetingSchema,
  bookSchema,
  newsSchema,
]);

export type HermesPayload = z.infer<typeof hermesPayloadSchema>;
export type HermesType = HermesPayload["type"];

export const HERMES_TYPES: HermesType[] = [
  "task",
  "reminder",
  "note",
  "knowledge",
  "meeting",
  "book",
  "news",
];
