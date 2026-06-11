# SRS.md — Personal Dashboard with Telegram + Hermes Agent

## 1. Project Overview

### 1.1 Project Name
Personal Command Dashboard

### 1.2 Purpose
The purpose of this system is to create a personal web-based dashboard where the user can view, manage, and review daily, weekly, and monthly work items. Input will mainly come from Telegram through the Hermes agent. Notifications and summaries will also be sent back to Telegram.

### 1.3 Important Constraint
The system will use **ChatGPT authentication through Hermes**, not direct OpenAI API integration.

Therefore:

- Do not design the system as OpenAI API-first.
- AI processing should be handled through Hermes/ChatGPT authenticated flow.
- The application backend should store structured data, summaries, outputs, status, and history.
- The dashboard should read from the application database.
- Telegram should be used as both an input and notification channel.

### 1.4 Main Goal
Create a personal productivity dashboard that shows:

- Daily tasks
- Weekly tasks
- Monthly tasks
- Meetings
- Email summary
- News summary
- Knowledge base
- Book summary
- Learning updates
- Follow-up items
- Telegram notes

---

## 2. System Architecture

### 2.1 High-Level Flow

```text
Telegram Input
     ↓
Hermes Agent using ChatGPT Authentication
     ↓
Application Backend
     ↓
PostgreSQL Database
     ↓
Web Dashboard
     ↓
Telegram Notification
```

### 2.2 Recommended Technology Stack

Frontend:

- Next.js
- React
- Tailwind CSS

Backend:

- Next.js API routes or separate Node.js/FastAPI backend

Database:

- PostgreSQL

ORM:

- Prisma

Authentication:

- Simple local authentication for personal dashboard
- Later optional Google login or passwordless login

Automation:

- Hermes agent
- Optional n8n for future workflow automation

Notification:

- Telegram Bot API

AI Processing:

- Hermes agent with ChatGPT authentication
- No direct OpenAI API dependency in MVP

---

## 3. User Roles

### 3.1 Primary User
The owner of the dashboard.

Permissions:

- Add tasks
- View dashboard
- Edit tasks
- Delete tasks
- Add meeting notes
- View summaries
- Trigger daily, weekly, and monthly reviews
- Receive Telegram notifications

### 3.2 Future Optional Roles

- Admin
- Assistant user
- Read-only viewer

For MVP, only one user is required.

---

## 4. Functional Requirements

## 4.1 Telegram Input Module

### Description
The user will send commands or natural language messages through Telegram. Hermes will process the message and send structured data to the backend.

### Supported Input Examples

```text
/task Prepare ERP meeting note tomorrow 10am
/note AI digital twin idea for newsroom
/meeting Vendor meeting with Summit on Sunday
/book Atomic Habits chapter 1 summary
/news AI and cybersecurity update
/review weekly
```

### Requirements

- The system shall receive Telegram-originated inputs.
- The system shall classify input type: task, note, meeting, book, news, knowledge, reminder.
- The system shall save classified input into the database.
- The system shall show saved input in the dashboard.
- The system shall send confirmation notification back to Telegram.

---

## 4.2 Dashboard Home / Today View

### Description
The Today View is the main page of the dashboard.

### Requirements

The Today View shall show:

- Today’s tasks
- Overdue tasks
- Upcoming meetings
- Important notes
- Email summary placeholder
- News summary placeholder
- Learning item placeholder
- Quick add input

### Priority
High

---

## 4.3 Task Management

### Task Fields

- ID
- Title
- Description
- Status
- Priority
- Due date
- Category
- Source
- Created date
- Updated date

### Status Values

- Pending
- In Progress
- Completed
- Cancelled

### Priority Values

- Low
- Medium
- High
- Urgent

### Requirements

- User shall create tasks manually from dashboard.
- User shall create tasks from Telegram.
- User shall update task status.
- User shall edit task details.
- User shall delete tasks.
- User shall filter tasks by daily, weekly, monthly, status, and priority.

---

## 4.4 Meeting Management

### Meeting Fields

- ID
- Title
- Date
- Time
- Location
- Participants
- Agenda
- Notes
- Action items
- Source
- Created date

### Requirements

- User shall add meetings from Telegram or dashboard.
- Dashboard shall show today’s and upcoming meetings.
- User shall add meeting notes.
- User shall create action items from meeting notes.
- Future phase may connect calendar.

---

## 4.5 Email Summary

### Description
Email summary will show important email highlights.

### MVP Requirement
For MVP, email summary can be manually inserted or sent by Hermes.

### Future Requirement
Later, Gmail integration can be added if needed.

### Fields

- Sender
- Subject
- Summary
- Importance
- Required action
- Due date
- Status

---

## 4.6 News Summary

### Description
News summary will show daily or weekly news based on selected categories.

### Categories

- AI
- Cybersecurity
- Technology
- Business
- Bangladesh
- Leadership
- Sports, optional

### Requirements

- User shall save news summaries.
- Dashboard shall show latest summaries.
- Telegram shall send daily news digest.
- News may be generated by Hermes/ChatGPT authenticated workflow.

---

## 4.7 Knowledge Base

### Description
The knowledge base stores personal notes, ideas, summaries, work references, and learning materials.

### Fields

- Title
- Content
- Tags
- Category
- Source
- Created date
- Updated date

### Requirements

- User shall add knowledge notes from Telegram.
- User shall add knowledge notes from dashboard.
- User shall search knowledge base.
- User shall filter by tag and category.

---

## 4.8 Book Summary

### Fields

- Book title
- Author
- Chapter
- Summary
- Key ideas
- Action points
- Personal reflection
- Status

### Requirements

- User shall save book notes.
- User shall view book summaries.
- User shall filter by book, chapter, and status.

---

## 4.9 Review System

### Daily Review
Shows:

- Completed tasks
- Pending tasks
- Overdue tasks
- Meetings
- Important notes
- Tomorrow’s priority

### Weekly Review
Shows:

- Weekly completed tasks
- Pending tasks
- Important meetings
- Key learning
- Important email/news summary
- Next week focus

### Monthly Review
Shows:

- Monthly achievements
- Delayed tasks
- Key decisions
- Learning progress
- Knowledge base growth
- Goals for next month

### Approval Rule
The system development process must not move to the next phase until the user manually tests the current phase and gives approval.

---

## 5. Non-Functional Requirements

## 5.1 Performance

- Dashboard should load within 3 seconds for normal personal data volume.
- Task list filtering should feel instant for personal usage.

## 5.2 Security

- Dashboard must have login protection.
- Sensitive tokens must be stored in environment variables.
- Telegram bot token must not be hardcoded.
- Database credentials must not be committed to Git.

## 5.3 Reliability

- Data should be stored permanently in PostgreSQL.
- Failed Telegram/Hermes events should be logged.
- Backend should return clear error messages.

## 5.4 Usability

- UI should be clean and simple.
- Today View should be the first page.
- Mobile-friendly design is preferred.

## 5.5 Maintainability

- Code should be modular.
- Each feature should have separate components/services.
- Database schema should be documented.

---

## 6. Database Entities

## 6.1 User

```text
id
name
email
passwordHash
createdAt
updatedAt
```

## 6.2 Task

```text
id
title
description
status
priority
dueDate
category
source
createdAt
updatedAt
```

## 6.3 Meeting

```text
id
title
dateTime
location
participants
agenda
notes
source
createdAt
updatedAt
```

## 6.4 KnowledgeNote

```text
id
title
content
tags
category
source
createdAt
updatedAt
```

## 6.5 EmailSummary

```text
id
sender
subject
summary
importance
requiredAction
dueDate
status
createdAt
```

## 6.6 NewsSummary

```text
id
title
category
summary
sourceUrl
createdAt
```

## 6.7 BookSummary

```text
id
bookTitle
author
chapter
summary
keyIdeas
actionPoints
reflection
status
createdAt
updatedAt
```

## 6.8 TelegramEvent

```text
id
telegramMessageId
rawMessage
classifiedType
processedStatus
errorMessage
createdAt
```

---

## 7. API Requirements

## 7.1 Task APIs

```text
GET /api/tasks
POST /api/tasks
GET /api/tasks/:id
PATCH /api/tasks/:id
DELETE /api/tasks/:id
```

## 7.2 Meeting APIs

```text
GET /api/meetings
POST /api/meetings
PATCH /api/meetings/:id
DELETE /api/meetings/:id
```

## 7.3 Knowledge APIs

```text
GET /api/knowledge
POST /api/knowledge
PATCH /api/knowledge/:id
DELETE /api/knowledge/:id
```

## 7.4 Telegram Webhook API

```text
POST /api/telegram/webhook
```

Responsibilities:

- Receive Telegram message
- Validate source
- Store raw message
- Accept structured payload from Hermes
- Save result to correct table
- Return success response

## 7.5 Review APIs

```text
GET /api/review/daily
GET /api/review/weekly
GET /api/review/monthly
```

---

## 8. UI Pages

```text
/login
/dashboard
/tasks
/meetings
/emails
/news
/knowledge
/books
/review/daily
/review/weekly
/review/monthly
/settings
```

---

## 9. Development Rule

The project must be developed phase by phase.

After each phase:

1. Developer completes the phase.
2. Developer runs local checks.
3. User performs manual testing.
4. User gives explicit approval.
5. Only then the next phase may start.

The developer must not continue to the next phase without user approval.

---

## 10. Manual Testing Rule

Every phase must include a manual testing checklist.

Each checklist item must have:

- Test case
- Steps
- Expected result
- Status

Status options:

```text
Not Tested
Passed
Failed
Blocked
```

---

## 11. MVP Scope

MVP includes:

- Basic login
- Dashboard Today View
- Task module
- Manual task creation
- Telegram input endpoint
- Store Telegram raw message
- Simple meeting module
- Knowledge note module
- Daily review page

MVP excludes:

- Direct OpenAI API integration
- Full Gmail integration
- Full calendar integration
- Multi-user permissions
- Mobile app

---

## 12. Future Enhancements

- Gmail integration
- Google Calendar integration
- Advanced AI summaries
- Voice input from Telegram
- File upload
- Book PDF summary
- Personal analytics
- Charts
- Goal tracking
- CISA/EMBA learning tracker
- Export monthly report as PDF
