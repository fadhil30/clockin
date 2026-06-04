# Frontend Spec — ClockIn (screen by screen)

Recreate these in React.js + Vite. Components listed in `ARCHITECTURE.md` → `src/components`. Open `prototype/index.html` to see each live. All tokens in `README.md`.

Two shells:
- **Employee** = centered phone-style column, `max-width 430px`, rounded `34px`, `--shadow-3`, on a radial-gradient page background. Sticky bottom tab bar. (On a real phone it fills the screen; on desktop it's a centered card.)
- **HR Admin** = full desktop layout: fixed **248px sidebar** (white, left nav + "records locked" note + user) and a **72px sticky topbar** (page title + bell + avatar), content area padded `26–32px` on `--app-bg`.

---

## Custom component library (build these first)
| Component | Spec |
|---|---|
| `Button` | variants: primary(plum), accent, outline, ghost, soft, danger, dangerGhost. sizes sm(36)/md(44)/lg(54). radius `--radius-sm`. hover brighten + shadow; active translateY(1) scale(.99). optional left/right icon. |
| `IconButton` | square, radius `--radius-sm`, muted→hover bg. |
| `Card` | white, `1px --border`, radius `--radius`, `--shadow-1` (hover→`--shadow-2` if `hover`). pad prop. |
| `Pill` | tones success/info/warning/danger/neutral/brand/accent. optional leading dot or icon. radius 999. sizes sm/md. |
| `Field` + `Input` | label 13/600; input h46, radius `--radius-sm`, 1.5px border → focus primary + 3.5px ring. optional leading icon, suffix slot, error state. |
| `Select` | same metrics as Input, chevron-down affordance. |
| `Toggle` | pill switch, on = `--accent`. |
| `Segmented` | pill group on `--muted`; active segment white + `--shadow-1` + primary text. optional icons. |
| `Avatar` | circle, deterministic bg color from name, initials; optional ring; supports image. |
| `Spinner` | rotating ring. |
| `Overlay` | fixed dim backdrop (rgba(16,28,45,.42) + blur), centers or right-aligns a panel; Esc to close. Used for HR drawers. |
| `Empty` | icon tile + title + sub for empty tables/lists. |
| `Donut` | SVG ring chart with segments + center slot (HR presence). |
| `StatChip` / `KPI` | small stat tile (employee) / larger KPI card with icon tile + value + delta pill (HR). |
| `ClockHero` | the clock-in hero (see variations). |
| `CameraCapture` | getUserMedia viewfinder + shutter; falls back to file upload; returns image. |
| `MiniMap` | stylized map card with animated pin (placeholder for a real map embed). |
| `ProofPhoto` | renders the stored photo (square, rounded) with timestamp/location watermark overlay; in prototype it's a silhouette placeholder. |

---

## EMPLOYEE APP

### 1. Login  (`/login`)
- **Desktop:** split. Left brand panel (plum gradient, blurred accent orb, "ClockIn" logo, headline *"Clock in from anywhere, with proof in a tap."*, 3 feature chips, footer). Right: form, `max-width 392px`.
- **Mobile (<880px):** brand panel hidden; small logo above form.
- Form: heading "Welcome back 👋", subtext; **role Segmented** (Employee / HR Admin); email `Input` (mail icon), password `Input` (lock icon + show/hide eye suffix); "Keep me signed in" checkbox + "Forgot?"; primary `Sign in as <role>` button (shows Spinner while authenticating); divider "DEMO QUICK ACCESS"; two outline buttons (Employee app / HR console).
- **Behavior:** submit → `POST /auth/login` → store tokens → route to `/app/home` or `/admin/dashboard` by role.

### 2. Home  (`/app/home`)
Vertical stack, 18px gap, entrance stagger:
1. **Greeting row:** Avatar(48, ring) + "Good morning/afternoon/evening," + first name 👋 + bell IconButton. (greeting by local hour.)
2. **Clock-in hero** (`ClockHero`) — see variations. Live clock ticks every second (`useNow`).
3. **Today's record** card (only when clocked in): photo thumb + clock-in time + location + "Verified" pill.
4. **Quick stats** row: This week (hours), On-time streak, Team in (`StatChip` ×3).
5. **"Who's working today"** card (tap → Team): overlapping avatars + count.
6. **Recent attendance**: last 3 present days as rows (date tile, time range, mode, duration, on-time/late pill). "History" link → History.
- Data: `GET /attendance/today`, `/attendance/presence/today`, `/attendance/history?limit=3`.

#### ClockHero variations (pick **Spotlight** default)
- **Spotlight:** plum gradient card, accent orb, day/date, big tabular live clock (64px/800) + AM/PM, "You haven't clocked in yet", full-width accent **Clock in now** button with slow `breathe` animation.
- **Ring:** white card; 212px SVG progress ring (accent arc = current seconds), centered plum circular button "Clock in" + time.
- **Minimal:** white card; date + 46px clock left, "Not in yet" warning pill right; full accent button below.
- **Clocked-in state (all):** plum gradient card showing **live worked duration** (h m, ticking) + "Clocked in · <time>" pill + outline **Clock out** button.

### 3. Clock-in flow  (modal sheet over Home, `slide-up`)
Sticky header: back arrow + title + 3-dot step progress. Steps:
1. **Locating** — pulsing map-pin, "Verifying your location…", live time. Auto-advances ~1.5s (in prod: actually request `navigator.geolocation`, reverse-geocode → label). 
2. **Photo proof** — `CameraCapture` (Live camera viewfinder w/ face guide + shutter, or Upload-first per variation). On capture → review.
3. **Review & confirm** — captured photo (with Retake), details card (timestamp / location / work mode), `MiniMap`, shield note *"locked once submitted"*. Buttons: Back / **Confirm clock-in** (accent).
4. **Success** — green circle with animated check, "You're clocked in! 🎉", time/date, "Attendance recorded" pill, **Back to home** button.
- On confirm → `POST /attendance/clock-in` (multipart). On success update today's state.

### 4. History  (`/app/history`)
- Header "Attendance" + Segmented **List / Month**.
- Summary: 4 `StatChip` (Days present, Avg clock-in, Hours logged, Leave taken).
- **List:** rows per day — date tile, time range, mode + date, duration, on-time/late pill; leave days show a leave pill.
- **Month:** calendar grid; each day shows date + colored status dot (green on-time / amber late / blue leave / grey weekend); prev/next month; legend.
- Data: `GET /attendance/history?from=&to=`.

### 5. Team  (`/app/team`)
- Header + search `Input`.
- People grouped by status (Clocked in / On break / On leave / Not in yet), each group a `Card` of rows: avatar with status dot, name, role, mode (home/office) + since-time.
- Data: `GET /attendance/presence/today`.

### 6. Profile  (`/app/profile`)
- Profile card (avatar 76 ring, name, role·dept, status + schedule pills).
- Info list (email, phone, default location, schedule, joined).
- Settings toggles (Email alerts, Location reminder).
- **Reset demo data** (prototype-only; drop in prod) + **Sign out**.

---

## HR ADMIN CONSOLE

### Sidebar (persistent)
Logo (clock tile + "ClockIn" / "HR CONSOLE"), nav: Dashboard / Employees / Attendance (active = brand-50 bg + primary text). Bottom: brand-50 "Records are locked 🔒" reassurance card + user row (avatar + name + sign-out).

### 1. Dashboard  (`/admin/dashboard`)
Topbar title "Good morning, Yara" / subtitle. Pick **Stat cards** layout default:
- **Stat cards:** 4 KPI cards across (Present today, Avg clock-in, Late arrivals, On leave) → then 2-col: **Team presence** (Donut + legend) | **Today's submissions** feed (rows: ProofPhoto thumb, name, dept·mode, time, on-time/late pill; click → detail).
- **Presence-focus:** big presence panel left + 2×2 KPI grid right, submissions feed full-width below.
- Data: `GET /hr/dashboard`.

### 2. Employees — master data  (`/admin/employees`)
- Toolbar: search `Input` + department `Select` + **Add employee** (primary).
- **Table:** Employee (avatar+name+role) | Department | Type pill | Status pill (dot) | Joined | Edit. Horizontal scroll on narrow. Footer "N of M".
- **Add/Edit drawer** (`Overlay` right-aligned, `slide-up`): name, role/title, department + type (Select), email, phone, status (Segmented). Footer: Remove (edit only) / Cancel / Save. Validation: name+email+role required.
- Data: `GET/POST/PATCH/DELETE /employees`, `GET /departments`.

### 3. Attendance logs — VIEW ONLY  (`/admin/attendance`)
- Toolbar: range Segmented (Today / This week / This month) + search + department Select + **Export** (outline).
- **Table:** Employee | Proof (ProofPhoto thumb) | Clock-in time | Mode (home/office icon) | Location | Status pill | View. Row click → detail.
- **Detail panel** (`Overlay` right): header (avatar + name + role·dept); **"View-only record — timestamp and photo can't be altered"** locked note; large **photo proof** with watermark; details card (clock-in time, location, work mode, verification); `MiniMap`; late flag note if applicable. **No edit/delete controls anywhere.**
- Data: `GET /hr/attendance`, `GET /hr/attendance/:id`.

---

## Responsive notes
- Employee shell is mobile-first; centers as a card ≥ its max-width.
- HR console is desktop-first; below ~900px, collapse sidebar to a top bar / drawer (not designed in prototype — implement with codebase patterns).
- Tables scroll horizontally on small widths (`overflow-x:auto`).
- Respect `prefers-reduced-motion`.

## State (frontend)
- **Auth:** token + role + user (Context); persisted (localStorage/secure cookie).
- **Live clock:** `useNow()` ticking each second (home hero, flow timestamps).
- **Attendance today:** query `GET /attendance/today`; mutations clock-in/out invalidate it.
- **Clock-in flow:** local step machine (`locating → photo → review → success`) + captured image + geo.
- **HR drawers / detail:** local open state holding the selected row.
- Use TanStack Query for all server state; keep filters (search/department/range) in component state or URL params.
