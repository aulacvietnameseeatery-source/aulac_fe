"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Dialog } from "@/components/ui/dialog";
import { ALInput } from "@/components/ui/al-input";
import { ALCombobox } from "@/components/ui/al-combobox"; // used for static Status field (not a lookup entity)
import { ALFileUploader } from "@/components/ui/al-file-uploader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RefreshCcw, Download, Eye, EyeOff, ImageOff } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import type { RestaurantTable, TableFormData, TableStatus } from "../types";
import { TABLE_STATUS_CONFIG, TABLE_STATUS_LV_IDS } from "../types";
import {
  useRegenerateQrMutation,
} from "../hooks/use-table-queries";
import { LOOKUP_TYPE, useLookupCrud, LookupCombobox } from "@/features/lookup";

interface TableModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  table?: RestaurantTable | null;
  onClose: () => void;
  onSubmit: (data: TableFormData, pendingFiles: File[], removedImageIds: number[]) => void;
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
  const t = useTranslations("tableManagement");
  const [formData, setFormData] = useState<TableFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<"tableCode" | "capacity" | "zoneLvId" | "typeLvId" | "statusLvId", string>>
  >({});
  const [qrPreview, setQrPreview] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  // ── Fetch lookup values via shared useLookupCrud ──
  const zoneLookup = useLookupCrud({
    typeId:      LOOKUP_TYPE.TableZone,
    queryKey:    ["lookups", "table-zone"],
    entityLabel: "Zone",
    typeLabel:   "Zone",
  });
  const typeLookup = useLookupCrud({
    typeId:      LOOKUP_TYPE.TableType,
    queryKey:    ["lookups", "table-type"],
    entityLabel: t("fields.type"),
    typeLabel:   t("fields.type"),
  });

  const statusLabelMap: Record<TableStatus, string> = {
    AVAILABLE: t("status.available"),
    OCCUPIED: t("status.occupied"),
    RESERVED: t("status.reserved"),
    LOCKED: t("status.locked"),
  };

  // ── Static status options — statuses are fixed; value = numeric statusLvId ──
  const STATIC_STATUS_OPTIONS = (Object.keys(TABLE_STATUS_CONFIG) as TableStatus[]).map((s) => ({
    label: statusLabelMap[s],
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
        images: table.images ?? [],
      });
      // Auto-show QR preview when editing a table that already has a QR image
      setQrPreview(!!table.qrCodeImageUrl);
    } else {
      setFormData(initialFormData);
      setQrPreview(false);
    }
    setPendingFiles([]);
    setRemovedImageIds([]);
  }, [mode, table, isOpen]);

  const handleChange = (
    field: keyof TableFormData,
    value: string | number | boolean | string[]
  ) => {
    if (field in formErrors) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const nextErrors: typeof formErrors = {};

    if (!String(formData.tableCode ?? "").trim()) {
      nextErrors.tableCode = t("validation.tableCodeRequired");
    }
    if (!Number(formData.capacity) || Number(formData.capacity) < 1) {
      nextErrors.capacity = t("validation.capacityMin");
    }
    if (!formData.zoneLvId) {
      nextErrors.zoneLvId = t("validation.zoneRequired");
    }
    if (!formData.typeLvId) {
      nextErrors.typeLvId = t("validation.typeRequired");
    }
    if (!formData.statusLvId) {
      nextErrors.statusLvId = t("validation.statusRequired");
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t("validation.fixHighlighted"));
      return;
    }

    // Convert string IDs to numbers for submission
    const submitData: TableFormData = {
      ...formData,
      statusLvId: formData.statusLvId ? Number(formData.statusLvId) : "",
      typeLvId: formData.typeLvId ? Number(formData.typeLvId) : "",
      zoneLvId: formData.zoneLvId ? Number(formData.zoneLvId) : "",
    };
    // Images and removals are bundled into the create/update request by the parent
    onSubmit(submitData, pendingFiles, removedImageIds);
  };

  const handleDownloadQR = useCallback(async () => {
    if (!formData.qrCodeImageUrl) return;
    try {
      const response = await fetch(formData.qrCodeImageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `qr-${formData.tableCode || "table"}.png`;
      link.href = blobUrl;
      link.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback: open in new tab
      window.open(formData.qrCodeImageUrl, "_blank");
    }
  }, [formData.qrCodeImageUrl, formData.tableCode]);

  return (
    <>
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={mode === "add" ? t("modal.addTitle") : t("modal.editTitle")}
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
            {t("actions.cancel")}
          </Button>
          <Button
            type="submit"
            form="table-form"
            variant="primary"
            className="w-full"
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            {mode === "add" ? t("actions.addTable") : t("actions.saveChanges")}
          </Button>
        </div>
      }
    >
      <form id="table-form" onSubmit={handleSubmit}>
        <div className="space-y-5 p-5">
          {/* Table Code + Capacity row */}
          <div className="grid grid-cols-2 gap-4">
            <ALInput
              title={t("fields.tableCode")}
              required
              placeholder={t("fields.tableCodePlaceholder")}
              value={formData.tableCode}
              error={formErrors.tableCode}
              onChange={(e) => handleChange("tableCode", e.target.value)}
            />
            <ALInput
              title={t("fields.capacity")}
              required
              type="number"
              min={1}
              max={20}
              value={formData.capacity}
              error={formErrors.capacity}
              onChange={(e) =>
                handleChange("capacity", parseInt(e.target.value) || 1)
              }
            />
          </div>

          {/* Zone + Type row */}
          <div className="grid grid-cols-2 gap-4">
            <LookupCombobox
              lookup={zoneLookup}
              title={t("fields.zone")}
              required
              placeholder={t("fields.selectZone")}
              value={formData.zoneLvId}
              error={formErrors.zoneLvId}
              onChange={(val) =>
                handleChange("zoneLvId", Array.isArray(val) ? "" : val)
              }
            />
            <LookupCombobox
              lookup={typeLookup}
              title={t("fields.type")}
              required
              placeholder={t("fields.selectType")}
              value={formData.typeLvId}
              error={formErrors.typeLvId}
              onChange={(val) =>
                handleChange("typeLvId", Array.isArray(val) ? "" : val)
              }
            />
          </div>

          {/* Status */}
          <ALCombobox
            title={t("fields.status")}
            required
            options={STATIC_STATUS_OPTIONS}
            value={formData.statusLvId ? String(formData.statusLvId) : undefined}
            onChange={(val) => handleChange("statusLvId", val ? Number(val as string) : "")}
            placeholder={t("fields.selectStatus")}
            error={formErrors.statusLvId}
            searchable={false}
          />

          {/* Online toggle */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <div>
              <p className="text-base font-medium text-gray-700">{t("fields.onlineStatus")}</p>
              <p className="text-xs text-gray-500">
                {t("fields.onlineStatusHint")}
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
                {t("qr.title")}
              </h5>
              <div className="grow border-t border-gray-100" />
            </div>

            {mode === "add" ? (
              /* Client-side QR preview — updates live as the user types the table code */
              <div className="space-y-2">
                {formData.tableCode.trim() ? (
                  <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-4">
                    <div className="shrink-0 rounded bg-white p-1.5">
                      <QRCodeSVG
                        value={`${typeof window !== "undefined" ? window.location.origin : ""}/menu-listing?table=${encodeURIComponent(formData.tableCode.trim())}`}
                        size={80}
                        level="M"
                      />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-medium text-gray-600">Preview QR Code</p>
                      <p className="text-[10px] text-gray-400 break-all">
                        {t("qr.encodes")} /menu-listing?table={formData.tableCode.trim()}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {t("qr.serverTokenHint")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">
                    {t("qr.enterTableCode")}
                  </p>
                )}
              </div>
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
                    {t("qr.regenerate")}
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
                        {t("qr.download")}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setQrPreview((v) => !v)}
                      >
                        {qrPreview ? (
                          <><EyeOff size={13} className="mr-1" />{t("qr.hide")}</>
                        ) : (
                          <><Eye size={13} className="mr-1" />{t("qr.preview")}</>
                        )}
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
                      <div className="shrink-0 w-24 h-24 rounded bg-white p-2 flex items-center justify-center">
                        <ImageOff className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium text-gray-600">{t("fields.status")}:</span>{" "}
                        {t("qr.active")}
                      </p>
                      <p className="text-xs text-gray-500 break-all">
                        <span className="font-medium text-gray-600">{t("qr.token")}:</span>{" "}
                        {formData.qrCodeUrl || "—"}
                      </p>
                    </div>
                  </div>
                )}

                {!formData.qrCodeGenerated && (
                  <p className="text-xs text-gray-400">
                    {t("qr.noCodeYet")}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Media Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                {t("media.title")}
              </h5>
              <div className="grow border-t border-gray-100" />
            </div>

            <ALFileUploader
                  existingFiles={(formData.images ?? []).map((img) => ({
                    id: img.mediaId,
                    url: img.url,
                    isPrimary: img.isPrimary,
                  }))}
                  onDeleteExisting={(id) => {
                    const numId = Number(id);
                    // Mark for removal (sent on submit) and hide optimistically
                    setRemovedImageIds((prev) => [...prev, numId]);
                    setFormData((prev) => ({
                      ...prev,
                      images: (prev.images ?? []).filter(
                        (img) => img.mediaId !== numId
                      ),
                    }));
                  }}
                  deletingExistingId={null}
                  pendingFiles={pendingFiles}
                  onPendingChange={setPendingFiles}
                  isUploading={isSubmitting}
                  accept="image/*"
                  acceptHint={["PNG", "JPG", "GIF", "WEBP"]}
                  maxFiles={5}
                  maxSizeBytes={5 * 1024 * 1024}
                  variant="image"
                  disabled={isSubmitting}
                />
          </div>
        </div>
      </form>
    </Dialog>

  </>
  );
};

export default TableModal;
