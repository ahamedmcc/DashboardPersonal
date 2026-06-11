import { PagePlaceholder } from "@/components/PagePlaceholder";

export default function MonthlyReviewPage() {
  return (
    <PagePlaceholder
      eyebrow="Review"
      title="Monthly review"
      description="Monthly retrospective: achievements, delayed tasks, key decisions, learning progress, knowledge growth, and next month’s goals."
      bullets={[
        "Monthly achievements and delayed tasks",
        "Key decisions and learning progress",
        "Knowledge base growth",
        "Goals for next month",
      ]}
      comingInPhase="Phase 9"
    />
  );
}
