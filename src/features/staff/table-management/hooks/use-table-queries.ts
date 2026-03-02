import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tableService } from "../services/table.service";
import type {
  TableQueryParams,
  CreateTableRequest,
  UpdateTableRequest,
  UpdateTableStatusRequest,
  TableManagementDto,
  TableDetailDto,
  LookupValueDto,
  CreateLookupValueRequest,
  UpdateLookupValueRequest,
  BulkOnlineRequest,
  QrCodeDto,
} from "../types";
import type { PagedResult } from "@/types/api-response.types";

// ──────────────────────────────────────────────────────────
// Query keys
// ──────────────────────────────────────────────────────────

export const TABLE_QUERY_KEYS = {
  all: ["tables"] as const,
  lists: () => [...TABLE_QUERY_KEYS.all, "list"] as const,
  list: (params: TableQueryParams) =>
    [...TABLE_QUERY_KEYS.lists(), params] as const,
  details: () => [...TABLE_QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...TABLE_QUERY_KEYS.details(), id] as const,
  zones: () => [...TABLE_QUERY_KEYS.all, "zones"] as const,
  tableTypes: () => [...TABLE_QUERY_KEYS.all, "types"] as const,
};

// ──────────────────────────────────────────────────────────
// Queries
// ──────────────────────────────────────────────────────────

/**
 * Fetches paginated table list with optional filters.
 * GET /api/tables
 */
export function useTablesQuery(params: TableQueryParams = {}) {
  return useQuery<PagedResult<TableManagementDto>>({
    queryKey: TABLE_QUERY_KEYS.list(params),
    queryFn: () => tableService.getTables(params),
  });
}

/**
 * Fetches single table detail by ID.
 * GET /api/tables/{id}
 */
export function useTableDetailQuery(id: number | null) {
  return useQuery<TableDetailDto | null>({
    queryKey: TABLE_QUERY_KEYS.detail(id ?? 0),
    queryFn: () => {
      if (!id) return null;
      return tableService.getTableDetail(id);
    },
    enabled: !!id && id > 0,
  });
}

// ──────────────────────────────────────────────────────────
// Mutations
// ──────────────────────────────────────────────────────────

/**
 * POST /api/tables — Create table
 */
export function useCreateTableMutation(callbacks?: {
  onSuccess?: (data: TableManagementDto) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<TableManagementDto, Error, CreateTableRequest>({
    mutationFn: (data) => tableService.createTable(data),

    onSuccess: (data) => {
      toast.success("Table created successfully", {
        description: `Table "${data.tableCode}" has been created.`,
      });
      queryClient.invalidateQueries({ queryKey: TABLE_QUERY_KEYS.lists() });
      callbacks?.onSuccess?.(data);
    },

    onError: (error: any) => {
      const apiError = error?.response?.data;
      if (apiError?.code === 409) {
        toast.error("Duplicate table code", {
          description: apiError.userMessage || error.message,
        });
      } else if (apiError?.validateInfo?.length) {
        apiError.validateInfo.forEach((msg: string) => toast.error(msg));
      } else {
        toast.error("Failed to create table", {
          description: apiError?.userMessage || error.message,
        });
      }
      callbacks?.onError?.(error);
    },
  });
}

/**
 * PUT /api/tables/{id} — Update table
 */
export function useUpdateTableMutation(callbacks?: {
  onSuccess?: (data: TableManagementDto) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<
    TableManagementDto,
    Error,
    { id: number; data: UpdateTableRequest }
  >({
    mutationFn: ({ id, data }) => tableService.updateTable(id, data),

    onSuccess: (data) => {
      toast.success("Table updated successfully", {
        description: `Table "${data.tableCode}" has been updated.`,
      });
      queryClient.invalidateQueries({ queryKey: TABLE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: TABLE_QUERY_KEYS.detail(data.tableId),
      });
      callbacks?.onSuccess?.(data);
    },

    onError: (error: any) => {
      const apiError = error?.response?.data;
      if (apiError?.code === 409) {
        toast.error("Duplicate table code", {
          description: apiError.userMessage || error.message,
        });
      } else if (apiError?.code === 404) {
        toast.warning("Table not found");
      } else {
        toast.error("Failed to update table", {
          description: apiError?.userMessage || error.message,
        });
      }
      callbacks?.onError?.(error);
    },
  });
}

/**
 * DELETE /api/tables/{id} — Soft delete
 */
export function useDeleteTableMutation(callbacks?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => tableService.deleteTable(id),

    onSuccess: () => {
      toast.success("Table deleted successfully");
      queryClient.invalidateQueries({ queryKey: TABLE_QUERY_KEYS.lists() });
      callbacks?.onSuccess?.();
    },

    onError: (error: any) => {
      const apiError = error?.response?.data;
      if (apiError?.code === 409) {
        toast.error("Cannot delete table", {
          description:
            apiError.userMessage ||
            "Table has active orders or upcoming reservations.",
        });
      } else if (apiError?.code === 404) {
        toast.warning("Table not found");
      } else {
        toast.error("Failed to delete table", {
          description: apiError?.userMessage || error.message,
        });
      }
      callbacks?.onError?.(error);
    },
  });
}

/**
 * PATCH /api/tables/{id}/status — Update status with transition validation
 */
export function useUpdateTableStatusMutation(callbacks?: {
  onSuccess?: (data: TableManagementDto) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<
    TableManagementDto,
    Error,
    { id: number; data: UpdateTableStatusRequest }
  >({
    mutationFn: ({ id, data }) => tableService.updateTableStatus(id, data),

    onSuccess: (data) => {
      toast.success("Status updated", {
        description: `Table "${data.tableCode}" is now ${data.statusName}.`,
      });
      queryClient.invalidateQueries({ queryKey: TABLE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: TABLE_QUERY_KEYS.detail(data.tableId),
      });
      callbacks?.onSuccess?.(data);
    },

    onError: (error: any) => {
      const apiError = error?.response?.data;
      if (apiError?.code === 400) {
        toast.error("Invalid status transition", {
          description: apiError.userMessage || error.message,
        });
      } else {
        toast.error("Failed to update status", {
          description: apiError?.userMessage || error.message,
        });
      }
      callbacks?.onError?.(error);
    },
  });
}

// ──────────────────────────────────────────────────────────
// Lookup Queries — zones, types, statuses
// ──────────────────────────────────────────────────────────

/**
 * GET /api/tables/zones — List all zone lookup values
 */
export function useZonesQuery() {
  return useQuery<LookupValueDto[]>({
    queryKey: TABLE_QUERY_KEYS.zones(),
    queryFn: () => tableService.getZones(),
    staleTime: 5 * 60_000, // zones rarely change
  });
}

/**
 * GET /api/tables/types — List all table type lookup values
 */
export function useTableTypesQuery() {
  return useQuery<LookupValueDto[]>({
    queryKey: TABLE_QUERY_KEYS.tableTypes(),
    queryFn: () => tableService.getTableTypes(),
    staleTime: 5 * 60_000,
  });
}

// ──────────────────────────────────────────────────────────
// Lookup Mutations — quick-create zone / type
// ──────────────────────────────────────────────────────────

/**
 * POST /api/tables/zones — Quick create a new zone
 */
export function useCreateZoneMutation(callbacks?: {
  onSuccess?: (data: LookupValueDto) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<LookupValueDto, Error, CreateLookupValueRequest>({
    mutationFn: (data) => tableService.createZone(data),

    onSuccess: (data) => {
      toast.success("Zone created", {
        description: `Zone "${data.valueName}" has been created.`,
      });
      queryClient.invalidateQueries({ queryKey: TABLE_QUERY_KEYS.zones() });
      callbacks?.onSuccess?.(data);
    },

    onError: (error: any) => {
      const apiError = error?.response?.data;
      toast.error("Failed to create zone", {
        description: apiError?.userMessage || error.message,
      });
      callbacks?.onError?.(error);
    },
  });
}

/**
 * POST /api/tables/types — Quick create a new table type
 */
export function useCreateTableTypeMutation(callbacks?: {
  onSuccess?: (data: LookupValueDto) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<LookupValueDto, Error, CreateLookupValueRequest>({
    mutationFn: (data) => tableService.createTableType(data),

    onSuccess: (data) => {
      toast.success("Table type created", {
        description: `Type "${data.valueName}" has been created.`,
      });
      queryClient.invalidateQueries({
        queryKey: TABLE_QUERY_KEYS.tableTypes(),
      });
      callbacks?.onSuccess?.(data);
    },

    onError: (error: any) => {
      const apiError = error?.response?.data;
      toast.error("Failed to create table type", {
        description: apiError?.userMessage || error.message,
      });
      callbacks?.onError?.(error);
    },
  });
}

/**
 * PUT /api/tables/zones/{id} — Update a zone
 */
export function useUpdateZoneMutation(callbacks?: {
  onSuccess?: (data: LookupValueDto) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<LookupValueDto, Error, { id: number; data: UpdateLookupValueRequest }>({
    mutationFn: ({ id, data }) => tableService.updateZone(id, data),
    onSuccess: (data) => {
      toast.success("Zone updated", { description: `Zone "${data.valueName}" saved.` });
      queryClient.invalidateQueries({ queryKey: TABLE_QUERY_KEYS.zones() });
      callbacks?.onSuccess?.(data);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.userMessage || error.message;
      toast.error("Failed to update zone", { description: msg });
      callbacks?.onError?.(error);
    },
  });
}

/**
 * DELETE /api/tables/zones/{id} — Delete a zone
 */
export function useDeleteZoneMutation(callbacks?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => tableService.deleteZone(id),
    onSuccess: () => {
      toast.success("Zone deleted");
      queryClient.invalidateQueries({ queryKey: TABLE_QUERY_KEYS.zones() });
      callbacks?.onSuccess?.();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.userMessage || error.message;
      toast.error("Failed to delete zone", { description: msg });
      callbacks?.onError?.(error);
    },
  });
}

/**
 * PUT /api/tables/types/{id} — Update a table type
 */
export function useUpdateTableTypeMutation(callbacks?: {
  onSuccess?: (data: LookupValueDto) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<LookupValueDto, Error, { id: number; data: UpdateLookupValueRequest }>({
    mutationFn: ({ id, data }) => tableService.updateTableType(id, data),
    onSuccess: (data) => {
      toast.success("Type updated", { description: `Type "${data.valueName}" saved.` });
      queryClient.invalidateQueries({ queryKey: TABLE_QUERY_KEYS.tableTypes() });
      callbacks?.onSuccess?.(data);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.userMessage || error.message;
      toast.error("Failed to update type", { description: msg });
      callbacks?.onError?.(error);
    },
  });
}

/**
 * DELETE /api/tables/types/{id} — Delete a table type
 */
export function useDeleteTableTypeMutation(callbacks?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => tableService.deleteTableType(id),
    onSuccess: () => {
      toast.success("Table type deleted");
      queryClient.invalidateQueries({ queryKey: TABLE_QUERY_KEYS.tableTypes() });
      callbacks?.onSuccess?.();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.userMessage || error.message;
      toast.error("Failed to delete type", { description: msg });
      callbacks?.onError?.(error);
    },
  });
}

// ──────────────────────────────────────────────────────────
// Bulk / special mutations
// ──────────────────────────────────────────────────────────

/**
 * PATCH /api/tables/bulk-online — Toggle online flag for all tables in a zone
 */
export function useBulkOnlineMutation(callbacks?: {
  onSuccess?: (affectedCount: number) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<{ affectedCount: number }, Error, BulkOnlineRequest>({
    mutationFn: (data) => tableService.bulkOnline(data),
    onSuccess: ({ affectedCount }, variables) => {
      toast.success(
        `${variables.isOnline ? "Tables online" : "Tables offline"}`,
        { description: `${affectedCount} table(s) updated.` }
      );
      queryClient.invalidateQueries({ queryKey: TABLE_QUERY_KEYS.lists() });
      callbacks?.onSuccess?.(affectedCount);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.userMessage || error.message;
      toast.error("Failed to update zone online status", { description: msg });
      callbacks?.onError?.(error);
    },
  });
}

/**
 * POST /api/tables/{id}/qr-code — Regenerate QR token for a table
 */
export function useRegenerateQrMutation(callbacks?: {
  onSuccess?: (data: QrCodeDto) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<QrCodeDto, Error, number>({
    mutationFn: (id) => tableService.regenerateQr(id),
    onSuccess: (data, id) => {
      toast.success("QR code regenerated");
      queryClient.invalidateQueries({ queryKey: TABLE_QUERY_KEYS.detail(id) });
      callbacks?.onSuccess?.(data);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.userMessage || error.message;
      toast.error("Failed to regenerate QR code", { description: msg });
      callbacks?.onError?.(error);
    },
  });
}
