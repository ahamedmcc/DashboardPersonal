# TODO.md — Cursor Development Plan

## Important Development Rule

Do not move to the next phase without manual testing and explicit approval from the user.

After completing each phase, stop and ask:

```text
Phase completed. Please test manually. Should I proceed to the next phase?
```

Only continue if the user clearly says yes, approved, go ahead, proceed, or similar.

---

# Phase 0 — Project Setup

## Goal
Create the basic project structure and development environment.

## Tasks

- [ ] Create Next.js project
- [ ] Install Tailwind CSS
- [ ] Install Prisma
- [ ] Install PostgreSQL client package
- [ ] Create `.env.example`
- [ ] Create base folder structure
- [ ] Add README setup instructions
- [ ] Create initial Git commit

## Suggested Folder Structure

```text
/src
  /app
  /components
  /lib
  /services
  /types
/prisma
/docs
```

## Environment Variables

```text
DATABASE_URL=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
APP_BASE_URL=
NEXTAUTH_SECRET=
```

## Manual Testing Checklist

| Test Case | Steps | Expected Result | Status |
|---|---|---|---|
| App starts | Run `npm run dev` | App opens locally | Not Tested |
| Tailwind works | Add sample styled text | Style appears correctly | Not Tested |
| Env file exists | Check `.env.example` | Required keys are listed | Not Tested |
| Folder structure | Check project folders | Required folders exist | Not Tested |

## Stop Point
Do not start Phase 1 until user approval.

---

# Phase 1 — Database Schema and Prisma Setup

## Goal
Create core database models.

## Tasks

- [ ] Configure Prisma
- [ ] Create User model
- [ ] Create Task model
- [ ] Create Meeting model
- [ ] Create KnowledgeNote model
- [ ] Create EmailSummary model
- [ ] Create NewsSummary model
- [ ] Create BookSummary model
- [ ] Create TelegramEvent model
- [ ] Run Prisma migration
- [ ] Create seed data

## Manual Testing Checklist

| Test Case | Steps | Expected Result | Status |
|---|---|---|---|
| Prisma migration | Run migration command | Tables are created | Not Tested |
| Seed data | Run seed command | Sample data appears | Not Tested |
| Prisma Studio | Open Prisma Studio | Models are visible | Not Tested |
| Data check | Open sample task | Task data is correct | Not Tested |

## Stop Point
Do not start Phase 2 until user approval.

---

# Phase 2 — Basic Layout and Navigation

## Goal
Create the dashboard layout and navigation pages.

## Tasks

- [ ] Create main layout
- [ ] Create sidebar menu
- [ ] Create top header
- [ ] Create dashboard page
- [ ] Create tasks page
- [ ] Create meetings page
- [ ] Create emails page
- [ ] Create news page
- [ ] Create knowledge page
- [ ] Create books page
- [ ] Create daily review page
- [ ] Create weekly review page
- [ ] Create monthly review page
- [ ] Create settings page

## Manual Testing Checklist

| Test Case | Steps | Expected Result | Status |
|---|---|---|---|
| Dashboard opens | Visit `/dashboard` | Dashboard page loads | Not Tested |
| Sidebar links | Click each menu item | Correct page opens | Not Tested |
| Responsive layout | Resize browser | Layout remains usable | Not Tested |
| Header visible | Check all pages | Header appears consistently | Not Tested |

## Stop Point
Do not start Phase 3 until user approval.

---

# Phase 3 — Task Management Module

## Goal
Allow user to create, view, edit, complete, and delete tasks.

## Tasks

- [ ] Create task list UI
- [ ] Create task form
- [ ] Create task API routes
- [ ] Add create task function
- [ ] Add edit task function
- [ ] Add delete task function
- [ ] Add status change function
- [ ] Add priority field
- [ ] Add due date field
- [ ] Add filter by status
- [ ] Add filter by priority
- [ ] Add daily, weekly, monthly filters

## Manual Testing Checklist

| Test Case | Steps | Expected Result | Status |
|---|---|---|---|
| Create task | Add a new task | Task appears in list | Not Tested |
| Edit task | Change task title | Updated title appears | Not Tested |
| Complete task | Mark task completed | Status changes to Completed | Not Tested |
| Delete task | Delete a task | Task disappears | Not Tested |
| Filter task | Apply status filter | Correct tasks show | Not Tested |
| Due date filter | Select today/weekly/monthly | Correct tasks show | Not Tested |

## Stop Point
Do not start Phase 4 until user approval.

---

# Phase 4 — Today Dashboard

## Goal
Show the user’s most important daily information in one page.

## Tasks

- [ ] Show today’s tasks
- [ ] Show overdue tasks
- [ ] Show upcoming meetings placeholder
- [ ] Show important notes placeholder
- [ ] Show email summary placeholder
- [ ] Show news summary placeholder
- [ ] Add quick task creation box
- [ ] Add task statistics cards

## Manual Testing Checklist

| Test Case | Steps | Expected Result | Status |
|---|---|---|---|
| Today tasks | Add task due today | Task appears on dashboard | Not Tested |
| Overdue tasks | Add past due task | Task appears as overdue | Not Tested |
| Quick add | Add task from dashboard | Task is saved | Not Tested |
| Stats cards | Check task count | Count is correct | Not Tested |

## Stop Point
Do not start Phase 5 until user approval.

---

# Phase 5 — Telegram Webhook and Hermes Input

## Goal
Receive Telegram/Hermes input and save it into the system.

## Important Constraint
Use Hermes with ChatGPT authentication. Do not implement direct OpenAI API calls.

## Tasks

- [ ] Create `/api/telegram/webhook` endpoint
- [ ] Save raw Telegram message into TelegramEvent table
- [ ] Accept structured payload from Hermes
- [ ] Map task payload to Task table
- [ ] Map note payload to KnowledgeNote table
- [ ] Map meeting payload to Meeting table
- [ ] Return success response
- [ ] Send confirmation back to Telegram
- [ ] Log failed events

## Example Structured Payload from Hermes

```json
{
  "type": "task",
  "title": "Prepare ERP meeting note",
  "description": "Prepare note before ERP meeting",
  "dueDate": "2026-06-15T10:00:00",
  "priority": "High",
  "source": "telegram"
}
```

## Manual Testing Checklist

| Test Case | Steps | Expected Result | Status |
|---|---|---|---|
| Webhook receives message | Send test POST request | API returns success | Not Tested |
| Raw message saved | Check TelegramEvent table | Raw message is stored | Not Tested |
| Task from Telegram | Send task payload | Task appears in dashboard | Not Tested |
| Note from Telegram | Send note payload | Note appears in knowledge page | Not Tested |
| Meeting from Telegram | Send meeting payload | Meeting appears in meeting page | Not Tested |
| Telegram confirmation | Send valid input | Confirmation returns to Telegram | Not Tested |
| Failed input | Send invalid payload | Error is logged clearly | Not Tested |

## Stop Point
Do not start Phase 6 until user approval.

---

# Phase 6 — Meeting Module

## Goal
Create meeting management features.

## Tasks

- [ ] Create meeting list UI
- [ ] Create meeting form
- [ ] Create meeting API routes
- [ ] Add meeting create function
- [ ] Add meeting edit function
- [ ] Add meeting delete function
- [ ] Add meeting notes field
- [ ] Add action items field
- [ ] Show upcoming meetings in dashboard

## Manual Testing Checklist

| Test Case | Steps | Expected Result | Status |
|---|---|---|---|
| Create meeting | Add a meeting | Meeting appears in list | Not Tested |
| Edit meeting | Change meeting details | Updated details appear | Not Tested |
| Delete meeting | Delete meeting | Meeting disappears | Not Tested |
| Meeting notes | Add notes | Notes are saved | Not Tested |
| Dashboard meeting | Add meeting today | Meeting appears on dashboard | Not Tested |

## Stop Point
Do not start Phase 7 until user approval.

---

# Phase 7 — Knowledge Base Module

## Goal
Store notes, ideas, learning items, and work knowledge.

## Tasks

- [ ] Create knowledge list UI
- [ ] Create knowledge form
- [ ] Create knowledge API routes
- [ ] Add tags
- [ ] Add category
- [ ] Add search function
- [ ] Add filter by tag
- [ ] Add filter by category

## Manual Testing Checklist

| Test Case | Steps | Expected Result | Status |
|---|---|---|---|
| Create note | Add knowledge note | Note appears in list | Not Tested |
| Edit note | Change note content | Updated note appears | Not Tested |
| Delete note | Delete note | Note disappears | Not Tested |
| Search note | Search keyword | Matching note appears | Not Tested |
| Filter tag | Select tag | Correct notes show | Not Tested |

## Stop Point
Do not start Phase 8 until user approval.

---

# Phase 8 — Email, News, and Book Summary Placeholders

## Goal
Create pages and database-backed forms for summaries.

## Tasks

- [ ] Create email summary page
- [ ] Create email summary form
- [ ] Create news summary page
- [ ] Create news summary form
- [ ] Create book summary page
- [ ] Create book summary form
- [ ] Show latest email summary on dashboard
- [ ] Show latest news summary on dashboard

## Manual Testing Checklist

| Test Case | Steps | Expected Result | Status |
|---|---|---|---|
| Add email summary | Create sample summary | Summary appears | Not Tested |
| Add news summary | Create sample news | News appears | Not Tested |
| Add book summary | Create sample book note | Book note appears | Not Tested |
| Dashboard latest summary | Add latest item | Dashboard shows latest item | Not Tested |

## Stop Point
Do not start Phase 9 until user approval.

---

# Phase 9 — Daily, Weekly, Monthly Review

## Goal
Create review pages based on stored data.

## Tasks

- [ ] Create daily review API
- [ ] Create weekly review API
- [ ] Create monthly review API
- [ ] Show completed tasks
- [ ] Show pending tasks
- [ ] Show overdue tasks
- [ ] Show meetings
- [ ] Show notes count
- [ ] Show learning/book summary count
- [ ] Add Telegram summary trigger placeholder

## Manual Testing Checklist

| Test Case | Steps | Expected Result | Status |
|---|---|---|---|
| Daily review | Open daily review | Today’s data appears | Not Tested |
| Weekly review | Open weekly review | This week’s data appears | Not Tested |
| Monthly review | Open monthly review | This month’s data appears | Not Tested |
| Completed count | Complete task | Count updates correctly | Not Tested |
| Pending count | Add pending task | Count updates correctly | Not Tested |

## Stop Point
Do not start Phase 10 until user approval.

---

# Phase 10 — Authentication and Security Hardening

## Goal
Protect the dashboard and secure sensitive settings.

## Tasks

- [ ] Add login page
- [ ] Add session handling
- [ ] Protect dashboard routes
- [ ] Move secrets to environment variables
- [ ] Validate API payloads
- [ ] Add basic rate protection for webhook
- [ ] Add error handling
- [ ] Add audit logs for Telegram events

## Manual Testing Checklist

| Test Case | Steps | Expected Result | Status |
|---|---|---|---|
| Login required | Open dashboard without login | Redirects to login | Not Tested |
| Login works | Enter valid credentials | Dashboard opens | Not Tested |
| Invalid login | Enter wrong credentials | Error appears | Not Tested |
| Protected API | Call protected API without session | Request blocked | Not Tested |
| Env check | Review code | No secret is hardcoded | Not Tested |

## Stop Point
Do not start Phase 11 until user approval.

---

# Phase 11 — Telegram Notification

## Goal
Send useful notifications back to Telegram.

## Tasks

- [ ] Create Telegram send message service
- [ ] Send task creation confirmation
- [ ] Send daily summary manually
- [ ] Send weekly summary manually
- [ ] Add notification logs
- [ ] Add error handling for failed Telegram messages

## Manual Testing Checklist

| Test Case | Steps | Expected Result | Status |
|---|---|---|---|
| Task confirmation | Create task from Telegram | Confirmation received | Not Tested |
| Daily summary | Trigger daily summary | Telegram receives summary | Not Tested |
| Weekly summary | Trigger weekly summary | Telegram receives summary | Not Tested |
| Failed notification | Use wrong token | Error is logged | Not Tested |

## Stop Point
Do not start Phase 12 until user approval.

---

# Phase 12 — Final Polish and MVP Release

## Goal
Prepare the MVP for regular personal use.

## Tasks

- [ ] Improve UI spacing
- [ ] Improve mobile responsiveness
- [ ] Add loading states
- [ ] Add empty states
- [ ] Add confirmation before delete
- [ ] Add basic dashboard charts
- [ ] Review all manual test results
- [ ] Fix failed tests
- [ ] Create final README
- [ ] Create deployment notes

## Manual Testing Checklist

| Test Case | Steps | Expected Result | Status |
|---|---|---|---|
| Full flow | Create task from Telegram | Task appears in dashboard | Not Tested |
| Manual task | Create task manually | Task appears correctly | Not Tested |
| Review pages | Open all review pages | Correct data appears | Not Tested |
| Mobile view | Open on mobile width | UI is usable | Not Tested |
| Delete confirmation | Delete item | Confirmation appears first | Not Tested |
| Error state | Trigger invalid input | Friendly error appears | Not Tested |

## MVP Completion Criteria

- [ ] Telegram input works
- [ ] Task dashboard works
- [ ] Meeting module works
- [ ] Knowledge module works
- [ ] Review pages work
- [ ] Telegram notification works
- [ ] Login protection works
- [ ] Manual testing passed for all phases
- [ ] User approves MVP
