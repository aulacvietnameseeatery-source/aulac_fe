export { ShiftManagement } from "./shift-management";
export { ShiftTemplates } from "./shift-templates/shift-templates";
export { ShiftReports } from "./shift-reports/shift-reports";
export { ShiftLive } from "./shift-live/shift-live";
export { MyShifts } from "./my-shifts/my-shifts";
export { AttendanceAdjustmentDialog } from "./components/attendance-adjustment-dialog";
export { ShiftStatusBadge } from "./components/shift-status-badge";
export { ShiftAssignmentForm } from "./components/shift-assignment-form";
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
  WorkedHoursReportRowDto,
  AttendanceReportRowDto,
  AttendanceExceptionReportRowDto,
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
