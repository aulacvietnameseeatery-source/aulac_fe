import { api } from "@/lib/http";
import { createLookupService } from "@/features/lookup";
import type { ApiResponse, PagedResult } from "@/types/api-response.types";
import type {
  TableManagementDto,
  TableDetailDto,
  TableMediaDto,
  CreateTableRequest,
  UpdateTableRequest,
  UpdateTableStatusRequest,
  TableQueryParams,
  LookupValueDto,
  CreateLookupValueRequest,
  UpdateLookupValueRequest,
  BulkOnlineRequest,
  QrCodeDto,
} from "../types";

// ── Shared lookup service instances ──
const _zoneService = createLookupService("/api/tables/zones");
const _typeService = createLookupService("/api/tables/types");

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
   * POST /api/tables — Create a new table (multipart/form-data)
   * Images are optional and uploaded in the same request.
   * Returns 201 Created with TableDetailDto.
   */
  async createTable(data: CreateTableRequest): Promise<TableManagementDto> {
    const form = new FormData();
    form.append("TableCode", data.tableCode);
    form.append("Capacity", String(data.capacity));
    form.append("IsOnline", String(data.isOnline ?? false));
    form.append("StatusLvId", String(data.statusLvId));
    form.append("TypeLvId", String(data.typeLvId));
    form.append("ZoneLvId", String(data.zoneLvId));
    data.images?.forEach((f) => form.append("Images", f));

    const res = await api.post<ApiResponse<TableManagementDto>>(
      "/api/tables",
      form
    );
    return res.data;
  },

  /**
   * PUT /api/tables/{id} — Update table data and/or images in one request (multipart/form-data)
   * - Images: new files to add
   * - RemovedImageIds: comma-separated mediaIds to delete
   * Returns the final TableDetailDto after all changes.
   */
  async updateTable(
    id: number,
    data: UpdateTableRequest
  ): Promise<TableManagementDto> {
    const form = new FormData();
    if (data.tableCode !== undefined) form.append("TableCode", data.tableCode);
    if (data.capacity !== undefined) form.append("Capacity", String(data.capacity));
    if (data.isOnline !== undefined) form.append("IsOnline", String(data.isOnline));
    if (data.statusLvId !== undefined) form.append("StatusLvId", String(data.statusLvId));
    if (data.typeLvId !== undefined) form.append("TypeLvId", String(data.typeLvId));
    if (data.zoneLvId !== undefined) form.append("ZoneLvId", String(data.zoneLvId));
    data.images?.forEach((f) => form.append("Images", f));
    if (data.removedImageIds?.length)
      form.append("RemovedImageIds", data.removedImageIds.join(","));

    const res = await api.put<ApiResponse<TableManagementDto>>(
      `/api/tables/${id}`,
      form
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

  // ── Lookup endpoints ── delegated to createLookupService instances ──

  /** GET /api/tables/zones */
  async getZones(): Promise<LookupValueDto[]> {
    return _zoneService.getAll();
  },

  /** GET /api/tables/types */
  async getTableTypes(): Promise<LookupValueDto[]> {
    return _typeService.getAll();
  },

  /** POST /api/tables/zones */
  async createZone(data: CreateLookupValueRequest): Promise<LookupValueDto> {
    return _zoneService.create(data);
  },

  /** POST /api/tables/types */
  async createTableType(data: CreateLookupValueRequest): Promise<LookupValueDto> {
    return _typeService.create(data);
  },

  /** PUT /api/tables/zones/{id} */
  async updateZone(id: number, data: UpdateLookupValueRequest): Promise<LookupValueDto> {
    return _zoneService.update(id, data);
  },

  /** DELETE /api/tables/zones/{id} */
  async deleteZone(id: number): Promise<void> {
    return _zoneService.remove(id);
  },

  /** PUT /api/tables/types/{id} */
  async updateTableType(id: number, data: UpdateLookupValueRequest): Promise<LookupValueDto> {
    return _typeService.update(id, data);
  },

  /** DELETE /api/tables/types/{id} */
  async deleteTableType(id: number): Promise<void> {
    return _typeService.remove(id);
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
   * POST /api/tables/{id}/media — Upload images for a table
   * Accepts multipart/form-data with field name `files`.
   * Returns 201 with the uploaded media DTOs.
   */
  async uploadTableMedia(tableId: number, files: File[]): Promise<TableMediaDto[]> {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    const res = await api.post<ApiResponse<TableMediaDto[]>>(
      `/api/tables/${tableId}/media`,
      form
    );
    return res.data ?? [];
  },

  /**
   * DELETE /api/tables/{id}/media/{mediaId} — Remove a single image
   * Returns 204 No Content on success.
   */
  async deleteTableMedia(tableId: number, mediaId: number): Promise<void> {
    await api.delete<ApiResponse<object>>(`/api/tables/${tableId}/media/${mediaId}`);
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
