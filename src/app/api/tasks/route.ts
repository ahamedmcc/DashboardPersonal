import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { badRequest, fromZodError, serverError } from "@/lib/api/errors";
import { createTaskSchema, taskFiltersSchema } from "@/lib/schemas/task";
import { buildTaskQuery } from "@/lib/tasks/query";

function parseDueDate(input: string | null | undefined): Date | null {
  if (!input) return null;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    // Drop empty strings so optional filters stay undefined.
    const cleaned = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== ""),
    );
    const filters = taskFiltersSchema.parse(cleaned);
    const { where, orderBy } = buildTaskQuery(filters);
    const tasks = await prisma.task.findMany({ where, orderBy });
    return NextResponse.json({ tasks });
  } catch (err) {
    if (err instanceof ZodError) return fromZodError(err);
    return serverError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return badRequest("Invalid JSON body");
    const parsed = createTaskSchema.parse(body);

    const task = await prisma.task.create({
      data: {
        title: parsed.title,
        description: parsed.description ?? null,
        status: parsed.status ?? undefined,
        priority: parsed.priority ?? undefined,
        dueDate: parseDueDate(parsed.dueDate ?? null),
        category: parsed.category ?? null,
        source: parsed.source ?? "manual",
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) return fromZodError(err);
    return serverError(err);
  }
}
