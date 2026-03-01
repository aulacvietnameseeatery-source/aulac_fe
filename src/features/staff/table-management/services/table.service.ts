import { api } from "@/lib/http";
import type { ApiResponse, PagedResult } from "@/types/api-response.types";
import type {
  TableManagementDto,
  TableDetailDto,
  CreateTableRequest,
  UpdateTableRequest,
  UpdateTableStatusRequest,
  TableQueryParams,
  LookupValueDto,
  LookupValueI18nDto,
  CreateLookupValueRequest,
  UpdateLookupValueRequest,
  BulkOnlineRequest,
  QrCodeDto,
} from "../types";
import { mapLookupI18n } from "../types";

/**
 * Table Management API service
 * Base URL: /api/tables
 */
export const tableService = {
  /**
   * GET /api/tables — Paginated list with optional filters
   */
  async getTables(
    params: TableQueryParams = {}
  ): Promise<PagedResult<TableManagementDto>> {
    const query = new URLSearchParams();

    if (params.pageIndex) query.set("pageIndex", String(params.pageIndex));
    if (params.pageSize) query.set("pageSize", String(params.pageSize));
    if (params.search) query.set("search", params.search);
    if (params.zoneId) query.set("zoneId", String(params.zoneId));
    if (params.typeId) query.set("typeId", String(params.typeId));
    if (params.statusId) query.set("statusId", String(params.statusId));
    if (params.isOnline !== undefined)
      query.set("isOnline", String(params.isOnline));

    const qs = query.toString();
    const url = qs ? `/api/tables?${qs}` : "/api/tables";

    const res = await api.get<ApiResponse<PagedResult<TableManagementDto>>>(url);
    return (
      res.data ?? {
        pageData: [],
        pageIndex: 1,
        pageSize: 30,
        totalCount: 0,
        totalPage: 0,
      }
    );
  },

  /**
   * GET /api/tables/{id} — Full detail including images, orders, reservations
   */
  async getTableDetail(id: number): Promise<TableDetailDto> {
    const res = await api.get<ApiResponse<TableDetailDto>>(`/api/tables/${id}`);
    return res.data;
  },

  /**
   * POST /api/tables — Create a new table
   * Returns 201 Created
   */
  async createTable(data: CreateTableRequest): Promise<TableManagementDto> {
    const res = await api.post<ApiResponse<TableManagementDto>>(
      "/api/tables",
      data
    );
    return res.data;
  },

  /**
   * PUT /api/tables/{id} — Partial update (null/absent fields not modified)
   */
  async updateTable(
    id: number,
    data: UpdateTableRequest
  ): Promise<TableManagementDto> {
    const res = await api.put<ApiResponse<TableManagementDto>>(
      `/api/tables/${id}`,
      data
    );
    return res.data;
  },

  /**
   * DELETE /api/tables/{id} — Soft delete
   * Blocked (409) if table has active orders or upcoming reservations
   */
  async deleteTable(id: number): Promise<void> {
    await api.delete<ApiResponse<object>>(`/api/tables/${id}`);
  },

  /**
   * PATCH /api/tables/{id}/status — Update status with transition validation
   */
  async updateTableStatus(
    id: number,
    data: UpdateTableStatusRequest
  ): Promise<TableManagementDto> {
    const res = await api.patch<ApiResponse<TableManagementDto>>(
      `/api/tables/${id}/status`,
      data
    );
    return res.data;
  },

  // ── Lookup endpoints ──────────────────────────────────

  /**
   * GET /api/tables/zones — List all zone lookup values
   * Response shape: LookupValueI18nDto (no valueName, has i18n)
   */
  async getZones(): Promise<LookupValueDto[]> {
    const res = await api.get<ApiResponse<LookupValueI18nDto[]>>("/api/tables/zones");
    return (res.data ?? []).map(mapLookupI18n);
  },

  /**
   * GET /api/tables/types — List all table type lookup values
   * Response shape: LookupValueI18nDto (no valueName, has i18n)
   */
  async getTableTypes(): Promise<LookupValueDto[]> {
    const res = await api.get<ApiResponse<LookupValueI18nDto[]>>("/api/tables/types");
    return (res.data ?? []).map(mapLookupI18n);
  },

  /**
   * POST /api/tables/zones — Quick-create a new zone
   */
  async createZone(data: CreateLookupValueRequest): Promise<LookupValueDto> {
    const res = await api.post<ApiResponse<LookupValueI18nDto>>("/api/tables/zones", data);
    return mapLookupI18n(res.data);
  },

  /**
   * POST /api/tables/types — Quick-create a new table type
   */
  async createTableType(data: CreateLookupValueRequest): Promise<LookupValueDto> {
    const res = await api.post<ApiResponse<LookupValueI18nDto>>("/api/tables/types", data);
    return mapLookupI18n(res.data);
  },

  /**
   * PUT /api/tables/zones/{id} — Update an existing zone
   */
  async updateZone(id: number, data: UpdateLookupValueRequest): Promise<LookupValueDto> {
    const res = await api.put<ApiResponse<LookupValueI18nDto>>(`/api/tables/zones/${id}`, data);
    return mapLookupI18n(res.data);
  },

  /**
   * DELETE /api/tables/zones/{id} — Delete a zone
   */
  async deleteZone(id: number): Promise<void> {
    await api.delete<ApiResponse<object>>(`/api/tables/zones/${id}`);
  },

  /**
   * PUT /api/tables/types/{id} — Update an existing table type
   */
  async updateTableType(id: number, data: UpdateLookupValueRequest): Promise<LookupValueDto> {
    const res = await api.put<ApiResponse<LookupValueI18nDto>>(`/api/tables/types/${id}`, data);
    return mapLookupI18n(res.data);
  },

  /**
   * DELETE /api/tables/types/{id} — Delete a table type
   */
  async deleteTableType(id: number): Promise<void> {
    await api.delete<ApiResponse<object>>(`/api/tables/types/${id}`);
  },

  /**
   * PATCH /api/tables/bulk-online — Set all tables in a zone online or offline
   */
  async bulkOnline(data: BulkOnlineRequest): Promise<{ affectedCount: number }> {
    const res = await api.patch<ApiResponse<{ affectedCount: number }>>(
      "/api/tables/bulk-online",
      data
    );
    return res.data ?? { affectedCount: 0 };
  },

  /**
   * POST /api/tables/{id}/qr-code — Regenerate QR token
   */
  async regenerateQr(id: number): Promise<QrCodeDto> {
    const res = await api.post<ApiResponse<QrCodeDto>>(
      `/api/tables/${id}/qr-code`,
      {} // no body required — POST triggers token regeneration
    );
    return res.data;
  },
};
