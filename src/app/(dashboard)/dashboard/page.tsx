import Link from "next/link";
import {
  CalendarDays,
  Clock,
  Inbox,
  ListChecks,
  Loader2,
  Mail,
  Newspaper,
  Lightbulb,
  Users,
} from "lucide-react";
import { TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { endOfDay, startOfDay } from "@/lib/date-windows";
import { StatCard } from "@/components/dashboard/StatCard";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { QuickAddTask } from "@/components/dashboard/QuickAddTask";
import { TaskRow } from "@/components/tasks/TaskRow";
import { MeetingsList } from "@/components/dashboard/MeetingsList";
import { NotesList } from "@/components/dashboard/NotesList";
import { EmailsList } from "@/components/dashboard/EmailsList";
import { NewsList } from "@/components/dashboard/NewsList";
import { TelegramRecent } from "@/components/dashboard/TelegramRecent";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekFromNow = new Date(now);
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  const openStatuses = [TaskStatus.PENDING, TaskStatus.IN_PROGRESS];

  const [
    totalTasks,
    inProgressCount,
    todayTasks,
    overdueTasks,
    upcomingMeetings,
    recentNotes,
    recentEmails,
    recentNews,
    recentTelegramEvents,
  ] = await Promise.all([
    prisma.task.count({ where: { status: { in: openStatuses } } }),
    prisma.task.count({ where: { status: TaskStatus.IN_PROGRESS } }),
    prisma.task.findMany({
      where: {
        status: { in: openStatuses },
        dueDate: { gte: todayStart, lte: todayEnd },
      },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    }),
    prisma.task.findMany({
      where: {
        status: { in: openStatuses },
        dueDate: { lt: todayStart },
      },
      orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
    }),
    prisma.meeting.findMany({
      where: { dateTime: { gte: now, lte: weekFromNow } },
      orderBy: { dateTime: "asc" },
      take: 4,
    }),
    prisma.knowledgeNote.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.emailSummary.findMany({
      where: { status: { not: "ignored" } },
      orderBy: [{ createdAt: "desc" }],
      take: 3,
    }),
    prisma.newsSummary.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.telegramEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const todayDateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
          Today
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Good {greetingFor(now)}
        </h1>
        <p className="text-sm text-slate-400">
          {todayDateLabel} · here is your command view.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Open"
          value={totalTasks}
          helper="Pending + in progress"
          icon={ListChecks}
          tone="indigo"
        />
        <StatCard
          label="Due today"
          value={todayTasks.length}
          helper={todayTasks.length === 0 ? "All clear" : "Needs your attention"}
          icon={CalendarDays}
          tone="emerald"
        />
        <StatCard
          label="Overdue"
          value={overdueTasks.length}
          helper={overdueTasks.length === 0 ? "Nothing slipping" : "Past due"}
          icon={Clock}
          tone="rose"
        />
        <StatCard
          label="In progress"
          value={inProgressCount}
          helper="Currently active"
          icon={Loader2}
          tone="amber"
        />
      </div>

      <QuickAddTask />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard
            title="Today’s tasks"
            description={`${todayTasks.length} open · due today`}
            viewAllHref="/tasks?window=today"
            isEmpty={todayTasks.length === 0}
            emptyState={
              <>
                Nothing due today. Use{" "}
                <Link href="/tasks" className="text-indigo-300 hover:text-indigo-200">
                  Tasks
                </Link>{" "}
                to plan ahead, or add one above.
              </>
            }
          >
            <ul className="space-y-2">
              {todayTasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            title="Overdue"
            description={`${overdueTasks.length} task${overdueTasks.length === 1 ? "" : "s"} past due`}
            viewAllHref="/tasks?window=overdue"
            isEmpty={overdueTasks.length === 0}
            emptyState="No overdue tasks. Nice."
          >
            <ul className="space-y-2">
              {overdueTasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </ul>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard
            title="Upcoming meetings"
            description="Next 7 days"
            viewAllHref="/meetings"
            isEmpty={upcomingMeetings.length === 0}
            emptyState={
              <span className="inline-flex items-center gap-2">
                <Users className="h-3.5 w-3.5" /> No meetings scheduled.
              </span>
            }
          >
            <MeetingsList meetings={upcomingMeetings} />
          </SectionCard>

          <SectionCard
            title="Telegram inbox"
            description="Latest input from Hermes"
            viewAllHref="/telegram"
            isEmpty={recentTelegramEvents.length === 0}
            emptyState={
              <span className="inline-flex items-center gap-2">
                <Inbox className="h-3.5 w-3.5" /> No Telegram input yet.
              </span>
            }
          >
            <TelegramRecent events={recentTelegramEvents} />
          </SectionCard>

          <SectionCard
            title="Important notes"
            description="Recent additions"
            viewAllHref="/knowledge"
            isEmpty={recentNotes.length === 0}
            emptyState={
              <span className="inline-flex items-center gap-2">
                <Lightbulb className="h-3.5 w-3.5" /> No notes yet.
              </span>
            }
          >
            <NotesList notes={recentNotes} />
          </SectionCard>

          <SectionCard
            title="Email summary"
            description="Highlights needing follow-up"
            viewAllHref="/emails"
            isEmpty={recentEmails.length === 0}
            emptyState={
              <span className="inline-flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" /> Nothing to summarize.
              </span>
            }
          >
            <EmailsList emails={recentEmails} />
          </SectionCard>

          <SectionCard
            title="News summary"
            description="Latest digest"
            viewAllHref="/news"
            isEmpty={recentNews.length === 0}
            emptyState={
              <span className="inline-flex items-center gap-2">
                <Newspaper className="h-3.5 w-3.5" /> No news yet.
              </span>
            }
          >
            <NewsList news={recentNews} />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function greetingFor(d: Date): string {
  const h = d.getHours();
  if (h < 5) return "night";
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
