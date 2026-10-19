# 🎓 CampusEvent: College Event Management & Discovery System

A modern, production-grade full-stack College Event Management platform built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **SQLite**, and an integrated **Campus AI Assistant (CampusBot)**.

Designed for college students, event organizers, and academic committees to discover, organize, register, and manage campus events with instant digital passes.

---

## 🌟 Key Features

### 1. 🔍 Event Discovery & Catalog
- **Live Search & Category Filtering**: Browse events across **Technical**, **Cultural**, **Sports**, **Workshops**, and **Seminars**.
- **Real-Time Capacity Indicators**: Interactive progress bars displaying remaining seats vs. total capacity.
- **Rich Event Cards**: High-definition banners, time/date chips, venue locators, and admission pricing tags.

### 2. 🔐 Authentication & Role-Based Access Control (RBAC)
- **Multi-Role Authentication**: Seamless support for **Students** and **Organizers/Admins**.
- **Secure Architecture**: `bcryptjs` password hashing and signed `jsonwebtoken` (JWT) with HTTP-only cookies and Bearer token fallback.
- **One-Click Demo Credentials**: Instant autofill buttons for testing as Admin or Student.

### 3. 🎟️ Event Registrations & Digital Passes
- **Atomic Registration Flow**: Prevents overbooking and rejects duplicate signups.
- **Unique Ticket Code Generation**: Each attendee receives a verified alphanumeric pass code (e.g., `CE-TEC-883190`).
- **Student Dashboard ("My Passes")**: View all active passes, event schedules, venue maps, and one-click registration cancellation.

### 4. 👑 Admin & Organizer Portal
- **Real-time Analytics**: High-level overview of total events, total attendee registrations, and capacity utilization.
- **Event Creation & Publishing**: Modal form with venue specification, capacity caps, date picker, and banner images.
- **Attendee Management & CSV Export**: Inspect all registered students for any event with names, emails, departments, and ticket codes, with instant CSV export.
- **Event Deletion**: Cascade cleanup of events and associated registrations.

### 5. 🤖 CampusBot AI Chatbot Assistant
- Floating interactive chatbot available across all pages.
- Understands natural language inquiries regarding:
  - Upcoming events by category (e.g., *"Show technical events"*)
  - Venue locations and campus directions (e.g., *"Where is the Main Auditorium?"*)
  - Event registration steps and certificate eligibility.
- Interactive quick-reply suggestion chips.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend UI** | Next.js 14 App Router, React 18, Tailwind CSS, Lucide React Icons |
| **Backend API** | Next.js Route Handlers (`/api/*`), RESTful API architecture |
| **Database** | SQLite with ACID compliance, automated migrations, and foreign key cascades |
| **Security & Auth** | JWT (`jsonwebtoken`), bcrypt password hashing (`bcryptjs`), HTTP-only cookies |
| **Testing** | Node / TSX automated test suite verifying all 20 core backend flows |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v20+ or v24+
- **npm** v10+

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd campusevent
npm install
```

### 2. Seed Database
Populate the database with default accounts, realistic college events, and chatbot FAQs:
```bash
npm run seed
```

### 3. Run Automated Tests
Verify authentication, event creation, registration limits, and chatbot query handling:
```bash
npm run test:api
```

### 4. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Default Demo Accounts

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **👑 Campus Admin** | `admin@campusevent.edu` | `Admin@123` | Full admin portal, event creation, attendee management, CSV export |
| **🎓 Student** | `student@campusevent.edu` | `Student@123` | Event registration, digital ticket passes, student dashboard |

*(You can also use the **"Fill Demo Admin"** or **"Fill Demo Student"** buttons in the sign-in modal for 1-click login!)*

---

## 📡 REST API Reference

| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/register` | `POST` | Public | Create new student or admin account |
| `/api/auth/login` | `POST` | Public | Authenticate user & issue JWT |
| `/api/auth/me` | `GET` | Auth | Get current authenticated user profile |
| `/api/auth/logout` | `POST` | Auth | Clear authentication cookie |
| `/api/events` | `GET` | Public | List events with category & search filters |
| `/api/events` | `POST` | Admin | Create a new campus event |
| `/api/events/:id` | `GET` | Public | Get single event details & registration status |
| `/api/events/:id` | `PUT` | Admin | Update existing event |
| `/api/events/:id` | `DELETE` | Admin | Delete event and cascade registrations |
| `/api/events/:id/register` | `POST` | Auth | Register logged-in student for event |
| `/api/events/:id/register` | `DELETE` | Auth | Cancel registration & release seat |
| `/api/registrations/my` | `GET` | Auth | List all events registered by current user |
| `/api/registrations/event/:id` | `GET` | Admin | Get list of all registered attendees for event |
| `/api/chat` | `POST` | Public | Query CampusBot AI assistant |
| `/api/seed` | `POST` | Public | Re-seed initial demo dataset |

---

## 📂 Project Directory Structure

```
campusevent/
├── scripts/
│   ├── seed.ts                     # Database seeding execution script
│   └── test-api.ts                 # End-to-end API & Auth test suite
├── src/
│   ├── app/
│   │   ├── admin/page.tsx          # Admin Portal & Attendee Management
│   │   ├── api/                    # REST API Route Handlers
│   │   │   ├── auth/               # Login, Register, Me, Logout
│   │   │   ├── chat/               # CampusBot AI API
│   │   │   ├── events/             # Events CRUD & Registration endpoints
│   │   │   └── registrations/      # Student & Event attendee queries
│   │   ├── dashboard/page.tsx      # Student Dashboard & Digital Ticket Passes
│   │   ├── events/[id]/page.tsx    # Event Details & Registration Card
│   │   ├── login/page.tsx          # Dedicated Login page
│   │   ├── register/page.tsx       # Dedicated Register page
│   │   ├── globals.css             # Glassmorphism & custom theme
│   │   ├── layout.tsx              # Root Layout with Nav, Footer, ChatWidget
│   │   └── page.tsx                # Event Discovery & Catalog Home
│   ├── components/
│   │   ├── AuthModal.tsx           # Login/Register modal with demo autofill
│   │   ├── ChatWidget.tsx          # Floating CampusBot AI Chatbot
│   │   ├── Footer.tsx              # Campus branding & venues
│   │   └── Navbar.tsx              # Responsive navigation & session controls
│   ├── context/
│   │   └── AuthContext.tsx         # Global client authentication state
│   ├── lib/
│   │   ├── auth.ts                 # JWT signing & verification middleware
│   │   ├── db.ts                   # SQLite client & schema initialization
│   │   ├── seed.ts                 # Initial demo events & FAQ dataset
│   │   └── types.ts                # TypeScript interfaces and data models
│   └── types/
│       └── sqlite.d.ts             # SQLite TypeScript declarations
├── campusevent.db                  # Local SQLite database file (gitignored)
└── package.json
```

---

## 🚢 GitHub Push Instructions

To push this codebase to your GitHub account:

1. Create a new repository on [GitHub](https://github.com/new) called `CampusEvent`.
2. Link your local repository and push:
```bash
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/CampusEvent.git
git branch -M main
git push -u origin main
```
