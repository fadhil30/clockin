# Architecture — ClockIn

> ⚠️ **STATUS — READ FIRST.** This describes the original *aspirational* microservices target
> (api-gateway + domain services, monorepo). The app was built as a **single NestJS modular
> monolith** (`UsersModule` / `AuthModule` / `AttendanceModule` in one app) with a React + Vite
> + **zustand** frontend. That monolith is the **binding decision** — `FIX_HANDOFF.md` does
> **not** ask you to split into microservices. Use this doc for the frontend project layout and
> general patterns only; ignore the gateway/microservice topology and the `clockin-backend` /
> `clockin-web` monorepo split.

## High-level
```
                 ┌─────────────────────────┐
   Browser  ───► │  React.js SPA (Vite)     │
                 │  - employee app          │
                 │  - HR admin console      │
                 └───────────┬─────────────┘
                             │ HTTPS / REST (JWT)
                             ▼
                 ┌─────────────────────────┐
                 │  api-gateway (NestJS)    │  ← single public entry
                 │  - REST controllers      │
                 │  - JWT guard + roles     │
                 │  - request validation    │
                 └───┬─────────┬─────────┬──┘
        TCP / Redis / RabbitMQ message transport
            ▼         ▼         ▼
   ┌──────────┐ ┌──────────┐ ┌────────────────┐
   │  auth    │ │ employee │ │  attendance    │
   │ service  │ │ service  │ │  service       │
   └────┬─────┘ └────┬─────┘ └───────┬────────┘
        │            │               │
        ▼            ▼               ▼
        └────────  MySQL  ───────────┘     + Object storage (photos)
```

Microservices communicate over a NestJS transport (`@nestjs/microservices` — TCP for simplicity in dev, Redis or RabbitMQ for production). The **gateway** is the only HTTP-exposed app; it translates REST calls into message patterns and aggregates responses.

> If full microservices are too heavy for v1, a pragmatic alternative is a **NestJS modular monolith** (one app, modules: `auth`, `employees`, `attendance`) that can be split into services later. The module boundaries below are designed so that split is mechanical. Choose based on team/ops capacity; the spec explicitly requires the microservices *concept*, so the gateway + service separation above is the target.

---

## Services & responsibilities

### `api-gateway`
- Hosts all HTTP REST endpoints (see `API_SPEC.md`).
- Global `ValidationPipe` (class-validator DTOs).
- `JwtAuthGuard` + `RolesGuard` (`@Roles('hr_admin')` etc.).
- File upload handling for photo proof (Multer → object storage), then forwards the resulting URL to `attendance-service`.
- Rate limiting, CORS, logging interceptor.

### `auth-service`
- Login (verify credentials → issue JWT access + refresh tokens).
- Password hashing (bcrypt/argon2).
- Token refresh & validation.
- Owns `users` table (auth identity) linked to `employees`.
- Role on the token: `employee` | `hr_admin`.

### `employee-service`
- **Master data CRUD** for employees (the HR directory).
- Departments lookup.
- Read endpoints for employee profile (used by employee app).
- Emits events on create/update (optional) for other services.

### `attendance-service`
- **Clock-in** (create record: timestamp, lat/lng, accuracy, photo URL, work mode) — **write-once**.
- **Clock-out** (sets `clock_out_ts` on the day's open record only).
- Read: today's status for an employee; history for an employee; team presence (aggregate of today); HR logs with filters (date range, department, employee, search).
- **No update/delete of timestamp or photo** — enforce in code and DB.

---

## Backend project layout (Nx or npm workspaces monorepo recommended)
```
clockin-backend/
  apps/
    api-gateway/
      src/
        main.ts
        app.module.ts
        auth/           (controller + JWT guard + roles guard)
        employees/      (controller → employee-service client)
        attendance/     (controller → attendance-service client, file upload)
    auth-service/
      src/ main.ts  auth.module.ts  auth.service.ts  users.entity.ts
    employee-service/
      src/ main.ts  employee.module.ts  employee.service.ts  employee.entity.ts  department.entity.ts
    attendance-service/
      src/ main.ts  attendance.module.ts  attendance.service.ts  attendance.entity.ts
  libs/
    common/           (DTOs, interfaces, message patterns, shared enums)
    database/         (TypeORM config factory — swap MySQL↔Oracle here)
  docker-compose.yml  (mysql, redis/rabbitmq, minio, services)
  .env
```

**Database swap point:** put the TypeORM `DataSource` options in `libs/database`. Switching MySQL → Oracle = change `type: 'mysql'` → `type: 'oracle'`, the driver dependency, and a few column types (see `DATA_MODEL.md`). No business code changes.

---

## Frontend project layout (React.js + Vite)
```
clockin-web/
  index.html
  vite.config.ts
  src/
    main.tsx
    App.tsx                       (router setup)
    theme/
      tokens.css                  (the CSS variables from README)
      GlobalStyles
    lib/
      api.ts                      (axios instance, baseURL, JWT interceptor)
      queryClient.ts              (TanStack Query)
      auth.tsx                    (AuthContext: token, role, login, logout)
    components/                   (CUSTOM COMPONENT LIBRARY — port from prototype)
      Button.tsx  IconButton.tsx  Card.tsx  Pill.tsx
      Input.tsx   Select.tsx  Field.tsx  Toggle.tsx  Segmented.tsx
      Avatar.tsx  Spinner.tsx  Overlay.tsx  Empty.tsx
      Donut.tsx   StatChip.tsx  KPI.tsx
      ClockHero.tsx  CameraCapture.tsx  MiniMap.tsx  ProofPhoto.tsx
    routes/
      Login.tsx
      employee/
        EmployeeLayout.tsx        (phone-style shell + bottom nav)
        Home.tsx  ClockInFlow.tsx  History.tsx  Team.tsx  Profile.tsx
      admin/
        AdminLayout.tsx           (sidebar + topbar)
        Dashboard.tsx  Employees.tsx  Attendance.tsx
    hooks/
      useNow.ts                   (1s ticking clock)
      useAttendance.ts            (queries/mutations)
```

### Routing
```
/login
/app                 → redirect /app/home   (role: employee)
/app/home
/app/history
/app/team
/app/profile
/admin               → redirect /admin/dashboard  (role: hr_admin)
/admin/dashboard
/admin/employees
/admin/attendance
```
Guard routes by role from the JWT. `/app/*` requires `employee` (HR may also view), `/admin/*` requires `hr_admin`.

---

## Build / run steps

### Backend
```bash
# prerequisites: Node 20+, Docker
cd clockin-backend
cp .env.example .env            # set DB creds, JWT secrets, storage creds
docker compose up -d mysql redis minio
npm install
npm run start:dev               # runs gateway + services (concurrently)
# gateway on http://localhost:3000
```

### Frontend
```bash
cd clockin-web
npm create vite@latest . -- --template react-ts   # if scaffolding fresh
npm install react-router-dom @tanstack/react-query axios lucide-react
# add Plus Jakarta Sans + Space Grotesk <link> in index.html, paste tokens.css
echo "VITE_API_URL=http://localhost:3000" > .env
npm run dev                      # http://localhost:5173
```

### Suggested order of implementation
1. DB schema + TypeORM entities (`DATA_MODEL.md`).
2. `auth-service` + gateway login → JWT working end to end.
3. Frontend: tokens.css + component library + Login screen → real auth.
4. `employee-service` CRUD + HR Employees screen.
5. `attendance-service` clock-in/out + Employee app flow (camera, geo, review, success).
6. History, Team presence.
7. HR Dashboard + Attendance logs (view-only detail).
8. Enforce immutability (API guards + DB trigger), polish animations.
