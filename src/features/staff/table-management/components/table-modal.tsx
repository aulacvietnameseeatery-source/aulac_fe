"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Dialog } from "@/components/ui/dialog";
import { ALInput } from "@/components/ui/al-input";
import { ALCombobox } from "@/components/ui/al-combobox";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadList,
  FileUploadItem,
  FileUploadItemPreview,
  FileUploadItemMetadata,
  FileUploadItemDelete,
} from "@/components/ui/file-upload";
import { RefreshCcw, Download, Eye, Upload, X, Trash2, Settings2 } from "lucide-react";
import type { RestaurantTable, TableFormData, TableStatus } from "../types";
import { TABLE_STATUS_CONFIG, TABLE_STATUS_LV_IDS } from "../types";
import {
  useZonesQuery,
  useTableTypesQuery,
  useCreateZoneMutation,
  useCreateTableTypeMutation,
  useRegenerateQrMutation,
} from "../hooks/use-table-queries";
import LookupManagerModal from "./lookup-manager-modal";

interface TableModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  table?: RestaurantTable | null;
  onClose: () => void;
  onSubmit: (data: TableFormData) => void;
  isSubmitting?: boolean;
}

const initialFormData: TableFormData = {
  tableCode: "",
  capacity: 2,
  statusLvId: "",
  typeLvId: "",
  zoneLvId: "",
  isOnline: true,
  qrCodeUrl: "",
  qrCodeImageUrl: "",
  qrCodeGenerated: false,
  images: [],
};

// ── Lookup options ──
// Fetched dynamically from API. Quick-create via ALCombobox allowCreate.

const TableModal: React.FC<TableModalProps> = ({
  isOpen,
  mode,
  table,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<TableFormData>(initialFormData);
  const [qrPreview, setQrPreview] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isZoneManagerOpen, setIsZoneManagerOpen] = useState(false);
  const [isTypeManagerOpen, setIsTypeManagerOpen] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // ── Fetch lookup values ──
  const { data: zones = [], isLoading: zonesLoading } = useZonesQuery();
  const { data: tableTypes = [], isLoading: typesLoading } = useTableTypesQuery();

  // ── Static status options — statuses are fixed; value = numeric statusLvId ──
  const STATIC_STATUS_OPTIONS = (Object.keys(TABLE_STATUS_CONFIG) as TableStatus[]).map((s) => ({
    label: TABLE_STATUS_CONFIG[s].label,
    value: String(TABLE_STATUS_LV_IDS[s]),
  }));

  // ── Regenerate QR mutation (edit mode only) ──
  const regenerateQrMutation = useRegenerateQrMutation({
    onSuccess: (data) => {
      setFormData((prev) => ({
        ...prev,
        qrCodeUrl: data.qrCodeUrl ?? "",
        qrCodeImageUrl: data.qrCodeImageUrl ?? "",
        qrCodeGenerated: true,
      }));
      setQrPreview(true);
    },
  });

  // ── Quick-create mutations ──
  const createZoneMutation = useCreateZoneMutation({
    onSuccess: (data) => {
      // Auto-select the newly created zone
      handleChange("zoneLvId", data.valueId);
    },
  });
  const createTypeMutation = useCreateTableTypeMutation({
    onSuccess: (data) => {
      handleChange("typeLvId", data.valueId);
    },
  });

  // ── Map lookup DTOs → ALCombobox options ──
  const zoneOptions = useMemo(
    () =>
      zones.map((z) => ({
        label: z.valueName,
        value: String(z.valueId),
      })),
    [zones]
  );

  const typeOptions = useMemo(
    () =>
      tableTypes.map((t) => ({
        label: t.valueName,
        value: String(t.valueId),
      })),
    [tableTypes]
  );

  useEffect(() => {
    if (mode === "edit" && table) {
      setFormData({
        tableCode: table.tableCode,
        capacity: table.capacity,
        statusLvId: table.statusId || "",
        typeLvId: table.typeId || "",
        zoneLvId: table.zoneId || "",
        isOnline: table.isOnline,
        qrCodeUrl: table.qrCodeUrl || "",
        qrCodeImageUrl: table.qrCodeImageUrl || "",
        qrCodeGenerated: !!table.qrCodeUrl,
        images: table.images?.map((img) => img.url) || [],
      });
    } else {
      setFormData(initialFormData);
      setQrPreview(false);
    }
    setUploadedFiles([]);
  }, [mode, table, isOpen]);

  const handleChange = (
    field: keyof TableFormData,
    value: string | number | boolean | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert string IDs to numbers for submission
    const submitData: TableFormData = {
      ...formData,
      statusLvId: formData.statusLvId ? Number(formData.statusLvId) : "",
      typeLvId: formData.typeLvId ? Number(formData.typeLvId) : "",
      zoneLvId: formData.zoneLvId ? Number(formData.zoneLvId) : "",
    };
    // Append any newly uploaded files as blob URLs (P2 — no upload endpoint yet)
    const newImageUrls = uploadedFiles.map((f) => URL.createObjectURL(f));
    const allImages = [...(formData.images || []), ...newImageUrls];
    onSubmit({ ...submitData, images: allImages });
  };

  const handleDownloadQR = useCallback(() => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `qr-${formData.tableCode || "table"}.png`;
    link.href = url;
    link.click();
  }, [formData.tableCode]);

  // Remove existing image
  const handleRemoveExistingImage = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  }, []);

  return (
    <>
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={mode === "add" ? "Add New Table" : "Edit Table"}
      width="660px"
      footer={
        <div className="flex items-center gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="table-form"
            variant="primary"
            className="w-full"
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            {mode === "add" ? "Add Table" : "Save Changes"}
          </Button>
        </div>
      }
    >
      <form id="table-form" onSubmit={handleSubmit}>
        <div className="space-y-5 p-5">
          {/* Table Code + Capacity row */}
          <div className="grid grid-cols-2 gap-4">
            <ALInput
              title="Table Code"
              required
              placeholder="e.g. T-01"
              value={formData.tableCode}
              onChange={(e) => handleChange("tableCode", e.target.value)}
            />
            <ALInput
              title="Capacity"
              required
              type="number"
              min={1}
              max={20}
              value={formData.capacity}
              onChange={(e) =>
                handleChange("capacity", parseInt(e.target.value) || 1)
              }
            />
          </div>

          {/* Zone + Type row */}
          <div className="grid grid-cols-2 gap-4">
            <ALCombobox
              title="Zone"
              required
              options={zoneOptions}
              value={formData.zoneLvId ? String(formData.zoneLvId) : undefined}
              onChange={(val) => handleChange("zoneLvId", val ? Number(val) : "")}
              placeholder="Select zone"
              searchable
              isLoading={zonesLoading}
              allowCreate
              onCreateOption={(name) => {
                createZoneMutation.mutate({ valueName: name });
              }}
              titleAction={
                <button
                  type="button"
                  title="Manage zones"
                  onClick={() => setIsZoneManagerOpen(true)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  <Settings2 size={11} />
                  Manage
                </button>
              }
            />
            <ALCombobox
              title="Type"
              required
              options={typeOptions}
              value={formData.typeLvId ? String(formData.typeLvId) : undefined}
              onChange={(val) => handleChange("typeLvId", val ? Number(val) : "")}
              placeholder="Select type"
              searchable
              isLoading={typesLoading}
              allowCreate
              onCreateOption={(name) => {
                createTypeMutation.mutate({ valueName: name });
              }}
              titleAction={
                <button
                  type="button"
                  title="Manage table types"
                  onClick={() => setIsTypeManagerOpen(true)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  <Settings2 size={11} />
                  Manage
                </button>
              }
            />
          </div>

          {/* Status */}
          <ALCombobox
            title="Status"
            required
            options={STATIC_STATUS_OPTIONS}
            value={formData.statusLvId ? String(formData.statusLvId) : undefined}
            onChange={(val) => handleChange("statusLvId", val ? Number(val) : "")}
            placeholder="Select status"
            searchable={false}
          />

          {/* Online toggle */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <div>
              <p className="text-base font-medium text-gray-700">Online Status</p>
              <p className="text-xs text-gray-500">
                Table is visible to guests when online
              </p>
            </div>
            <Switch
              checked={formData.isOnline}
              onChange={(checked) => handleChange("isOnline", checked)}
            />
          </div>

          {/* QR Code Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                QR Code
              </h5>
              <div className="grow border-t border-gray-100" />
            </div>

            {mode === "add" ? (
              <p className="text-xs text-gray-400">
                A QR code is generated automatically when the table is created.
              </p>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                    onClick={() => table && regenerateQrMutation.mutate(table.tableId)}
                    disabled={regenerateQrMutation.isPending}
                  >
                    <RefreshCcw size={13} className={regenerateQrMutation.isPending ? "animate-spin" : ""} />
                    Regenerate QR
                  </button>
                  {formData.qrCodeGenerated && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadQR}
                      >
                        <Download size={13} className="mr-1" />
                        Download
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setQrPreview((v) => !v)}
                      >
                        <Eye size={13} className="mr-1" />
                        {qrPreview ? "Hide" : "Preview"}
                      </Button>
                    </>
                  )}
                </div>

                {formData.qrCodeGenerated && qrPreview && (
                  <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-4">
                    {formData.qrCodeImageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={formData.qrCodeImageUrl}
                        alt="QR code"
                        className="shrink-0 w-24 h-24 rounded bg-white p-1"
                      />
                    ) : (
                      <div ref={qrRef} className="shrink-0 bg-white rounded p-2">
                        <QRCodeCanvas
                          value={formData.qrCodeUrl || ""}
                          size={96}
                          level="M"
                        />
                      </div>
                    )}
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium text-gray-600">Status:</span>{" "}
                        Active
                      </p>
                      <p className="text-xs text-gray-500 break-all">
                        <span className="font-medium text-gray-600">Token:</span>{" "}
                        {formData.qrCodeUrl || "—"}
                      </p>
                    </div>
                  </div>
                )}

                {!formData.qrCodeGenerated && (
                  <p className="text-xs text-gray-400">
                    No QR code yet. Click “Regenerate QR” to create one.
                  </p>
                )}
              </>
            )}
          </div>

          {/* Media Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Media
              </h5>
              <div className="grow border-t border-gray-100" />
            </div>

            {/* Existing images (edit mode) */}
            {(formData.images?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.images!.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group/img w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(idx)}
                      className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/50 text-white opacity-0 group-hover/img:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New file upload */}
            <FileUpload
              value={uploadedFiles}
              onValueChange={setUploadedFiles}
              accept="image/*"
              multiple
              maxFiles={5}
              maxSize={5 * 1024 * 1024}
            >
              <FileUploadDropzone className="min-h-0 gap-1.5 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Upload size={16} />
                  <span>Drop images here or click to upload</span>
                </div>
                <p className="text-xs text-muted-foreground/70">
                  PNG, JPG up to 5MB each (max 5 files)
                </p>
              </FileUploadDropzone>
              <FileUploadList className="mt-2">
                {uploadedFiles.map((file) => (
                  <FileUploadItem key={file.name + file.size} value={file}>
                    <div className="flex items-center gap-2">
                      <FileUploadItemPreview className="size-10 shrink-0" />
                      <FileUploadItemMetadata size="sm" className="flex-1" />
                      <FileUploadItemDelete asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </FileUploadItemDelete>
                    </div>
                  </FileUploadItem>
                ))}
              </FileUploadList>
            </FileUpload>
          </div>
        </div>
      </form>
    </Dialog>

    {/* Zone manager — opens on top of this modal */}
    <LookupManagerModal
      isOpen={isZoneManagerOpen}
      onClose={() => setIsZoneManagerOpen(false)}
      type="zone"
      onCreated={(item) => {
        handleChange("zoneLvId", item.valueId);
        setIsZoneManagerOpen(false);
      }}
    />

    {/* Type manager */}
    <LookupManagerModal
      isOpen={isTypeManagerOpen}
      onClose={() => setIsTypeManagerOpen(false)}
      type="tableType"
      onCreated={(item) => {
        handleChange("typeLvId", item.valueId);
        setIsTypeManagerOpen(false);
      }}
    />
  </>
  );
};

export default TableModal;
