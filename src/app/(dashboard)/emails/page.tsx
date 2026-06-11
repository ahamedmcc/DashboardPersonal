import { PagePlaceholder } from "@/components/PagePlaceholder";

export default function EmailsPage() {
  return (
    <PagePlaceholder
      eyebrow="Work"
      title="Email summary"
      description="Important email highlights — sender, subject, summary, importance, required actions, and due dates."
      bullets={[
        "Add manually or via Hermes-pushed summaries",
        "Track importance and required follow-up",
        "Mark items pending, actioned, or ignored",
      ]}
      comingInPhase="Phase 8"
    />
  );
}
