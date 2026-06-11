import { PagePlaceholder } from "@/components/PagePlaceholder";

export default function DailyReviewPage() {
  return (
    <PagePlaceholder
      eyebrow="Review"
      title="Daily review"
      description="End-of-day snapshot: completed and pending tasks, overdue items, today’s meetings, key notes, and tomorrow’s priorities."
      bullets={[
        "Completed, pending, and overdue tasks for the day",
        "Today’s meetings and important notes",
        "Tomorrow’s priorities",
        "Optional Telegram summary trigger (Phase 11)",
      ]}
      comingInPhase="Phase 9"
    />
  );
}
