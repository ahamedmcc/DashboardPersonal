import { TaskPriority } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { HermesPayload, HermesType } from "@/lib/schemas/hermes";

export type HermesRouteResult = {
  /** Logical type as classified by Hermes. */
  type: HermesType;
  /** Database table the record was written to. */
  target: "Task" | "KnowledgeNote" | "Meeting" | "BookSummary" | "NewsSummary";
  /** The id of the newly-created row. */
  recordId: string;
  /** Short, human-readable confirmation suitable for Telegram. */
  confirmation: string;
};

function priorityOrDefault(p?: string | null): TaskPriority {
  if (!p) return TaskPriority.MEDIUM;
  const upper = p.toUpperCase();
  return (Object.values(TaskPriority) as string[]).includes(upper)
    ? (upper as TaskPriority)
    : TaskPriority.MEDIUM;
}

function parseDate(input?: string | null): Date | null {
  if (!input) return null;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Persist a Hermes-classified payload into the matching table. Returns a
 * structured result the webhook uses for the response and the Telegram
 * confirmation message.
 */
export async function routeHermesPayload(
  payload: HermesPayload,
): Promise<HermesRouteResult> {
  switch (payload.type) {
    case "task":
    case "reminder": {
      const task = await prisma.task.create({
        data: {
          title: payload.title,
          description: payload.description ?? null,
          priority: priorityOrDefault(payload.priority),
          dueDate: parseDate(payload.dueDate),
          category: payload.category ?? null,
          source: "telegram",
        },
      });
      return {
        type: payload.type,
        target: "Task",
        recordId: task.id,
        confirmation: `✅ ${payload.type === "reminder" ? "Reminder" : "Task"} saved: *${escapeMd(task.title)}*`,
      };
    }

    case "note":
    case "knowledge": {
      const note = await prisma.knowledgeNote.create({
        data: {
          title: payload.title,
          content: payload.content,
          tags: payload.tags ?? [],
          category: payload.category ?? null,
          source: "telegram",
        },
      });
      return {
        type: payload.type,
        target: "KnowledgeNote",
        recordId: note.id,
        confirmation: `✅ Note saved: *${escapeMd(note.title)}*`,
      };
    }

    case "meeting": {
      const dateTime = parseDate(payload.dateTime);
      if (!dateTime) {
        throw new Error("Meeting payload had an invalid dateTime");
      }
      const meeting = await prisma.meeting.create({
        data: {
          title: payload.title,
          dateTime,
          location: payload.location ?? null,
          participants: payload.participants ?? [],
          agenda: payload.agenda ?? null,
          notes: payload.notes ?? null,
          actionItems: payload.actionItems ?? [],
          source: "telegram",
        },
      });
      return {
        type: "meeting",
        target: "Meeting",
        recordId: meeting.id,
        confirmation: `📅 Meeting saved: *${escapeMd(meeting.title)}* on ${dateTime.toLocaleString()}`,
      };
    }

    case "book": {
      const book = await prisma.bookSummary.create({
        data: {
          bookTitle: payload.bookTitle,
          author: payload.author ?? null,
          chapter: payload.chapter ?? null,
          summary: payload.summary,
          keyIdeas: payload.keyIdeas ?? [],
          actionPoints: payload.actionPoints ?? [],
          reflection: payload.reflection ?? null,
        },
      });
      return {
        type: "book",
        target: "BookSummary",
        recordId: book.id,
        confirmation: `📚 Book note saved: *${escapeMd(book.bookTitle)}*${book.chapter ? ` — ${escapeMd(book.chapter)}` : ""}`,
      };
    }

    case "news": {
      const news = await prisma.newsSummary.create({
        data: {
          title: payload.title,
          category: payload.category,
          summary: payload.summary,
          sourceUrl: payload.sourceUrl ?? null,
        },
      });
      return {
        type: "news",
        target: "NewsSummary",
        recordId: news.id,
        confirmation: `📰 News saved: *${escapeMd(news.title)}* _(${escapeMd(news.category)})_`,
      };
    }
  }
}

/** Markdown-escape characters that Telegram treats specially. */
function escapeMd(s: string): string {
  return s.replace(/([_*`[\]])/g, "\\$1");
}
