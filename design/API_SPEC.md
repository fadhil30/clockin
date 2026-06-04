# API Spec — ClockIn

> ⚠️ **STATUS — READ FIRST.** The detailed sections further down describe the original
> *aspirational* design (microservices, `/hr/*` + `/employees` + `/departments` routes,
> UUID IDs). The app was built simpler and that simpler shape is the **binding decision**
> (see `FIX_HANDOFF.md` Appendix B). **Treat everything below the line as reference only.**
> The **canonical as-built contract** the code actually exposes is this:

## Canonical API (as-built — this is what to implement against)

Base URL (dev): `http://localhost:3000`, global prefix **`/api`**. JWT bearer on every
route except login. Numeric IDs. Times ISO-8601 (UTC). **No PATCH/PUT/DELETE on `/attendance` — ever.**

**Auth**
- `POST /api/auth/login` → `{ access_token, user: { id, name, email, role, department } }`
- `GET  /api/auth/me` → current user (from JWT)

**Users** *(role: admin; JWT + RolesGuard)*
- `GET    /api/users?department=&page=&limit=` → `{ data, total, page, limit }`
- `GET    /api/users/:id`
- `POST   /api/users` → create (P1.2 adds jobTitle, phone, employmentType, status, defaultLocation, joinedAt)
- `PATCH  /api/users/:id` → update
- `DELETE /api/users/:id` → soft-delete (`isActive=false`)

**Attendance** *(JWT; employee acts on self)*
- `POST /api/attendance/clock-in` → body `{ latitude?, longitude?, mode? }` (`mode` = HOME|OFFICE, P1.1). 409 if already clocked in today.
- `POST /api/attendance/clock-out` → sets `clockOutAt` once. 409 if not in / already out.
- `POST /api/attendance/:id/photo` *(multipart, field `photo`)* → **409 if a photo already exists** (P0.1, immutable proof).
- `GET  /api/attendance/my/today` → today's record or `null`.
- `GET  /api/attendance/my?page=&limit=&startDate=&endDate=` → `{ data, total, page, limit }`.
- `GET  /api/attendance/my/summary?from=&to=` → **NEW** `{ daysPresent, avgClockIn, hoursLogged, leaveTaken }` (FIX_HANDOFF A.3).
- `GET  /api/attendance/presence/today` → **NEW** `{ counts, people }` (employee + admin; FIX_HANDOFF A.1).

**Attendance — admin reads** *(role: admin; JWT + RolesGuard; READ-ONLY)*
- `GET /api/attendance?date=&startDate=&endDate=&department=&userId=&page=&limit=` → `{ data, total, page, limit }`.
- `GET /api/attendance/:id` → full record (joined user) for the view-only detail drawer.
- `GET /api/attendance/dashboard` → **NEW** `{ presentToday, totalEmployees, lateArrivals, onLeave, avgClockIn, presence, recentSubmissions }` (FIX_HANDOFF A.2).

> Exact request/response JSON and NestJS service code for the three **NEW** endpoints
> are in `FIX_HANDOFF.md` Appendix A. Error envelope + validation rules below still apply.

---

## (Reference only — original aspirational spec; NOT the build target)

All REST endpoints are exposed by **`api-gateway`** and proxied to the relevant microservice over the message transport. Base URL (dev): `http://localhost:3000`. All responses JSON. All times ISO-8601 (UTC) — the frontend formats to local.

**Auth:** `Authorization: Bearer <accessToken>` on every endpoint except login/refresh.
**Roles:** `employee` and `hr_admin`. HR may read employee-facing data; employees may not access `/hr/*`.

---

## Auth (`auth-service`)

### POST `/auth/login`
```jsonc
// req
{ "email": "maya.putri@northwind.co", "password": "••••••••" }
// 200
{
  "accessToken": "jwt...",
  "refreshToken": "jwt...",
  "user": { "id":"u1", "employeeId":"e-001", "role":"employee",
            "name":"Maya Putri", "email":"maya.putri@northwind.co" }
}
// 401 { "message": "Invalid credentials" }
```
JWT payload: `{ sub: userId, employeeId, role, iat, exp }`.

### POST `/auth/refresh` → `{ accessToken }`
### POST `/auth/logout` → `204`
### GET `/auth/me` → current user + linked employee profile

---

## Employees — master data (`employee-service`)
HR-only for write; read allowed for self (employee) and HR.

### GET `/employees?search=&department=&status=&page=&limit=`
```jsonc
// 200
{ "data": [ {
    "id":"e-001","fullName":"Maya Putri","roleTitle":"Product Designer",
    "department":"Design","email":"maya.putri@northwind.co","phone":"+62 811 2200 145",
    "employmentType":"Full-time","status":"Active","joinedAt":"2023-03-14"
  } ],
  "total": 12, "page": 1, "limit": 20 }
```

### GET `/employees/:id` → single employee (full profile)

### POST `/employees`  *(role: hr_admin)*
```jsonc
// req
{ "fullName":"Jordan Lee","roleTitle":"Frontend Engineer","department":"Engineering",
  "email":"jordan.lee@northwind.co","phone":"+1 555 0100","employmentType":"Full-time",
  "status":"Active" }
// 201 → created employee (+ optionally creates a linked user with a temp password)
```

### PATCH `/employees/:id`  *(role: hr_admin)* → updated employee
### DELETE `/employees/:id`  *(role: hr_admin)* → `204` (soft-delete recommended)

### GET `/departments` → `[{ "id","name" }]`

---

## Attendance (`attendance-service`)

### Employee endpoints (role: employee, acts on self)

#### GET `/attendance/today` → today's status
```jsonc
{ "clockedIn": true,
  "record": { "id":"a1","clockInTs":"2026-06-01T02:02:00Z","clockOutTs":null,
              "locationLabel":"Home Office · Jakarta, ID","workMode":"home",
              "photoUrl":"https://.../a1.jpg","status":"on_time" } }
// if not clocked in → { "clockedIn": false, "record": null }
```

#### POST `/attendance/clock-in`  *(multipart/form-data)*
Captures timestamp server-side (trust server clock), stores photo, writes the **immutable** record.
```
fields:
  photo:        <file>            (required — the proof image)
  latitude:     -6.2088           (required)
  longitude:    106.8456          (required)
  accuracyM:    12                (optional)
  locationLabel:"Home Office · Jakarta, ID"
  workMode:     "home" | "office"
// 201 → created record (as in /today)
// 409 if already clocked in today
```
> Gateway receives the file (Multer), uploads to object storage, passes `photoUrl` to the service. `clock_in_ts` = server now. `status` computed (late if past configurable cutoff).

#### POST `/attendance/clock-out` → sets `clock_out_ts` once
```jsonc
// 200 → updated record with clockOutTs + workedMinutes
// 409 if not clocked in / already clocked out
```

#### GET `/attendance/history?from=&to=&view=list|calendar`
```jsonc
{ "data": [
    { "date":"2026-05-30","kind":"present","clockInTs":"...","clockOutTs":"...",
      "workedMinutes":492,"status":"on_time","workMode":"home",
      "locationLabel":"Home Office · Jakarta, ID" },
    { "date":"2026-05-28","kind":"leave","label":"Annual leave" },
    { "date":"2026-05-31","kind":"weekend" }
  ],
  "summary": { "daysPresent":21,"avgClockIn":"08:58","hoursLogged":168,"leaveTaken":2 } }
```

### Team presence (role: employee + hr_admin)

#### GET `/attendance/presence/today`
```jsonc
{ "counts": { "in":6, "break":2, "leave":1, "out":3 },
  "people": [
    { "employeeId":"e-002","name":"Arjun Mehta","role":"Engineering Lead",
      "department":"Engineering","status":"in","since":"08:46","mode":"home" }
  ] }
```

### HR — attendance logs (role: hr_admin, **READ-ONLY**)

#### GET `/hr/attendance?date=&range=today|week|month&department=&search=&page=&limit=`
```jsonc
{ "data": [
    { "id":"a1","employeeId":"e-008","name":"Marcus Bell","department":"Sales",
      "clockInTs":"2026-06-01T00:30:00Z","workMode":"office",
      "locationLabel":"HQ · San Francisco, US","status":"on_time","photoUrl":"https://.../a1.jpg" }
  ], "total": 10 }
```

#### GET `/hr/attendance/:id` → full record for the view-only detail panel
```jsonc
{ "id":"a1","employee":{ "id":"e-008","name":"Marcus Bell","role":"Sales Executive","department":"Sales" },
  "clockInTs":"...","clockOutTs":null,"latitude":37.77,"longitude":-122.41,
  "locationLabel":"HQ · San Francisco, US","workMode":"office",
  "photoUrl":"https://.../a1.jpg","status":"on_time","verification":"photo+geotag" }
```

#### HR dashboard summary — GET `/hr/dashboard`
```jsonc
{ "presentToday":9, "totalEmployees":12, "avgClockIn":"08:58",
  "lateArrivals":2, "onLeave":1,
  "presence": { /* same shape as /presence/today counts */ },
  "recentSubmissions": [ /* latest log rows */ ] }
```

> **There is intentionally NO** `PATCH`/`PUT`/`DELETE` on any `/attendance` or `/hr/attendance` resource. This is the enforcement of the immutability business rule at the API surface.

---

## Errors (consistent envelope)
```jsonc
{ "statusCode": 409, "error": "Conflict", "message": "Already clocked in today" }
```
Use Nest exception filters. Common codes: 400 validation, 401 auth, 403 role, 404 not found, 409 conflict (double clock-in), 413 file too large, 422 bad image.

## Validation rules (frontend + DTOs)
- Email: valid format, unique on create.
- Clock-in: photo required (image mime, ≤ ~8MB), lat/lng present & in range.
- Employee create: `fullName`, `email`, `roleTitle`, `department` required.
- Clock-out only valid when an open record exists for today.
