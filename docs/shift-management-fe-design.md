# Shift Management Frontend Design

> Scope: simple shift management for staff operations.
> Focus: shift schedules, check-in/check-out tracking, late and absence visibility, live on-duty board, and attendance reporting.
> Framework context: Next.js App Router, `next-intl`, TanStack React Query, protected staff dashboard routes.

---

## 1. Objectives

The frontend must support two main user journeys:

1. Staff member checks their assigned shift and performs check-in/check-out.
2. Manager monitors live attendance and reviews attendance reports.

The UI should stay simple and operational. It is not a full HR system in this phase.

---

## 2. Business Scope Reflected in FE

### Included screens

- Manager shift schedule list and editor
- Manager assignment view
- Staff self-service check-in/check-out page
- Live on-duty board
- Attendance and worked-hours report pages

### Excluded in MVP

- break management UI
- shift swap UI
- payroll export UI
- complex calendar drag and drop
- notification center for shifts

---

## 3. Route Design

Recommended routes under the authenticated dashboard:

| Route | Audience | Purpose |
|------|------|------|
| `/dashboard/shifts` | Manager | Shift schedules and assignments |
| `/dashboard/shifts/live` | Manager | Live on-duty board |
| `/dashboard/shifts/reports` | Manager | Attendance and hours reporting |
| `/dashboard/my-shifts` | Staff | My assigned shifts and check-in/check-out |

Recommended page wrappers:

- each route should be a thin page file under `src/app/[locale]/(auth)/dashboard/...`
- each page should render a feature entry component wrapped in `ProtectedRoute`

Example permissions:

- `/dashboard/shifts` uses `Permissions.ViewShift`
- `/dashboard/shifts/live` uses `Permissions.ViewShift`
- `/dashboard/shifts/reports` uses `Permissions.ViewShiftReport`
- `/dashboard/my-shifts` uses authenticated access and check-in/out permissions for actions

---

## 4. Feature Folder Structure

Recommended feature layout following current repo conventions:

```text
src/features/staff/shift-management/
├── index.ts
├── shift-management.tsx
├── services/
│   └── shift-management.service.ts
├── hooks/
│   ├── use-shift-schedule-queries.ts
│   ├── use-shift-attendance-queries.ts
│   ├── use-shift-live-board.ts
│   └── use-shift-report-queries.ts
├── types/
│   ├── shift-management.types.ts
│   └── schema.ts
├── components/
│   ├── shift-schedule-list.tsx
│   ├── shift-schedule-form.tsx
│   ├── shift-assignment-panel.tsx
│   ├── check-in-card.tsx
│   ├── live-duty-board.tsx
│   ├── attendance-status-badge.tsx
│   ├── attendance-adjustment-dialog.tsx
│   └── report-filters.tsx
├── shift-live/
│   ├── index.ts
│   └── shift-live.tsx
├── shift-reports/
│   ├── index.ts
│   └── shift-reports.tsx
└── my-shifts/
    ├── index.ts
    └── my-shifts.tsx
```

This structure keeps one feature family while still separating manager screens from staff self-service screens.

---

## 5. Permission Constants

Add FE constants mirroring the BE permission strings.

Recommended additions in `src/types/const.ts`:

```ts
ViewShift: 'SHIFT:READ',
ScheduleShift: 'SHIFT:SCHEDULE',
AssignShift: 'SHIFT:ASSIGN',
CheckInShift: 'SHIFT:CHECK_IN',
CheckOutShift: 'SHIFT:CHECK_OUT',
AdjustAttendance: 'SHIFT:ADJUST_ATTENDANCE',
ViewShiftReport: 'SHIFT:REPORT_READ',
CloseShift: 'SHIFT:CLOSE',
```

Use `PermissionGuard` inside pages for action buttons such as publish, assign, or adjust attendance.

---

## 6. API Integration Design

All API calls should use:

- `api` from `@/lib/http`
- `ApiResponse<T>` typing
- service files that unwrap `.data`
- TanStack React Query for all server state

Recommended service surface:

```ts
shiftManagementService.getSchedules(params)
shiftManagementService.createSchedule(body)
shiftManagementService.updateSchedule(id, body)
shiftManagementService.getAssignments(params)
shiftManagementService.createAssignments(body)
shiftManagementService.checkIn(assignmentId)
shiftManagementService.checkOut(assignmentId)
shiftManagementService.adjustAttendance(attendanceId, body)
shiftManagementService.getLiveBoard(params)
shiftManagementService.getAttendanceReport(params)
shiftManagementService.getWorkedHoursReport(params)
shiftManagementService.getExceptionReport(params)
shiftManagementService.getMyShifts(params)
```

---

## 7. Type Design

Recommended FE DTOs:

```ts
export interface ShiftScheduleDto {
  shiftScheduleId: number;
  businessDate: string;
  shiftTypeLvId: number;
  shiftTypeCode: string;
  shiftTypeName: string;
  plannedStartAt: string;
  plannedEndAt: string;
  statusLvId: number;
  statusCode: string;
  statusName: string;
  notes?: string | null;
  assignedCount: number;
}

export interface ShiftAssignmentDto {
  shiftAssignmentId: number;
  shiftScheduleId: number;
  staffId: number;
  staffName: string;
  roleId: number;
  roleName: string;
  assignmentStatusCode: string;
  attendanceStatusCode: string;
  plannedStartAt: string;
  plannedEndAt: string;
  actualCheckInAt?: string | null;
  actualCheckOutAt?: string | null;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  workedMinutes: number;
}

export interface LiveDutySummaryDto {
  scheduled: number;
  active: number;
  late: number;
  absent: number;
  completed: number;
}

export interface LiveDutyBoardDto {
  businessDate: string;
  summary: LiveDutySummaryDto;
  rows: ShiftAssignmentDto[];
}

export interface AttendanceReportRowDto {
  staffId: number;
  staffName: string;
  roleName: string;
  assignedShifts: number;
  presentShifts: number;
  lateShifts: number;
  absentShifts: number;
  workedMinutes: number;
  averageLateMinutes: number;
}
```

Use both lookup IDs and lookup codes where the backend provides them.

---

## 8. Query Hook Design

Recommended query hooks:

### `useShiftSchedulesQuery(params)`

Purpose:

- fetch paged schedules list

### `useCreateShiftScheduleMutation()`

- invalidates schedules list

### `useUpdateShiftScheduleMutation()`

- invalidates schedules and live board when current-day shift changes

### `useShiftAssignmentsQuery(params)`

- fetch assignments for a schedule or date range

### `useCheckInMutation()`

- invalidates `my shifts`, `live board`, and assignment queries

### `useCheckOutMutation()`

- invalidates `my shifts`, `live board`, and assignment queries

### `useLiveDutyBoardQuery(params)`

- poll every 30 to 60 seconds if SignalR is not active

### `useAttendanceReportQuery(params)`

- fetches attendance summary rows and totals

Recommended query keys:

```ts
export const SHIFT_QUERY_KEYS = {
  all: ['shifts'] as const,
  schedules: () => [...SHIFT_QUERY_KEYS.all, 'schedules'] as const,
  scheduleList: (params: object) => [...SHIFT_QUERY_KEYS.schedules(), params] as const,
  assignments: () => [...SHIFT_QUERY_KEYS.all, 'assignments'] as const,
  assignmentList: (params: object) => [...SHIFT_QUERY_KEYS.assignments(), params] as const,
  live: (params: object) => [...SHIFT_QUERY_KEYS.all, 'live', params] as const,
  reports: () => [...SHIFT_QUERY_KEYS.all, 'reports'] as const,
  attendanceReport: (params: object) => [...SHIFT_QUERY_KEYS.reports(), 'attendance', params] as const,
  workedHoursReport: (params: object) => [...SHIFT_QUERY_KEYS.reports(), 'worked-hours', params] as const,
  exceptionsReport: (params: object) => [...SHIFT_QUERY_KEYS.reports(), 'exceptions', params] as const,
  myShifts: (params: object) => [...SHIFT_QUERY_KEYS.all, 'my-shifts', params] as const,
};
```

---

## 9. Screen Design

### 9.1 Manager schedule page

Purpose:

- create, review, and update schedules
- inspect assignment coverage per shift

Recommended content:

- page header with date range filters
- schedule list table or week grid
- create/edit shift dialog
- assignment side panel or inline drawer

Important visible fields:

- business date
- shift type
- planned time range
- schedule status
- assigned staff count

Recommended actions:

- create schedule
- edit schedule
- publish schedule
- open assignments panel

### 9.2 My shifts page

Purpose:

- staff sees only their own assignments
- staff can check in and check out from a simple action card

Recommended content:

- today card with next/current shift
- status badge
- planned start and end time
- check-in button
- check-out button
- last action timestamp

UX rules:

- disable check-out until successful check-in
- show late badge and minutes after check-in if applicable
- show completed state after check-out

### 9.3 Live on-duty board

Purpose:

- give managers a realtime operational view of attendance

Recommended layout:

- top summary cards: scheduled, active, late, absent, completed
- filter bar: date, shift type, role, status
- board rows or cards ordered by priority

Recommended row content:

- staff name
- role
- scheduled time
- actual check-in
- actual check-out
- attendance status badge
- late minutes or early leave minutes if present

Recommended default sort:

1. late
2. absent
3. active
4. scheduled
5. completed

### 9.4 Reports page

Purpose:

- analyze attendance reliability and staffing outcomes over time

Recommended tabs:

- Attendance summary
- Worked hours
- Exceptions

Recommended filters:

- from date
- to date
- shift type
- role
- staff member
- attendance status

Recommended outputs:

- summary KPI cards
- tabular detail rows
- export placeholder button for future phase if needed

---

## 10. Form Design

### 10.1 Schedule form

Suggested schema fields:

- `businessDate`
- `shiftTypeLvId`
- `plannedStartAt`
- `plannedEndAt`
- `notes`

Validation rules:

- required date
- required shift type
- start earlier than end
- notes optional with max length

### 10.2 Attendance adjustment form

Suggested schema fields:

- `actualCheckInAt`
- `actualCheckOutAt`
- `adjustmentReason`

Validation rules:

- reason required
- check-out cannot be earlier than check-in

Use the repo form pattern:

- Zod schema in `types/schema.ts`
- `useForm({ resolver: zodResolver(...), mode: 'onBlur' })`
- `ALInput`, `ALCombobox`, and existing UI primitives

---

## 11. Status Mapping and UI State

Define status config maps in the types layer for consistent badges and colors.

Recommended attendance status map:

```ts
export const ATTENDANCE_STATUS_CONFIG = {
  SCHEDULED: { label: 'Scheduled', variant: 'secondary' },
  ACTIVE: { label: 'On Duty', variant: 'default' },
  LATE: { label: 'Late', variant: 'destructive' },
  ABSENT: { label: 'Absent', variant: 'destructive' },
  COMPLETED: { label: 'Completed', variant: 'outline' },
  EARLY_LEAVE: { label: 'Early Leave', variant: 'destructive' },
  EXCUSED: { label: 'Excused', variant: 'secondary' },
} as const;
```

Use status codes, not numeric IDs, for UI logic.

---

## 12. Realtime Design

Reuse the existing SignalR pattern already present in the codebase.

Recommended FE integration:

- create a feature-local shift SignalR provider or a small reusable provider if the team wants to consolidate patterns later
- subscribe to backend events:
  - `AttendanceChanged`
  - `LiveBoardChanged`
  - `ShiftScheduleChanged`

Behavior:

- on live event, invalidate or patch the relevant React Query caches
- keep reports query passive; only the live board and current-day widgets should react in real time

Fallback behavior:

- if SignalR is disconnected, continue polling the live board every 30 to 60 seconds

---

## 13. Reporting UX Design

### 13.1 Attendance summary tab

Summary cards:

- total assigned shifts
- attendance rate
- late count
- absence count

Table columns:

- staff name
- role
- assigned shifts
- present shifts
- late shifts
- absent shifts
- attendance rate

### 13.2 Worked hours tab

Summary cards:

- total scheduled hours
- total worked hours
- variance hours

Table columns:

- staff name
- role
- scheduled minutes
- worked minutes
- variance minutes

### 13.3 Exceptions tab

Summary cards:

- late incidents
- absences
- early departures
- manual adjustments

Table columns:

- date
- staff name
- role
- shift type
- exception type
- affected minutes
- reviewed by

---

## 14. Internationalization

Add translation keys to all three locale files:

- `src/messages/en.json`
- `src/messages/fr.json`
- `src/messages/vi.json`

Suggested namespaces:

- `ShiftManagement.Common`
- `ShiftManagement.Schedule`
- `ShiftManagement.Live`
- `ShiftManagement.MyShift`
- `ShiftManagement.Reports`

Keep labels generic and reusable, for example:

- `checkIn`
- `checkOut`
- `late`
- `absent`
- `onDuty`
- `workedHours`

---

## 15. Navigation and Menu Placement

Recommended dashboard navigation group:

- `Shift Management`
  - `Schedules`
  - `Live Board`
  - `Reports`
  - `My Shifts`

If the current sidebar does not support nested menu items cleanly, keep it flat for MVP.

---

## 16. MVP Implementation Order

### Phase 1

- add FE permission constants
- add route pages and feature scaffolding
- build schedule list and schedule form
- build my shifts page with check-in/check-out actions
- build live board page with polling

### Phase 2

- add attendance adjustment dialog
- add reporting tabs and tables
- add SignalR live updates

### Phase 3

- add exports and richer filtering
- refine weekly view and staffing summaries

---

## 17. Acceptance Criteria

- Staff can view their own current shift assignment.
- Staff can check in and check out from the dashboard UI.
- Manager can view all current-day assignments in one live board.
- Late and absent staff are visually obvious without opening detail screens.
- Reports can summarize attendance, worked hours, and exceptions by date range.
- Manager can manually adjust attendance with a required reason.
- All staff-facing and manager-facing screens are client components and use API-driven state.

---

## 18. Notes for Implementation

- Prefer a simple table or list-based schedule view for MVP instead of a heavy calendar dependency.
- Keep live board and reports separate; they serve different workflows.
- Use React Query invalidation consistently after check-in, check-out, or manager adjustments.
- Do not duplicate attendance logic in FE; status evaluation should come from backend facts whenever possible.
