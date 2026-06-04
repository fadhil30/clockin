# ClockIn — WFH Attendance Management System

A full-stack web application for managing employee Work-From-Home attendance. Employees clock in with a selfie and GPS location; HR admins monitor submissions and manage the employee directory.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS 11 (TypeScript) |
| Database | MySQL 8.0 (TypeORM, migrations) |
| Auth | JWT via Passport.js (role-based) |
| Photo Storage | Supabase Storage (S3-compatible) or local fallback |
| Frontend | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS 3.4 (Plum & Coral brand) |
| State | Zustand + SWR |
| Forms | React Hook Form + Zod |
| Containerization | Docker Compose (MySQL) |

---

## Features

### Employee
- Login with email/password (JWT auth)
- Clock in with geolocation capture and selfie upload
- Clock out to end the workday
- View personal attendance history (list + calendar)
- View real-time team presence (who is clocked in today)
- Edit personal profile (name, phone, department)

### HR Admin
- Dashboard with KPIs (present today, on time, late, absent)
- View all employee attendance records (read-only)
- Filter attendance by date range, department, and status
- Full employee directory (create, update, deactivate)
- View individual attendance details with photo proof

### System
- Attendance records are **immutable** after submission — enforced by a MySQL DB trigger and API constraints, preventing any tampering
- Photo uploads stored in Supabase Storage; falls back to local disk if Supabase is not configured
- Role-based access control (EMPLOYEE vs ADMIN) at the API guard level

---

## Prerequisites

- Node.js 20+
- Docker Desktop (for MySQL container)
- npm (or pnpm/yarn)

---

## Getting Started

### 1. Clone & install dependencies

```bash
git clone <repo-url>
cd ClockIn

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

Copy the example env and fill in your values:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
# Database (matches docker-compose.yml)
DB_HOST=localhost
DB_PORT=3308
DB_USERNAME=root
DB_PASSWORD=secret
DB_DATABASE=clockin_db

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# App
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase (optional — leave as placeholder to use local disk storage)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_BUCKET=attendance-photos
```

> **Supabase setup (optional):** Create a project at [supabase.com](https://supabase.com), create a public bucket named `attendance-photos`, and copy the URL + service role key from Project Settings → API.

### 3. Start MySQL (Docker)

```bash
docker compose up -d
```

This starts MySQL 8.0 on host port **3308** (mapped to container 3306). The database `clockin_db` is created automatically.

> **Why port 3308?** Port 3306 and 3307 may be occupied by local MySQL/MariaDB installations. Adjust `DB_PORT` in `.env` if needed.

### 4. Run database migrations

```bash
cd backend
npm run migration:run
```

### 5. Seed demo accounts

```bash
npm run seed
```

This creates two demo users:

| Role | Email | Password |
|---|---|---|
| HR Admin | admin@clockin.com | Admin@123 |
| Employee | john@clockin.com | Employee@123 |

### 6. Start the servers

**Backend** (runs on `http://localhost:3000`):
```bash
cd backend
npm run start:dev
```

**Frontend** (runs on `http://localhost:5173`):
```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Available Scripts

### Backend

```bash
npm run start:dev       # Development mode (watch)
npm run start:prod      # Production mode
npm run build           # Compile TypeScript to dist/
npm run seed            # Seed demo data
npm run migration:run   # Apply all pending migrations
npm run migration:revert # Undo the last migration
npm run migration:show  # List applied migrations
npm run test            # Unit tests
npm run test:e2e        # End-to-end tests
```

### Frontend

```bash
npm run dev     # Vite dev server with HMR
npm run build   # Production bundle
npm run preview # Preview production build
npm run lint    # ESLint check
```

---

## API Reference

All endpoints are prefixed with `/api`.

### Authentication

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login — returns `{ access_token, user }` |
| GET | `/api/auth/me` | JWT | Returns the authenticated user's profile |

### Attendance

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/attendance/clock-in` | JWT | Create an attendance record for today |
| POST | `/api/attendance/clock-out` | JWT | Set clock-out time on today's record |
| POST | `/api/attendance/:id/photo` | JWT | Upload selfie for an attendance record |
| GET | `/api/attendance/my/today` | JWT | Get the current user's attendance for today |
| GET | `/api/attendance/my` | JWT | Get the current user's attendance history (paginated) |
| GET | `/api/attendance/my/summary` | JWT | Get attendance summary stats for a date range |
| GET | `/api/attendance/presence/today` | JWT | Get all users clocked in today (team presence) |
| GET | `/api/attendance/dashboard` | JWT (Admin) | Admin KPI stats: present, late, absent counts |
| GET | `/api/attendance` | JWT (Admin) | List all attendance records with filters |
| GET | `/api/attendance/:id` | JWT (Admin) | Get a single attendance record |

### Users (Admin only)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/users` | JWT (Admin) | List all users (filterable by department, paginated) |
| GET | `/api/users/:id` | JWT (Admin) | Get a single user |
| POST | `/api/users` | JWT (Admin) | Create a new employee account |
| PATCH | `/api/users/:id` | JWT (Admin) | Update employee data |
| DELETE | `/api/users/:id` | JWT (Admin) | Soft-delete (deactivate) an employee |

---

## Database Schema

### `users`

| Column | Type | Notes |
|---|---|---|
| id | int (PK) | Auto-increment |
| email | varchar(255) | Unique |
| password | varchar(255) | Bcrypt hashed |
| full_name | varchar(255) | |
| role | enum | `EMPLOYEE`, `ADMIN` |
| status | enum | `ACTIVE`, `INACTIVE`, `SUSPENDED` |
| employment_type | enum | `FULL_TIME`, `PART_TIME`, `CONTRACT` |
| department | varchar(100) | |
| phone | varchar(20) | |
| hire_date | date | |
| profile_pic_url | varchar(500) | |
| manager_id | int (FK) | Self-referential (nullable) |
| created_at | timestamp | |
| updated_at | timestamp | |

### `attendance_records`

| Column | Type | Notes |
|---|---|---|
| id | int (PK) | Auto-increment |
| user_id | int (FK) | References `users.id` |
| clock_in_time | timestamp | Set on clock-in |
| clock_out_time | timestamp | Set on clock-out (nullable) |
| latitude | decimal(10,7) | GPS location at clock-in |
| longitude | decimal(11,7) | GPS location at clock-in |
| photo_url | varchar(500) | Supabase or local URL |
| work_mode | enum | `REMOTE`, `OFFICE`, `HYBRID` |
| status | enum | `PRESENT`, `LATE`, `ABSENT` |
| note | text | Optional employee note |
| created_at | timestamp | |

> **Immutability rule:** A MySQL trigger (`prevent_attendance_update`) fires on UPDATE or DELETE of any attendance record and raises a hard error. This is the system of record — changes are prohibited after submission.

---

## Project Structure

```
ClockIn/
├── backend/                    NestJS API
│   └── src/
│       ├── main.ts             Bootstrap: CORS, global pipes, static file serving
│       ├── app.module.ts       Root module — wires all feature modules
│       ├── data-source.ts      TypeORM DataSource for CLI migrations
│       ├── seed.ts             Demo data seeder (run once)
│       ├── common/
│       │   ├── decorators/     @CurrentUser, @Roles
│       │   ├── enums/          Role, AttendanceStatus, WorkMode, etc.
│       │   ├── filters/        Global HTTP exception formatter
│       │   ├── guards/         JwtAuthGuard, RolesGuard
│       │   └── services/       SupabaseService (photo upload)
│       ├── config/
│       │   ├── database.config.ts  TypeORM MySQL connection from env
│       │   └── jwt.config.ts       JWT secret/expiry from env
│       ├── migrations/         5 ordered TypeORM migrations
│       └── modules/
│           ├── auth/           Login endpoint + JWT strategy
│           ├── users/          Employee CRUD (admin-only)
│           └── attendance/     Clock-in/out, photo, history, dashboard
├── frontend/                   React + Vite app
│   └── src/
│       ├── api/                Axios client + per-resource API functions
│       ├── components/
│       │   ├── layout/         AppShell, AdminShell, EmployeeShell, Sidebar
│       │   ├── shared/         ProtectedRoute, RoleGuard, PhotoPreview
│       │   └── ui/             Button, Input, Modal, Badge, Avatar, Spinner, Table
│       ├── hooks/              useCurrentTime (live clock), useGeolocation (GPS)
│       ├── pages/
│       │   ├── auth/           LoginPage
│       │   ├── employee/       Dashboard, ClockIn, History, Team, Profile
│       │   └── admin/          AdminDashboard, Employees, Attendance
│       ├── store/              authStore (Zustand: user + token)
│       └── types/              TypeScript interfaces for User and Attendance
├── docker-compose.yml          MySQL 8.0 container (port 3308)
└── design/                     UI spec, API spec, data model, architecture docs
```

---

## File Documentation

### Backend

#### `src/main.ts`
Entry point. Bootstraps the NestJS app with:
- Global `/api` prefix
- CORS configured for the frontend URL
- `ValidationPipe` (whitelist, transform, forbidNonWhitelisted) for all DTOs
- Global `HttpExceptionFilter` for consistent error responses
- Static file serving from `uploads/` (local photo fallback)

#### `src/app.module.ts`
Root module that imports `ConfigModule` (env), `TypeOrmModule` (DB), `AuthModule`, `UsersModule`, and `AttendanceModule`.

#### `src/data-source.ts`
Standalone TypeORM `DataSource` used by the TypeORM CLI for generating and running migrations. Reads the same env vars as the app but outside the NestJS DI container.

#### `src/seed.ts`
One-shot script to insert demo admin and employee accounts with bcrypt-hashed passwords. Run with `npm run seed`.

#### `src/config/database.config.ts`
Reads `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` from env and returns a TypeORM config object. `synchronize: false` — all schema changes go through migrations.

#### `src/config/jwt.config.ts`
Reads `JWT_SECRET` and `JWT_EXPIRES_IN` from env. Used by `AuthModule` and `JwtStrategy`.

#### `src/common/guards/jwt-auth.guard.ts`
NestJS guard extending `AuthGuard('jwt')`. Applies Passport JWT validation; rejects requests with missing or invalid tokens with 401.

#### `src/common/guards/roles.guard.ts`
Guard that reads the `@Roles()` metadata on a route and compares it to `user.role` from the JWT payload. Returns 403 if the role does not match.

#### `src/common/decorators/current-user.decorator.ts`
Parameter decorator `@CurrentUser()`. Extracts `req.user` (the validated JWT payload) and injects it into the controller method.

#### `src/common/decorators/roles.decorator.ts`
Metadata decorator `@Roles(Role.ADMIN)`. Sets the `roles` key that `RolesGuard` reads.

#### `src/common/filters/http-exception.filter.ts`
Global exception filter. Catches all `HttpException` instances and returns a uniform JSON error shape: `{ statusCode, message, error, timestamp, path }`.

#### `src/common/services/supabase.service.ts`
Injectable service wrapping the Supabase JS client. Exposes `uploadFile(buffer, filename, mimetype)` which uploads to the `attendance-photos` bucket and returns a public URL. Falls back to saving locally if credentials are not set.

#### `src/common/enums/`
- `role.enum.ts` — `EMPLOYEE`, `ADMIN`
- `attendance-status.enum.ts` — `PRESENT`, `LATE`, `ABSENT`
- `work-mode.enum.ts` — `REMOTE`, `OFFICE`, `HYBRID`
- `employment-type.enum.ts` — `FULL_TIME`, `PART_TIME`, `CONTRACT`
- `user-status.enum.ts` — `ACTIVE`, `INACTIVE`, `SUSPENDED`

#### `src/modules/auth/`
- `auth.controller.ts` — `POST /api/auth/login` (public), `GET /api/auth/me` (JWT required)
- `auth.service.ts` — Validates email/password with bcrypt, signs and returns a JWT on success
- `auth.module.ts` — Configures `PassportModule`, `JwtModule`, and imports `UsersModule`
- `dto/login.dto.ts` — Validates request body: `{ email: string, password: string }`
- `strategies/jwt.strategy.ts` — Passport strategy that extracts the Bearer token from the Authorization header and validates the payload against the secret

#### `src/modules/users/`
- `users.controller.ts` — All routes require Admin JWT. Exposes CRUD endpoints under `/api/users`
- `users.service.ts` — Business logic: `findAll` (paginated, filterable by department), `findOne`, `create` (hashes password), `update`, `softDelete` (sets status to INACTIVE)
- `users.module.ts` — Registers the `User` entity and exports `UsersService` for use in `AuthModule`
- `entities/user.entity.ts` — TypeORM entity mapping to the `users` table with all profile columns and the self-referential `manager_id` FK
- `dto/create-user.dto.ts` — Validated payload for creating a user (email, password, full_name, role, department, etc.)
- `dto/update-user.dto.ts` — Partial version of `CreateUserDto` (all fields optional)

#### `src/modules/attendance/`
- `attendance.controller.ts` — Attendance endpoints. Employee routes use `@CurrentUser()` to scope to the caller. Admin routes are additionally guarded by `@Roles(Role.ADMIN)`
- `attendance.service.ts` — Core business logic:
  - `clockIn` — Creates a new record; marks as LATE if after 09:00
  - `clockOut` — Sets `clock_out_time` on today's open record
  - `uploadPhoto` — Delegates to `SupabaseService`; updates `photo_url`
  - `getMyToday` — Returns today's record for the current user
  - `getMyHistory` — Paginated personal attendance history
  - `getMySummary` — Aggregates counts (present, late, absent, on-time rate) for a date range
  - `getPresenceToday` — Lists all users with a clock-in for today
  - `getAdminDashboard` — KPI stats for the admin dashboard
  - `findAll` — Admin paginated list with filters (date range, status, department, user)
  - `findOneAdmin` — Fetches a single record with user data joined
- `attendance.module.ts` — Registers `Attendance` entity and `SupabaseService`
- `entities/attendance.entity.ts` — TypeORM entity for `attendance_records`; has a `@ManyToOne` relation to `User`
- `dto/clock-in.dto.ts` — Request body: `{ latitude, longitude, workMode, note? }`
- `dto/attendance-filter.dto.ts` — Query params for admin list: `{ userId, startDate, endDate, status, department, page, limit }`

#### `src/migrations/`
Ordered TypeORM migrations — always run via `npm run migration:run`:

1. **InitialSchema** — Creates `users` and `attendance_records` tables with all base columns and indexes
2. **ImmutabilityTrigger** — Installs a MySQL trigger that blocks any UPDATE or DELETE on `attendance_records`, enforcing the immutability business rule at the DB level
3. **FixFkRestrict** — Adjusts the foreign key between `attendance_records.user_id` and `users.id` to use RESTRICT on delete (prevents orphan records)
4. **AttendanceModeStatus** — Adds `work_mode` (enum) and `status` (enum) columns to attendance records
5. **UserProfileFields** — Adds extended profile columns: `phone`, `department`, `employment_type`, `hire_date`, `manager_id`, `profile_pic_url`

---

### Frontend

#### `src/main.tsx`
React entry point. Mounts `<App />` into `#root` with `React.StrictMode`.

#### `src/App.tsx`
Root component. Configures `react-router-dom` routes split by role. Wraps all routes in `ProtectedRoute`; admin routes additionally use `RoleGuard`.

#### `src/api/axiosInstance.ts`
Preconfigured Axios instance with `baseURL: http://localhost:3000/api`. A request interceptor reads the token from `authStore` and attaches it as `Authorization: Bearer <token>`. A response interceptor clears auth state and redirects to `/login` on 401.

#### `src/api/auth.api.ts`
- `login(email, password)` — POST `/auth/login`
- `getMe()` — GET `/auth/me`

#### `src/api/users.api.ts`
- `listUsers(params)` — GET `/users` with optional `department`, `page`, `limit`
- `getUser(id)` — GET `/users/:id`
- `createUser(data)` — POST `/users`
- `updateUser(id, data)` — PATCH `/users/:id`
- `deleteUser(id)` — DELETE `/users/:id`

#### `src/api/attendance.api.ts`
- `clockIn(data)` — POST `/attendance/clock-in`
- `clockOut()` — POST `/attendance/clock-out`
- `uploadPhoto(id, file)` — POST `/attendance/:id/photo` (multipart)
- `getMyToday()` — GET `/attendance/my/today`
- `getMyHistory(params)` — GET `/attendance/my`
- `getMySummary(params)` — GET `/attendance/my/summary`
- `getPresenceToday()` — GET `/attendance/presence/today`
- `getAdminDashboard()` — GET `/attendance/dashboard`
- `listAttendance(params)` — GET `/attendance`
- `getAttendance(id)` — GET `/attendance/:id`

#### `src/store/authStore.ts`
Zustand store persisted to `localStorage`. Holds `user` (profile) and `token` (JWT string). Exposes `login(user, token)` and `logout()` actions. The Axios interceptor reads directly from this store.

#### `src/hooks/useCurrentTime.ts`
Custom hook that returns a live `Date` object updated every second via `setInterval`. Used by the employee dashboard to show the current time.

#### `src/hooks/useGeolocation.ts`
Custom hook wrapping the browser `navigator.geolocation.getCurrentPosition` API. Returns `{ latitude, longitude, error, loading }`. Used by `ClockInPage` to capture the employee's GPS coordinates.

#### `src/components/shared/ProtectedRoute.tsx`
Reads auth state from `authStore`. If unauthenticated, redirects to `/login`. Otherwise renders children.

#### `src/components/shared/RoleGuard.tsx`
Accepts a `role` prop. If the logged-in user's role does not match, redirects to the appropriate default route. Used to separate the admin and employee route trees.

#### `src/components/shared/PhotoPreview.tsx`
Renders an attendance photo from either a Supabase CDN URL or a local `/uploads/` URL. Includes a fallback placeholder when no photo exists.

#### `src/components/layout/`
- `AppShell.tsx` — Top-level wrapper (fonts, Toaster)
- `EmployeeShell.tsx` — Mobile-first shell with bottom navigation for the employee app
- `AdminShell.tsx` — Desktop sidebar layout for the HR admin console
- `Sidebar.tsx` — Navigation links driven by the current user's role

#### `src/components/ui/`
Reusable, brand-themed primitives:
- `Button.tsx` — Variant (primary/secondary/ghost/danger), size (sm/md/lg), loading state
- `Input.tsx` — Labeled text input with inline error display (pairs with React Hook Form)
- `Modal.tsx` — Headless UI `Dialog`-based overlay with backdrop
- `Badge.tsx` — Pill badge for attendance status (color-coded: green/yellow/red)
- `Avatar.tsx` — Circular user avatar with initials fallback
- `Spinner.tsx` — Animated SVG loading indicator
- `Table.tsx` — Accessible table with configurable columns, row keys, and empty state

#### `src/pages/auth/LoginPage.tsx`
Login form built with React Hook Form + Zod validation. On success, stores the token and user in `authStore` and redirects based on role.

#### `src/pages/employee/DashboardPage.tsx`
Home screen for employees. Shows the live clock, today's clock-in status, a summary of the current month (days present, late, absent), and a quick clock-in button. Data fetched via SWR from `getMyToday` and `getMySummary`.

#### `src/pages/employee/ClockInPage.tsx`
Two-step clock-in flow: (1) captures geolocation via `useGeolocation`, (2) prompts a selfie upload, then calls `clockIn` followed by `uploadPhoto`. Handles the clock-out action for already-clocked-in users.

#### `src/pages/employee/HistoryPage.tsx`
Paginated list of the current user's attendance records. Each row links to a detail view with photo and location. Filterable by date range.

#### `src/pages/employee/TeamPage.tsx`
Shows a live presence list of all team members clocked in today. Data from `getPresenceToday`, refreshed on a short SWR interval.

#### `src/pages/employee/ProfilePage.tsx`
Editable profile form (full name, phone, department). Reads from `authStore`; patches via `updateUser`. Also shows aggregate attendance stats from `getMySummary`.

#### `src/pages/admin/AdminDashboardPage.tsx`
Admin overview. KPI cards (present, late, absent, total) from `getAdminDashboard`. Includes a donut chart of work-mode distribution and a recent submissions feed.

#### `src/pages/admin/EmployeesPage.tsx`
Full CRUD employee directory. Lists users in a `Table` component with department filter. Opens a `Modal` for create/edit using React Hook Form. Soft-delete triggers a confirmation dialog before calling `deleteUser`.

#### `src/pages/admin/AttendancePage.tsx`
Read-only attendance log for HR. Filter panel (date range, employee, status, department). Opens a detail `Modal` with photo proof when a row is clicked. No edit or delete actions — records are immutable.

#### `src/types/user.types.ts`
TypeScript interfaces and enums matching the backend: `User`, `Role`, `UserStatus`, `EmploymentType`.

#### `src/types/attendance.types.ts`
TypeScript interfaces: `AttendanceRecord`, `AttendanceStatus`, `WorkMode`, `AttendanceSummary`, `PresenceUser`.

---

## Design System

The UI uses a **Plum & Coral** brand palette:

| Token | Value | Usage |
|---|---|---|
| Plum | `#5E2A8C` | Primary actions, nav accent |
| Coral | `#FF6F50` | CTAs, highlights |
| Success | `#12A150` | Present / on-time status |
| Warning | `#F59E0B` | Late status |
| Destructive | `#E5484D` | Absent / error states |
| Info | `#2D7FF9` | Informational elements |

Typography: **Plus Jakarta Sans** for UI text, **Space Grotesk** for numeric displays.

---

## Improvements Beyond Requirements

The base requirements called for a clock-in app with photo upload and an HR admin view. The following was added:

| Improvement | Description |
|---|---|
| **Immutability enforcement** | MySQL trigger + API-level guard prevents any modification to submitted attendance records |
| **Late detection** | Clock-in after 09:00 is automatically marked as `LATE` |
| **Work mode tracking** | Employees can specify REMOTE / OFFICE / HYBRID per session |
| **Clock-out** | Employees can record an end-of-day time (not in original spec) |
| **Team presence view** | Real-time list of who is currently clocked in today |
| **Attendance summary API** | Aggregated stats (present count, late rate, on-time %) over any date range |
| **Admin dashboard KPIs** | Pre-aggregated counts for today's attendance status distribution |
| **Geolocation capture** | GPS coordinates stored on clock-in (browser Geolocation API) |
| **Supabase Storage** | Photos stored in cloud CDN; local disk fallback for dev without credentials |
| **Soft-delete for users** | Deactivating an employee preserves historical attendance data |
| **TypeORM migrations** | Schema managed via versioned migrations (`synchronize: false`) with an immutability trigger migration |
| **Role-based UI routing** | Employee and admin apps are entirely separate route trees |
| **SWR data fetching** | Stale-while-revalidate caching for dashboard and presence data |
| **Custom hook abstraction** | `useCurrentTime` and `useGeolocation` isolate platform APIs from UI components |
| **Reusable UI library** | 7 brand-themed primitives (Button, Input, Modal, Badge, Avatar, Spinner, Table) |
