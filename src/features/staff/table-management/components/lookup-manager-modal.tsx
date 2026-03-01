"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ALInput } from "@/components/ui/al-input";
import { BaseTable } from "@/components/ui/table/base-table";
import { ConfirmModal } from "@/components/layout/admin-sidebar/confirm-modal";
import type { TableColumn } from "@/types/table.types";
import type { LookupValueDto } from "../types";
import {
  useZonesQuery,
  useTableTypesQuery,
  useCreateZoneMutation,
  useCreateTableTypeMutation,
  useUpdateZoneMutation,
  useUpdateTableTypeMutation,
  useDeleteZoneMutation,
  useDeleteTableTypeMutation,
} from "../hooks/use-table-queries";

// ─── Types ───────────────────────────────────────────────────

export interface LookupManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Which lookup entity to manage */
  type: "zone" | "tableType";
  /** Called after a new item is created so the parent can auto-select it */
  onCreated?: (item: LookupValueDto) => void;
}

// ─── Inline form state ───────────────────────────────────────

interface FormState {
  valueName: string;
  description: string;
}

const EMPTY_FORM: FormState = { valueName: "", description: "" };

// ─── Component ───────────────────────────────────────────────

const LookupManagerModal: React.FC<LookupManagerModalProps> = ({
  isOpen,
  onClose,
  type,
  onCreated,
}) => {
  const isZone = type === "zone";
  const entityLabel = isZone ? "Zone" : "Table Type";

  // ── Data ──
  const { data: zones = [], isLoading: zonesLoading } = useZonesQuery();
  const { data: types = [], isLoading: typesLoading } = useTableTypesQuery();
  const items = isZone ? zones : types;
  const isLoading = isZone ? zonesLoading : typesLoading;

  // ── Form state ──
  const [formMode, setFormMode] = useState<"idle" | "add" | "edit">("idle");
  const [editTarget, setEditTarget] = useState<LookupValueDto | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<LookupValueDto | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Focus name input when form opens
  useEffect(() => {
    if (formMode !== "idle") {
      const t = setTimeout(() => nameInputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [formMode]);

  // Reset form on close
  useEffect(() => {
    if (!isOpen) {
      setFormMode("idle");
      setEditTarget(null);
      setForm(EMPTY_FORM);
      setDeleteTarget(null);
    }
  }, [isOpen]);

  // ── Mutations ──
  const createZone = useCreateZoneMutation({
    onSuccess: (data) => {
      setFormMode("idle");
      setForm(EMPTY_FORM);
      onCreated?.(data);
    },
  });
  const createType = useCreateTableTypeMutation({
    onSuccess: (data) => {
      setFormMode("idle");
      setForm(EMPTY_FORM);
      onCreated?.(data);
    },
  });
  const updateZone = useUpdateZoneMutation({
    onSuccess: () => {
      setFormMode("idle");
      setEditTarget(null);
      setForm(EMPTY_FORM);
    },
  });
  const updateType = useUpdateTableTypeMutation({
    onSuccess: () => {
      setFormMode("idle");
      setEditTarget(null);
      setForm(EMPTY_FORM);
    },
  });
  const deleteZone = useDeleteZoneMutation({
    onSuccess: () => setDeleteTarget(null),
  });
  const deleteType = useDeleteTableTypeMutation({
    onSuccess: () => setDeleteTarget(null),
  });

  const isSaving =
    createZone.isPending || createType.isPending ||
    updateZone.isPending || updateType.isPending;
  const isDeleting = deleteZone.isPending || deleteType.isPending;

  // ── Handlers ──
  const handleStartAdd = () => {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setFormMode("add");
  };

  const handleStartEdit = useCallback((item: LookupValueDto) => {
    setForm({ valueName: item.valueName, description: item.description ?? "" });
    setEditTarget(item);
    setFormMode("edit");
  }, []);

  const handleCancelForm = () => {
    setFormMode("idle");
    setEditTarget(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = () => {
    if (!form.valueName.trim()) return;
    const payload = {
      valueName: form.valueName.trim(),
      description: form.description.trim() || undefined,
    };
    if (formMode === "add") {
      if (isZone) createZone.mutate(payload);
      else createType.mutate(payload);
    } else if (formMode === "edit" && editTarget) {
      if (isZone) updateZone.mutate({ id: editTarget.valueId, data: payload });
      else updateType.mutate({ id: editTarget.valueId, data: payload });
    }
  };

  const handleDeleteClick = useCallback((item: LookupValueDto) => {
    setDeleteTarget(item);
  }, []);

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (isZone) deleteZone.mutate(deleteTarget.valueId);
    else deleteType.mutate(deleteTarget.valueId);
  };

  // ── Table columns ──
  const columns: TableColumn[] = useMemo(
    () => [
      {
        field: "sortOrder",
        header: "#",
        width: "60px",
        align: "center" as const,
        sortable: false,
      },
      {
        field: "valueName",
        header: "Name",
        sortable: false,
        filterType: "text" as const,
      },
      {
        field: "valueCode",
        header: "Code",
        width: "160px",
        sortable: false,
        cellRender: ({ value }: { value: string }) => (
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-mono">
            {value}
          </span>
        ),
      },
      {
        field: "description",
        header: "Description",
        sortable: false,
        cellRender: ({ value }: { value: string }) => (
          <span className="text-gray-500 text-sm">{value || "—"}</span>
        ),
      },
    ],
    []
  );

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        title={`Manage ${entityLabel}s`}
        width="780px"
        footer={
          <div className="flex justify-end w-full">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        }
      >
        <div className="p-4 space-y-4">
          {/* ── Inline Add / Edit Form ── */}
          {formMode !== "idle" ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700">
                {formMode === "add" ? `Add New ${entityLabel}` : `Edit ${entityLabel}`}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <ALInput
                  ref={nameInputRef}
                  title="Name"
                  required
                  placeholder={`e.g. ${isZone ? "Garden" : "VIP Booth"}`}
                  value={form.valueName}
                  onChange={(e) => setForm((f) => ({ ...f, valueName: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); handleSave(); }
                    if (e.key === "Escape") handleCancelForm();
                  }}
                />
                <ALInput
                  title="Description"
                  placeholder="Optional helper text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); handleSave(); }
                    if (e.key === "Escape") handleCancelForm();
                  }}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelForm}
                  disabled={isSaving}
                >
                  <X size={14} className="mr-1" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  isLoading={isSaving}
                  disabled={!form.valueName.trim() || isSaving}
                >
                  <Check size={14} className="mr-1" />
                  {formMode === "add" ? "Create" : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleStartAdd}
              >
                <Plus size={14} className="mr-1" />
                Add {entityLabel}
              </Button>
            </div>
          )}

          {/* ── Table ── */}
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <BaseTable<LookupValueDto>
              data={items}
              loading={isLoading}
              columns={columns}
              rowKey="valueId"
              total={items.length}
              onDataChange={() => {}}
              searchPlaceholder={`Search ${entityLabel.toLowerCase()}s...`}
              defaultRowsPerPage={50}
              rowsPerPageOptions={[50]}
              renderActionColumn={(item) => (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title={`Edit ${entityLabel}`}
                    onClick={() => handleStartEdit(item)}
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    title={`Delete ${entityLabel}`}
                    onClick={() => handleDeleteClick(item)}
                    className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            />
          </div>
        </div>
      </Dialog>

      {/* ── Delete confirmation ── */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${entityLabel}`}
        message={`Are you sure you want to delete "${deleteTarget?.valueName}"? This action cannot be undone. Tables currently using this ${entityLabel.toLowerCase()} will be affected.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
};

export default LookupManagerModal;
