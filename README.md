# MEC MLBB Tournament Operations & Live Bracket Platform

> A realtime tournament operations and bracket management platform designed to help organizers manage single-elimination esports tournaments, including official bracket setup, match scheduling, staff assignment, match results, automatic bracket progression, and public tournament transparency.

Built with **Next.js 15+ (App Router)**, **TypeScript**, **Tailwind CSS**, **PostgreSQL**, **Prisma ORM**, and a lightweight **Server-Sent Events (SSE)** realtime engine. Ready for instant deployment on **Coolify** using Docker Compose.

---

## 1. Product Philosophy & Architecture

In competitive esports like Mobile Legends: Bang Bang (MLBB), physical technical meetings and live drawing happen in the real world. This platform serves as the **Tournament Operations Management System (TOMS)**:

```
Physical Technical Meeting Draw
        ↓
Admin Enters 32 Draw Slots (/admin/bracket)
        ↓
Validation Engine (32 slots, uniqueness, all registered teams)
        ↓
Lock Official Bracket (Generates M01 - M16 Round of 32 Matches)
        ↓
Schedule & Assign Staff (Conflict Engine prevents double-booking)
        ↓
Kickoff Match → Set LIVE (Realtime public broadcast)
        ↓
Submit Official Result with Confirmation Checkbox
        ↓
Automated Bracket Progression (Winner auto-advances to next match slot)
        ↓
Grand Final M31 → Declare Champion & Archive
```

### Core Architecture Highlights

- **Match-Centric Domain Model**: A `Match` is the central hub tying teams, brackets, schedules, venues, referees, PJs, observers, notes, and results together without redundant state.
- **Automated Winner Progression**: Submitting an official score automatically routes the winning team into the correct slot (`Team A` or `Team B`) of the downstream match in the tournament tree. No manual re-typing.
- **Scheduling Conflict Detection Engine**: Evaluates a ±45 minute time window around proposed match schedules and warns against double-booking venues or assigning the same referee, PJ, or observer to concurrent matches.
- **Append-Only Audit Logging**: Important actions (`BRACKET_LOCKED`, `RESULT_SUBMITTED`, `MATCH_STATUS_CHANGED`, `BRACKET_EMERGENCY_OVERRIDE`) are recorded in an immutable database log.
- **Realtime SSE Broadcast**: Public viewers and operational dashboards receive instant updates when matches change status or results are submitted without page refreshes.

---

## 2. Tournament Structure (32-Team Single Elimination)

32 teams across 31 single-elimination matches:

- **Round of 32 (16 Matches)**:
  - Left Side: `M01` to `M08` (Slots #01 to #16)
  - Right Side: `M09` to `M16` (Slots #17 to #32)
- **Round of 16 (8 Matches)**:
  - Left Side: `M17` (M01 vs M02), `M18` (M03 vs M04), `M19` (M05 vs M06), `M20` (M07 vs M08)
  - Right Side: `M21` (M09 vs M10), `M22` (M11 vs M12), `M23` (M13 vs M14), `M24` (M15 vs M16)
- **Quarter Finals (4 Matches)**:
  - Left Side: `M25` (M17 vs M18), `M26` (M19 vs M20)
  - Right Side: `M27` (M21 vs M22), `M28` (M23 vs M24)
- **Semi Finals (2 Matches)**:
  - Left Side: `M29` (M25 vs M26)
  - Right Side: `M30` (M27 vs M28)
- **Grand Final (1 Match)**:
  - `M31` (Winner M29 vs Winner M30) → Declares Champion 🏆 and Runner-Up 🥈!

---

## 3. Role-Based Access Control (RBAC)

| Role                            |  Bracket Setup & Lock  | Match Status & Scores | Schedule & Staff |     View Audit Logs     | Public View |
| :------------------------------ | :--------------------: | :-------------------: | :--------------: | :---------------------: | :---------: |
| **TOURNAMENT_ADMIN**      | Full (Lock & Override) |   Full (Any Match)   |       Full       | Full (Private & Public) |  Read-only  |
| **TOURNAMENT_DIRECTOR**   |    Full (Lock only)    |   Full (Any Match)   |       Full       |          Full          |  Read-only  |
| **REFEREE**               |       Read-only       | Assigned Matches Only |   View Shifts   |        Read-only        |  Read-only  |
| **PJ (Person in Charge)** |       Read-only       |   Operational Notes   |   View Shifts   |        Read-only        |  Read-only  |
| **OBSERVER**              |       Read-only       |   Observation Notes   |   View Shifts   |        Read-only        |  Read-only  |
| **STREAM_OPERATOR**       |       Read-only       |       Read-only       |  View Schedule  |        Read-only        |  Read-only  |
| **PUBLIC**                |       Read-only       |       Read-only       |    Read-only    |    Public Logs Only    |  Read-only  |

The Admin header navigation includes an instant **Role Switcher Dropdown** in development, allowing organizers, referees, and judges to simulate their specific operational views on the fly.

---

## 4. Application Routes

### Public Routes (No Authentication Required)

- `/`: Homepage with hero status, next match billboard, active LIVE matches, recent results, and announcements.
- `/bracket`: Interactive symmetrical 32-team tournament bracket (Desktop tree view + Mobile round selector cards).
- `/schedule`: Filterable match schedule (status, round, venue, team search).
- `/matches`: Catalog of all 31 matches segmented by round.
- `/matches/[matchId]`: Match detail page with scores, official status, venue, public referee/PJ info, and team rosters.
- `/teams`: Grid of 32 participating teams.
- `/teams/[teamId]`: Team profile with player lineup (EXP, Jungle, Mid, Gold, Roam) and tournament match history.
- `/live`: Dedicated spectator room showing currently active LIVE matches.
- `/announcements`: Official tournament bulletin board.
- `/transparency`: Verification portal displaying bracket lock timestamp, integrity metrics, and public operational logs.

### Admin Operational Routes

- `/admin/dashboard`: Operations cockpit with live match controllers and metrics.
- `/admin/bracket`: 32-slot physical draw entry, validation engine, official lock modal, and emergency override.
- `/admin/matches`: Table overview of all 31 matches with status toggles.
- `/admin/matches/[matchId]`: Match cockpit for status management, score entry, official result confirmation, and staff assignment.
- `/admin/schedule`: Comprehensive schedule grid with automatic conflict detection (venue/staff double-booking).
- `/admin/teams` & `/admin/teams/[id]`: Team registration and player rosters.
- `/admin/staff` & `/admin/staff/[id]`: Staff directory and individual staff shift timeline.
- `/admin/venues`: Arena rooms management and active match occupancy.
- `/admin/announcements`: Create, edit, and pin tournament announcements.
- `/admin/audit-log`: Immutable append-only operational log with JSON diff inspector.
- `/admin/settings`: Simulation tools (Auto-fill draw, Simulate R32, Simulate Champion, Reset Draft).

---

## 5. Local Development Setup

### Prerequisites

- Node.js 20+ (Node 22 / 26 supported)
- Docker & Docker Compose (for PostgreSQL)

### 1. Clone & Install

```bash
git clone <repo-url>
cd baganMEC
npm install
```

### 2. Configure Environment (.env)

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=baganmec
POSTGRES_PORT=5435
DATABASE_URL="postgresql://postgres:postgres@localhost:5435/baganmec?schema=public"
JWT_SECRET="mlbb-tournament-super-secret-key-2026-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 3. Start PostgreSQL & Run Database Setup

```bash
# Start PostgreSQL container
docker compose up -d postgres

# Push schema to database
npm run db:push

# Seed database with 32 realistic MLBB teams, staff, venues, and matches
npm run db:seed
```

### 4. Run Automated Tests

```bash
npm test
```

Verifies RBAC permissions, bracket validation, duplicate rejection, bracket locking, automated winner progression, conflict detection, and audit logging.

### 5. Start Next.js Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the public website or [http://localhost:3000/admin](http://localhost:3000/admin) to access tournament operations.

---

## 6. Coolify & Docker Compose Deployment

The repository includes a production-ready, multi-stage `Dockerfile` and `docker-compose.yml` tailored for **Coolify**:

### Deploying to Coolify:

1. In Coolify, create a **New Resource** → **Docker Compose**.
2. Point to this repository.
3. Configure the environment variables:
   ```env
   POSTGRES_PASSWORD=your_secure_postgres_password
   JWT_SECRET=your_long_random_jwt_secret
   NEXT_PUBLIC_APP_URL=https://your-tournament-domain.com
   ```
4. Click **Deploy**.
   - The PostgreSQL service starts with healthchecks.
   - The Next.js standalone container starts, automatically runs `docker-entrypoint.sh` to sync database migrations via `prisma db push`, and serves traffic on port 3000.

---

## 7. Tournament Day Runbook for Organizers

1. **Before the Event (Technical Meeting)**:
   - Admin opens `/admin/bracket`.
   - As official physical lot numbers are drawn, admin selects teams for Slots #01 through #32.
   - Validation box verifies 32/32 slots filled and no duplicate teams.
   - Admin clicks **Kunci Bagan Resmi (Lock Bracket)**.
2. **Scheduling Matches**:
   - Admin opens `/admin/schedule`.
   - Set match times and assign Referees, PJs, and Arena bilik.
   - If any staff or venue is double-booked within a 45-minute window, the conflict engine flags it immediately.
3. **During the Match**:
   - When teams enter the stage, set status to `READY`.
   - When game picks & bans start, set status to `LIVE`. Public homepage and spectator room update in realtime.
4. **Submitting Results**:
   - Enter final scores (e.g. 2 - 1), select winner, check confirmation checkbox, and click **Submit Hasil Resmi**.
   - Winner is **automatically propagated** into the next bracket match.
   - An immutable audit log entry is recorded.
5. **Grand Final**:
   - When Match 31 completes, the system declares the Champion, updates tournament status to `COMPLETED`, and showcases the Champion banner across the public portal.
