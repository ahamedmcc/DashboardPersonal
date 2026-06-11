import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { badRequest, fromZodError, serverError } from "@/lib/api/errors";
import {
  createMeetingSchema,
  meetingFiltersSchema,
} from "@/lib/schemas/meeting";
import { buildMeetingQuery } from "@/lib/meetings/query";

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const cleaned = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== ""),
    );
    const filters = meetingFiltersSchema.parse(cleaned);
    const { where, orderBy } = buildMeetingQuery(filters);
    const meetings = await prisma.meeting.findMany({ where, orderBy });
    return NextResponse.json({ meetings });
  } catch (err) {
    if (err instanceof ZodError) return fromZodError(err);
    return serverError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return badRequest("Invalid JSON body");
    const parsed = createMeetingSchema.parse(body);

    const dateTime = new Date(parsed.dateTime);
    if (Number.isNaN(dateTime.getTime())) return badRequest("Invalid dateTime");

    const meeting = await prisma.meeting.create({
      data: {
        title: parsed.title,
        dateTime,
        location: parsed.location ?? null,
        participants: parsed.participants ?? [],
        agenda: parsed.agenda ?? null,
        notes: parsed.notes ?? null,
        actionItems: parsed.actionItems ?? [],
        source: parsed.source ?? "manual",
      },
    });

    return NextResponse.json({ meeting }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) return fromZodError(err);
    return serverError(err);
  }
}
