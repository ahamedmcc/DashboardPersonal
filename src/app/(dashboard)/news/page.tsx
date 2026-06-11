import { PagePlaceholder } from "@/components/PagePlaceholder";

export default function NewsPage() {
  return (
    <PagePlaceholder
      eyebrow="Learning"
      title="News summary"
      description="Daily and weekly news digests across AI, cybersecurity, technology, business, Bangladesh, and leadership."
      bullets={[
        "Browse summaries by category",
        "Receive a Telegram daily digest (Phase 11)",
        "Hermes-generated content via ChatGPT-authenticated flow",
      ]}
      comingInPhase="Phase 8"
    />
  );
}
