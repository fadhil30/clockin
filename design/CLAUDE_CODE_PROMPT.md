# Claude Code — Master Prompt (ClockIn remediation)

Paste this into Claude Code with the repo open. It assumes `FIX_HANDOFF.md`,
`README.md`, and `FRONTEND.md` from this handoff folder have been committed into
the repo (recommended under `/design/`). If you did NOT commit them, paste the
contents of FIX_HANDOFF.md into the prompt instead of referencing it.

---

You are fixing the existing `fadhil30/clockin` app (NestJS + MySQL/TypeORM
backend, React + Vite + zustand frontend) to match its design + technical brief.

First, read these committed docs and treat them as the source of truth:
- design/FIX_HANDOFF.md  → exact backend + frontend changes, in priority order
- design/README.md       → design tokens, the immutability business rule
- design/FRONTEND.md     → screen-by-screen visual spec

This is a remediation pass on a working MVP, NOT a rewrite. Keep existing
routing, auth, validation, and geolocation logic intact unless a fix says
otherwise. Work in the priority order below and open a separate commit per group.

== P0 — backend correctness & security (do first) ==
1. attendance.service.ts uploadPhoto(): reject (409) if record.photoUrl is already set.
2. jwt.strategy.ts + jwt.config.ts: remove the 'fallback-secret'; throw at boot if
   JWT_SECRET is unset. Add JWT_SECRET + JWT_EXPIRES_IN to .env.example.
3. database.config.ts: set synchronize:false; add TypeORM migration scripts; generate
   an initial migration; add a migration with a MySQL BEFORE UPDATE trigger on
   attendance_records that rejects changes to clock_in_at, latitude, longitude, and an
   already-set photo_url (allow clock_out_at and first photo_url write).
4. attendance.entity.ts: change the user relation onDelete from CASCADE to RESTRICT so
   immutable attendance can never be cascade-deleted.
5. Confirm there are still ZERO PATCH/PUT/DELETE routes on /attendance.

== P1 — backend data model ==
6. Attendance: add `mode` enum (HOME|OFFICE) accepted in ClockInDto; add late detection
   (status PRESENT|LATE|LEAVE via a configurable cutoff). Migrate.
7. Users: add nullable jobTitle, phone, employmentType, status, defaultLocation, joinedAt
   to the entity + create/update DTOs; update seed.ts. Migrate.

== P2 — frontend fidelity & completeness ==
8. tailwind.config.js: replace the blue `primary` scale with ClockIn's own "Plum & Coral"
   brand — plum primary (#5E2A8C) + coral accent (#FF6F50), set radii (sm10/14/lg20), and load
   Plus Jakarta Sans (UI) + Space Grotesk (clocks/numerals). NOT affiliated with any external
   design system. Then find-and-replace every hardcoded blue-* class across the app with the tokens.
9. Split shells: EmployeeShell = centered phone column (max-w 430px, radius 34px) with a
   sticky bottom tab bar (Home/History/Team/Profile); AdminShell = the desktop sidebar
   restyled to spec with the "Records are locked 🔒" card. Route each role to its shell.
10. Login: split brand-panel layout + role Segmented + show/hide password + demo access.
    Keep the zod schema, login(), and role redirect.
11. Home: Spotlight ClockHero (plum gradient, ticking 64px live clock, coral "Clock in now"
    breathe CTA; clocked-in state shows live worked duration + Clock out). Keep getMyToday()/
    clockOut(). Send `mode` in clockIn().
12. Clock-in flow: 4 steps (Locating → Photo → Review → Success); add a getUserMedia live
    camera with upload fallback; success screen with animated check. Keep clockIn()/uploadPhoto().
13. Add the missing employee screens: History (list + month calendar, uses getMyHistory +
    a new /attendance/my/summary), Team (presence by status, uses GET /attendance/presence/today),
    Profile.
14. Admin Dashboard: 4 KPI cards + presence donut + submissions feed, fed by the new
    GET /attendance/dashboard endpoint.
15. Admin Attendance: keep VIEW-ONLY; add range segmented + Export (CSV) + proof thumbnails;
    move detail to a right drawer with the locked note + proof photo + MiniMap. Remove the
    dead _employeeMap.
16. Employees: avatars + type/status pills + department Select/search; wire the new user
    fields into the Add/Edit form (move to a right drawer).
17. New GET-only endpoints — implement exactly as specified in FIX_HANDOFF.md Appendix A:
    - GET /attendance/presence/today (employee + admin): per-employee presence + rollup counts.
    - GET /attendance/dashboard (admin): 4 KPIs + presence counts + recent submissions.
    - GET /attendance/my/summary (employee): history summary strip.
    Use the code's actual conventions (numeric IDs, single users table) per Appendix B —
    do NOT migrate to the normalized UUID model in DATA_MODEL.md. Do NOT add any attendance
    mutate routes.
18. (optional) Adopt @tanstack/react-query for reads + mutations with cache invalidation,
    replacing the manual useEffect fetching.

Use lucide-react for icons. After each group: run the backend and `npm run dev` on the
frontend, exercise the happy path (login → clock in → clock out; HR view-only detail),
and verify against the acceptance checklist at the bottom of FIX_HANDOFF.md before moving on.
Do not weaken the immutability rule at any point.
