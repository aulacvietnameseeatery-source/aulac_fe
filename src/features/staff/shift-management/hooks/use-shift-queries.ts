import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { shiftManagementService } from "../services/shift-management.service";
import type {
  GetSchedulesParams,
  GetAssignmentsParams,
  GetLiveBoardParams,
  GetAttendanceReportParams,
  GetWorkedHoursReportParams,
  GetExceptionsReportParams,
  GetMyShiftsParams,
  CreateShiftScheduleRequest,
  UpdateShiftScheduleRequest,
  CreateAssignmentsRequest,
  AdjustAttendanceRequest,
} from "../types/shift-management.types";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const SHIFT_QUERY_KEYS = {
  all: ["shifts"] as const,
  schedules: () => [...SHIFT_QUERY_KEYS.all, "schedules"] as const,
  scheduleList: (params: object) => [...SHIFT_QUERY_KEYS.schedules(), params] as const,
  scheduleDetail: (id: number) => [...SHIFT_QUERY_KEYS.schedules(), "detail", id] as const,
  assignments: () => [...SHIFT_QUERY_KEYS.all, "assignments"] as const,
  assignmentList: (params: object) => [...SHIFT_QUERY_KEYS.assignments(), params] as const,
  live: (params: object) => [...SHIFT_QUERY_KEYS.all, "live", params] as const,
  reports: () => [...SHIFT_QUERY_KEYS.all, "reports"] as const,
  attendanceReport: (params: object) =>
    [...SHIFT_QUERY_KEYS.reports(), "attendance", params] as const,
  workedHoursReport: (params: object) =>
    [...SHIFT_QUERY_KEYS.reports(), "worked-hours", params] as const,
  exceptionsReport: (params: object) =>
    [...SHIFT_QUERY_KEYS.reports(), "exceptions", params] as const,
  myShifts: (params: object) => [...SHIFT_QUERY_KEYS.all, "my-shifts", params] as const,
};

// ─── Schedule Queries ─────────────────────────────────────────────────────────

export function useShiftSchedulesQuery(params: GetSchedulesParams = {}) {
  return useQuery({
    queryKey: SHIFT_QUERY_KEYS.scheduleList(params),
    queryFn: () => shiftManagementService.getSchedules(params),
  });
}

export function useShiftScheduleDetailQuery(id: number, enabled = true) {
  return useQuery({
    queryKey: SHIFT_QUERY_KEYS.scheduleDetail(id),
    queryFn: () => shiftManagementService.getScheduleById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateShiftScheduleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateShiftScheduleRequest) =>
      shiftManagementService.createSchedule(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.schedules() });
      toast.success("Shift schedule created");
    },
    onError: () => toast.error("Failed to create shift schedule"),
  });
}

export function useUpdateShiftScheduleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateShiftScheduleRequest }) =>
      shiftManagementService.updateSchedule(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.schedules() });
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.all });
      toast.success("Shift schedule updated");
    },
    onError: () => toast.error("Failed to update shift schedule"),
  });
}

// ─── Assignment Queries ───────────────────────────────────────────────────────

export function useShiftAssignmentsQuery(params: GetAssignmentsParams = {}) {
  return useQuery({
    queryKey: SHIFT_QUERY_KEYS.assignmentList(params),
    queryFn: () => shiftManagementService.getAssignments(params),
    enabled: Object.keys(params).length > 0,
  });
}

export function useCreateAssignmentsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAssignmentsRequest) =>
      shiftManagementService.createAssignments(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.assignments() });
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.schedules() });
      toast.success("Staff assigned successfully");
    },
    onError: () => toast.error("Failed to assign staff"),
  });
}

export function useCancelAssignmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => shiftManagementService.cancelAssignment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.assignments() });
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.schedules() });
      toast.success("Assignment cancelled");
    },
    onError: () => toast.error("Failed to cancel assignment"),
  });
}

export function usePublishScheduleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => shiftManagementService.publishSchedule(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.schedules() });
      toast.success("Schedule published");
    },
    onError: () => toast.error("Failed to publish schedule"),
  });
}

export function useCloseScheduleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => shiftManagementService.closeSchedule(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.schedules() });
      toast.success("Shift closed");
    },
    onError: () => toast.error("Failed to close shift"),
  });
}

export function useStaffForAssignmentQuery(enabled = true) {
  return useQuery({
    queryKey: [...SHIFT_QUERY_KEYS.all, "staff-list"],
    queryFn: () => shiftManagementService.getStaffList(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCheckInMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: number) => shiftManagementService.checkIn(assignmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.myShifts({}) });
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.assignments() });
      qc.invalidateQueries({ queryKey: ["shifts", "live"] });
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
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.myShifts({}) });
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.assignments() });
      qc.invalidateQueries({ queryKey: ["shifts", "live"] });
      toast.success("Checked out successfully");
    },
    onError: () => toast.error("Failed to check out"),
  });
}

export function useAdjustAttendanceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      attendanceId,
      body,
    }: {
      attendanceId: number;
      body: AdjustAttendanceRequest;
    }) => shiftManagementService.adjustAttendance(attendanceId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.assignments() });
      qc.invalidateQueries({ queryKey: ["shifts", "live"] });
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.reports() });
      toast.success("Attendance adjusted");
    },
    onError: () => toast.error("Failed to adjust attendance"),
  });
}

// ─── Live Board ───────────────────────────────────────────────────────────────

export function useLiveDutyBoardQuery(params: GetLiveBoardParams = {}) {
  return useQuery({
    queryKey: SHIFT_QUERY_KEYS.live(params),
    queryFn: () => shiftManagementService.getLiveBoard(params),
    // Poll every 30s as SignalR fallback
    refetchInterval: 30_000,
  });
}

// ─── Report Queries ───────────────────────────────────────────────────────────

export function useAttendanceReportQuery(params: GetAttendanceReportParams = {}) {
  return useQuery({
    queryKey: SHIFT_QUERY_KEYS.attendanceReport(params),
    queryFn: () => shiftManagementService.getAttendanceReport(params),
  });
}

export function useWorkedHoursReportQuery(
  params: GetWorkedHoursReportParams,
  enabled = true
) {
  return useQuery({
    queryKey: SHIFT_QUERY_KEYS.workedHoursReport(params),
    queryFn: () => shiftManagementService.getWorkedHoursReport(params),
    enabled: enabled && !!params.fromDate && !!params.toDate,
  });
}

export function useExceptionsReportQuery(
  params: GetExceptionsReportParams,
  enabled = true
) {
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
