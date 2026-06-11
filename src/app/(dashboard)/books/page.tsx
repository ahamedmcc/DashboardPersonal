import { PagePlaceholder } from "@/components/PagePlaceholder";

export default function BooksPage() {
  return (
    <PagePlaceholder
      eyebrow="Learning"
      title="Book summaries"
      description="Chapter-level summaries, key ideas, action points, and personal reflections."
      bullets={[
        "Capture book + chapter notes from Telegram",
        "Track reading status (reading, completed, on hold, dropped)",
        "Filter by book, chapter, and status",
      ]}
      comingInPhase="Phase 8"
    />
  );
}
