# Data Model — ClockIn (MySQL)

> ⚠️ **STATUS — READ FIRST.** This describes the original *aspirational* normalized schema
> (separate `departments` / `employees` / `users` tables, **UUID** PKs). The app was built
> simpler — **one `users` table, numeric auto-increment IDs, `department` as a string** — and
> that simpler shape is the **binding decision** (`FIX_HANDOFF.md` Appendix B). Use this doc
> as reference for *field ideas and the immutability trigger only*; do **not** migrate to UUIDs
> or split tables. The fields actually added in remediation are listed in `FIX_HANDOFF.md` P1.

TypeORM entities. Designed to be **Oracle-swappable**: keep types portable (notes inline). All tables use a string UUID PK for portability (`CHAR(36)`), `created_at` / `updated_at` timestamps.

---

## ER overview
```
departments 1───* employees 1───1 users (auth)
                       │
                       1
                       │
                       *
                attendance_records   (write-once)
```

---

## `departments`
| Column | Type (MySQL) | Notes |
|---|---|---|
| id | CHAR(36) PK | uuid |
| name | VARCHAR(80) UNIQUE | e.g. "Engineering" |
| created_at | DATETIME | |

Seed: Engineering, Design, Product, Marketing, Sales, People, Finance, Support.

---

## `users` (owned by auth-service)
| Column | Type | Notes |
|---|---|---|
| id | CHAR(36) PK | |
| employee_id | CHAR(36) FK → employees.id | nullable until linked |
| email | VARCHAR(160) UNIQUE | login identity |
| password_hash | VARCHAR(255) | bcrypt/argon2 |
| role | ENUM('employee','hr_admin') | on JWT |
| is_active | TINYINT(1) | default 1 |
| last_login_at | DATETIME | nullable |
| created_at / updated_at | DATETIME | |

> Oracle: `ENUM` → `VARCHAR2(16)` + CHECK constraint; `TINYINT(1)` → `NUMBER(1)`.

---

## `employees` (master data — owned by employee-service)
| Column | Type | Notes |
|---|---|---|
| id | CHAR(36) PK | |
| full_name | VARCHAR(120) | required |
| role_title | VARCHAR(120) | e.g. "Product Designer" |
| department_id | CHAR(36) FK → departments.id | required |
| email | VARCHAR(160) UNIQUE | work email |
| phone | VARCHAR(40) | nullable; used for reminders |
| employment_type | ENUM('Full-time','Contract','Part-time','Intern') | |
| status | ENUM('Active','On leave','Suspended') | default 'Active' |
| default_location_label | VARCHAR(120) | e.g. "Home Office · Jakarta, ID" |
| schedule | VARCHAR(80) | e.g. "Mon–Fri · 09:00–18:00" |
| avatar_url | VARCHAR(255) | nullable (else initials) |
| joined_at | DATE | |
| created_at / updated_at | DATETIME | |

CRUD endpoints map to this table. Create/Update/Delete allowed (HR can manage employees). Soft-delete recommended (`deleted_at`) instead of hard delete.

---

## `attendance_records` (owned by attendance-service) — **WRITE-ONCE**
| Column | Type | Notes |
|---|---|---|
| id | CHAR(36) PK | |
| employee_id | CHAR(36) FK → employees.id | required, indexed |
| work_date | DATE | the calendar day (for one-record-per-day logic) |
| clock_in_ts | DATETIME | **immutable** after insert |
| clock_out_ts | DATETIME | nullable; set once on clock-out |
| latitude | DECIMAL(9,6) | captured geolocation |
| longitude | DECIMAL(9,6) | |
| accuracy_m | INT | gps accuracy in metres, nullable |
| location_label | VARCHAR(160) | reverse-geocoded / chosen, e.g. "Home · Jakarta, ID" |
| work_mode | ENUM('home','office') | |
| photo_url | VARCHAR(255) | **immutable**; URL in object storage |
| status | ENUM('on_time','late') | derived at insert (late if after 09:10 — make configurable) |
| created_at | DATETIME | |

**Indexes:** `(employee_id, work_date)`, `(work_date)`, `(department via join)`.
**Uniqueness:** one open clock-in per employee per `work_date`.

> Oracle: `DATETIME`→`TIMESTAMP`, `DECIMAL(9,6)`→`NUMBER(9,6)`, `INT`→`NUMBER(10)`, `ENUM`→`VARCHAR2`+CHECK.

### Immutability enforcement (defense in depth)
1. **API:** `attendance-service` exposes only `create` (clock-in), `clockOut` (sets `clock_out_ts` if null), and read queries. **No update/delete** of `clock_in_ts` or `photo_url`. HR endpoints are read-only.
2. **DB trigger (MySQL):** block updates to protected columns and block deletes.
```sql
DELIMITER //
CREATE TRIGGER trg_attendance_no_edit
BEFORE UPDATE ON attendance_records
FOR EACH ROW
BEGIN
  IF NEW.clock_in_ts <> OLD.clock_in_ts
     OR NEW.photo_url <> OLD.photo_url
     OR NEW.latitude  <> OLD.latitude
     OR NEW.longitude <> OLD.longitude THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Attendance proof is immutable';
  END IF;
END//
-- (optional) block all deletes
CREATE TRIGGER trg_attendance_no_delete
BEFORE DELETE ON attendance_records
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Attendance records cannot be deleted';
END//
DELIMITER ;
```
> Allow `clock_out_ts` to be set exactly once (NULL → value): the trigger above permits it because it only guards the protected columns.

---

## Optional: `leave_requests` (future — prototype shows leave in history)
Not required for v1 but history/calendar displays "Annual leave" / "Sick leave" days. If implementing:
| Column | Type | Notes |
|---|---|---|
| id | CHAR(36) PK | |
| employee_id | FK | |
| start_date / end_date | DATE | |
| type | ENUM('annual','sick','unpaid') | |
| status | ENUM('pending','approved','rejected') | |
| reason | VARCHAR(255) | |

For v1 you can omit this and simply not render leave days, or seed a static lookup.

---

## Derived / computed values (don't store; compute in queries)
- **Worked duration** = `clock_out_ts − clock_in_ts`.
- **On-time streak**, **avg clock-in**, **hours this week** — aggregate from `attendance_records`.
- **Team presence today** — group today's records + employee.status (`on leave`) to derive in / on-break / on-leave / not-in. (Note: "on break" is a UI state in the prototype; if you want real breaks, add a `breaks` table or a `status` enum on the record. For v1, "on break" can be omitted or modeled simply.)
