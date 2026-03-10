import { api } from "@/lib/http";
import type { ApiResponse, PagedResult } from "@/types/api-response.types";
import type {
  ShiftScheduleListDto,
  ShiftScheduleDetailDto,
  ShiftAssignmentDto,
  AttendanceRecordDto,
  AttendanceReportRowDto,
  LiveShiftBoardDto,
  WorkedHoursReportRowDto,
  AttendanceExceptionReportRowDto,
  StaffBasicDto,
  CreateShiftScheduleRequest,
  UpdateShiftScheduleRequest,
  CreateAssignmentsRequest,
  AdjustAttendanceRequest,
  GetSchedulesParams,
  GetAssignmentsParams,
  GetLiveBoardParams,
  GetAttendanceReportParams,
  GetWorkedHoursReportParams,
  GetExceptionsReportParams,
  GetMyShiftsParams,
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
  // ─── Schedules ────────────────────────────────────────────────────────────

  async getSchedules(params: GetSchedulesParams = {}): Promise<PagedResult<ShiftScheduleListDto>> {
    const query = toQuery({
      fromDate: params.fromDate,
      toDate: params.toDate,
      shiftTypeLvId: params.shiftTypeLvId,
      statusLvId: params.statusLvId,
      pageIndex: params.pageIndex ?? 1,
      pageSize: params.pageSize ?? 20,
    });
    const res = await api.get<ApiResponse<PagedResult<ShiftScheduleListDto>>>(
      `${BASE}/schedules${query}`
    );
    return (
      res.data ?? { pageData: [], pageIndex: 1, pageSize: 20, totalCount: 0, totalPage: 0 }
    );
  },

  async getScheduleById(id: number): Promise<ShiftScheduleDetailDto> {
    const res = await api.get<ApiResponse<ShiftScheduleDetailDto>>(
      `${BASE}/schedules/${id}`
    );
    return res.data;
  },

  async createSchedule(body: CreateShiftScheduleRequest): Promise<ShiftScheduleDetailDto> {
    const res = await api.post<ApiResponse<ShiftScheduleDetailDto>>(
      `${BASE}/schedules`,
      body
    );
    return res.data;
  },

  async updateSchedule(
    id: number,
    body: UpdateShiftScheduleRequest
  ): Promise<ShiftScheduleDetailDto> {
    const res = await api.put<ApiResponse<ShiftScheduleDetailDto>>(
      `${BASE}/schedules/${id}`,
      body
    );
    return res.data;
  },
  async publishSchedule(id: number): Promise<ShiftScheduleDetailDto> {
    const res = await api.post<ApiResponse<ShiftScheduleDetailDto>>(
      `${BASE}/schedules/${id}/publish`,
      {}
    );
    return res.data;
  },

  async closeSchedule(id: number): Promise<ShiftScheduleDetailDto> {
    const res = await api.post<ApiResponse<ShiftScheduleDetailDto>>(
      `${BASE}/schedules/${id}/close`,
      {}
    );
    return res.data;
  },
  // ─── Assignments ──────────────────────────────────────────────────────────

  async getAssignments(params: GetAssignmentsParams = {}): Promise<PagedResult<ShiftAssignmentDto>> {
    const query = toQuery({
      shiftScheduleId: params.shiftScheduleId,
      fromDate: params.fromDate,
      toDate: params.toDate,
      staffId: params.staffId,
      assignmentStatusLvId: params.assignmentStatusLvId,
      pageIndex: params.pageIndex ?? 1,
      pageSize: params.pageSize ?? 20,
    });
    const res = await api.get<ApiResponse<PagedResult<ShiftAssignmentDto>>>(
      `${BASE}/assignments${query}`
    );
    return (
      res.data ?? { pageData: [], pageIndex: 1, pageSize: 20, totalCount: 0, totalPage: 0 }
    );
  },

  async createAssignments(body: CreateAssignmentsRequest): Promise<ShiftAssignmentDto[]> {
    const res = await api.post<ApiResponse<ShiftAssignmentDto[]>>(
      `${BASE}/assignments`,
      body
    );
    return res.data ?? [];
  },

  async cancelAssignment(id: number): Promise<void> {
    await api.delete(`${BASE}/assignments/${id}`);
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

  async adjustAttendance(
    attendanceId: number,
    body: AdjustAttendanceRequest
  ): Promise<AttendanceRecordDto> {
    const res = await api.patch<ApiResponse<AttendanceRecordDto>>(
      `${BASE}/attendance/${attendanceId}`,
      body
    );
    return res.data;
  },

  // ─── Live Board ───────────────────────────────────────────────────────────

  async getLiveBoard(params: GetLiveBoardParams = {}): Promise<LiveShiftBoardDto> {
    const query = toQuery({ businessDate: params.businessDate });
    const res = await api.get<ApiResponse<LiveShiftBoardDto>>(`${BASE}/live${query}`);
    return res.data;
  },

  // ─── Reports ──────────────────────────────────────────────────────────────

  async getAttendanceReport(
    params: GetAttendanceReportParams = {}
  ): Promise<PagedResult<AttendanceReportRowDto>> {
    const query = toQuery({
      fromDate: params.fromDate,
      toDate: params.toDate,
      staffId: params.staffId,
      shiftTypeLvId: params.shiftTypeLvId,
      attendanceStatusLvId: params.attendanceStatusLvId,
      pageIndex: params.pageIndex ?? 1,
      pageSize: params.pageSize ?? 20,
    });
    const res = await api.get<ApiResponse<PagedResult<AttendanceReportRowDto>>>(
      `${BASE}/reports/attendance${query}`
    );
    return (
      res.data ?? { pageData: [], pageIndex: 1, pageSize: 20, totalCount: 0, totalPage: 0 }
    );
  },

  async getWorkedHoursReport(
    params: GetWorkedHoursReportParams
  ): Promise<WorkedHoursReportRowDto[]> {
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

  async getExceptionsReport(
    params: GetExceptionsReportParams
  ): Promise<AttendanceExceptionReportRowDto[]> {
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

  // ─── My Shifts ────────────────────────────────────────────────────────────

  async getMyShifts(params: GetMyShiftsParams = {}): Promise<PagedResult<ShiftAssignmentDto>> {
    // My shifts = assignments filtered by the logged-in user (server handles auth)
    const query = toQuery({
      fromDate: params.fromDate,
      toDate: params.toDate,
      pageIndex: params.pageIndex ?? 1,
      pageSize: params.pageSize ?? 20,
    });
    const res = await api.get<ApiResponse<PagedResult<ShiftAssignmentDto>>>(
      `${BASE}/assignments/my${query}`
    );
    return (
      res.data ?? { pageData: [], pageIndex: 1, pageSize: 20, totalCount: 0, totalPage: 0 }
    );
  },

  // ─── Staff Picker (for assignment form) ───────────────────────────────────────

  async getStaffList(): Promise<StaffBasicDto[]> {
    const res = await api.get<ApiResponse<PagedResult<StaffBasicDto>>>(
      "/api/account/staff?PageIndex=1&PageSize=200"
    );
    return res.data?.pageData ?? [];
  },
};
