import type { AttendanceStatusCode } from "@/types/status-codes";

// ─── Template ─────────────────────────────────────────────────────────────────

export interface ShiftTemplateListDto {
  shiftTemplateId: number;
  templateName: string;
  defaultStartTime: string; // HH:mm:ss
  defaultEndTime: string;   // HH:mm:ss
  description?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ShiftTemplateDetailDto extends ShiftTemplateListDto {
  createdByName: string;
  updatedByName?: string | null;
  updatedAt: string;
}

// Keep backward-compatible alias
export type ShiftTemplateDto = ShiftTemplateListDto;

// ─── Assignment ───────────────────────────────────────────────────────────────

export interface ShiftAssignmentListDto {
  shiftAssignmentId: number;
  shiftTemplateId: number;
  templateName: string;
  staffId: number;
  staffName: string;
  workDate: string;         // yyyy-MM-dd
  plannedStartAt: string;   // ISO 8601
  plannedEndAt: string;     // ISO 8601
  assignmentStatusCode: string;
  assignmentStatusName: string;
  isActive: boolean;
  tags?: string | null;
  notes?: string | null;
  assignedAt: string;
  assignedByName: string;
}

export interface ShiftAssignmentDetailDto extends ShiftAssignmentListDto {
  attendance: AttendanceRecordDto | null;
}

export interface ShiftLiveBoardItemDto {
  shiftAssignmentId: number;
  shiftTemplateId: number;
  templateName: string;
  staffId: number;
  staffName: string;
  staffRoleCode: string;
  staffRoleName: string;
  workDate: string;
  plannedStartAt: string;
  plannedEndAt: string;
  assignmentStatusCode: string;
  assignmentStatusName: string;
  isActive: boolean;
  tags?: string | null;
  notes?: string | null;
  assignedAt: string;
  assignedByName: string;
  attendanceStatusCode?: string | null;
  attendanceStatusName?: string | null;
  actualCheckInAt?: string | null;
  actualCheckOutAt?: string | null;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  workedMinutes: number;
  isManualAdjustment: boolean;
  liveStatusCode: string;
  liveStatusName: string;
  hasAlert: boolean;
  currentTaskLabel?: string | null;
  currentLocationLabel?: string | null;
  ordersHandledCount?: number | null;
  paidBillsCount?: number | null;
  currentRevenue?: number | null;
  itemsCompletedCount?: number | null;
  pendingTicketsCount?: number | null;
  issueCount: number;
  latestIssueText?: string | null;
}

export interface ShiftLiveRealtimeEventDto {
  eventType: string;
  workDate?: string | null;
  shiftAssignmentId?: number | null;
  staffId?: number | null;
  orderId?: number | null;
  occurredAt: string;
}

// Keep backward-compatible alias used across the module
export type ShiftAssignmentDto = ShiftAssignmentDetailDto;

// ─── Time Log (Split Shift) ──────────────────────────────────────────────────

export interface TimeLogDto {
  timeLogId: number;
  punchInTime: string;        // ISO 8601
  punchOutTime: string | null;
  validationStatus: string;   // Valid | Late | Early_Leave | Missing_Punch
  punchDurationMinutes: number;
  createdAt: string;
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export interface AttendanceRecordDto {
  attendanceId: number;
  shiftAssignmentId: number;
  attendanceStatusCode: string;
  attendanceStatusName: string;
  actualCheckInAt: string | null;
  actualCheckOutAt: string | null;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  workedMinutes: number;
  isManualAdjustment: boolean;
  adjustmentReason: string | null;
  reviewedByName: string | null;
  reviewedAt: string | null;
  timeLogs: TimeLogDto[];
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export interface AttendanceReportRowDto {
  shiftAssignmentId: number;
  staffId: number;
  staffName: string;
  workDate: string;
  templateName: string;
  plannedStartAt: string;
  plannedEndAt: string;
  attendanceStatusCode: string;
  actualCheckInAt: string | null;
  actualCheckOutAt: string | null;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  workedMinutes: number;
  isManualAdjustment: boolean;
}

export interface WorkedHoursReportRowDto {
  staffId: number;
  staffName: string;
  scheduledMinutes: number;
  workedMinutes: number;
  varianceMinutes: number;
  incompleteRecords: number;
}

export interface AttendanceExceptionReportRowDto {
  staffId: number;
  staffName: string;
  workDate: string;
  templateName: string;
  exceptionType: string;
  minutesAffected: number;
  isManualAdjustment: boolean;
  reviewerName: string | null;
}

// ─── Request Bodies ───────────────────────────────────────────────────────────

export interface CreateShiftTemplateRequest {
  templateName: string;
  defaultStartTime: string;
  defaultEndTime: string;
  description?: string | null;
}

export interface UpdateShiftTemplateRequest {
  templateName?: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface CreateShiftAssignmentRequest {
  shiftTemplateId: number;
  staffId: number;
  workDate: string;           // yyyy-MM-dd
  plannedStartAt?: string | null;
  plannedEndAt?: string | null;
  notes?: string | null;
  tags?: string | null;
  isDraft?: boolean;
}

export interface UpdateShiftAssignmentRequest {
  plannedStartAt?: string | null;
  plannedEndAt?: string | null;
  notes?: string | null;
  tags?: string | null;
}

export interface AdjustAttendanceRequest {
  actualCheckInAt?: string | null;
  actualCheckOutAt?: string | null;
  adjustmentReason: string;
}

// ─── New Requests (Phase 3) ──────────────────────────────────────────────────

export interface BulkCreateAssignmentRequest {
  shiftTemplateId: number;
  staffIds: number[];
  workDate: string;           // yyyy-MM-dd
  plannedStartAt?: string | null;
  plannedEndAt?: string | null;
  notes?: string | null;
  tags?: string | null;
  isDraft?: boolean;
}

export interface PublishAssignmentsRequest {
  assignmentIds?: number[] | null;
  fromDate?: string | null;   // yyyy-MM-dd
  toDate?: string | null;     // yyyy-MM-dd
}

export interface CopyWeekRequest {
  sourceWeekStart: string;    // yyyy-MM-dd (must be Monday)
  targetWeekStart: string;    // yyyy-MM-dd (must be Monday)
  asDraft?: boolean;
}

export interface ReassignRequest {
  newStaffId: number;
  newWorkDate?: string | null;
  reason?: string | null;
}

export interface TeamScheduleParams {
  weekStart: string;
  weekEnd: string;
}

export interface TeamScheduleStaffRow {
  staffId: number;
  staffName: string;
  roleName: string;
  assignments: ShiftAssignmentListDto[];
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface GetTemplatesParams {
  isActive?: boolean;
  pageIndex?: number;
  pageSize?: number;
}

export interface GetAssignmentsParams {
  staffId?: number;
  shiftTemplateId?: number;
  fromDate?: string;
  toDate?: string;
  isActive?: boolean;
  pageIndex?: number;
  pageSize?: number;
}

export interface GetMyShiftsParams {
  fromDate?: string;
  toDate?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface GetAttendanceReportParams {
  fromDate?: string;
  toDate?: string;
  staffId?: number;
  shiftTemplateId?: number;
  attendanceStatusCode?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface GetWorkedHoursReportParams {
  fromDate: string;
  toDate: string;
  staffId?: number;
}

export interface GetExceptionsReportParams {
  fromDate: string;
  toDate: string;
  staffId?: number;
}

// ─── Staff Picker ─────────────────────────────────────────────────────────────

export interface StaffBasicDto {
  accountId: number;
  fullName: string;
  roleName: string;
}

// ─── Status Config Maps ───────────────────────────────────────────────────────

export const ATTENDANCE_STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "destructive" | "secondary" | "outline" }
> = {
  SCHEDULED: { label: "Scheduled", variant: "secondary" },
  ACTIVE:    { label: "On Duty",   variant: "default" },
  LATE:      { label: "Late",      variant: "destructive" },
  ABSENT:    { label: "Absent",    variant: "destructive" },
  COMPLETED: { label: "Completed", variant: "outline" },
  EARLY_LEAVE: { label: "Early Leave", variant: "destructive" },
  EXCUSED:   { label: "Excused",   variant: "secondary" },
};

// Kept for any remaining consumers — maps assignmentStatusCode
export const ASSIGNMENT_STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "destructive" | "secondary" | "outline" }
> = {
  DRAFT:     { label: "Draft",     variant: "secondary" },
  ASSIGNED:  { label: "Assigned",  variant: "default" },
  CONFIRMED: { label: "Confirmed", variant: "outline" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  // Legacy isActive-based keys
  active:    { label: "Active",    variant: "default" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

// ─── Removed / deprecated (kept as empty exports to avoid breaking imports) ───

/** @deprecated ShiftSchedule is removed. Use ShiftAssignmentListDto instead. */
export type ShiftScheduleListDto = ShiftAssignmentListDto;
/** @deprecated ShiftSchedule is removed. Use ShiftAssignmentDetailDto instead. */
export type ShiftScheduleDetailDto = ShiftAssignmentDetailDto;
/** @deprecated No longer used. */
export const SCHEDULE_STATUS_CONFIG = {} as Record<string, never>;
