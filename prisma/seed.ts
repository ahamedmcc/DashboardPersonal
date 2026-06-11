/**
 * Personal Command Dashboard — seed data
 *
 * Run with:
 *   npm run prisma:seed
 *
 * Idempotent: running multiple times will not create duplicate rows for the
 * primary user; other tables clear and re-insert their sample rows so the
 * dashboard always has known fixtures during development.
 */

import { PrismaClient, TaskPriority, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_USER_EMAIL = "owner@personal-dashboard.local";

// Helpers ---------------------------------------------------------------------

const daysFromNow = (days: number, hour = 9, minute = 0): Date => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
};

async function main() {
  console.log("Seeding database…");

  // 1) User -------------------------------------------------------------------
  // Real auth (and password hashing) is added in Phase 10; for Phase 1 we just
  // store a placeholder marker so the row exists.
  const user = await prisma.user.upsert({
    where: { email: SEED_USER_EMAIL },
    update: {},
    create: {
      name: "Dashboard Owner",
      email: SEED_USER_EMAIL,
      passwordHash: "PLACEHOLDER_NOT_FOR_AUTH_YET",
    },
  });
  console.log(`  user: ${user.email}`);

  // 2) Tasks ------------------------------------------------------------------
  await prisma.task.deleteMany();
  await prisma.task.createMany({
    data: [
      {
        title: "Prepare ERP meeting note",
        description: "Outline pain points + agenda before the Sunday ERP review.",
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        dueDate: daysFromNow(1, 10),
        category: "work",
        source: "telegram",
      },
      {
        title: "Review weekly news digest",
        description: "Skim AI + cybersecurity headlines and capture top 3 takeaways.",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        dueDate: daysFromNow(0, 18),
        category: "learning",
        source: "manual",
      },
      {
        title: "Renew domain registration",
        description: "Personal domain expires next month — renew for 2 years.",
        status: TaskStatus.PENDING,
        priority: TaskPriority.LOW,
        dueDate: daysFromNow(20, 12),
        category: "personal",
        source: "manual",
      },
      {
        title: "Book travel for vendor visit",
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.MEDIUM,
        dueDate: daysFromNow(-3, 14),
        category: "work",
        source: "manual",
      },
      {
        title: "Resolve stale firewall rule",
        description: "Old rule blocking dev VPN — coordinate with infra team.",
        status: TaskStatus.PENDING,
        priority: TaskPriority.URGENT,
        dueDate: daysFromNow(-1, 17),
        category: "work",
        source: "telegram",
      },
    ],
  });

  // 3) Meetings ---------------------------------------------------------------
  await prisma.meeting.deleteMany();
  await prisma.meeting.createMany({
    data: [
      {
        title: "Vendor meeting with Summit",
        dateTime: daysFromNow(3, 11),
        location: "Office — Room 4B",
        participants: ["Tanvir", "Summit AE", "Procurement Lead"],
        agenda: "Review proposal, pricing, and integration timeline.",
        notes: null,
        source: "telegram",
      },
      {
        title: "Weekly 1:1 with manager",
        dateTime: daysFromNow(2, 15, 30),
        location: "Google Meet",
        participants: ["Tanvir", "Manager"],
        agenda: "Status update, blockers, next-week priorities.",
        notes: "Bring up CISA study plan.",
        source: "manual",
      },
    ],
  });

  // 4) Knowledge notes --------------------------------------------------------
  await prisma.knowledgeNote.deleteMany();
  await prisma.knowledgeNote.createMany({
    data: [
      {
        title: "AI digital twin idea for newsroom",
        content:
          "An AI digital twin of an editor that reviews drafts for tone, factual risk, and policy compliance before publish. Useful for late-night desks.",
        tags: ["ai", "newsroom", "ideas"],
        category: "ideas",
        source: "telegram",
      },
      {
        title: "Zero-trust starter checklist",
        content:
          "1) Identity-aware proxy 2) Device posture 3) Least-privilege roles 4) Audit logs 5) Continuous verification.",
        tags: ["security", "zero-trust", "reference"],
        category: "reference",
        source: "manual",
      },
    ],
  });

  // 5) Email summary ----------------------------------------------------------
  await prisma.emailSummary.deleteMany();
  await prisma.emailSummary.createMany({
    data: [
      {
        sender: "ceo@company.com",
        subject: "Q3 strategy memo",
        summary:
          "CEO outlines three priorities for Q3: cost discipline, AI-assisted ops, and a customer-facing reliability metric.",
        importance: "high",
        requiredAction: "Reply with one bullet of personal commitment by Friday.",
        dueDate: daysFromNow(2, 17),
        status: "pending",
      },
      {
        sender: "noreply@hostingprovider.com",
        subject: "Invoice #44218",
        summary: "Monthly hosting invoice, auto-charged on the 5th.",
        importance: "low",
        requiredAction: null,
        dueDate: null,
        status: "ignored",
      },
    ],
  });

  // 6) News summary -----------------------------------------------------------
  await prisma.newsSummary.deleteMany();
  await prisma.newsSummary.createMany({
    data: [
      {
        title: "AI agents move into enterprise IT operations",
        category: "AI",
        summary:
          "Several enterprises pilot AI agents for tier-1 IT support. Early results show 30–40% deflection on common tickets.",
        sourceUrl: "https://example.com/ai-agents-itops",
      },
      {
        title: "New phishing wave targets banking users",
        category: "Cybersecurity",
        summary:
          "Coordinated SMS-phishing campaign impersonates local banks. Users tricked into installing malicious APKs.",
        sourceUrl: "https://example.com/banking-phishing-wave",
      },
      {
        title: "Bangladesh tech sector outlook",
        category: "Bangladesh",
        summary:
          "Analysts expect steady growth in fintech and IT services through next fiscal year, with talent gap remaining the top constraint.",
        sourceUrl: null,
      },
    ],
  });

  // 7) Book summary -----------------------------------------------------------
  await prisma.bookSummary.deleteMany();
  await prisma.bookSummary.createMany({
    data: [
      {
        bookTitle: "Atomic Habits",
        author: "James Clear",
        chapter: "Chapter 1 — The Surprising Power of Tiny Habits",
        summary:
          "Tiny improvements compound. Habits are the compound interest of self-improvement; identity-based change beats outcome-based change.",
        keyIdeas: [
          "1% better daily compounds dramatically over a year.",
          "Goals set the direction; systems determine progress.",
          "Identity change > outcome chasing.",
        ],
        actionPoints: [
          "Define one identity statement: 'I am someone who reviews work daily.'",
          "Stack a 2-minute review habit onto an existing morning routine.",
        ],
        reflection: "The identity framing matches how my best habits actually formed.",
        status: "reading",
      },
    ],
  });

  // 8) Telegram event ---------------------------------------------------------
  await prisma.telegramEvent.deleteMany();
  await prisma.telegramEvent.createMany({
    data: [
      {
        telegramMessageId: "1001",
        rawMessage: {
          message_id: 1001,
          from: { id: 12345, first_name: "Tanvir" },
          text: "/task Prepare ERP meeting note tomorrow 10am",
        },
        classifiedType: "task",
        processedStatus: "processed",
      },
      {
        telegramMessageId: "1002",
        rawMessage: {
          message_id: 1002,
          from: { id: 12345, first_name: "Tanvir" },
          text: "/note AI digital twin idea for newsroom",
        },
        classifiedType: "note",
        processedStatus: "processed",
      },
      {
        telegramMessageId: "1003",
        rawMessage: {
          message_id: 1003,
          from: { id: 12345, first_name: "Tanvir" },
          text: "/foo something hermes did not understand",
        },
        classifiedType: "unknown",
        processedStatus: "failed",
        errorMessage: "Hermes could not classify the input.",
      },
    ],
  });

  // Summary -------------------------------------------------------------------
  const counts = {
    users: await prisma.user.count(),
    tasks: await prisma.task.count(),
    meetings: await prisma.meeting.count(),
    knowledgeNotes: await prisma.knowledgeNote.count(),
    emailSummaries: await prisma.emailSummary.count(),
    newsSummaries: await prisma.newsSummary.count(),
    bookSummaries: await prisma.bookSummary.count(),
    telegramEvents: await prisma.telegramEvent.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
