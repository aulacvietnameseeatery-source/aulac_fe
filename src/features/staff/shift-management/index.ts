export { ShiftManagement } from "./shift-schedule/shift-management";
export { ShiftTemplates } from "./shift-templates/shift-templates";
export { ShiftReports } from "./shift-reports/shift-reports";
export { ShiftLive } from "./shift-live/shift-live";
export { MyShifts } from "./my-shifts/my-shifts";
export { AttendanceAdjustmentDialog } from "./components/attendance-adjustment-dialog";
export { ShiftStatusBadge } from "./components/shift-status-badge";
export { ShiftAssignmentForm } from "./components/shift-assignment-form";
export { ShiftCard } from "./components/shift-card";
export { CopyWeekDialog } from "./components/copy-week-dialog";
export { PublishToolbar } from "./components/publish-toolbar";
export { ShiftMatrixCalendar } from "./shift-schedule/components/shift-matrix-calendar";
export {
  ATTENDANCE_STATUS_CONFIG,
  ASSIGNMENT_STATUS_CONFIG,
  // deprecated — kept for backward compat
  SCHEDULE_STATUS_CONFIG,
} from "./types/shift-management.types";
export type {
  ShiftTemplateListDto,
  ShiftTemplateDetailDto,
  ShiftTemplateDto,           // deprecated alias
  ShiftAssignmentListDto,
  ShiftAssignmentDetailDto,
  ShiftAssignmentDto,         // deprecated alias
  AttendanceRecordDto,
  TimeLogDto,
  WorkedHoursReportRowDto,
  AttendanceReportRowDto,
  AttendanceExceptionReportRowDto,
  TeamScheduleStaffRow,
  BulkCreateAssignmentRequest,
  PublishAssignmentsRequest,
  CopyWeekRequest,
  ReassignRequest,
  // deprecated aliases
  ShiftScheduleListDto,
  ShiftScheduleDetailDto,
} from "./types/shift-management.types";
export {
  SHIFT_QUERY_KEYS,
  // Templates
  useShiftTemplatesQuery,
  useShiftTemplateDetailQuery,
  useCreateShiftTemplateMutation,
  useUpdateShiftTemplateMutation,
  useDeactivateShiftTemplateMutation,
  // Assignments
  useShiftAssignmentsQuery,
  useShiftAssignmentDetailQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useCancelAssignmentMutation,
  useStaffForAssignmentQuery,
  // Bulk / Publish / Copy / Reassign / Confirm
  useBulkCreateAssignmentsMutation,
  usePublishAssignmentsMutation,
  useCopyWeekMutation,
  useReassignAssignmentMutation,
  useConfirmAssignmentMutation,
  // Team Schedule
  useTeamScheduleQuery,
  // Attendance
  useCheckInMutation,
  useCheckOutMutation,
  useAdjustAttendanceMutation,
  // Reports
  useAttendanceReportQuery,
  useWorkedHoursReportQuery,
  useExceptionsReportQuery,
  // My Shifts
  useMyShiftsQuery,
  // Deprecated stubs kept for backward compat
  useShiftSchedulesQuery,
  useCreateShiftScheduleMutation,
  useCreateAssignmentsMutation,
  usePublishScheduleMutation,
  useCloseScheduleMutation,
  useUpdateShiftScheduleMutation,
  useCreateShiftSchedulesRangeMutation,
  useLiveDutyBoardQuery,
} from "./hooks/use-shift-queries";
