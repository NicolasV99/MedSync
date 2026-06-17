# MedSync Dashboard

A centralized appointment management platform for independent healthcare professionals. MedSync reduces administrative overhead and patient no-shows by combining a patient CRM, Google Calendar sync, and automated WhatsApp reminders in a single dashboard.

> CSE 499 Senior Project — BYU, Spring 2025

**Live Demo:** https://med-sync-chi.vercel.app

---

## Completed Requirements

| Requirement | Type | Status |
|-------------|------|--------|
| **User Authentication** — Secure email/password login and account middleware protection | Core | ✅ Complete — Nefi |
| **Patient Management UI** — Interactive data tables with client-side search, sort, and filters | Core | ✅ Complete — Nicolas |
| **Patient Profile Forms** — Dynamic dialogs to create, view, and edit clinical patient files | Core | ✅ Complete — Ange Junior |
| **Interactive Agenda** — Full calendar interface in the appointments section | Core | ✅ Complete — Austin |
| **Analytics Dashboard Layout** — Metrics panels, KPI cards, and appointment summaries | Core | ✅ Complete — Nicolas |
| **Appointment Database & API** — RESTful CRUD endpoints with live PostgreSQL persistence | Core | ✅ Complete — Nefi |
| **Google Authentication** — "Sign in with Google" OAuth 2.0 workflow | Core | ✅ Complete — Nicolas |

---

## Features

- **Patient Management** — Create, view, edit, and delete patient records with clinical history; scoped per authenticated user
- **Appointments & Calendar** — Full FullCalendar interface with create/edit/delete; appointments persisted in PostgreSQL
- **Google OAuth** — Sign in with Google or email/password via NextAuth v5
- **Analytics Dashboard** — Live KPI cards (total patients, appointments today, patients this week, recent appointments)
- **Google Calendar Sync** — Backend integration in progress; UI placeholder connected
- **WhatsApp Reminders** — Automated patient notifications via WhatsApp (in progress)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, TypeScript |
| Auth | NextAuth v5 (Auth.js) — Credentials + Google OAuth 2.0 |
| Database | PostgreSQL via Neon (serverless) |
| Calendar UI | FullCalendar (daygrid, timegrid, interaction) |
| External APIs | Google Calendar API, WhatsApp Business API |
| Deployment | Vercel (full-stack via Next.js API routes) |

---

## Project Structure

```
MedSync/
├── app/                            # Next.js full-stack app (frontend + API)
│   ├── app/
│   │   ├── (auth)/                 # Login, signup, forgot/reset password
│   │   ├── (dashboard)/            # Protected app pages
│   │   │   ├── dashboard/          # Overview, KPI cards, recent appointments
│   │   │   ├── patients/           # Patient list & management
│   │   │   └── appointments/       # FullCalendar agenda view
│   │   └── api/
│   │       ├── auth/               # NextAuth + login/signup/reset endpoints
│   │       ├── patients/           # CRUD patient records
│   │       ├── appointments/       # CRUD appointments
│   │       └── calendar/           # Google Calendar sync endpoints
│   ├── components/
│   │   ├── dashboard/              # KPI cards, recent appointments, calendar card
│   │   ├── patients/               # Patient table, edit modal, delete button
│   │   ├── appointments/           # Calendar, new/edit appointment modals
│   │   └── layout/                 # Sidebar, Navbar
│   ├── context/
│   │   └── AppointmentsContext.tsx # Global appointments state (API-connected)
│   ├── lib/                        # DB pool, Google Calendar client, patients helper
│   ├── types/                      # TypeScript interfaces (next-auth.d.ts, etc.)
│   └── auth.ts                     # NextAuth configuration
├── qa/                             # QA test suite and API contract docs
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm

### Local Setup

```bash
# Clone the repository
git clone https://github.com/NicolasV99/MedSync.git
cd MedSync/app

# Install dependencies
npm install

# Set up environment variables (see below)
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file inside `app/` with the following:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=

# NextAuth
AUTH_SECRET=
AUTH_URL=http://localhost:3000

# Google OAuth (login + calendar)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email (password reset)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

### Database Migrations

After setting up your database, run the migrations:

```bash
# Create appointments table columns and Google Calendar tokens table
node scripts/run-appointments-migration.mjs
```

The `tokens.sql` file in `app/data/` contains the `google_calendar_tokens` table schema — run it directly in your database console.

---

## Team

| Name | Role |
|------|------|
| Nicolas Velasquez | Team Lead & Front-End Developer |
| Ange Junior Gohouri | UI/UX Designer & Researcher |
| Nefi Zaldana | Back-End Developer |
| Austin Anumudu | QA Engineer & Tester |

---

## Deployment

Deployed on Vercel. Every push to `main` triggers an automatic production deploy.

**Vercel settings:** Root Directory → `app/`

---

*"Quality is not an act, it is a habit."*
