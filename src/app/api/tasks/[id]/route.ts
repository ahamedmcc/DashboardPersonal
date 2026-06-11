import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { badRequest, fromZodError, notFound, serverError } from "@/lib/api/errors";
import { updateTaskSchema } from "@/lib/schemas/task";

type Ctx = { params: Promise<{ id: string }> };

function parseDueDate(input: string | null | undefined): Date | null | undefined {
  if (input === undefined) return undefined; // not provided → don't change
  if (input === null || input === "") return null; // explicitly clear
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return notFound("Task not found");
    return NextResponse.json({ task });
  } catch (err) {
    return serverError(err);
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return badRequest("Invalid JSON body");
    const parsed = updateTaskSchema.parse(body);

    const data: Prisma.TaskUpdateInput = {};
    if (parsed.title !== undefined) data.title = parsed.title;
    if (parsed.description !== undefined) data.description = parsed.description;
    if (parsed.status !== undefined) data.status = parsed.status;
    if (parsed.priority !== undefined) data.priority = parsed.priority;
    if (parsed.category !== undefined) data.category = parsed.category;
    if (parsed.source !== undefined) data.source = parsed.source;
    if (parsed.dueDate !== undefined) {
      const due = parseDueDate(parsed.dueDate);
      if (due !== undefined) data.dueDate = due;
    }

    try {
      const task = await prisma.task.update({ where: { id }, data });
      return NextResponse.json({ task });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
        return notFound("Task not found");
      }
      throw e;
    }
  } catch (err) {
    if (err instanceof ZodError) return fromZodError(err);
    return serverError(err);
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    try {
      await prisma.task.delete({ where: { id } });
      return new NextResponse(null, { status: 204 });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
        return notFound("Task not found");
      }
      throw e;
    }
  } catch (err) {
    return serverError(err);
  }
}
