import { useQuery, useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { shiftManagementService } from "../services/shift-management.service";
import { getLocalizedApiErrorMessage } from "@/lib/api-error";
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
  TeamScheduleStaffRow,
  ShiftAssignmentListDto,
  ShiftAssignmentDetailDto,
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
  liveBoard: (params: object) => [...SHIFT_QUERY_KEYS.all, "live-board", params] as const,
  reports: () => [...SHIFT_QUERY_KEYS.all, "reports"] as const,
  attendanceReport: (params: object) =>
    [...SHIFT_QUERY_KEYS.reports(), "attendance", params] as const,
  workedHoursReport: (params: object) =>
    [...SHIFT_QUERY_KEYS.reports(), "worked-hours", params] as const,
  exceptionsReport: (params: object) =>
    [...SHIFT_QUERY_KEYS.reports(), "exceptions", params] as const,
  myShifts: (params: object) => [...SHIFT_QUERY_KEYS.all, "my-shifts", params] as const,
  teamSchedule: (params: object) => [...SHIFT_QUERY_KEYS.all, "team-schedule", params] as const,
  teamScheduleMonth: (anchorWeekStart: string) =>
    [...SHIFT_QUERY_KEYS.all, "team-schedule-month", anchorWeekStart] as const,
};

function parseIsoDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildMonthWindow(anchorWeekStart: string): {
  monthKey: string;
  rangeStart: string;
  rangeEnd: string;
  weekStarts: string[];
} {
  const anchor = parseIsoDate(anchorWeekStart);
  const firstOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const lastOfMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  const startMonday = getMonday(firstOfMonth);
  const endMonday = getMonday(lastOfMonth);
  const weekStarts: string[] = [];

  for (let cur = new Date(startMonday); cur <= endMonday; cur = addDays(cur, 7)) {
    weekStarts.push(fmtDate(cur));
  }

  return {
    monthKey: `${anchor.getFullYear()}-${String(anchor.getMonth() + 1).padStart(2, "0")}`,
    rangeStart: fmtDate(startMonday),
    rangeEnd: fmtDate(addDays(endMonday, 6)),
    weekStarts,
  };
}

function getWeekStartFromDate(dateStr: string): string {
  const date = parseIsoDate(dateStr);
  return fmtDate(getMonday(date));
}

// ─── Local cache helpers (no refetch) ─────────────────────────────────────────

/** Convert a detail DTO to the list DTO shape used by team-schedule cache. */
function detailToListDto(d: ShiftAssignmentDetailDto): ShiftAssignmentListDto {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { attendance, ...list } = d;
  return list;
}

/** Add an assignment into every matching team-schedule cache entry. */
function addAssignmentToScheduleCache(
  qc: QueryClient,
  assignment: ShiftAssignmentListDto,
) {
  qc.setQueriesData<TeamScheduleStaffRow[]>(
    { queryKey: [...SHIFT_QUERY_KEYS.all, "team-schedule"] },
    (old) => {
      if (!old) return old;
      const rows = old.map((row) => {
        if (row.staffId !== assignment.staffId) return row;
        return {
          ...row,
          assignments: [...row.assignments, assignment],
        };
      });
      // If staff not present yet, add a new row
      if (!rows.some((r) => r.staffId === assignment.staffId)) {
        rows.push({
          staffId: assignment.staffId,
          staffName: assignment.staffName,
          roleName: "",
          assignments: [assignment],
        });
      }
      return rows;
    },
  );
}

/** Update an existing assignment in every matching team-schedule cache entry. */
function updateAssignmentInScheduleCache(
  qc: QueryClient,
  assignmentId: number,
  patch: Partial<ShiftAssignmentListDto>,
) {
  qc.setQueriesData<TeamScheduleStaffRow[]>(
    { queryKey: [...SHIFT_QUERY_KEYS.all, "team-schedule"] },
    (old) => {
      if (!old) return old;
      return old.map((row) => ({
        ...row,
        assignments: row.assignments.map((a) =>
          a.shiftAssignmentId === assignmentId ? { ...a, ...patch } : a,
        ),
      }));
    },
  );
}

/** Remove an assignment from every matching team-schedule cache entry. */
function removeAssignmentFromScheduleCache(qc: QueryClient, assignmentId: number) {
  qc.setQueriesData<TeamScheduleStaffRow[]>(
    { queryKey: [...SHIFT_QUERY_KEYS.all, "team-schedule"] },
    (old) => {
      if (!old) return old;
      return old.map((row) => ({
        ...row,
        assignments: row.assignments.filter(
          (a) => a.shiftAssignmentId !== assignmentId,
        ),
      }));
    },
  );
}

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
  const t = useTranslations("shift.messages");
  return useMutation({
    mutationFn: (body: CreateShiftTemplateRequest) =>
      shiftManagementService.createTemplate(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.templates() });
      toast.success(t("createTemplateSuccess"));
    },
    onError: () => toast.error(t("createTemplateError")),
  });
}

export function useUpdateShiftTemplateMutation() {
  const qc = useQueryClient();
  const t = useTranslations("shift.messages");
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateShiftTemplateRequest }) =>
      shiftManagementService.updateTemplate(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.templates() });
      toast.success(t("updateTemplateSuccess"));
    },
    onError: () => toast.error(t("updateTemplateError")),
  });
}

export function useDeactivateShiftTemplateMutation() {
  const qc = useQueryClient();
  const t = useTranslations("shift.schedule.template.messages");
  return useMutation({
    mutationFn: (id: number) => shiftManagementService.deactivateTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.templates() });
      toast.success(t("deactivateSuccess"));
    },
    onError: (error) => {
      const apiError = error as {
        response?: {
          status?: number;
          data?: {
            userMessage?: string;
            systemMessage?: string | null;
          };
        };
      };
      const userMessage = apiError.response?.data?.userMessage?.toLowerCase() ?? "";
      const systemMessage = apiError.response?.data?.systemMessage?.toLowerCase() ?? "";
      const isActiveAssignmentConflict =
        apiError.response?.status === 409 &&
        (systemMessage === "conflict" || userMessage.includes("cannot deactivate a template"));

      if (isActiveAssignmentConflict) {
        toast.error(t("deactivateConflictTitle"), {
          description: t("deactivateConflictDescription"),
        });
        return;
      }

      toast.error(t("deactivateErrorTitle"), {
        description: getLocalizedApiErrorMessage(error, t("deactivateErrorDescription")),
      });
    },
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

export function useShiftLiveBoardQuery(params: GetAssignmentsParams = {}) {
  return useQuery({
    queryKey: SHIFT_QUERY_KEYS.liveBoard(params),
    queryFn: () => shiftManagementService.getLiveBoard(params),
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  });
}

export function useCreateAssignmentMutation() {
  const qc = useQueryClient();
  const t = useTranslations("shift.messages");
  return useMutation({
    mutationFn: (body: CreateShiftAssignmentRequest) =>
      shiftManagementService.createAssignment(body),
    onSuccess: (data) => {
      addAssignmentToScheduleCache(qc, detailToListDto(data));
      toast.success(t("assignStaffSuccess"));
    },
    onError: () => toast.error(t("assignStaffError")),
  });
}

export function useUpdateAssignmentMutation() {
  const qc = useQueryClient();
  const t = useTranslations("shift.messages");
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateShiftAssignmentRequest }) =>
      shiftManagementService.updateAssignment(id, body),
    onSuccess: (data) => {
      updateAssignmentInScheduleCache(qc, data.shiftAssignmentId, detailToListDto(data));
      toast.success(t("updateAssignmentSuccess"));
    },
    onError: () => toast.error(t("updateAssignmentError")),
  });
}

export function useCancelAssignmentMutation() {
  const qc = useQueryClient();
  const t = useTranslations("shift.messages");
  return useMutation({
    mutationFn: (id: number) => shiftManagementService.cancelAssignment(id),
    onSuccess: (_data, id) => {
      removeAssignmentFromScheduleCache(qc, id);
      toast.success(t("cancelAssignmentSuccess"));
    },
    onError: () => toast.error(t("cancelAssignmentError")),
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
  const t = useTranslations("shift.messages");
  return useMutation({
    mutationFn: (assignmentId: number) => shiftManagementService.checkIn(assignmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.assignments() });
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.myShifts({}) });
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.liveBoard({}) });
      toast.success(t("checkInSuccess"));
    },
    onError: () => toast.error(t("checkInError")),
  });
}

export function useCheckOutMutation() {
  const qc = useQueryClient();
  const t = useTranslations("shift.messages");
  return useMutation({
    mutationFn: (assignmentId: number) => shiftManagementService.checkOut(assignmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.assignments() });
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.myShifts({}) });
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.liveBoard({}) });
      toast.success(t("checkOutSuccess"));
    },
    onError: () => toast.error(t("checkOutError")),
  });
}

export function useAdjustAttendanceMutation() {
  const qc = useQueryClient();
  const t = useTranslations("shift.messages");
  return useMutation({
    mutationFn: ({ attendanceId, body }: { attendanceId: number; body: AdjustAttendanceRequest }) =>
      shiftManagementService.adjustAttendance(attendanceId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.assignments() });
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.reports() });
      toast.success(t("adjustAttendanceSuccess"));
    },
    onError: () => toast.error(t("adjustAttendanceError")),
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

export function useTeamScheduleMonthQuery(anchorWeekStart: string, enabled = true) {
  const monthWindow = buildMonthWindow(anchorWeekStart);
  return useQuery({
    queryKey: SHIFT_QUERY_KEYS.teamScheduleMonth(monthWindow.monthKey),
    enabled: enabled && !!anchorWeekStart,
    queryFn: async () => {
      const monthRows = await shiftManagementService.getTeamSchedule({
        weekStart: monthWindow.rangeStart,
        weekEnd: monthWindow.rangeEnd,
      });

      const byWeek: Record<string, TeamScheduleStaffRow[]> = {};
      monthWindow.weekStarts.forEach((ws) => {
        byWeek[ws] = [];
      });

      // Split month payload into week buckets while preserving staff grouping per week
      for (const row of monthRows) {
        for (const assignment of row.assignments ?? []) {
          const weekStart = getWeekStartFromDate(assignment.workDate);
          if (!byWeek[weekStart]) continue;

          let targetRow = byWeek[weekStart].find((r) => r.staffId === row.staffId);
          if (!targetRow) {
            targetRow = {
              staffId: row.staffId,
              staffName: row.staffName,
              roleName: row.roleName,
              assignments: [],
            };
            byWeek[weekStart].push(targetRow);
          }
          targetRow.assignments.push(assignment);
        }
      }

      monthWindow.weekStarts.forEach((ws) => {
        byWeek[ws] = (byWeek[ws] ?? []).sort((a, b) => a.staffName.localeCompare(b.staffName));
      });

      return {
        weekStarts: monthWindow.weekStarts,
        byWeek,
      };
    },
  });
}

// ─── Staff List (for picker / filter) ────────────────────────────────────────

export function useStaffListQuery() {
  return useQuery({
    queryKey: [...SHIFT_QUERY_KEYS.all, "staff-list"] as const,
    queryFn: () => shiftManagementService.getStaffList(),
  });
}

// ─── Bulk / Publish / Copy / Reassign / Confirm ──────────────────────────────

export function useBulkCreateAssignmentsMutation() {
  const qc = useQueryClient();
  const t = useTranslations("shift.messages");
  return useMutation({
    mutationFn: (body: BulkCreateAssignmentRequest) =>
      shiftManagementService.bulkCreateAssignments(body),
    onSuccess: (data) => {
      for (const assignment of data) {
        addAssignmentToScheduleCache(qc, assignment);
      }
      toast.success(t("bulkCreateSuccess"));
    },
    onError: () => toast.error(t("bulkCreateError")),
  });
}

export function usePublishAssignmentsMutation() {
  const qc = useQueryClient();
  const t = useTranslations("shift.messages");
  return useMutation({
    mutationFn: (body: PublishAssignmentsRequest) =>
      shiftManagementService.publishAssignments(body),
    onSuccess: (data) => {
      // Update status of published assignments in cache
      for (const assignment of data) {
        updateAssignmentInScheduleCache(qc, assignment.shiftAssignmentId, assignment);
      }
      toast.success(t("publishSuccess"));
    },
    onError: () => toast.error(t("publishError")),
  });
}

export function useCopyWeekMutation() {
  const qc = useQueryClient();
  const t = useTranslations("shift.schedule.copyWeekDialog");
  return useMutation({
    mutationFn: (body: CopyWeekRequest) =>
      shiftManagementService.copyWeek(body),
    onSuccess: (data) => {
      for (const assignment of data) {
        addAssignmentToScheduleCache(qc, assignment);
      }
      toast.success(t("success"));
    },
    onError: (error) => {
      toast.error(getLocalizedApiErrorMessage(error, t("error")));
    },
  });
}

export function useReassignAssignmentMutation() {
  const qc = useQueryClient();
  const t = useTranslations("shift.messages");
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ReassignRequest }) =>
      shiftManagementService.reassignAssignment(id, body),
    onSuccess: (data) => {
      // Remove from old staff row, add to new staff row
      removeAssignmentFromScheduleCache(qc, data.shiftAssignmentId);
      addAssignmentToScheduleCache(qc, detailToListDto(data));
      toast.success(t("reassignSuccess"));
    },
    onError: () => toast.error(t("reassignError")),
  });
}

export function useConfirmAssignmentMutation() {
  const qc = useQueryClient();
  const t = useTranslations("shift.messages");
  return useMutation({
    mutationFn: (id: number) =>
      shiftManagementService.confirmAssignment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.assignments() });
      qc.invalidateQueries({ queryKey: SHIFT_QUERY_KEYS.myShifts({}) });
      toast.success(t("confirmSuccess"));
    },
    onError: () => toast.error(t("confirmError")),
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
