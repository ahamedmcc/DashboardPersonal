import { PagePlaceholder } from "@/components/PagePlaceholder";

export default function SettingsPage() {
  return (
    <PagePlaceholder
      eyebrow="Account"
      title="Settings"
      description="Personal preferences, Telegram bot configuration, and notification preferences."
      bullets={[
        "Telegram bot connection status",
        "Notification preferences for Telegram",
        "Login + session settings (Phase 10)",
      ]}
      comingInPhase="Phase 10+"
    />
  );
}
