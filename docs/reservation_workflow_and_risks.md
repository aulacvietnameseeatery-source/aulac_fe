# Reservation Workflow & Plan (March 2026)

This document preserves the original workflow and adds a risk/edge-case analysis to harden the logic.

## 1. Overview
The Reservation module manages the entire lifecycle of a customer's booking request.

Core criteria:
- Double-booking Prevention: Realtime tracking of reservation time slots.
- Operational Optimization: Automating late arrivals (No-show) via Background Jobs.
- User-Friendly UX: Staff interface supports multi-table selection and zone locking to prevent operational errors.

## 2. Status Definitions

### 2.1 Reservation Status
- PENDING: Newly created booking (via Web/App or manually by staff). Not yet assigned to a specific table.
- CONFIRMED: Booking approved by the receptionist and Table Assigned.
- CHECKED_IN: Guests have arrived and are seated.
- NO_SHOW: Guests did not arrive after the holding period (Grace period: 15 minutes).
- CANCELLED: Cancelled by the guest or proactively by the staff.
- COMPLETED: Guests have finished their meal and paid (Triggered from the Order module).

### 2.2 Associated Table Status
- AVAILABLE: Table is empty, ready to welcome guests.
- RESERVED: Table is held for upcoming guests (Associated reservation is CONFIRMED).
- OCCUPIED: Table is currently in use by guests (Associated reservation is CHECKED_IN).

## 3. Business Workflows

### Scenario 1: Standard Flow
1. Guest/Staff creates a new Reservation. Status: PENDING. Table: null.
2. Receptionist confirms:
   - Opens Assign Table Modal.
   - Calls Time Machine API: `GET /api/tables/available?targetTime=...`
   - Selects one or multiple tables.
   - Cross-locking logic: Selecting a table on Floor 1 disables tables in VIP Zone.
   - Submit: Reservation -> CONFIRMED, tables -> RESERVED.
   - Schedules Hangfire job 15 minutes after ReservedTime to check No-show.
3. Guest arrives: Status -> CHECKED_IN.
   - Assigned tables -> OCCUPIED automatically.

### Scenario 2: Auto No-Show & Table Release
If 15 minutes pass after ReservedTime and still not CHECKED_IN:
- Hangfire job runs:
  - Reservation -> NO_SHOW.
  - Tables -> AVAILABLE.
  - SignalR notification to update UI.

### Scenario 3: Late Arrival (After No-Show)
Guests arrive at minute 16:
- Receptionist tries to change status to CHECKED_IN.
- Backend validation:
  - If previously assigned table is AVAILABLE -> reclaim and seat (OCCUPIED).
  - If table already OCCUPIED -> block, receptionist must assign new table then check-in.

### Scenario 4: Walk-in Guests
Guests walk in without booking:
- Receptionist creates Order directly for an AVAILABLE table.
- Optional: create a Reservation with pre-assigned CHECKED_IN + table.

## 4. Technical Design

### 4.1 Backend (APIs & Services)
- `GET /api/reservations`: Fetch list including table names (string.Join TableCode).
- `GET /api/tables/available?targetTime=...`: Overlap checking algorithm, filters out tables within targetTime ± 2 hours.
- `PATCH /api/reservations/{id}/assign-and-confirm`:
  - Accepts List<long> tableIds.
  - Transaction: update Reservation, link junction table, change table statuses, schedule Hangfire job.
- `PATCH /api/reservations/{id}/status`:
  - General update, releases tables (AVAILABLE) on Cancel/No-show,
  - Occupies tables (OCCUPIED) on Check-in.

### 4.2 Frontend (UI Components)
- `ReservationCard.tsx`: status badges, time, table names, smart dropdown (forces Assign Table Modal when CONFIRMED is selected but no table assigned).
- `AssignTableModal.tsx`: calls available tables API, renders checkbox list, applies Zone Locking.
- `TableManagementContent.tsx`: Time Machine feature with datetime-local + debounced search.

### 4.3 Core Data Models (Frontend Interfaces)
Reservation models and Table/Time Machine models as defined in the spec (unchanged).

## 5. Integrity Constraints
1. EF Core Tracking: Do not call UpdateAsync() on the entire Reservation after including Tables list (avoid duplicate PK in junction table). Use _uow.SaveChangesAsync().
2. N-N Relationship: keep junction table consistent with table status transitions.

## 6. Risk & Edge-Case Analysis (Additions)

### 6.1 Concurrency and Double-Booking
- UI filtering is not sufficient. `assign-and-confirm` must re-check availability inside the same transaction to avoid race conditions (two staff confirm same table at once).
- Consider using row-level locks or optimistic concurrency tokens on Reservation/Table rows.

### 6.2 Hangfire Job Idempotency
- No-show job must check current Reservation status before updating.
- If reservation was CHECKED_IN or CANCELLED before job runs, job should no-op.
- If job fails, define whether transaction should rollback or allow reservation to stay CONFIRMED with a rescheduled job.

### 6.3 Late Arrival After NO_SHOW
- When re-checking in:
  - Validate all previously assigned tables are still AVAILABLE.
  - If any table is OCCUPIED, block the action and require reassignment.
- Decide whether partial reclaim (some tables) is allowed or not.

### 6.4 Zone Locking Enforcement
- Zone locking must be enforced on backend as well, not only in UI, to prevent API bypass.

### 6.5 Order Module Interaction
- COMPLETED from Order should set table to AVAILABLE.
- If Reservation already CANCELLED/NO_SHOW, do not re-open or overwrite status.

### 6.6 Walk-in vs Reserved Conflict
- If a table is RESERVED for a future booking, decide whether walk-in can override.
- Suggest block or require manager override + audit log.

### 6.7 Time Zone / Time Drift
- Ensure ReservedTime is stored in UTC or explicitly standardized.
- Apply grace period using server time to avoid client drift.

### 6.8 Overlap Window Rule
- The ±2 hours overlap rule should be a configurable policy, not hardcoded.
- Ensure overlap logic is reused in both `available` and `assign-and-confirm`.

### 6.9 Cancellation Cleanup
- When CANCELLED, release tables and cancel Hangfire job if scheduled.
- Prevent job from re-applying NO_SHOW after cancellation.

