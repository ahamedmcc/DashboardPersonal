import { prisma } from "@/lib/prisma";
import {
  meetingFiltersSchema,
  type MeetingWindow,
} from "@/lib/schemas/meeting";
import { buildMeetingQuery } from "@/lib/meetings/query";
import { CreateMeetingButton } from "@/components/meetings/CreateMeetingButton";
import { MeetingFilters } from "@/components/meetings/MeetingFilters";
import { MeetingRow } from "@/components/meetings/MeetingRow";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function pickSingle(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

const WINDOW_LABEL: Record<MeetingWindow, string> = {
  all: "All meetings",
  upcoming: "Upcoming meetings",
  today: "Today’s meetings",
  this_week: "This week’s meetings",
  past: "Past meetings",
};

export default async function MeetingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const cleaned = Object.fromEntries(
    (["window", "q"] as const)
      .map((k) => [k, pickSingle(sp[k])] as const)
      .filter(([, v]) => v && v !== ""),
  );

  const parsed = meetingFiltersSchema.safeParse(cleaned);
  const filters = parsed.success ? parsed.data : {};
  const window = (filters.window ?? "upcoming") as MeetingWindow;
  const { where, orderBy } = buildMeetingQuery(filters);

  const [meetings, totalCount] = await Promise.all([
    prisma.meeting.findMany({ where, orderBy }),
    prisma.meeting.count(),
  ]);

  const heading = WINDOW_LABEL[window];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            Work
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">{heading}</h1>
          <p className="text-sm text-slate-400">
            {meetings.length} of {totalCount} meeting{totalCount === 1 ? "" : "s"}.
          </p>
        </div>
        <CreateMeetingButton />
      </header>

      <MeetingFilters />

      {meetings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/30 p-10 text-center">
          <p className="text-sm text-slate-300">No meetings to show.</p>
          <p className="mt-1 text-xs text-slate-500">
            Use “New meeting” to add one, or send a meeting via Telegram.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {meetings.map((m) => (
            <MeetingRow key={m.id} meeting={m} />
          ))}
        </ul>
      )}
    </div>
  );
}
