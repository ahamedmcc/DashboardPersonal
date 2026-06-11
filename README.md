# Personal Command Dashboard

A personal web-based productivity dashboard. Input mainly comes from **Telegram** through the **Hermes** agent (ChatGPT-authenticated), and notifications/summaries are sent back to Telegram.

> **Important constraint:** AI processing is handled through Hermes/ChatGPT-authenticated flow. The app does **not** call the OpenAI API directly. The backend stores structured data and the dashboard reads from it.

For the full requirements see [`SRS.md`](./SRS.md). For the phased build plan see [`TODO.md`](./TODO.md).

---

## Tech stack

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Notifications:** Telegram Bot API
- **Automation/AI:** Hermes agent (ChatGPT auth)

---

## Project structure

```
.
├── prisma/                # Prisma schema, migrations, seed
├── docs/                  # Project documentation
├── public/                # Static assets (added on demand)
├── src/
│   ├── app/               # Next.js App Router pages, layouts, API routes
│   ├── components/        # Reusable UI components
│   ├── lib/               # Shared utilities (e.g. Prisma client)
│   ├── services/          # Telegram / Hermes / summary services
│   └── types/             # Shared TypeScript types
├── .env.example           # Required environment variables
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── SRS.md                 # Requirements
└── TODO.md                # Phase-by-phase plan
```

---

## Prerequisites

- Node.js **>= 20** (tested with 24.x)
- npm **>= 10**
- PostgreSQL **>= 14** (local install or Docker)
- A Telegram bot token and chat id (only needed from Phase 5 onwards)

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
#    Windows PowerShell:
Copy-Item .env.example .env
#    macOS / Linux:
cp .env.example .env

# 3. Fill in DATABASE_URL (and other keys when relevant) in .env
#    Example:
#    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/personal_dashboard?schema=public

# 4. Generate the Prisma client (Phase 0 schema is intentionally minimal —
#    real models are added in Phase 1).
npx prisma generate
```

---

## Running locally

```bash
npm run dev
```

Open <http://localhost:3000>. You should see the **Phase 0 · Project Setup** landing page rendered with Tailwind styles.

---

## Available scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npm run prisma:generate` | Generate the Prisma client |
| `npm run prisma:migrate` | Run a Prisma migration in dev |
| `npm run prisma:studio` | Open Prisma Studio (visual DB inspector) |
| `npm run prisma:seed` | Insert sample data (idempotent for the user row) |
| `npm run prisma:reset` | Drop & recreate the dev DB and re-run migrations + seed |

---

## Environment variables

See [`.env.example`](./.env.example). Required keys:

- `DATABASE_URL` — PostgreSQL connection string
- `TELEGRAM_BOT_TOKEN` — Telegram bot token (Phase 5+)
- `TELEGRAM_CHAT_ID` — Telegram chat id for notifications (Phase 5+)
- `APP_BASE_URL` — Public base URL of the running app
- `NEXTAUTH_SECRET` — Session signing secret (Phase 10)

Secrets must never be committed. `.env` is gitignored.

---

## Development rule (from `TODO.md`)

> The project is developed phase by phase. After each phase: developer completes the phase, runs local checks, the user performs manual testing and gives explicit approval. **Only then** does the next phase start.

---

## Phase 0 — Manual testing checklist

| Test Case | Steps | Expected Result | Status |
| --- | --- | --- | --- |
| App starts | `npm run dev` | App opens at `http://localhost:3000` | Not Tested |
| Tailwind works | Open `/` | Dark themed page with rounded card and colored badges | Not Tested |
| Env file exists | Open `.env.example` | `DATABASE_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `APP_BASE_URL`, `NEXTAUTH_SECRET` listed | Not Tested |
| Folder structure | List project | `src/{app,components,lib,services,types}`, `prisma/`, `docs/` exist | Not Tested |

When all four are **Passed**, give the go-ahead and Phase 1 (full Prisma schema + migration + seed) will start.

---

## Phase 1 — Database setup & manual testing

Phase 1 adds the full database schema (8 models per `SRS.md` §6), the first migration, and seed data.

### Local Postgres (already provisioned)

Postgres for this project runs in an **isolated Docker container** named `pcd-postgres` on **port 5433** (port 5432 was already taken by a separate native PostgreSQL on this machine; using 5433 keeps both instances independent).

| Setting | Value |
| --- | --- |
| Container name | `pcd-postgres` |
| Image | `postgres:16` |
| Host | `localhost` |
| Port | `5433` |
| User | `dashboard` |
| Password | `dashboard_dev_secret` |
| Database | `personal_dashboard` |
| Restart policy | `unless-stopped` (auto-starts with Docker Desktop) |

The connection string lives in `.env` as:

```env
DATABASE_URL=postgresql://dashboard:dashboard_dev_secret@localhost:5433/personal_dashboard?schema=public
```

If you ever need to recreate it from scratch:

```bash
docker rm -f pcd-postgres
docker run -d --name pcd-postgres --restart unless-stopped \
  -p 5433:5432 \
  -e POSTGRES_USER=dashboard \
  -e POSTGRES_PASSWORD=dashboard_dev_secret \
  -e POSTGRES_DB=personal_dashboard \
  postgres:16
```

Stop / start the existing container without losing data:

```bash
docker stop pcd-postgres
docker start pcd-postgres
```

### Re-running migrations or seed

```bash
# Apply any new migrations (or create a new one when the schema changes)
npm run prisma:migrate

# Re-insert the sample data (idempotent for the user; replaces other rows)
npm run prisma:seed

# Inspect everything visually
npm run prisma:studio    # http://localhost:5555

# Nuke the dev DB and rebuild from scratch (migrations + seed)
npm run prisma:reset
```

### Phase 1 manual testing checklist

The first three rows have already been executed and are passing on this machine; please verify them visually in Prisma Studio.

| Test Case | Steps | Expected Result | Status |
| --- | --- | --- | --- |
| Prisma migration | `npm run prisma:migrate -- --name init` | Migration runs without error; `prisma/migrations/20260611082240_init/` exists | Passed (auto) |
| Tables created | Open Prisma Studio (`npm run prisma:studio` → http://localhost:5555) | All 8 models visible: User, Task, Meeting, KnowledgeNote, EmailSummary, NewsSummary, BookSummary, TelegramEvent | Pending manual verify |
| Seed data | `npm run prisma:seed` | Console prints `Seed complete:` with counts `{users:1, tasks:5, meetings:2, knowledgeNotes:2, emailSummaries:2, newsSummaries:3, bookSummaries:1, telegramEvents:3}` | Passed (auto) |
| Data check (Task) | Studio → Task table | "Prepare ERP meeting note" exists with `priority=HIGH`, `status=PENDING`, `source=telegram` | Passed (auto via `prisma/verify.ts`) |
| Data check (TelegramEvent) | Studio → TelegramEvent table | 3 rows; one has `processedStatus=failed`, `classifiedType=unknown`, `errorMessage="Hermes could not classify the input."` | Passed (auto via `prisma/verify.ts`) |

When all rows are **Passed**, give the go-ahead and Phase 2 (basic layout & navigation) will start.

---

## Phase 2 — Layout & navigation

Phase 2 ships the dashboard shell:

- A **route group** `(dashboard)` so every authenticated page shares one layout.
- A responsive **side navigation** with sections for Main, Work, Learning, Review, and Account.
- A consistent sticky **top bar** with the app title and today’s date.
- 11 page **stubs**, one per SRS UI page, plus a `/` → `/dashboard` redirect.
- A reusable `PagePlaceholder` component so each stub stays a few lines long.

### Routes

| Path | Page | Will be wired in |
| --- | --- | --- |
| `/` | Redirect to `/dashboard` | Phase 2 (done) |
| `/dashboard` | Today view | Phase 4 |
| `/tasks` | Tasks | Phase 3 |
| `/meetings` | Meetings | Phase 6 |
| `/emails` | Email summary | Phase 8 |
| `/news` | News summary | Phase 8 |
| `/knowledge` | Knowledge base | Phase 7 |
| `/books` | Book summaries | Phase 8 |
| `/review/daily` | Daily review | Phase 9 |
| `/review/weekly` | Weekly review | Phase 9 |
| `/review/monthly` | Monthly review | Phase 9 |
| `/settings` | Settings | Phase 10+ |

### Phase 2 manual testing checklist

Start the dev server with `npm run dev`, open <http://localhost:3000>, then:

| Test Case | Steps | Expected Result | Status |
| --- | --- | --- | --- |
| Dashboard opens | Visit `/` (or `/dashboard`) | Redirects to `/dashboard`; page renders with sidebar + header + body | Passed (auto smoke-test) |
| Sidebar links | Click each menu item: Today, Tasks, Meetings, Emails, Knowledge, Books, News, Daily, Weekly, Monthly, Settings | Correct page opens; the clicked item is highlighted in the sidebar | Pending manual verify |
| Active highlighting | Visit `/review/weekly` | "Weekly review" item is highlighted; others aren’t | Pending manual verify |
| Responsive layout | Resize browser narrower than 1024 px | Sidebar collapses; a hamburger button appears top-left; clicking it slides the drawer in | Pending manual verify |
| Mobile drawer closes | On mobile width, open drawer and click a nav item | Drawer closes automatically and route changes | Pending manual verify |
| Header visible | Open every page | Sticky top bar with "Personal Command Dashboard" + date is present on all pages | Passed (auto smoke-test) |

When all rows are **Passed**, give the go-ahead and Phase 3 (Task Management Module) will start.

---

## Phase 3 — Task Management Module

Phase 3 ships full task CRUD: a real `/tasks` page with list, filters, and a "New task" modal — backed by REST API routes that match SRS §7.1.

### API endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/tasks` | List tasks. Supports `?status=`, `?priority=`, `?window=today\|this_week\|this_month\|overdue`, `?q=` |
| `POST` | `/api/tasks` | Create a task. Body `{ title, description?, status?, priority?, dueDate?, category?, source? }` |
| `GET` | `/api/tasks/:id` | Read one task |
| `PATCH` | `/api/tasks/:id` | Update any subset of fields |
| `DELETE` | `/api/tasks/:id` | Delete a task. Returns 204. |

All endpoints validate input with `zod`. Validation errors return HTTP 400 with a structured `{ error }` body.

### Page

`/tasks` (server-rendered) shows:

- **Header** — total count + a per-status breakdown (or filter-aware "Showing N of M").
- **Filter bar** — `Status`, `Priority`, `Due` (Today / This week / This month / Overdue), with a "Clear filters" link. Filter state lives in the URL (e.g. `/tasks?status=PENDING&priority=URGENT`).
- **Task list** — each row has a checkbox to toggle completed, the title + description, badges for status / priority / due date / category / source, and hover-revealed Edit and Delete buttons.
- **Modals** — `New task`, `Edit task`, and `Delete this task?` (with explicit confirmation).

### Phase 3 manual testing checklist

The first six rows have already been auto-verified end-to-end against the live dev server.

| Test Case | Steps | Expected Result | Status |
| --- | --- | --- | --- |
| Create task (UI) | Click "New task" → fill title → Save | Task appears at the top of the list; modal closes | Pending manual verify |
| Create task (API) | `POST /api/tasks` with `{ "title": "Smoke" }` | 201 + task in body | Passed (auto) |
| Edit task (UI) | Hover a task → click Edit → change title → Save | New title shown immediately | Pending manual verify |
| Edit task (API) | `PATCH /api/tasks/:id` with `{ "title": "x", "status": "COMPLETED" }` | 200; both fields updated | Passed (auto) |
| Complete task | Click checkbox at the left of a task | Task gets line-through, status badge becomes "Completed" | Pending manual verify |
| Delete task | Hover a task → Delete → confirm in modal | Task disappears from list; 204 returned | Passed (auto) |
| Filter by status | Pick `Pending` in the Status filter | Only PENDING tasks remain; URL has `?status=PENDING` | Passed (auto via API) |
| Filter by priority | Pick `Urgent` | Only URGENT tasks remain | Passed (auto via API) |
| Due-date filter (overdue) | Pick `Overdue` in the Due filter | Only past-due, not completed/cancelled tasks remain | Passed (auto via API) |
| Due-date filter (today/week/month) | Pick each | Only tasks due in that window remain | Pending manual verify |
| Validation | `POST /api/tasks` with `{ "title": "" }` | 400 with structured error | Passed (auto) |
| 404 on deleted | `GET /api/tasks/<deleted-id>` | 404 | Passed (auto) |

When all rows are **Passed**, give the go-ahead and Phase 4 (Today Dashboard) will start.

---

## Phase 4 — Today Dashboard

Phase 4 turns `/dashboard` into the real "command view" with live data from the DB.

### Layout

- **Header** with a time-of-day greeting and today's date.
- **Stats grid** — 4 cards: `Open`, `Due today`, `Overdue`, `In progress`.
- **Quick add** — slim inline form (title + priority + due: today / tomorrow / no date) that POSTs to `/api/tasks`.
- **Two-column main grid** (single column on mobile):
  - Left (wide): `Today's tasks`, `Overdue` — both render real `TaskRow` widgets, so all the row actions (toggle complete, edit, delete) work directly on the dashboard.
  - Right (narrow): `Upcoming meetings` (next 7 days), `Important notes` (most recent), `Email summary` (most recent non-ignored), `News summary` (most recent).
- Every right-column card has a **View all →** link to its dedicated page.

All queries run in parallel server-side via `Promise.all` for snappy initial render.

### Phase 4 manual testing checklist

The first three rows have already been auto-verified end-to-end against the live dev server.

| Test Case | Steps | Expected Result | Status |
| --- | --- | --- | --- |
| Stats cards | Visit `/dashboard` | Counts equal what the DB holds (`Open=4, Due today=1, Overdue=1, In progress=1` with seed data) | Passed (auto) |
| Today’s tasks | Add a task due today | Appears in the "Today’s tasks" section and `Due today` increments | Passed (auto) |
| Overdue tasks | Visit `/dashboard` | Seeded "Resolve stale firewall rule" appears in the Overdue section with red "Overdue · …" badge | Passed (auto) |
| Quick add | In the Quick add box: type a title, pick `Urgent` + `Tomorrow`, click Add | Input clears, "Added" hint flashes, the task appears in the relevant section | Pending manual verify |
| Toggle complete on dashboard | Click checkbox on a today task | Status badge becomes "Completed", strikethrough applies, `Open` and `Due today` counts decrease | Pending manual verify |
| Edit on dashboard | Hover a task → Edit → change title → Save | Inline title updates without a page reload | Pending manual verify |
| Delete on dashboard | Hover a task → Delete → confirm | Task disappears and counts decrease | Pending manual verify |
| Upcoming meetings | Visit `/dashboard` | Seeded "Vendor meeting with Summit" and "Weekly 1:1 with manager" appear in the right column | Passed (auto) |
| Knowledge / email / news cards | Visit `/dashboard` | Seeded "AI digital twin idea", "Q3 strategy memo", "AI agents move into enterprise IT operations" appear | Passed (auto) |
| View-all links | Click any "View all →" | Goes to the corresponding page (e.g. `/tasks?window=overdue`, `/meetings`, `/knowledge`, `/emails`, `/news`) | Pending manual verify |

When all rows are **Passed**, give the go-ahead and Phase 5 (Telegram webhook + Hermes input) will start.

---

## Phase 5 — Telegram webhook + Hermes input

> **Constraint (SRS §1.3):** Hermes (ChatGPT-authenticated) classifies the input **upstream**. The dashboard backend never calls the OpenAI API directly. Hermes posts a structured payload to our webhook, which writes it into the matching table.

### Endpoint

```
POST /api/telegram/webhook
Headers:
  Content-Type: application/json
  X-Webhook-Secret: <TELEGRAM_WEBHOOK_SECRET from .env>
```

Configure the shared secret in `.env`:

```env
TELEGRAM_WEBHOOK_SECRET=dev-webhook-secret-change-me   # rotate before deploy
```

### What the webhook does (in order)

1. Validates the `X-Webhook-Secret` header (returns **401** on mismatch).
2. **Always** logs the raw body into `TelegramEvent` first (audit trail per SRS §7.4) — even invalid bodies become a row with `processedStatus=failed` and an `errorMessage`.
3. Validates the body against the Hermes schema.
4. Routes the typed payload to the correct table:

   | `type` | Table | Source field |
   | --- | --- | --- |
   | `task`, `reminder` | `Task` | `source = "telegram"` |
   | `note`, `knowledge` | `KnowledgeNote` | `source = "telegram"` |
   | `meeting` | `Meeting` | `source = "telegram"` |
   | `book` | `BookSummary` | — |
   | `news` | `NewsSummary` | — |

5. Updates the `TelegramEvent` row with `processedStatus` (`processed` or `failed`) and `classifiedType`.
6. Sends a confirmation message back to Telegram via `sendTelegramMessage`. **Without `TELEGRAM_BOT_TOKEN` set, this is a no-op that logs a `[telegram] (dry-run, …)` line** so the webhook still returns success in dev.

### Payload examples (PowerShell `Invoke-RestMethod`)

```powershell
$base   = 'http://localhost:3000/api/telegram/webhook'
$hdr    = @{ 'X-Webhook-Secret' = 'dev-webhook-secret-change-me'; 'Content-Type' = 'application/json' }

# Task (canonical SRS example)
Invoke-RestMethod -Method Post $base -Headers $hdr -Body (@{
  type = 'task'; title = 'Prepare ERP meeting note'
  description = 'Prepare note before ERP meeting'
  dueDate = '2026-06-15T10:00:00'; priority = 'High'
  telegramMessageId = 4001; chatId = 99999
} | ConvertTo-Json)

# Note
Invoke-RestMethod -Method Post $base -Headers $hdr -Body (@{
  type = 'note'; title = 'AI digital twin idea'
  content = 'Use a digital twin of an editor for late-night news desks.'
  tags = @('ai','newsroom'); telegramMessageId = 4002
} | ConvertTo-Json)

# Meeting
Invoke-RestMethod -Method Post $base -Headers $hdr -Body (@{
  type = 'meeting'; title = 'ERP rollout sync'
  dateTime = '2026-06-20T14:30:00'; location = 'Google Meet'
  participants = @('Tanvir','PM'); telegramMessageId = 4003
} | ConvertTo-Json)

# Book / News / Reminder follow the same pattern; see `src/lib/schemas/hermes.ts` for the full schema.
```

### Phase 5 manual testing checklist

The first seven rows are auto-verified end-to-end against the live dev server (see `prisma/verify-webhook.ts`).

| Test Case | Steps | Expected Result | Status |
| --- | --- | --- | --- |
| Webhook authentication | POST without `X-Webhook-Secret` | 401 | Passed (auto) |
| Raw message audit | POST anything | A `TelegramEvent` row exists with the raw body | Passed (auto) |
| Task from Telegram | POST a `task` payload | 201; row in `Task` with `source=telegram`; appears on `/tasks` and `/dashboard` | Passed (auto) |
| Note from Telegram | POST a `note` payload | 201; row in `KnowledgeNote`; visible on `/dashboard` "Important notes" | Passed (auto) |
| Meeting from Telegram | POST a `meeting` payload | 201; row in `Meeting`; visible on `/dashboard` "Upcoming meetings" if within 7 days | Passed (auto) |
| Book / News / Reminder | POST each | 201; row in `BookSummary` / `NewsSummary` / `Task` respectively | Passed (auto) |
| Failed input | POST `{"type":"banana"}` | 400; `TelegramEvent` row exists with `processedStatus=failed`, `classifiedType="banana"`, `errorMessage` populated | Passed (auto) |
| Telegram confirmation (dry-run) | Tail the dev-server console while POSTing | Log line `[telegram] (dry-run, no TELEGRAM_BOT_TOKEN) chat=… text=…` | Pending manual verify |
| Telegram confirmation (live) | Set `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` in `.env`, restart, POST | A real Telegram message arrives in your chat | Pending — needs your real bot |

When all rows are **Passed**, give the go-ahead and Phase 6 (Meeting module) will start.

---

## Phase 6 — Meeting module

Phase 6 ships the full meeting CRUD experience and adds an `actionItems` field to the `Meeting` model (migration: `20260611102348_add_meeting_action_items`).

### API endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/meetings` | List meetings. Supports `?window=all\|upcoming\|today\|this_week\|past` (default `upcoming`) and `?q=` (searches title / agenda / notes / location) |
| `POST` | `/api/meetings` | Create a meeting. Body `{ title, dateTime, location?, participants?, agenda?, notes?, actionItems? }` |
| `GET` | `/api/meetings/:id` | Read one |
| `PATCH` | `/api/meetings/:id` | Update any subset of fields |
| `DELETE` | `/api/meetings/:id` | Delete. Returns 204. |

### Page

`/meetings`:
- Header with filter-aware title (`Upcoming meetings`, `This week’s meetings`, etc.) and a "New meeting" button.
- Filter bar — chip-style window selector (All / Upcoming / Today / This week / Past) plus a search input.
- List of `MeetingRow`s. Each row shows: relative-day chip (Today / Tomorrow / weekday / date), time + date, location, participant chips, truncated agenda + notes, and the first 3 action items (with `+N more` tail).
- Hover-revealed Edit and Delete buttons; both open modals (Delete asks for confirmation).
- The dashboard's "Upcoming meetings" widget now shows an amber "N action items" line when present.

### Telegram / Hermes integration

The Hermes meeting payload now accepts `actionItems`:

```json
{
  "type": "meeting",
  "title": "ERP rollout sync",
  "dateTime": "2026-06-20T14:30:00",
  "location": "Google Meet",
  "participants": ["Tanvir","PM","Vendor lead"],
  "agenda": "Phase 2 milestones",
  "notes": "Decisions ...",
  "actionItems": ["Send proposal","Schedule next review"]
}
```

### Phase 6 manual testing checklist

The first six rows are auto-verified end-to-end against the live dev server.

| Test Case | Steps | Expected Result | Status |
| --- | --- | --- | --- |
| Create meeting (API) | `POST /api/meetings` with title + dateTime + 3 actionItems | 201 with stored `actionItems.length === 3` | Passed (auto) |
| Edit meeting (API) | `PATCH /api/meetings/:id` rename + 4 actionItems | 200 with `title` updated and `actionItems.length === 4` | Passed (auto) |
| Delete meeting (API) | `DELETE /api/meetings/:id` | 204 | Passed (auto) |
| Filter windows | `GET /api/meetings?window=all\|upcoming\|today\|this_week\|past` | Each returns the right subset | Passed (auto) |
| Search | `GET /api/meetings?q=smoke` | Returns only matching meetings | Passed (auto) |
| Hermes meeting + actionItems | POST a `meeting` payload to `/api/telegram/webhook` with `actionItems` | 201; row in `Meeting` with `source=telegram`; live Telegram confirmation `sent=true` | Passed (auto) |
| Create meeting (UI) | `/meetings` → New meeting → fill form (incl. action items, one per line) → Save | Row appears with the right relative-day chip, participants chips, action items preview | Pending manual verify |
| Edit meeting (UI) | Hover a row → Edit → change title / add notes / add action item → Save | Inline updates with no full reload | Pending manual verify |
| Delete meeting (UI) | Hover a row → Delete → confirm | Row disappears | Pending manual verify |
| Today's meeting on dashboard | Add a meeting due today via `/meetings` | Appears under "Upcoming meetings" on `/dashboard` with a "Today" chip; if action items exist, an amber count line appears | Pending manual verify |

When all rows are **Passed**, give the go-ahead and Phase 7 (Knowledge base module) will start.

---

## Telegram inbox & exposing the webhook to Hermes

The dashboard now ships a **Telegram inbox** at `/telegram` that surfaces every payload Hermes posts to `/api/telegram/webhook` — successful and failed — in real time. The `/dashboard` page also has a small "Telegram inbox" widget showing the 5 most recent events.

For Hermes (which runs outside this machine) to actually reach the webhook, the webhook URL has to be **publicly reachable**. `localhost:3000` will not work from Hermes.

### Local dev: expose `localhost:3000` with a tunnel

Pick one — both are free:

**Option A — `localtunnel` (zero install, fastest):**

```powershell
npx --yes localtunnel --port 3000 --print-requests
# → your url is: https://<random-subdomain>.loca.lt
```

> First browser visit to a `loca.lt` URL shows an anti-abuse "tunnel password" page. Hermes (or any non-browser client) bypasses it automatically because it doesn't send a browser User-Agent, **or** you can add the header `bypass-tunnel-reminder: true`.

**Option B — Cloudflare Tunnel (more reliable, stable URL with an account):**

```powershell
# one-time install
winget install --id Cloudflare.cloudflared
# anonymous quick-tunnel (URL changes per run)
cloudflared tunnel --url http://localhost:3000
```

### Configure Hermes

Whichever tunnel you pick, give Hermes:

| Setting | Value |
| --- | --- |
| **Method** | `POST` |
| **URL** | `https://<your-tunnel-host>/api/telegram/webhook` |
| **Headers** | `Content-Type: application/json` and `x-webhook-secret: <value of TELEGRAM_WEBHOOK_SECRET in .env>` |
| **Body** | One of the Hermes payload shapes below |

The full URL is also displayed inside the dashboard at `/telegram` ("Hermes integration" panel) — it auto-detects the public host from the request, so when Hermes hits us through a tunnel, you can copy it from there.

### Supported payload shapes (discriminated union)

Every payload is `{ "type": "<one of>", ... }`. Validation is in [`src/lib/schemas/hermes.ts`](./src/lib/schemas/hermes.ts).

```jsonc
// type: "task"
{ "type": "task",    "title": "Prep Q3 deck", "dueDate": "2026-06-20T10:00:00Z", "priority": "HIGH",
  "telegramMessageId": "1001" }

// type: "meeting"
{ "type": "meeting", "title": "Sales sync",    "dateTime": "2026-06-12T15:00:00Z",
  "location": "Zoom", "participants": ["Mahir","Jane"],
  "agenda": "Pricing & rollout", "actionItems": ["Send pricing","Schedule follow-up"],
  "telegramMessageId": "1002" }

// type: "note" | "knowledge"
{ "type": "note",    "title": "Onboarding gotcha", "content": "…", "tags": ["onboarding"],
  "telegramMessageId": "1003" }

// type: "book"
{ "type": "book",    "bookTitle": "DDIA",   "summary": "…", "keyIdeas": ["…"],
  "telegramMessageId": "1004" }

// type: "news"
{ "type": "news",    "title": "PG 18",       "summary": "…", "category": "tech",
  "telegramMessageId": "1005" }

// type: "reminder"  (stored as a Task)
{ "type": "reminder","title": "Take pills",  "dueDate": "2026-06-12T08:00:00Z",
  "telegramMessageId": "1006" }
```

### What lands where

| `type` | Persisted as | Visible at |
| --- | --- | --- |
| `task`, `reminder` | `Task` (with `source = "telegram"`) | `/tasks`, `/dashboard` |
| `meeting` | `Meeting` (with `source = "telegram"`) | `/meetings`, `/dashboard` (next 7 days only) |
| `note`, `knowledge` | `KnowledgeNote` | `/knowledge` |
| `book` | `BookSummary` | `/books` |
| `news` | `NewsSummary` | `/news` |
| (any) | `TelegramEvent` (always — audit trail) | `/telegram` and dashboard widget |

> **Why doesn't every meeting show up under "Upcoming meetings"?** That dashboard widget only shows meetings whose `dateTime` is within the next 7 days. Meetings sent through Telegram with a date further out still appear in the **Telegram inbox** (`/telegram`) and in `/meetings` with `window=all`. This is by design — it's a "next 7 days" widget.

### Troubleshooting

If Telegram input "doesn't show up":

1. Open `/telegram`. **Did the event arrive at all?**
   - **No row** → Hermes hasn't reached the webhook. Check the tunnel URL and that Hermes is configured to POST to it.
   - **Row with status `failed`** → Hermes reached us but the payload didn't match the schema. Open the row, expand "Show raw payload", and read the `errorMessage` (it's the flattened Zod error).
   - **Row with status `processed`** → The data was saved. It might just not be in the widget you were looking at (e.g. meeting more than 7 days out — see note above). Check the relevant module page (`/meetings`, `/tasks`, etc.).
2. Confirm the `x-webhook-secret` header matches `TELEGRAM_WEBHOOK_SECRET` in `.env`. A mismatch returns `401`.
3. Confirm the dev server is running (`npm run dev`).

