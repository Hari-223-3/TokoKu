# Capstone Project — What to Submit and How

> **Who is this for:** All project teams
> **When to read:** Now — and refer back to it every week
> **Key rule:** Your project is built **progressively**. You don't submit everything at once. Each week, you update your work based on what you just learned in class.
>
> ⚠️ **Note:** All examples in this guide use a fictional **"MediBook" hospital appointment system** for illustration only. **Replace them with your own project's content** — your own system name, user roles, use cases, tables, routes, and screens.

---

## What You Submit (3 Items)

Every team maintains these three deliverables throughout the semester:

| # | What | Format | Where |
|---|---|---|---|
| 1 | **Design Document** | `.docx` or `.pdf` file | Submit via course platform |
| 2 | **Code Repository** | GitHub link | Include in your Design Document |
| 3 | **Deployment Link** | Live URL | Include in your Design Document (when available) |

> **The Design Document is your main deliverable.** It is a living document — you update it every week as your project grows. The GitHub link and deployment link are included inside it.

---

## 1. Design Document — What Goes Inside

Your Design Document has **8 sections**. You don't need to fill in all sections right away — start with what you can, and add more each week as we cover new topics in class.

### Section 1 — Project Overview

One paragraph that answers three questions:
- What does your system do?
- Who uses it?
- What problem does it solve?

**Example:**

> MediBook is a hospital appointment system. Patients use the mobile app to browse available doctors, book appointments, and view their booking history. Hospital staff use the web dashboard to manage doctor schedules, view all appointments, and update patient records. The system replaces the current phone-based booking process, which is slow and error-prone.

**Keep it short.** If you can't explain your project in one paragraph, your scope is probably too big.

---

### Section 2 — User Roles & Use Cases

#### 2a. User Roles

List every type of user in your system. Most projects have exactly two:

| Role | Platform | Description |
|---|---|---|
| Admin (Hospital Staff) | Web | Manages schedules, views all appointments |
| Patient | Mobile | Books appointments, views own history |

#### 2b. Use Case List

A **use case** = one thing a user can do in your system.

| # | Actor | Use Case | Priority |
|---|---|---|---|
| UC-1 | Patient | Register an account | Must have |
| UC-2 | Patient | Log in | Must have |
| UC-3 | Patient | View list of doctors | Must have |
| UC-4 | Patient | Book an appointment | Must have |
| UC-5 | Patient | View my appointments | Must have |
| UC-6 | Patient | Cancel my appointment | Should have |
| UC-7 | Admin | Log in | Must have |
| UC-8 | Admin | View all appointments | Must have |
| UC-9 | Admin | Add/edit doctor profiles | Should have |
| UC-10 | Admin | AI: auto-suggest schedule | Nice to have |

> **Priority guide:**
> - **Must have** — the system doesn't work without it
> - **Should have** — important but the system still works without it
> - **Nice to have** — only if you have time

#### 2c. Use Case Diagram

Draw a UML Use Case Diagram showing actors (stick figures) and use cases (ovals). Tools you can use: draw.io, Lucidchart, Figma, or even hand-drawn and photographed.

Example structure:
```
    ┌─────────────────────────────────────┐
    │           MediBook System           │
    │                                     │
 Patient ──── ( Book appointment )        │
    │  ╲                                  │
    │   ╲── ( View my appointments )      │
    │    ╲                                │
    │     ╲─ ( Cancel appointment )       │
    │                                     │
 Admin ──── ( View all appointments )     │
    │  ╲                                  │
    │   ╲── ( Manage doctor profiles )    │
    │    ╲                                │
    │     ╲─ ( AI: suggest schedule )     │
    └─────────────────────────────────────┘
```

> Use a proper diagramming tool for your submission — the text version above is just to show the idea.

---

### Section 3 — System Architecture

A single diagram showing how the parts of your system connect:

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Web App    │         │   Backend    │         │  Mobile App  │
│  (React +   │────────▶│  (Express +  │◀────────│ (React Native│
│    Vite)     │  HTTP   │   SQLite)    │  HTTP   │   + Expo)    │
│              │         │              │         │              │
│  Admin role  │         │  REST API    │         │  User role   │
│  Port 5173   │         │  Port 3000   │         │  Expo Go     │
└──────────────┘         └──────────────┘         └──────────────┘
                                │
                         ┌──────┴──────┐
                         │   SQLite    │
                         │  Database   │
                         │ (notes.db)  │
                         └─────────────┘
```

Label each box with:
- What it is (Web App / Backend / Mobile App / Database)
- Technology used (React, Express, SQLite, React Native)
- How they communicate (HTTP / REST API)

---

### Section 4 — Data Model (ER Diagram)

Show your database tables, their columns, and how tables relate to each other.

**Table format:**

| Table: `users` | | |
|---|---|---|
| `id` | INTEGER | PRIMARY KEY, auto-increment |
| `username` | TEXT | NOT NULL, UNIQUE |
| `password_hash` | TEXT | NOT NULL |
| `role` | TEXT | "admin" or "patient" |

| Table: `appointments` | | |
|---|---|---|
| `id` | INTEGER | PRIMARY KEY, auto-increment |
| `patient_id` | INTEGER | FOREIGN KEY → users.id |
| `doctor_name` | TEXT | NOT NULL |
| `date` | TEXT | NOT NULL |
| `status` | TEXT | "pending", "confirmed", "cancelled" |

**ER Diagram:** Draw the tables as boxes with lines showing relationships (1-to-many, etc.). Tools: draw.io, dbdiagram.io, or hand-drawn.

> **When to add this section:** After Week 9 (SQL & data modeling).

---

### Section 5 — API Endpoints

List every route your backend provides:

| Method | Endpoint | Auth Required? | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register a new user |
| `POST` | `/api/auth/login` | No | Login, returns JWT token |
| `GET` | `/api/appointments` | Yes (admin) | Get all appointments |
| `GET` | `/api/appointments/mine` | Yes (patient) | Get my appointments |
| `POST` | `/api/appointments` | Yes (patient) | Book a new appointment |
| `PUT` | `/api/appointments/:id` | Yes (admin) | Update appointment status |
| `DELETE` | `/api/appointments/:id` | Yes | Cancel an appointment |
| `POST` | `/api/ai/suggest` | Yes (admin) | AI: suggest optimal schedule |

For each endpoint, briefly describe:
- What it expects (request body fields)
- What it returns (response format)

> **When to add this section:** After Week 10 (auth + frontend-backend connection).

---

### Section 6 — Activity Diagrams

An activity diagram shows the **step-by-step flow** of a key process, including decisions and branches.

**You need 2–3 activity diagrams** for your most important flows. Pick from:
- Login / Registration flow
- The core action of your app (booking, ordering, enrolling, etc.)
- An admin workflow (approve, reject, manage)

**Example — Appointment Booking Flow:**

```
        [ Patient opens app ]
                 │
        [ Browse doctor list ]
                 │
        [ Select doctor + date ]
                 │
        ◇ Is the slot available?
       / \
     Yes   No
      │      │
      │    [ Show "slot taken" message ]
      │      │
      │    [ Go back to select ]
      │
  [ Confirm booking ]
         │
  [ Backend creates appointment ]
         │
  [ Show confirmation screen ]
```

Use a proper diagramming tool (draw.io, Lucidchart, Figma). The text version above is just to show the logic.

> **When to add this section:** You can start now — activity diagrams describe the logic of your app, not the code. Drawing them early helps you plan before coding.

---

### Section 7 — UI Design

Show what your screens look like. **Both Web and Mobile need UI designs.**

#### What to include:

For each screen, provide:
1. **Screen name** (e.g., "Login Page", "Appointment List", "Booking Form")
2. **A wireframe or screenshot** showing the layout
3. **Brief description** of what the user does on this screen

#### Format options (pick one):

| Option | Tool | Effort |
|---|---|---|
| Digital wireframes | draw.io / Figma | Medium |
| Slide-based mockups | PowerPoint / Canva | Low–Medium |
| Screenshots of working app | Your browser / Expo Go | Low (after you've built it) |

#### Minimum screens to show:

**Web (Admin side):**
- Login page
- Dashboard / main list view
- Detail / edit view
- At least one form (create or update)

**Mobile (User side):**
- Login page
- Main list / browse view
- Detail view
- Action screen (book, order, enroll, etc.)

> **When to add this section:** Start with Web wireframes now. Add Mobile wireframes after Week 12. Replace wireframes with actual screenshots once your app is built.

---

### Section 8 — Task Breakdown & Progress Log

Show who is doing what, and track your progress week by week.

**Team members:**

| Name | Student ID | Role in Team |
|---|---|---|
| Andi Pratama | 2024001 | Backend + Database |
| Budi Santoso | 2024002 | Web Frontend |
| Citra Dewi | 2024003 | Mobile Frontend + UI Design |

**Progress tracker:**

| Task | Owner | Target | Status |
|---|---|---|---|
| Design use cases & UI wireframes | All | Week 7 | ✅ Done |
| Build Web admin app (fake data) | Budi | Week 7 | ✅ Done |
| Deploy Web app to GitHub Pages | Budi | Week 7 | ✅ Done |
| Design database tables | Andi | Week 9 | ✅ Done |
| Build Express backend + auth | Andi | Week 10 | ✅ Done |
| Connect Web app to real backend | Andi + Budi | Week 11 | 🔄 In progress |
| Plan AI feature | All | Week 11 | ⬜ Not started |
| Build Mobile app screens | Citra | Week 12 | ⬜ Not started |
| Connect Mobile to backend | Citra + Andi | Week 13 | ⬜ Not started |
| Integrate AI feature | All | Week 14 | ⬜ Not started |
| Final testing & demo prep | All | Week 15 | ⬜ Not started |

**Update this table every week.** Your lecturer will check your progress at key checkpoints.

---

## 2. Code Repository (GitHub)

Provide the link to your team's GitHub repository.

**Requirements:**
- The repository must be **public** (or shared with your lecturer)
- It should have **real commit history** — not a single commit with all the code
- Include a `README.md` at the root with:
  - Project name and one-line description
  - Team member names
  - How to run the project locally (step by step)
  - Link to the deployed version (when available)

**Recommended repository structure:**

```
your-project/
├── README.md
├── web-admin/          ← React (Vite) frontend for admin
│   ├── src/
│   ├── package.json
│   └── .env.example    ← never commit .env itself
├── backend/            ← Express + SQLite API server
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── mobile-app/         ← React Native (Expo) app for users
    ├── App.js
    └── package.json
```

> **Important:** Never commit `.env` files, API keys, or `node_modules/` to GitHub. Add them to `.gitignore`.

---

## 3. Deployment Link

Provide the URL(s) where your running application can be accessed:

| Component | Deployment Platform | When Required |
|---|---|---|
| Web Admin App | GitHub Pages | From Week 7 |
| Backend API | Free hosting (TBD in class) | From Week 13 |
| Mobile App | Expo Go (no URL needed — show on your phone) | From Week 14 |

> The backend deployment platform will be covered in class during Week 13. Before that, your backend only needs to run locally.

---

## Weekly Checklist — What to Update When

Use this checklist to know what you should have in your document by each milestone:

### By Week 7 (Project 1 Deadline)
- [x] Section 1: Project Overview
- [x] Section 2: User Roles & Use Cases (Web admin side at minimum)
- [x] Section 6: Activity Diagrams (1–2 core flows)
- [x] Section 7: UI Design — Web wireframes or screenshots
- [x] Section 8: Task Breakdown (initial plan)
- [x] GitHub link (Web admin code)
- [x] Deployment link (GitHub Pages)

### By Week 10
- [ ] Section 4: Data Model / ER Diagram
- [ ] Section 5: API Endpoints (at least CRUD + auth)
- [ ] Section 8: Progress updated
- [ ] GitHub link updated (backend code added)

### By Week 12
- [ ] Section 2: Use Cases updated (add Mobile user side)
- [ ] Section 3: System Architecture diagram
- [ ] Section 7: UI Design — add Mobile wireframes
- [ ] Section 8: Progress updated

### By Week 14–15 (Final Deadline)
- [ ] All 8 sections complete and up to date
- [ ] Section 5: API Endpoints include AI route(s)
- [ ] Section 7: UI Design replaced with actual screenshots
- [ ] Section 8: Final progress — all tasks marked done or with explanation
- [ ] GitHub link — all code committed with clean history
- [ ] Deployment links — Web + Backend live, Mobile demo-ready on phone

---

## Submission Format

Each week, submit **one updated document** (not a new document each time). Your lecturer wants to see the document **grow over time** — that shows real progress.

**File naming:** `TeamName_DesignDocument.docx` (or `.pdf`)

**Inside the document, include on the first page:**
- Team name
- Team members and student IDs
- GitHub repository link
- Deployment link(s)
- Date of last update
