import type {
  ShiftTypeCode,
  ShiftStatusCode,
  ShiftAssignmentStatusCode,
  AttendanceStatusCode,
} from "@/types/status-codes";

// ─── Schedule ────────────────────────────────────────────────────────────────

export interface ShiftScheduleListDto {
  shiftScheduleId: number;
  businessDate: string; // yyyy-MM-dd
  shiftTypeLvId: number;
  shiftTypeCode: ShiftTypeCode;
  shiftTypeName: string;
  statusLvId: number;
  statusCode: ShiftStatusCode;
  statusName: string;
  plannedStartAt: string; // ISO 8601
  plannedEndAt: string; // ISO 8601
  notes: string | null;
  assignmentCount: number;
  createdAt: string;
}

export interface ShiftScheduleDetailDto extends ShiftScheduleListDto {
  createdByName: string;
  updatedByName: string | null;
  updatedAt: string;
  assignments: ShiftAssignmentDto[];
}

// ─── Assignment ───────────────────────────────────────────────────────────────

export interface ShiftAssignmentDto {
  shiftAssignmentId: number;
  shiftScheduleId: number;
  staffId: number;
  staffName: string;
  roleId: number;
  roleName: string;
  assignmentStatusLvId: number;
  assignmentStatusCode: ShiftAssignmentStatusCode;
  assignmentStatusName: string;
  remarks: string | null;
  assignedAt: string;
  assignedByName: string;
  attendance: AttendanceRecordDto | null;
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export interface AttendanceRecordDto {
  attendanceId: number;
  shiftAssignmentId: number;
  attendanceStatusLvId: number;
  attendanceStatusCode: AttendanceStatusCode;
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
}

// ─── Live Board ───────────────────────────────────────────────────────────────

export interface LiveBoardSummaryDto {
  scheduled: number;
  active: number;
  late: number;
  absent: number;
  completed: number;
}

export interface LiveShiftBoardRowDto {
  shiftAssignmentId: number;
  staffId: number;
  staffName: string;
  roleName: string;
  shiftTypeCode: ShiftTypeCode;
  plannedStartAt: string;
  plannedEndAt: string;
  actualCheckInAt: string | null;
  actualCheckOutAt: string | null;
  attendanceStatusCode: AttendanceStatusCode;
  lateMinutes: number;
}

export interface LiveShiftBoardDto {
  businessDate: string;
  summary: LiveBoardSummaryDto;
  rows: LiveShiftBoardRowDto[];
}

// ─── Reports ──────────────────────────────────────────────────────────────────

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
  roleName: string;
  businessDate: string;
  shiftTypeCode: ShiftTypeCode;
  exceptionType: string;
  minutesAffected: number;
  isManualAdjustment: boolean;
  reviewerName: string | null;
}

// ─── Request Bodies ───────────────────────────────────────────────────────────

export interface CreateShiftScheduleRequest {
  businessDate: string;
  shiftTypeLvId: number;
  plannedStartAt: string;
  plannedEndAt: string;
  notes?: string | null;
}

export interface UpdateShiftScheduleRequest {
  plannedStartAt?: string;
  plannedEndAt?: string;
  statusLvId?: number;
  notes?: string | null;
}

export interface CreateAssignmentsRequest {
  shiftScheduleId: number;
  staffIds: number[];
  remarks?: string | null;
}

export interface AdjustAttendanceRequest {
  actualCheckInAt?: string | null;
  actualCheckOutAt?: string | null;
  adjustmentReason: string;
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface GetSchedulesParams {
  fromDate?: string;
  toDate?: string;
  shiftTypeLvId?: number;
  statusLvId?: number;
  pageIndex?: number;
  pageSize?: number;
}

export interface GetAssignmentsParams {
  shiftScheduleId?: number;
  fromDate?: string;
  toDate?: string;
  staffId?: number;
  assignmentStatusLvId?: number;
  pageIndex?: number;
  pageSize?: number;
}

export interface GetLiveBoardParams {
  businessDate?: string;
}

export interface GetAttendanceReportParams {
  fromDate?: string;
  toDate?: string;
  staffId?: number;
  shiftTypeLvId?: number;
  attendanceStatusLvId?: number;
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

export interface GetMyShiftsParams {
  fromDate?: string;
  toDate?: string;
  pageIndex?: number;
  pageSize?: number;
}

// ─── Staff Picker (for assignment form) ──────────────────────────────────────

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
  ACTIVE: { label: "On Duty", variant: "default" },
  LATE: { label: "Late", variant: "destructive" },
  ABSENT: { label: "Absent", variant: "destructive" },
  COMPLETED: { label: "Completed", variant: "outline" },
  EARLY_LEAVE: { label: "Early Leave", variant: "destructive" },
  EXCUSED: { label: "Excused", variant: "secondary" },
};

export const SCHEDULE_STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "destructive" | "secondary" | "outline" }
> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  PUBLISHED: { label: "Published", variant: "default" },
  CLOSED: { label: "Closed", variant: "outline" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

export const ASSIGNMENT_STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "destructive" | "secondary" | "outline" }
> = {
  ASSIGNED: { label: "Assigned", variant: "secondary" },
  CONFIRMED: { label: "Confirmed", variant: "default" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};
