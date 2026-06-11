import { z } from "zod";

export const MEETING_WINDOWS = [
  "all",
  "upcoming",
  "today",
  "this_week",
  "past",
] as const;
export type MeetingWindow = (typeof MEETING_WINDOWS)[number];

const trimmed = z.string().trim();

const isoDateString = z
  .string()
  .trim()
  .refine((v) => !Number.isNaN(Date.parse(v)), { message: "Invalid date string" });

export const createMeetingSchema = z.object({
  title: trimmed.min(1, "Title is required").max(200),
  dateTime: isoDateString,
  location: trimmed.max(200).optional().nullable(),
  participants: z.array(trimmed).optional(),
  agenda: trimmed.max(4000).optional().nullable(),
  notes: trimmed.max(8000).optional().nullable(),
  actionItems: z.array(trimmed).optional(),
  source: trimmed.max(32).optional(),
});
export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;

export const updateMeetingSchema = createMeetingSchema.partial();
export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>;

export const meetingFiltersSchema = z.object({
  window: z.enum(MEETING_WINDOWS).optional(),
  q: trimmed.max(100).optional(),
});
export type MeetingFilters = z.infer<typeof meetingFiltersSchema>;
