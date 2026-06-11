import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { badRequest, fromZodError, notFound, serverError } from "@/lib/api/errors";
import { updateMeetingSchema } from "@/lib/schemas/meeting";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const meeting = await prisma.meeting.findUnique({ where: { id } });
    if (!meeting) return notFound("Meeting not found");
    return NextResponse.json({ meeting });
  } catch (err) {
    return serverError(err);
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return badRequest("Invalid JSON body");
    const parsed = updateMeetingSchema.parse(body);

    const data: Prisma.MeetingUpdateInput = {};
    if (parsed.title !== undefined) data.title = parsed.title;
    if (parsed.location !== undefined) data.location = parsed.location;
    if (parsed.agenda !== undefined) data.agenda = parsed.agenda;
    if (parsed.notes !== undefined) data.notes = parsed.notes;
    if (parsed.source !== undefined) data.source = parsed.source;
    if (parsed.participants !== undefined) data.participants = parsed.participants;
    if (parsed.actionItems !== undefined) data.actionItems = parsed.actionItems;
    if (parsed.dateTime !== undefined) {
      const dt = new Date(parsed.dateTime);
      if (Number.isNaN(dt.getTime())) return badRequest("Invalid dateTime");
      data.dateTime = dt;
    }

    try {
      const meeting = await prisma.meeting.update({ where: { id }, data });
      return NextResponse.json({ meeting });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
        return notFound("Meeting not found");
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
      await prisma.meeting.delete({ where: { id } });
      return new NextResponse(null, { status: 204 });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
        return notFound("Meeting not found");
      }
      throw e;
    }
  } catch (err) {
    return serverError(err);
  }
}
