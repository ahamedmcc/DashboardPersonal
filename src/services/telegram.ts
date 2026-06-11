/**
 * Thin Telegram Bot API client.
 *
 * In dev (no `TELEGRAM_BOT_TOKEN` set) `sendTelegramMessage` is a no-op that
 * logs what *would* have been sent. This lets the webhook return success
 * even before a real bot is provisioned.
 */

const TELEGRAM_API = "https://api.telegram.org";

export type SendResult =
  | { sent: true; chatId: string }
  | { sent: false; reason: string };

export async function sendTelegramMessage(
  text: string,
  chatIdOverride?: string | number | null,
): Promise<SendResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const fallbackChat = process.env.TELEGRAM_CHAT_ID?.trim();
  const chatId = chatIdOverride
    ? String(chatIdOverride)
    : fallbackChat || undefined;

  if (!token) {
    console.log(
      `[telegram] (dry-run, no TELEGRAM_BOT_TOKEN) chat=${chatId ?? "?"} text=${JSON.stringify(text)}`,
    );
    return { sent: false, reason: "no_token" };
  }
  if (!chatId) {
    console.warn("[telegram] cannot send — no chat id (request body or env)");
    return { sent: false, reason: "no_chat_id" };
  }

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "<no body>");
      console.error(`[telegram] sendMessage failed status=${res.status} body=${body}`);
      return { sent: false, reason: `http_${res.status}` };
    }
    return { sent: true, chatId };
  } catch (err) {
    console.error("[telegram] sendMessage threw:", err);
    return { sent: false, reason: "network_error" };
  }
}
