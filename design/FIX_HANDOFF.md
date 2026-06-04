# ClockIn — Remediation Handoff (Frontend + Backend)

**Repo:** `github.com/fadhil30/clockin` · branch `main`
**Audience:** a developer (or Claude Code) fixing the existing implementation to match the ClockIn design + technical brief.
**How to use:** read this alongside `README.md` (tokens, business rule) and `FRONTEND.md` (screen-by-screen spec) in this same folder. Those are the source of truth for *visual* detail; this file is the source of truth for *what to change in the current code and why*.

This is a **remediation pass on an existing MVP**, not a rewrite. Keep working routing, auth, validation, and geolocation logic intact unless a fix explicitly says otherwise.

---

## 0. Current state in one paragraph

The build is a functional NestJS (modular monolith) + MySQL/TypeORM backend with a React + Vite + zustand frontend. Auth, role guards, employee/admin CRUD, and the clock-in/out flow all work. The core immutability rule is **mostly** enforced (no edit/delete routes on attendance), but there is one real hole (photo overwrite) and no DB-level protection. The UI is a low-fidelity reskin: stock Tailwind blue instead of Esco tokens, the employee app is a desktop sidebar instead of a mobile phone-shell, and several screens/fields from the spec are missing.

Fixes are ordered **P0 (correctness/security) → P1 (data model) → P2 (UI fidelity & completeness)**. Do them in order; P0 and P1 unblock P2.

---

## P0 — Correctness & security (backend)

### P0.1 — Block photo re-upload (immutability hole) 🔴
**File:** `backend/src/modules/attendance/attendance.service.ts` → `uploadPhoto()`
**Problem:** the method checks ownership but not whether a photo already exists, so an employee can overwrite their submitted proof photo (and `photoUploadedAt`) any time the record exists. This violates "photo is immutable once submitted."
**Fix:** reject when a photo is already present.

```ts
async uploadPhoto(recordId: number, userId: number, file: Express.Multer.File): Promise<AttendanceRecord> {
  const record = await this.attendanceRepo.findOne({ where: { id: recordId } });
  if (!record) throw new NotFoundException(`Record #${recordId} not found`);
  if (record.userId !== userId) throw new ForbiddenException("Cannot modify another employee's record");
  if (record.photoUrl) throw new ConflictException('Proof photo already submitted and cannot be changed'); // ADD
  // ...unchanged: upload + save
}
```

### P0.2 — Remove the hardcoded JWT fallback secret 🔴
**File:** `backend/src/modules/auth/strategies/jwt.strategy.ts` (and anywhere `JWT_SECRET` is read, e.g. `config/jwt.config.ts`)
**Problem:** `secretOrKey: process.env.JWT_SECRET ?? 'fallback-secret'` — if the env var is ever missing in any environment, tokens become forgeable with a known secret.
**Fix:** fail fast at boot.

```ts
const secret = process.env.JWT_SECRET;
if (!secret) throw new Error('JWT_SECRET is not set');
// ...
super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), ignoreExpiration: false, secretOrKey: secret });
```
Do the same in `jwt.config.ts` for the signing side. Add `JWT_SECRET` (and `JWT_EXPIRES_IN`, e.g. `1d`) to `.env.example`.

### P0.3 — Make attendance write-once at the DB layer 🟠
**Problem:** immutability currently holds only because no edit/delete routes exist. There is no DB protection, and `synchronize: true` with **no migrations** means there's nowhere a trigger can live. A future route or stray `repo.save()` could mutate `clockInAt`/photo.
**Fix:**
1. Turn off blind schema sync and introduce migrations: set `synchronize: false` in `config/database.config.ts`, add TypeORM migration scripts to `package.json` (`migration:generate`, `migration:run`), and generate an initial migration from the current entities.
2. Add a migration with a MySQL trigger (or column-level guard) that rejects updates to immutable columns once set:

```sql
CREATE TRIGGER trg_attendance_immutable
BEFORE UPDATE ON attendance_records
FOR EACH ROW
BEGIN
  IF (OLD.clock_in_at  <> NEW.clock_in_at)
  OR (OLD.photo_url IS NOT NULL AND OLD.photo_url <> NEW.photo_url)
  OR (OLD.latitude  <=> NEW.latitude)  = 0
  OR (OLD.longitude <=> NEW.longitude) = 0
  THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Attendance record fields are immutable';
  END IF;
END;
```
> Allow `clock_out_at` and (first-time) `photo_url` to be written; block changes to `clock_in_at`, lat/long, and an already-set `photo_url`. Adjust to taste, but the goal is: clock-out and first photo upload succeed; everything else on an existing row is rejected by the DB itself.

### P0.4 — Reconsider `onDelete: 'CASCADE'` on attendance 🟠
**File:** `backend/src/modules/attendance/entities/attendance.entity.ts`
**Problem:** `@ManyToOne(() => User, { onDelete: 'CASCADE' })` means a hard user delete would destroy immutable attendance records. It's currently masked because users are soft-deleted (`isActive=false`), but it's a latent contradiction with the immutability rule.
**Fix:** change to `onDelete: 'RESTRICT'` (or `SET NULL` with a nullable FK) so attendance history can never be cascade-deleted. Confirm there is no hard-delete path for users (there isn't today — `usersService.softDelete` flips `isActive`).

---

## P1 — Data model (backend) — the schema is thinner than the UI needs

The design renders work mode (home/office) icons, on-time/late pills, and a rich employee profile/drawer. None of that data exists yet.

### P1.1 — Attendance: add `mode` and late detection
**File:** `attendance.entity.ts` + `clock-in.dto.ts` + `attendance.service.ts`
- Add `mode` column: `@Column({ type: 'enum', enum: ['HOME','OFFICE'], default: 'HOME' })`.
- Accept `mode` in `ClockInDto` (`@IsEnum`, `@IsOptional`).
- Add late detection: either a `isLate boolean` column set at clock-in by comparing `clockInAt` against the employee's expected start time, or compute it. Minimum viable: a configurable cutoff (e.g. 09:15) → set `status` to `'LATE'` vs `'PRESENT'`. The design's on-time/late pills depend on this.
- Keep the existing `status` default but expand the allowed values (`PRESENT | LATE | LEAVE`).

### P1.2 — Users: add the profile fields the design uses
**File:** `users/entities/user.entity.ts` + `create-user.dto.ts` + `update-user.dto.ts`
Add nullable columns the Employees drawer + Profile screen expect:
- `jobTitle` (string), `phone` (string), `employmentType` (enum `FULL_TIME | PART_TIME | CONTRACT`), `status` (enum `ACTIVE | INVITED | SUSPENDED` — distinct from the soft-delete `isActive`), `defaultLocation` (string), `joinedAt` (date).
- Surface these in the DTOs (all optional except what the design marks required: name, email, role).
- Update the seed (`seed.ts`) to populate a couple realistic values.

### P1.3 — Migrations for all schema changes
All P1 changes go through generated migrations (see P0.3). No `synchronize`-only schema in any shared environment.

---

## P2 — Frontend fidelity & completeness

> Visual detail (exact hex, radii, copy, animation timing) lives in `README.md` → "Design Tokens" and `FRONTEND.md`. This section says **what to change in the current files**.

### P2.0 — Wire the real design tokens (do this FIRST — biggest visual impact)
**File:** `frontend/tailwind.config.js` + a fonts import
ClockIn has its own **"Plum & Coral"** identity (NOT affiliated with any external design system).
Replace the generic blue `primary` scale with the plum + coral accent, and load Plus Jakarta Sans + Space Grotesk.
```js
theme: { extend: {
  colors: {
    primary: { 50:'#F7F3FB',100:'#EEE3F6',200:'#DCC7EC',300:'#C2A1DC',400:'#A273C6',500:'#8348A9',600:'#6A3290',700:'#4A1D6E', DEFAULT:'#5E2A8C' },
    accent:  { soft:'#FFEDE8', DEFAULT:'#FF6F50', strong:'#E8512F', foreground:'#4A1606' },
    success:'#12A150', warning:'#F59E0B', info:'#2D7FF9', destructive:'#E5484D',
    appbg:'#F4F0F9',
  },
  borderRadius: { sm:'10px', DEFAULT:'14px', lg:'20px' },
  fontFamily: { sans: ['"Plus Jakarta Sans"','system-ui','sans-serif'], mono: ['"Space Grotesk"','ui-monospace','monospace'] },
}}
```
Load both fonts (Google Fonts `<link>` in `index.html` or `@fontsource`). Clocks/stats use the
`mono` (Space Grotesk) family + `font-variant-numeric: tabular-nums; letter-spacing:-0.01em`.
Then **find-and-replace every hardcoded `blue-600/blue-500/blue-700/blue-100`** across the app (Button, Sidebar, Input focus ring, DashboardPage clock, AdminDashboard tiles, badges) with the plum `primary` / coral accent tokens.

### P2.1 — Split the app shells (employee = phone, admin = desktop)
**Files:** `components/layout/AppShell.tsx`, `Sidebar.tsx`, `App.tsx`
Today both roles share the desktop `Sidebar`. Create **two shells**:
- `EmployeeShell`: centered phone-style column, `max-width 430px`, radius `34px`, large soft shadow, on a radial-gradient page bg, with a **sticky bottom tab bar**: Home / History / Team / Profile (lucide icons, active = navy, hit targets ≥44px).
- `AdminShell`: keep the current desktop sidebar (but restyle to spec — 248px, "Records are locked 🔒" reassurance card, user row).
Route employee pages through `EmployeeShell`, admin pages through `AdminShell`.

### P2.2 — Login (`pages/auth/LoginPage.tsx`)
Rebuild as a desktop **split** (stack < 880px): plum-gradient brand panel (logo, headline "Clock in from anywhere, with proof in a tap.", 3 feature chips) + right form column (max-width 392px). Form: "Welcome back 👋", **role Segmented** (Employee / HR Admin, drives CTA label), email Input w/ mail icon, password Input w/ lock icon + **show/hide eye**, "Keep me signed in" + "Forgot?", primary "Sign in as <role>" button (spinner while submitting), "DEMO QUICK ACCESS" divider + two outline demo buttons. **Keep** the existing zod schema + `login()` + role redirect. Add `lucide-react` for icons.

### P2.3 — Employee Home (`pages/employee/DashboardPage.tsx`)
Vertical stack (~18px gap, staggered entrance, respect `prefers-reduced-motion`):
- Greeting row: Avatar(48, ring) + time-of-day greeting + first name 👋 + bell icon button.
- **ClockHero "Spotlight"**: plum gradient card + coral orb, day/date, big tabular live clock (~64px/800, ticking) + AM/PM, "You haven't clocked in yet", full-width **coral** "Clock in now" CTA with a slow 3.4s breathe. Clocked-in state: live worked-duration ticker + "Clocked in · <time>" pill + outline "Clock out" (wire to existing `clockOut()`).
- Today's-record card (when clocked in): photo thumb + time + location + "Verified" pill.
- Quick-stats row: 3 stat chips (week hours / on-time streak / team in).
- **Keep** `getMyToday()` / `clockOut()` as-is; restyle/restructure only.

### P2.4 — Clock-in flow (`pages/employee/ClockInPage.tsx`)
- Present as a slide-up modal sheet over Home (if routing allows) or keep the route but match the visual.
- Expand 3 steps → **4**: Locating → Photo → Review → **Success**.
  - Locating: pulsing map-pin while `useGeolocation` resolves (keep the hook).
  - Photo: add a **live-camera viewfinder** (`getUserMedia`) with face guide + shutter, **keep file-upload as fallback**.
  - Review: details card (timestamp/location/**work mode**) + stylized MiniMap + shield note "locked once submitted."
  - Success: green circle + animated checkmark draw, "You're clocked in! 🎉", time/date, "Attendance recorded" pill, "Back to home".
- **Send `mode`** (home/office) in the `clockIn()` payload (new field from P1.1). Keep `clockIn()` + `uploadPhoto()` calls.

### P2.5 — New employee screens (currently missing entirely)
Add routes + pages: **History** (List + Month calendar, uses `getMyHistory()` which already exists), **Team** (presence grouped by status — needs a presence endpoint; see note below), **Profile** (profile card + info list + settings toggles + sign out).

### P2.6 — Admin Dashboard (`pages/admin/AdminDashboardPage.tsx`)
Expand from 2 tiles to the spec: **4 KPI cards** (Present today, Avg clock-in, Late arrivals, On leave) + **Team presence donut** + **Today's submissions feed** (proof thumb, name, dept·mode, time, on-time/late pill → click opens detail). Late/leave/mode data comes from P1.1.

### P2.7 — Admin Attendance (`pages/admin/AttendancePage.tsx`)
Keep view-only ✅. Add: range **Segmented** (Today / This week / This month), **Export** (outline button → CSV), **proof-photo thumbnails** in rows (replace the "Uploaded" badge), and move the detail from a centered `Modal` to a **right-aligned drawer** with the "View-only record — timestamp and photo can't be altered" locked note, large proof photo, MiniMap, and late flag. **No edit/delete controls** (already correct — keep it that way). Remove the dead `_employeeMap`.

### P2.8 — Employees (`pages/admin/EmployeesPage.tsx`)
Functionally complete already. Bring to spec: avatars + type/status pills in the table, a department **Select** + search in the toolbar, and convert the centered modal to a right drawer. Wire the new P1.2 fields into the Add/Edit form.

### P2.9 — Adopt TanStack Query (optional but spec'd)
Spec wanted `axios + @tanstack/react-query`; current code fetches manually with `useEffect`/`useState`. Wrap server reads in `useQuery` and mutations (clock-in/out, employee CRUD) in `useMutation` with cache invalidation. This removes the manual refetch boilerplate and stale-data risk. Lower priority than P0/P1.

### New endpoints implied by the UI
The frontend needs two reads that don't exist yet — `GET /attendance/presence/today`
(Team screen + admin presence donut) and a dashboard summary (admin KPIs). These are
specified in full, grounded in the actual codebase, in **Appendix A** below. Add them as
**GET-only** endpoints. Do **not** add any mutate routes to attendance.

---

## Acceptance criteria (definition of done)

**Backend**
- [ ] Re-uploading a photo to a record that already has one returns 409 (P0.1).
- [ ] App refuses to boot without `JWT_SECRET` (P0.2).
- [ ] A DB `UPDATE` that changes `clock_in_at` / lat / long / an existing `photo_url` is rejected by the database, not just the API (P0.3).
- [ ] No `synchronize: true` outside local dev; migrations exist and run cleanly (P0.3).
- [ ] Deleting a user cannot cascade-delete attendance records (P0.4).
- [ ] Attendance has `mode` + late status; users have the added profile fields; seed populates them (P1).
- [ ] Still **zero** PATCH/PUT/DELETE routes on `/attendance`.

**Frontend**
- [ ] No `blue-*` Tailwind classes remain; primary is plum `#5E2A8C`, accent is coral `#FF6F50`; Plus Jakarta Sans + Space Grotesk load.
- [ ] Employee app renders as a centered phone-shell with a bottom tab bar; admin keeps the desktop sidebar.
- [ ] Login is the split brand-panel layout with role segmented + show/hide password + demo access.
- [ ] Home shows the Spotlight ClockHero with a ticking live clock; clock-in flow ends on a Success screen; photo step offers live camera + upload.
- [ ] History / Team / Profile screens exist and route.
- [ ] Admin dashboard shows 4 KPIs + presence + submissions; attendance detail is a view-only right drawer with proof photo and the locked note.

---

## Suggested commit sequence
1. `fix(security): block photo re-upload + require JWT_SECRET` (P0.1–0.2)
2. `feat(db): migrations + immutability trigger, disable synchronize` (P0.3–0.4)
3. `feat(model): attendance mode + late status, user profile fields` (P1)
4. `feat(ui): wire ClockIn Plum & Coral tokens + fonts` (P2.0)
5. `feat(ui): split employee phone-shell / admin desktop shells` (P2.1)
6. `feat(ui): rebuild login + home ClockHero + clock-in flow` (P2.2–2.4)
7. `feat(ui): history/team/profile + admin dashboard/attendance/employees to spec` (P2.5–2.8)
8. `chore(fe): adopt react-query` (P2.9)

---

# Appendix A — New endpoints, in full (grounded in the actual code)

> Conventions in this repo: **numeric auto-increment IDs** (not UUIDs), a single
> `users` table (no separate `employees`/`departments` tables), `date` stored as a
> `'YYYY-MM-DD'` string, timestamps as `Date`. The code below follows those exact
> conventions — see Appendix B for why this differs from `DATA_MODEL.md`.
>
> Prereq: these depend on the P1 fields — `attendance.mode` (`HOME|OFFICE`) and
> `attendance.status` (`PRESENT|LATE|LEAVE`). Implement P1 first.

## A.1 — `GET /attendance/presence/today`  (employee + admin)

Powers the employee **Team** screen and the admin **presence donut**. Returns
per-employee presence derived from today's records, plus rollup counts.

**Presence derivation (one active employee = one of):**
| Status | Condition |
|---|---|
| `in` | has a today record with `clockOutAt == null` |
| `done` | has a today record with `clockOutAt != null` (clocked out) |
| `leave` | today record `status == 'LEAVE'` (or a leave entry if you add the optional leave model) |
| `not_in` | active employee with no today record |

> "On break" from the design is **not modeled in v1** (no break table) — omit it, or
> add a `breaks` table later. Don't fake it.

**Controller** (`attendance.controller.ts`) — note: NOT admin-guarded, both roles read it:
```ts
@Get('presence/today')
getPresenceToday() {
  return this.attendanceService.getPresenceToday();
}
```

**Service** (`attendance.service.ts`):
```ts
async getPresenceToday() {
  const today = this.todayString();

  // all active employees (exclude soft-deleted; employees only, not admins)
  const employees = await this.userRepo.find({
    where: { isActive: true, role: Role.EMPLOYEE },
  });

  // today's records, keyed by userId
  const records = await this.attendanceRepo.find({ where: { date: today } });
  const byUser = new Map(records.map(r => [r.userId, r]));

  const people = employees.map(e => {
    const r = byUser.get(e.id);
    let status: 'in' | 'done' | 'leave' | 'not_in' = 'not_in';
    if (r?.status === 'LEAVE') status = 'leave';
    else if (r && r.clockOutAt) status = 'done';
    else if (r) status = 'in';
    return {
      employeeId: e.id,
      name: e.name,
      role: e.jobTitle ?? null,      // from P1.2
      department: e.department ?? null,
      status,
      mode: r?.mode ?? null,         // from P1.1
      since: r ? r.clockInAt : null, // ISO; frontend formats to HH:mm
    };
  });

  const counts = people.reduce(
    (acc, p) => { acc[p.status]++; return acc; },
    { in: 0, done: 0, leave: 0, not_in: 0 } as Record<string, number>,
  );

  return { counts, people };
}
```
> Inject the users repo into `AttendanceService` (`@InjectRepository(User)`), and add
> `User` to `TypeOrmModule.forFeature([...])` in `attendance.module.ts`. Or, cleaner,
> call `UsersService` (import `UsersModule`, add a `findAllActiveEmployees()` helper).

**Response shape (200):**
```jsonc
{
  "counts": { "in": 6, "done": 2, "leave": 1, "not_in": 3 },
  "people": [
    { "employeeId": 8, "name": "Marcus Bell", "role": "Sales Executive",
      "department": "Sales", "status": "in", "mode": "OFFICE",
      "since": "2026-06-03T01:30:00.000Z" }
  ]
}
```

## A.2 — `GET /attendance/dashboard`  (admin only)

Powers the four admin KPI cards + presence + the "today's submissions" feed.

**Controller:**
```ts
@Get('dashboard')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
getDashboard() {
  return this.attendanceService.getAdminDashboard();
}
```

**Service:**
```ts
async getAdminDashboard() {
  const today = this.todayString();

  const totalEmployees = await this.userRepo.count({
    where: { isActive: true, role: Role.EMPLOYEE },
  });

  const todays = await this.attendanceRepo.find({
    where: { date: today },
    relations: { user: true },
    order: { clockInAt: 'DESC' },
  });

  const presentToday = todays.length;
  const lateArrivals = todays.filter(r => r.status === 'LATE').length;
  const onLeave = todays.filter(r => r.status === 'LEAVE').length;

  // avg clock-in time-of-day across present records → "HH:mm"
  const presents = todays.filter(r => r.status !== 'LEAVE' && r.clockInAt);
  const avgClockIn = presents.length
    ? this.formatAvgTime(presents.map(r => new Date(r.clockInAt)))
    : null;

  const recentSubmissions = todays.slice(0, 8).map(r => ({
    id: r.id,
    name: r.user?.name ?? null,
    department: r.user?.department ?? null,
    mode: r.mode ?? null,
    clockInAt: r.clockInAt,
    status: r.status,
    photoUrl: r.photoUrl ?? null,
  }));

  const presence = await this.getPresenceToday(); // reuse A.1 counts

  return {
    presentToday, totalEmployees, lateArrivals, onLeave, avgClockIn,
    presence: presence.counts,
    recentSubmissions,
  };
}

private formatAvgTime(dates: Date[]): string {
  const avgSec = dates.reduce((s, d) => s + d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds(), 0) / dates.length;
  const h = Math.floor(avgSec / 3600);
  const m = Math.floor((avgSec % 3600) / 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
```
> `onLeave` is only meaningful once leave exists. If you don't model leave in v1, it
> returns 0 — that's honest. If/when you add the optional `leave_requests` table from
> `DATA_MODEL.md`, fold it in here and in A.1.

**Response shape (200):**
```jsonc
{
  "presentToday": 9, "totalEmployees": 12, "lateArrivals": 2, "onLeave": 1,
  "avgClockIn": "08:58",
  "presence": { "in": 6, "done": 2, "leave": 1, "not_in": 3 },
  "recentSubmissions": [
    { "id": 41, "name": "Marcus Bell", "department": "Sales", "mode": "OFFICE",
      "clockInAt": "2026-06-03T01:30:00.000Z", "status": "PRESENT",
      "photoUrl": "https://.../41.jpg" }
  ]
}
```

## A.3 — History summary (extend the existing `GET /attendance/my`)

`getMyHistory()` already returns `{ data, total, page, limit }`. The History screen also
needs the **summary strip** (Days present / Avg clock-in / Hours logged / Leave taken).
Add a sibling `GET /attendance/my/summary?from=&to=` (or extend the existing response
with a `summary` block) computed over the range:
```jsonc
{ "daysPresent": 21, "avgClockIn": "08:58", "hoursLogged": 168, "leaveTaken": 2 }
```
- `hoursLogged` = Σ `(clockOutAt − clockInAt)` over completed days.
- `daysPresent` = count of `status != 'LEAVE'` rows.
- `leaveTaken` = count of `status == 'LEAVE'` rows (0 until leave is modeled).

## A.4 — Frontend wiring for the new endpoints

**`api/attendance.api.ts`** — add:
```ts
export const getPresenceToday = async () => {
  const { data } = await axiosInstance.get('/attendance/presence/today');
  return data; // { counts, people }
};
export const getAdminDashboard = async () => {
  const { data } = await axiosInstance.get('/attendance/dashboard');
  return data;
};
```
**`types/attendance.types.ts`** — add `PresenceStatus`, `PresencePerson`, `PresenceResponse`,
`AdminDashboard` interfaces matching the shapes above.

**Consumption** (if you adopt react-query, P2.9):
```ts
const { data: presence } = useQuery({ queryKey: ['presence','today'], queryFn: getPresenceToday });
const { data: dash }     = useQuery({ queryKey: ['admin','dashboard'], queryFn: getAdminDashboard });
```
- **Team screen** → group `presence.people` by `status` into the four cards.
- **Admin dashboard** → `dash.presentToday / avgClockIn / lateArrivals / onLeave` feed the 4 KPI
  cards; `dash.presence` feeds the donut; `dash.recentSubmissions` feeds the submissions feed
  (each row click → existing `GET /attendance/:id` detail drawer).

---

# Appendix B — Reconcile the two data models (important)

`DATA_MODEL.md` and `API_SPEC.md` describe the **normalized target**: separate
`departments`, `employees`, and `users(auth)` tables, **UUID** PKs, and richer
attendance fields. The **implemented code took a simpler shape**:

| Aspect | Spec docs (target) | Implemented code (reality) |
|---|---|---|
| Identity | `CHAR(36)` UUID PKs | numeric `unsigned int` auto-increment |
| People | `users` + `employees` + `departments` (3 tables) | one `users` table; `department` is a string column |
| Attendance fields | `work_mode`, `status(on_time/late)`, `location_label`, `accuracy_m` | `mode`/`status` **missing** (added in P1), no label/accuracy |
| Route prefixes | `/hr/attendance`, `/employees`, `/departments` | `/attendance` (admin via guard), `/users`, no departments route |

**Decision for this remediation: keep the implemented simpler shape** (single `users`
table, numeric IDs, `/attendance` + `/users`). It's adequate for v1 and avoids a costly
migration. Therefore:
- Treat `DATA_MODEL.md` / `API_SPEC.md` as **aspirational reference**, not literal targets.
- The field names in Appendix A use the **code's** names (`userId`, `clockInAt`, `mode`,
  numeric `id`), not the spec's (`employee_id`, `clock_in_ts`, UUIDs).
- If the team later wants the normalized model (e.g. multiple departments with their own
  metadata, or splitting auth from HR master data), that's a separate, larger migration —
  out of scope for this fix pass. Note it as future work.
