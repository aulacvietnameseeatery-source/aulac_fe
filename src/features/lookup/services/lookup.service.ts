import { api } from "@/lib/http";
import type { ApiResponse } from "@/types/api-response.types";
import type {
  LookupTypeId,
  LookupValueI18nDto,
  LookupValueDto,
  CreateLookupValueRequest,
  UpdateLookupValueRequest,
  BatchReorderLookupRequest,
  BatchReorderLookupResponse,
} from "../types/lookup.types";
import { mapLookupI18n } from "../types/lookup.types";

/**
 * Creates a generic CRUD service for lookup values by typeId.
 *
 * The endpoint must follow the standard RESTful pattern:
 *   GET    /api/lookups/{typeId}
 *   POST   /api/lookups/{typeId}
 *   PUT    /api/lookups/{typeId}/{valueId}
 *   DELETE /api/lookups/{typeId}/{valueId}
 *
 * @example
 *   const zoneService = createLookupService(LOOKUP_TYPE.TableZone, { typeLabel: "Zone" });
 */
export function createLookupService(
  typeId: LookupTypeId,
  options?: { typeLabel?: string }
) {
  const baseUrl = `/api/lookups/${typeId}`;

  return {
    async getAll(): Promise<LookupValueDto[]> {
      const res = await api.get<ApiResponse<LookupValueI18nDto[]>>(baseUrl);
      return (res.data ?? []).map(mapLookupI18n);
    },

    async create(data: CreateLookupValueRequest): Promise<LookupValueDto> {
      const res = await api.post<ApiResponse<LookupValueI18nDto>>(baseUrl, data);
      return mapLookupI18n(res.data);
    },

    async update(id: number, data: UpdateLookupValueRequest): Promise<LookupValueDto> {
      const res = await api.put<ApiResponse<LookupValueI18nDto>>(`${baseUrl}/${id}`, data);
      return mapLookupI18n(res.data);
    },

    async remove(id: number): Promise<void> {
      const qs = options?.typeLabel
        ? `?${new URLSearchParams({ typeLabel: options.typeLabel }).toString()}`
        : "";
      await api.delete<ApiResponse<object>>(`${baseUrl}/${id}${qs}`);
    },

    async reorder(data: BatchReorderLookupRequest): Promise<BatchReorderLookupResponse> {
      const res = await api.put<ApiResponse<BatchReorderLookupResponse>>(`${baseUrl}/reorder`, data);
      return res.data;
    },
  };
}
