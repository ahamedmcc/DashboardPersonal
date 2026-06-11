import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personal Command Dashboard",
  description:
    "Personal productivity dashboard — tasks, meetings, knowledge, reviews, and Telegram/Hermes integration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
