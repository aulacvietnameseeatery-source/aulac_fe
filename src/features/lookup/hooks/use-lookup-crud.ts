"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createLookupService } from "../services/lookup.service";
import type {
  LookupTypeId,
  LookupValueDto,
  CreateLookupValueRequest,
  UpdateLookupValueRequest,
  BatchReorderLookupRequest,
  BatchReorderLookupResponse,
  TranslateLookupRequest,
  TranslateLookupResponse,
} from "../types/lookup.types";
import { isLookupTypeConfigurable } from "../types/lookup.types";

// ──────────────────────────────────────────────────────────

export interface LookupCrudConfig {
  /** Lookup type ID used by /api/lookups/{typeId} */
  typeId: LookupTypeId;
  /**
   * Stable React Query key array.
   * Must uniquely identify this resource across the app.
   * e.g. ["tables", "zones"] or ["dishes", "tags"]
   */
  queryKey: readonly string[];
  /** Human-readable singular label used in toast messages, e.g. "Zone" */
  entityLabel: string;
  /** Optional type label sent to DELETE endpoint for clearer backend messages */
  typeLabel?: string;
  /** Override default configurability for this lookup type */
  isConfigurable?: boolean;
  /** How long fetched data is considered fresh. Defaults to 5 minutes. */
  staleTime?: number;
}

// ──────────────────────────────────────────────────────────

/**
 * Generic hook for any BE LookupValue entity (zone, type, status, tag, etc.).
 *
 * Returns data + callback props that can be spread directly onto
 * <LookupManagerModal> — no need to wire up individual service calls.
 *
 * @example
 *   const zoneLookup = useLookupCrud({
 *     typeId:      LOOKUP_TYPE.TableZone,
 *     queryKey:    ["lookups", "table-zone"],
 *     entityLabel: "Zone",
 *     typeLabel:   "Zone",
 *   });
 *
 *   // Quick-create (ALCombobox):
 *   onCreateOption={(name) =>
 *     zoneLookup.onSave({ valueName: name }).then(item =>
 *       setSelectedZone(item.valueId)
 *     )
 *   }
 *
 *   // Full manager modal:
 *   <LookupManagerModal
 *     {...zoneLookup}
 *     isOpen={open}
 *     onClose={() => setOpen(false)}
 *     onCreated={(item) => setSelectedZone(item.valueId)}
 *   />
 */
export function useLookupCrud({
  typeId,
  queryKey,
  entityLabel,
  typeLabel,
  isConfigurable,
  staleTime = 5 * 60_000,
}: LookupCrudConfig) {
  const queryClient = useQueryClient();
  const resolvedIsConfigurable =
    isConfigurable ?? isLookupTypeConfigurable(typeId);
  const service = useMemo(
    () => createLookupService(typeId, { typeLabel }),
    [typeId, typeLabel]
  );

  // ── Query ──────────────────────────────────────────────
  const query = useQuery<LookupValueDto[]>({
    queryKey,
    queryFn: () => service.getAll(),
    staleTime,
  });

  // ── Create ─────────────────────────────────────────────
  const createMutation = useMutation<LookupValueDto, Error, CreateLookupValueRequest>({
    mutationFn: (data) => service.create(data),
    onSuccess: (data) => {
      toast.success(`${entityLabel} created`, {
        description: `"${data.valueName}" has been created.`,
      });
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: any) => {
      toast.error(`Failed to create ${entityLabel.toLowerCase()}`, {
        description: error?.response?.data?.userMessage || error.message,
      });
    },
  });

  // ── Update ─────────────────────────────────────────────
  const updateMutation = useMutation<
    LookupValueDto,
    Error,
    { id: number; data: UpdateLookupValueRequest }
  >({
    mutationFn: ({ id, data }) => service.update(id, data),
    onSuccess: (data) => {
      toast.success(`${entityLabel} updated`, {
        description: `"${data.valueName}" saved.`,
      });
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: any) => {
      toast.error(`Failed to update ${entityLabel.toLowerCase()}`, {
        description: error?.response?.data?.userMessage || error.message,
      });
    },
  });

  // ── Delete ─────────────────────────────────────────────
  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: (id) => service.remove(id),
    onSuccess: () => {
      toast.success(`${entityLabel} deleted`);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: any) => {
      toast.error(`Failed to delete ${entityLabel.toLowerCase()}`, {
        description: error?.response?.data?.userMessage || error.message,
      });
    },
  });

  // ── Reorder (Batch) ───────────────────────────────────
  const reorderMutation = useMutation<
    BatchReorderLookupResponse,
    Error,
    BatchReorderLookupRequest
  >({
    mutationFn: (data) => service.reorder(data),
    onSuccess: (data) => {
      toast.success(`${entityLabel} order updated`, {
        description: `${data.updatedCount} item(s) reordered.`,
      });
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: any) => {
      toast.error(`Failed to reorder ${entityLabel.toLowerCase()}s`, {
        description: error?.response?.data?.userMessage || error.message,
      });
    },
  });

  // ── Translate ─────────────────────────────────────────
  const translateMutation = useMutation<
    TranslateLookupResponse,
    Error,
    TranslateLookupRequest
  >({
    mutationFn: (data) => service.translateLookupContent(data),
    onSuccess: () => {
      toast.success("Translation completed successfully!");
    },
    onError: (error: any) => {
      toast.error("Auto-translate failed", {
        description: error?.response?.data?.userMessage || error.message,
      });
    },
  });

  // ──────────────────────────────────────────────────────
  return {
    // ── LookupManagerModal props (spread-ready) ──
    entityLabel,
    isConfigurable: resolvedIsConfigurable,
    items:     query.data ?? [],
    isLoading: query.isLoading,
    onSave:   (data: CreateLookupValueRequest)             => createMutation.mutateAsync(data),
    onUpdate: (id: number, data: UpdateLookupValueRequest) => updateMutation.mutateAsync({ id, data }),
    onDelete: (id: number)                                 => deleteMutation.mutateAsync(id),
    onReorder: (data: BatchReorderLookupRequest)           => reorderMutation.mutateAsync(data),
    onTranslate: (data: TranslateLookupRequest)            => translateMutation.mutateAsync(data),

    // ── Granular state (for loading indicators etc.) ──
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isReordering: reorderMutation.isPending,
    isTranslating: translateMutation.isPending,
  };
}

export type LookupCrudReturn = ReturnType<typeof useLookupCrud>;
