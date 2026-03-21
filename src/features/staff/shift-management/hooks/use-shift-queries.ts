import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { shiftManagementService } from "../services/shift-management.service";
import type {
  GetTemplatesParams,
  GetAssignmentsParams,
  GetMyShiftsParams,
  GetAttendanceReportParams,
  GetWorkedHoursReportParams,
  GetExceptionsReportParams,
  CreateShiftTemplateRequest,
  UpdateShiftTemplateRequest,
  CreateShiftAssignmentRequest,
  UpdateShiftAssignmentRequest,
  AdjustAttendanceRequest,
  BulkCreateAssignmentRequest,
  PublishAssignmentsRequest,
  CopyWeekRequest,
  ReassignRequest,
  TeamScheduleParams,
} from "../types/shift-management.types";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const SHIFT_QUERY_KEYS = {
  all: ["shifts"] as const,
  templates: () => [...SHIFT_QUERY_KEYS.all, "templates"] as const,
  templateList: (params: object) => [...SHIFT_QUERY_KEYS.templates(), "list", params] as const,
  templateById: (id: number) => [...SHIFT_QUERY_KEYS.templates(), "detail", id] as const,
  assignments: () => [...SHIFT_QUERY_KEYS.all, "assignments"] as const,
  assignmentList: (params: object) => [...SHIFT_QUERY_KEYS.assignments(), params] as const,
  assignmentById: (id: number) => [...SHIFT_QUERY_KEYS.assignments(), "detail", id] as const,
  reports: () => [...SHIFT_QUERY_KEYS.all, "reports"] as const,
  attendanceReport: (params: object) =>
    [...SHIFT_QUERY_KEYS.reports(), "attendance", params] as const,
  workedHoursReport: (params: object) =>
    [...SHIFT_QUERY_KEYS.reports(), "worked-hours", params] as const,
  exceptionsReport: (params: object) =>
    [...SHIFT_QUERY_KEYS.reports(), "exceptions", params] as const,
  myShifts: (params: object) => [...SHIFT_QUERY_KEYS.all, "my-shifts", params] as const,
  teamSchedule: (params: object) => [...SHIFT_QUERY_KEYS.all, "team-schedule", params] as const,
};

// ─── Template Queries ─────────────────────────────────────────────────────────

export function useShiftTemplatesQuery(params: GetTemplatesParams = {}) {
  return useQuery({
    queryKey: SHIFT_QUERY_KEYS.templateList(params),
    queryFn: () => shiftManagementService.getTemplates(params),
  });
}

export function useShiftTemplateDetailQuery(id: number, enabled = true) {
  return useQuery({
    queryKey: SHIFT_QUERY_KEYS.templateById(id),
    queryFn: () => shiftManagementService.getTemplateById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateShiftTemplateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateShiftTemplateRequest) =>
      shiftManagementService.createTemplate(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.templates() });
      toast.success("Shift template created");
    },
    onError: () => toast.error("Failed to create shift template"),
  });
}

export function useUpdateShiftTemplateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateShiftTemplateRequest }) =>
      shiftManagementService.updateTemplate(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.templates() });
      toast.success("Shift template updated");
    },
    onError: () => toast.error("Failed to update shift template"),
  });
}

export function useDeactivateShiftTemplateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => shiftManagementService.deactivateTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.templates() });
      toast.success("Shift template deactivated");
    },
    onError: () => toast.error("Failed to deactivate template"),
  });
}

// ─── Assignment Queries ───────────────────────────────────────────────────────

export function useShiftAssignmentsQuery(params: GetAssignmentsParams = {}) {
  return useQuery({
    queryKey: SHIFT_QUERY_KEYS.assignmentList(params),
    queryFn: () => shiftManagementService.getAssignments(params),
  });
}

export function useShiftAssignmentDetailQuery(id: number, enabled = true) {
  return useQuery({
    queryKey: SHIFT_QUERY_KEYS.assignmentById(id),
    queryFn: () => shiftManagementService.getAssignmentById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateAssignmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateShiftAssignmentRequest) =>
      shiftManagementService.createAssignment(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.assignments() });
      toast.success("Staff assigned to shift");
    },
    onError: () => toast.error("Failed to assign staff"),
  });
}

export function useUpdateAssignmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateShiftAssignmentRequest }) =>
      shiftManagementService.updateAssignment(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.assignments() });
      toast.success("Shift assignment updated");
    },
    onError: () => toast.error("Failed to update assignment"),
  });
}

export function useCancelAssignmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => shiftManagementService.cancelAssignment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.assignments() });
      toast.success("Assignment cancelled");
    },
    onError: () => toast.error("Failed to cancel assignment"),
  });
}

export function useStaffForAssignmentQuery(enabled = true) {
  return useQuery({
    queryKey: [...SHIFT_QUERY_KEYS.all, "staff-list"],
    queryFn: () => shiftManagementService.getStaffList(),
    enabled,
  });
}

// ─── Attendance Mutations ─────────────────────────────────────────────────────

export function useCheckInMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: number) => shiftManagementService.checkIn(assignmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.assignments() });
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.myShifts({}) });
      toast.success("Checked in successfully");
    },
    onError: () => toast.error("Failed to check in"),
  });
}

export function useCheckOutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: number) => shiftManagementService.checkOut(assignmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.assignments() });
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.myShifts({}) });
      toast.success("Checked out successfully");
    },
    onError: () => toast.error("Failed to check out"),
  });
}

export function useAdjustAttendanceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ attendanceId, body }: { attendanceId: number; body: AdjustAttendanceRequest }) =>
      shiftManagementService.adjustAttendance(attendanceId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.assignments() });
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.reports() });
      toast.success("Attendance adjusted");
    },
    onError: () => toast.error("Failed to adjust attendance"),
  });
}

// ─── Report Queries ───────────────────────────────────────────────────────────

export function useAttendanceReportQuery(params: GetAttendanceReportParams = {}) {
  return useQuery({
    queryKey: SHIFT_QUERY_KEYS.attendanceReport(params),
    queryFn: () => shiftManagementService.getAttendanceReport(params),
  });
}

export function useWorkedHoursReportQuery(params: GetWorkedHoursReportParams, enabled = true) {
  return useQuery({
    queryKey: SHIFT_QUERY_KEYS.workedHoursReport(params),
    queryFn: () => shiftManagementService.getWorkedHoursReport(params),
    enabled: enabled && !!params.fromDate && !!params.toDate,
  });
}

export function useExceptionsReportQuery(params: GetExceptionsReportParams, enabled = true) {
  return useQuery({
    queryKey: SHIFT_QUERY_KEYS.exceptionsReport(params),
    queryFn: () => shiftManagementService.getExceptionsReport(params),
    enabled: enabled && !!params.fromDate && !!params.toDate,
  });
}

// ─── My Shifts ────────────────────────────────────────────────────────────────

export function useMyShiftsQuery(params: GetMyShiftsParams = {}) {
  return useQuery({
    queryKey: SHIFT_QUERY_KEYS.myShifts(params),
    queryFn: () => shiftManagementService.getMyShifts(params),
  });
}

// ─── Team Schedule ────────────────────────────────────────────────────────────

export function useTeamScheduleQuery(params: TeamScheduleParams, enabled = true) {
  return useQuery({
    queryKey: SHIFT_QUERY_KEYS.teamSchedule(params),
    queryFn: () => shiftManagementService.getTeamSchedule(params),
    enabled: enabled && !!params.weekStart && !!params.weekEnd,
  });
}

// ─── Bulk / Publish / Copy / Reassign / Confirm ──────────────────────────────

export function useBulkCreateAssignmentsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: BulkCreateAssignmentRequest) =>
      shiftManagementService.bulkCreateAssignments(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.assignments() });
      toast.success("Assignments created");
    },
    onError: () => toast.error("Failed to create assignments"),
  });
}

export function usePublishAssignmentsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PublishAssignmentsRequest) =>
      shiftManagementService.publishAssignments(body),
    onSuccess: (_data, _vars) => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.assignments() });
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.all });
      toast.success("Shifts published — staff notified");
    },
    onError: () => toast.error("Failed to publish shifts"),
  });
}

export function useCopyWeekMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CopyWeekRequest) =>
      shiftManagementService.copyWeek(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.assignments() });
      toast.success("Week copied successfully");
    },
    onError: () => toast.error("Failed to copy week"),
  });
}

export function useReassignAssignmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ReassignRequest }) =>
      shiftManagementService.reassignAssignment(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.assignments() });
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.all });
      toast.success("Assignment reassigned");
    },
    onError: () => toast.error("Failed to reassign"),
  });
}

export function useConfirmAssignmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      shiftManagementService.confirmAssignment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.assignments() });
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.myShifts({}) });
      toast.success("Shift confirmed");
    },
    onError: () => toast.error("Failed to confirm shift"),
  });
}

// ─── Deprecated stubs (kept so existing import sites don't break) ─────────────

/** @deprecated ShiftSchedule is removed. All schedules are now assignments. */
export const useShiftSchedulesQuery = useShiftAssignmentsQuery;
/** @deprecated */
export const useCreateShiftScheduleMutation = useCreateAssignmentMutation;
/** @deprecated */
export const useCreateAssignmentsMutation = useCreateAssignmentMutation;
/** @deprecated */
export const useShiftScheduleDetailQuery = () =>
  ({ data: undefined, isLoading: false } as ReturnType<typeof useShiftAssignmentDetailQuery>);
/** @deprecated */
export const usePublishScheduleMutation = () => ({ mutate: () => {} } as never);
/** @deprecated */
export const useCloseScheduleMutation = () => ({ mutate: () => {} } as never);
/** @deprecated */
export const useUpdateShiftScheduleMutation = () => ({ mutate: () => {} } as never);
/** @deprecated */
export const useCreateShiftSchedulesRangeMutation = () => ({ mutate: () => {} } as never);
/** @deprecated */
export const useLiveDutyBoardQuery = () => ({ data: undefined, isLoading: false } as never);
