import { api } from "@/lib/http";
import type { ApiResponse } from "@/types/api-response.types";
import type {
  LookupValueI18nDto,
  LookupValueDto,
  CreateLookupValueRequest,
  UpdateLookupValueRequest,
} from "../types/lookup.types";
import { mapLookupI18n } from "../types/lookup.types";

/**
 * Creates a generic CRUD service for any BE lookup endpoint.
 *
 * The endpoint must follow the standard RESTful pattern:
 *   GET    <baseUrl>        → list all values
 *   POST   <baseUrl>        → create a value
 *   PUT    <baseUrl>/{id}   → update a value
 *   DELETE <baseUrl>/{id}   → delete a value
 *
 * @example
 *   const zoneService   = createLookupService("/api/tables/zones");
 *   const tagService    = createLookupService("/api/dishes/tags");
 *   const statusService = createLookupService("/api/reservations/statuses");
 */
export function createLookupService(baseUrl: string) {
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
      await api.delete<ApiResponse<object>>(`${baseUrl}/${id}`);
    },
  };
}
