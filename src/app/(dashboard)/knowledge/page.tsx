import { PagePlaceholder } from "@/components/PagePlaceholder";

export default function KnowledgePage() {
  return (
    <PagePlaceholder
      eyebrow="Learning"
      title="Knowledge base"
      description="Personal notes, ideas, work references, and learning material — from Telegram or the dashboard."
      bullets={[
        "Add notes from Telegram (/note …) or the dashboard",
        "Search the knowledge base by keyword",
        "Filter by tag and category",
      ]}
      comingInPhase="Phase 7"
    />
  );
}
