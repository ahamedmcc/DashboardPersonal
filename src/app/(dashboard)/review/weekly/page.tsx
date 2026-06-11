import { PagePlaceholder } from "@/components/PagePlaceholder";

export default function WeeklyReviewPage() {
  return (
    <PagePlaceholder
      eyebrow="Review"
      title="Weekly review"
      description="Weekly view: completed work, pending items, important meetings, key learning, and the focus for next week."
      bullets={[
        "Weekly completed and pending tasks",
        "Important meetings and notes",
        "Key learning, email, and news highlights",
        "Next week focus",
      ]}
      comingInPhase="Phase 9"
    />
  );
}
