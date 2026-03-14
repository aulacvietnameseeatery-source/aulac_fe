# RESERVATION WORKFLOW & PLAN
**Last Updated:** March 2026

---

## 1. OVERVIEW
The Reservation module manages the entire lifecycle of a customer's booking request. The system is designed with the following core criteria:
- **Double-booking Prevention:** Realtime tracking of reservation time slots.
- **Operational Optimization:** Automating late arrivals (No-show) via Background Jobs.
- **User-Friendly UX:** The staff interface supports multi-table selection and zone locking to prevent operational errors.

---

## 2. STATUS DEFINITIONS

### 2.1. Reservation Status
1. `PENDING`: Newly created booking (via Web/App or manually by staff). Not yet assigned to a specific table.
2. `CONFIRMED`: Booking approved by the receptionist and **Table Assigned**.
3. `CHECKED_IN`: Guests have arrived and are seated.
4. `NO_SHOW`: Guests did not arrive after the holding period (Grace period: 15 minutes).
5. `CANCELLED`: Cancelled by the guest or proactively by the staff.
6. `COMPLETED`: Guests have finished their meal and paid (Triggered from the Order module).

### 2.2. Associated Table Status
- `AVAILABLE`: Table is empty, ready to welcome guests.
- `RESERVED`: Table is held for upcoming guests (Associated reservation is `CONFIRMED`).
- `OCCUPIED`: Table is currently in use by guests (Associated reservation is `CHECKED_IN`).

---

## 3. BUSINESS WORKFLOWS

### Scenario 1: Standard Flow
- **Step 1 (Guest/Staff):** Create a new Reservation. Status: `PENDING`. Table: `null`.
- **Step 2 (Receptionist):** View the PENDING list, click to change status to `CONFIRMED`.
    - The system opens the **Assign Table Modal**.
    - Calls the "Time Machine" API (`GET /api/tables/available?targetTime=...`) to show only tables available at that specific time.
    - The receptionist selects one or multiple tables (Cross-locking logic: Selecting a table on Floor 1 disables tables in the VIP Zone).
    - Submit: Reservation changes to `CONFIRMED`. Corresponding tables change to `RESERVED`.
    - **Trigger Hangfire Job:** Schedules a background task 15 minutes after the `ReservedTime` to check for a No-Show.
- **Step 3 (Guest Arrives):** Receptionist changes Status -> `CHECKED_IN`.
    - The system automatically changes the assigned tables to `OCCUPIED`.

### Scenario 2: Auto No-Show & Table Release
- After the reservation is `CONFIRMED`, if 15 minutes pass (relative to `ReservedTime`) without the status changing to `CHECKED_IN`.
- The Hangfire Background Job runs automatically:
    - Changes Reservation Status -> `NO_SHOW`.
    - Changes Table Status -> `AVAILABLE` (Releasing the tables for other guests).
    - Triggers a SignalR realtime notification to update the UI for all staff without requiring a page refresh.

### Scenario 3: Late Arrival (After being marked No-Show)
- Guests arrive at the 16th minute (Reservation is already `NO_SHOW`, tables are released).
- Receptionist finds the reservation and changes the status back to `CHECKED_IN`.
- **Backend Validation:**
    - If the previously assigned table is still `AVAILABLE` -> Reclaim the table, seat the guests (`OCCUPIED`).
    - If the previously assigned table has been taken (`OCCUPIED` by someone else) -> Backend throws an error to block the action. The receptionist must remove the old table, use the Assign Table Modal to grant a new table, and then Check-in.

### Scenario 4: Walk-in Guests
- Guests walk straight into the restaurant without a prior booking.
- Receptionist creates an Order directly for an `AVAILABLE` table. No need to go through the Reservation flow (or alternatively, quickly create a Reservation with a pre-assigned `CHECKED_IN` status and table).

---

## 4. TECHNICAL DESIGN

### 4.1. Backend (APIs & Services)
- **`GET /api/reservations`**: Fetches the reservation list including table names (using `string.Join` to concatenate `TableCode`).
- **`GET /api/tables/available?targetTime=...`**: Overlap checking algorithm. Filters out tables involved in other reservations within a `targetTime ± 2 hours` window.
- **`PATCH /api/reservations/{id}/assign-and-confirm`**:
    - Accepts a `List<long> tableIds`.
    - Transaction: Updates Reservation, links junction table (`reservation_table`), changes table statuses, schedules the Hangfire job.
- **`PATCH /api/reservations/{id}/status`**: General status update function, flexibly handles releasing tables (`AVAILABLE`) on Cancel/No-Show, or occupying tables (`OCCUPIED`) on Check-in.

### 4.2. Frontend (UI Components)
- **`ReservationCard.tsx`**: Displays status badges, time, and table names. Integrates a smart Dropdown (Intercepts actions, forcing the Assign Table Modal to open if `CONFIRMED` is selected but no table is assigned).
- **`AssignTableModal.tsx`**:
    - Calls the available tables API by `targetTime`.
    - Renders the Checkbox list.
    - Integrates the **Zone Locking Algorithm**: Selecting a table in Zone A -> Disables all tables in other Zones.
- **`TableManagementContent.tsx`**:
    - Table Management screen with a "Time Machine" feature (Date/time picker `datetime-local` combined with Debounced Search) allowing staff to foresee the restaurant's layout in the future.

### 4.3. Core Data Models (Frontend Interfaces)

To ensure seamless data mapping between the Backend and Frontend, the following core interfaces are defined in TypeScript. These interfaces clearly demonstrate the Many-to-Many relationship and the "Time Machine" feature.

#### A. Reservation Models
*Defines the structure of booking requests and their assigned tables.*

```typescript
 1. Used in the main reservation list (ReservationCard)
export interface ReservationDto {
    reservationId: number;
    reservedTime: string; // ISO 8601 Date string
    customerName: string;
    phone: string;
    pax: number;
    statusId: number;
    statusName: string;
    // Concatenated string of assigned tables (e.g., "T01, V02")
    tableName?: string | null; 
    notes?: string;
}

// 2. Used in the Reservation Detail page
export interface ReservationDetailDto {
    reservationId: number;
    customerName: string;
    partySize: number;
    reservedTime: string;
    statusName: string;
    statusCode: string;
    notes?: string;
    // List of tables specifically assigned to this reservation
    tables: ReservationTableDto[]; 
}

export interface ReservationTableDto {
    tableId: number;
    tableCode: string;
    capacity: number;
    tableType: string;
    zone: string; // Crucial for Zone Locking logic
}

B. Table & Time Machine Models
Defines how tables are queried (with overlap checking) and how they display their future bookings.
// 1. Query parameters including the "Time Machine" targetTime
export interface TableQueryParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  zoneId?: number;
  typeId?: number;
  statusId?: number; 
  isOnline?: boolean;
  // Triggers the overlap-checking algorithm in BE
  targetTime?: string; 
}

// 2. Returned from GET /api/tables
export interface TableManagementDto {
  tableId: number;
  tableCode: string;
  capacity: number;
  isOnline: boolean;
  statusCode: string; // "AVAILABLE" | "OCCUPIED" | "RESERVED" | "LOCKED"
  typeName: string;
  zoneName: string;
}

// 3. Returned from GET /api/tables/{id} (Table Detail Panel)
export interface TableDetailDto extends TableManagementDto {
  activeOrdersCount: number;
  hasErrors: boolean;
  // Cross-module data: Shows future bookings for this specific table
  upcomingReservations: UpcomingReservationDto[]; 
}

// 4. Embedded inside TableDetailDto
export interface UpcomingReservationDto {
  reservationId: number;
  guestName: string;
  pax: number;
  reservedTime: string; // ISO 8601
  statusCode: string;   // "PENDING" | "CONFIRMED"
}
---

## 5. INTEGRITY CONSTRAINTS
1. **EF Core Tracking:** Do not call `UpdateAsync()` on the entire Reservation Object after Including the `Tables` list to prevent `Duplicate entry for key PRIMARY` errors in the Many-to-Many junction table. Only use `_uow.SaveChangesAsync()`.
2. **N-N Relationship:** Ensure 1 Reservation can map to multiple Tables, but within 1 timeframe (± 2h window), 1 Table strictly belongs to only 1 Reservation.