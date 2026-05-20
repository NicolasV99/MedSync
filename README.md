# MedSync Dashboard

A centralized appointment management platform for independent healthcare professionals. MedSync reduces administrative overhead and patient no-shows by combining a patient CRM, Google Calendar sync, and automated WhatsApp reminders in a single dashboard.

> CSE 499 Senior Project — BYU, Spring 2025

---

## Features

- **Patient Management** — Create, view, edit, and delete patient records with basic clinical history
- **Google Calendar Sync** — Two-way OAuth 2.0 integration; appointments stay in sync across devices
- **WhatsApp Automation** — Automatic reminders sent 24 hours before each appointment via Twilio
- **Metrics Dashboard** — Visual stats on attendance, no-show rate, and reminder delivery

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, TypeScript |
| Backend | Node.js with Express |
| Database | PostgreSQL / Firebase |
| External APIs | Google Calendar API (OAuth 2.0), Twilio WhatsApp |
| Deployment | Vercel (frontend), Railway / Render (backend) |

---

## Project Structure

```
MedSync/
├── app/                        # Next.js frontend
│   ├── app/
│   │   ├── (auth)/login/       # Login page
│   │   └── (dashboard)/        # App pages (sidebar layout)
│   │       ├── dashboard/      # Overview & metrics
│   │       └── patients/       # Patient list & management
│   ├── components/
│   │   └── layout/             # Sidebar, Navbar
│   ├── types/                  # TypeScript interfaces
│   └── lib/                    # Utility functions
├── design/                     # Design deliverables
│   ├── wireframes/
│   ├── design-system/          # Design tokens, color palette, typography
│   ├── specifications/
│   └── handoff/
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

# Set up environment variables
cp .env.local .env.local
# Fill in the required values (see Environment Variables section)

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file inside `app/` with the following:

```env
# Database
DATABASE_URL=

# Google OAuth (for Calendar sync)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# Twilio / WhatsApp
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

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

The frontend is deployed on Vercel. Every push to `main` triggers an automatic deploy.

Backend deployment target: Railway or Render (configured in Week 6).

---

*"Quality is not an act, it is a habit."*
