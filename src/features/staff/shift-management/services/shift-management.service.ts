import { api } from "@/lib/http";
import type { ApiResponse, PagedResult } from "@/types/api-response.types";
import type {
  ShiftTemplateListDto,
  ShiftTemplateDetailDto,
  ShiftAssignmentListDto,
  ShiftAssignmentDetailDto,
  ShiftLiveBoardItemDto,
  AttendanceRecordDto,
  AttendanceReportRowDto,
  WorkedHoursReportRowDto,
  AttendanceExceptionReportRowDto,
  StaffBasicDto,
  CreateShiftTemplateRequest,
  UpdateShiftTemplateRequest,
  CreateShiftAssignmentRequest,
  UpdateShiftAssignmentRequest,
  AdjustAttendanceRequest,
  BulkCreateAssignmentRequest,
  PublishAssignmentsRequest,
  CopyWeekRequest,
  ReassignRequest,
  TeamScheduleStaffRow,
  TeamScheduleParams,
  GetTemplatesParams,
  GetAssignmentsParams,
  GetMyShiftsParams,
  GetAttendanceReportParams,
  GetWorkedHoursReportParams,
  GetExceptionsReportParams,
} from "../types/shift-management.types";

const BASE = "/api/shifts";

function toQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      q.set(k, String(v));
    }
  }
  const str = q.toString();
  return str ? `?${str}` : "";
}

export const shiftManagementService = {
  // ─── Templates ────────────────────────────────────────────────────────────

  async getTemplates(params: GetTemplatesParams = {}): Promise<ShiftTemplateListDto[]> {
    const query = toQuery({ isActive: params.isActive });
    const res = await api.get<ApiResponse<ShiftTemplateListDto[]>>(`${BASE}/templates${query}`);
    return res.data ?? [];
  },

  async getTemplateById(id: number): Promise<ShiftTemplateDetailDto> {
    const res = await api.get<ApiResponse<ShiftTemplateDetailDto>>(`${BASE}/templates/${id}`);
    return res.data;
  },

  async createTemplate(body: CreateShiftTemplateRequest): Promise<ShiftTemplateDetailDto> {
    const res = await api.post<ApiResponse<ShiftTemplateDetailDto>>(`${BASE}/templates`, body);
    return res.data;
  },

  async updateTemplate(id: number, body: UpdateShiftTemplateRequest): Promise<ShiftTemplateDetailDto> {
    const res = await api.put<ApiResponse<ShiftTemplateDetailDto>>(`${BASE}/templates/${id}`, body);
    return res.data;
  },

  async deactivateTemplate(id: number): Promise<void> {
    await api.delete(`${BASE}/templates/${id}`);
  },

  // ─── Assignments ──────────────────────────────────────────────────────────

  async getAssignments(params: GetAssignmentsParams = {}): Promise<PagedResult<ShiftAssignmentListDto>> {
    const query = toQuery({
      staffId: params.staffId,
      shiftTemplateId: params.shiftTemplateId,
      fromDate: params.fromDate,
      toDate: params.toDate,
      isActive: params.isActive,
      pageIndex: params.pageIndex ?? 1,
      pageSize: params.pageSize ?? 20,
    });
    const res = await api.get<ApiResponse<PagedResult<ShiftAssignmentListDto>>>(
      `${BASE}/assignments${query}`
    );
    return res.data ?? { pageData: [], pageIndex: 1, pageSize: 20, totalCount: 0, totalPage: 0 };
  },

  async getAssignmentById(id: number): Promise<ShiftAssignmentDetailDto> {
    const res = await api.get<ApiResponse<ShiftAssignmentDetailDto>>(`${BASE}/assignments/${id}`);
    return res.data;
  },

  async getLiveBoard(params: GetAssignmentsParams = {}): Promise<ShiftLiveBoardItemDto[]> {
    const query = toQuery({
      staffId: params.staffId,
      shiftTemplateId: params.shiftTemplateId,
      fromDate: params.fromDate,
      toDate: params.toDate,
      isActive: params.isActive,
      pageSize: params.pageSize ?? 200,
    });
    const res = await api.get<ApiResponse<ShiftLiveBoardItemDto[]>>(`${BASE}/live-board${query}`);
    return res.data ?? [];
  },

  async createAssignment(body: CreateShiftAssignmentRequest): Promise<ShiftAssignmentDetailDto> {
    const res = await api.post<ApiResponse<ShiftAssignmentDetailDto>>(`${BASE}/assignments`, body);
    return res.data;
  },

  async updateAssignment(id: number, body: UpdateShiftAssignmentRequest): Promise<ShiftAssignmentDetailDto> {
    const res = await api.put<ApiResponse<ShiftAssignmentDetailDto>>(`${BASE}/assignments/${id}`, body);
    return res.data;
  },

  async cancelAssignment(id: number): Promise<void> {
    await api.delete(`${BASE}/assignments/${id}`);
  },

  // ─── Bulk / Publish / Copy / Reassign / Confirm ───────────────────────────

  async bulkCreateAssignments(body: BulkCreateAssignmentRequest): Promise<ShiftAssignmentListDto[]> {
    const res = await api.post<ApiResponse<ShiftAssignmentListDto[]>>(
      `${BASE}/assignments/bulk`,
      body
    );
    return res.data ?? [];
  },

  async publishAssignments(body: PublishAssignmentsRequest): Promise<ShiftAssignmentListDto[]> {
    const res = await api.post<ApiResponse<ShiftAssignmentListDto[]>>(
      `${BASE}/assignments/publish`,
      body
    );
    return res.data ?? [];
  },

  async copyWeek(body: CopyWeekRequest): Promise<ShiftAssignmentListDto[]> {
    const res = await api.post<ApiResponse<ShiftAssignmentListDto[]>>(
      `${BASE}/assignments/copy-week`,
      body
    );
    return res.data ?? [];
  },

  async reassignAssignment(id: number, body: ReassignRequest): Promise<ShiftAssignmentDetailDto> {
    const res = await api.put<ApiResponse<ShiftAssignmentDetailDto>>(
      `${BASE}/assignments/${id}/reassign`,
      body
    );
    return res.data;
  },

  async confirmAssignment(id: number): Promise<ShiftAssignmentDetailDto> {
    const res = await api.post<ApiResponse<ShiftAssignmentDetailDto>>(
      `${BASE}/assignments/${id}/confirm`,
      {}
    );
    return res.data;
  },

  // ─── Team Schedule ────────────────────────────────────────────────────────

  async getTeamSchedule(params: TeamScheduleParams): Promise<TeamScheduleStaffRow[]> {
    const query = toQuery({ weekStart: params.weekStart, weekEnd: params.weekEnd });
    // BE returns a flat List<ShiftAssignmentListDto> — group by staff on the FE side
    const res = await api.get<ApiResponse<ShiftAssignmentListDto[]>>(
      `${BASE}/team-schedule${query}`
    );
    const flatAssignments = res.data ?? [];
    const staffMap = new Map<number, TeamScheduleStaffRow>();
    for (const a of flatAssignments) {
      let row = staffMap.get(a.staffId);
      if (!row) {
        row = {
          staffId: a.staffId,
          staffName: a.staffName,
          roleName: "", // flat DTO doesn't carry roleName; filled by staff picker if needed
          assignments: [],
        };
        staffMap.set(a.staffId, row);
      }
      row.assignments.push(a);
    }
    return Array.from(staffMap.values());
  },

  // ─── Attendance ───────────────────────────────────────────────────────────

  async checkIn(assignmentId: number): Promise<AttendanceRecordDto> {
    const res = await api.post<ApiResponse<AttendanceRecordDto>>(
      `${BASE}/assignments/${assignmentId}/check-in`,
      {}
    );
    return res.data;
  },

  async checkOut(assignmentId: number): Promise<AttendanceRecordDto> {
    const res = await api.post<ApiResponse<AttendanceRecordDto>>(
      `${BASE}/assignments/${assignmentId}/check-out`,
      {}
    );
    return res.data;
  },

  async adjustAttendance(attendanceId: number, body: AdjustAttendanceRequest): Promise<AttendanceRecordDto> {
    const res = await api.patch<ApiResponse<AttendanceRecordDto>>(
      `${BASE}/attendance/${attendanceId}`,
      body
    );
    return res.data;
  },

  // ─── My Shifts (logged-in staff's assignments) ────────────────────────────

  async getMyShifts(params: GetMyShiftsParams = {}): Promise<PagedResult<ShiftAssignmentListDto>> {
    const query = toQuery({
      fromDate: params.fromDate,
      toDate: params.toDate,
      isActive: true,
      pageIndex: params.pageIndex ?? 1,
      pageSize: params.pageSize ?? 20,
    });
    const res = await api.get<ApiResponse<PagedResult<ShiftAssignmentListDto>>>(
      `${BASE}/my-shifts${query}`
    );
    return res.data ?? { pageData: [], pageIndex: 1, pageSize: 20, totalCount: 0, totalPage: 0 };
  },

  // ─── Reports ──────────────────────────────────────────────────────────────

  async getAttendanceReport(params: GetAttendanceReportParams = {}): Promise<PagedResult<AttendanceReportRowDto>> {
    const query = toQuery({
      fromDate: params.fromDate,
      toDate: params.toDate,
      staffId: params.staffId,
      shiftTemplateId: params.shiftTemplateId,
      attendanceStatusCode: params.attendanceStatusCode,
      pageIndex: params.pageIndex ?? 1,
      pageSize: params.pageSize ?? 20,
    });
    const res = await api.get<ApiResponse<PagedResult<AttendanceReportRowDto>>>(
      `${BASE}/reports/attendance${query}`
    );
    return res.data ?? { pageData: [], pageIndex: 1, pageSize: 20, totalCount: 0, totalPage: 0 };
  },

  async getWorkedHoursReport(params: GetWorkedHoursReportParams): Promise<WorkedHoursReportRowDto[]> {
    const query = toQuery({
      fromDate: params.fromDate,
      toDate: params.toDate,
      staffId: params.staffId,
    });
    const res = await api.get<ApiResponse<WorkedHoursReportRowDto[]>>(
      `${BASE}/reports/worked-hours${query}`
    );
    return res.data ?? [];
  },

  async getExceptionsReport(params: GetExceptionsReportParams): Promise<AttendanceExceptionReportRowDto[]> {
    const query = toQuery({
      fromDate: params.fromDate,
      toDate: params.toDate,
      staffId: params.staffId,
    });
    const res = await api.get<ApiResponse<AttendanceExceptionReportRowDto[]>>(
      `${BASE}/reports/exceptions${query}`
    );
    return res.data ?? [];
  },

  // ─── Staff Picker ─────────────────────────────────────────────────────────

  async getStaffList(): Promise<StaffBasicDto[]> {
    const res = await api.get<ApiResponse<PagedResult<StaffBasicDto>>>(
      "/api/account/staff?PageIndex=1&PageSize=200"
    );
    return res.data?.pageData ?? [];
  },
};
