"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { RefreshCcw, Download, Eye, Upload, X, Trash2 } from "lucide-react";
import type {
  RestaurantTable,
  TableFormData,
  TableType,
  TableZone,
  TableStatus,
} from "../types";
import { ALL_TYPES, ALL_ZONES, ALL_STATUSES } from "../data";
import {
  TABLE_TYPE_LABELS,
  TABLE_ZONE_LABELS,
  TABLE_STATUS_CONFIG,
} from "../types";

interface TableModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  table?: RestaurantTable | null;
  onClose: () => void;
  onSubmit: (data: TableFormData) => void;
}

const initialFormData: TableFormData = {
  tableCode: "",
  capacity: 2,
  status: "",
  type: "",
  zone: "",
  isOnline: true,
  qrCodeUrl: "",
  qrCodeGenerated: false,
  images: [],
};

const TYPE_OPTIONS = ALL_TYPES.map((t) => ({
  label: TABLE_TYPE_LABELS[t],
  value: t,
}));

const ZONE_OPTIONS = ALL_ZONES.map((z) => ({
  label: TABLE_ZONE_LABELS[z],
  value: z,
}));

const STATUS_OPTIONS = ALL_STATUSES.map((s) => ({
  label: TABLE_STATUS_CONFIG[s].label,
  value: s,
}));

const TableModal: React.FC<TableModalProps> = ({
  isOpen,
  mode,
  table,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<TableFormData>(initialFormData);
  const [qrPreview, setQrPreview] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === "edit" && table) {
      setFormData({
        tableCode: table.tableCode,
        capacity: table.capacity,
        status: table.status,
        type: table.type,
        zone: table.zone,
        isOnline: table.isOnline,
        qrCodeUrl: table.qrCodeUrl || "",
        qrCodeGenerated: table.qrCodeGenerated || !!table.qrCodeUrl,
        images: table.images || [],
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
    const newImageUrls = uploadedFiles.map((f) => URL.createObjectURL(f));
    const allImages = [...(formData.images || []), ...newImageUrls];
    onSubmit({ ...formData, images: allImages });
    onClose();
  };

  // QR Code handlers
  const qrUrl = formData.tableCode
    ? `/order?table=${formData.tableCode}`
    : "";

  const handleGenerateQR = useCallback(() => {
    if (!formData.tableCode) return;
    setFormData((prev) => ({
      ...prev,
      qrCodeUrl: qrUrl,
      qrCodeGenerated: true,
    }));
    setQrPreview(true);
  }, [formData.tableCode, qrUrl]);

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
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="table-form"
            variant="primary"
            className="w-full"
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
              options={ZONE_OPTIONS}
              value={formData.zone || undefined}
              onChange={(val) => handleChange("zone", val as TableZone)}
              placeholder="Select zone"
              searchable={false}
            />
            <ALCombobox
              title="Type"
              required
              options={TYPE_OPTIONS}
              value={formData.type || undefined}
              onChange={(val) => handleChange("type", val as TableType)}
              placeholder="Select type"
              searchable={false}
            />
          </div>

          {/* Status */}
          <ALCombobox
            title="Status"
            required
            options={STATUS_OPTIONS}
            value={formData.status || undefined}
            onChange={(val) => handleChange("status", val as TableStatus)}
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

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateQR}
                disabled={!formData.tableCode}
              >
                <RefreshCcw size={13} className="mr-1" />
                Generate QR
              </Button>
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
                <div ref={qrRef} className="shrink-0 bg-white rounded p-2">
                  <QRCodeCanvas
                    value={formData.qrCodeUrl || qrUrl}
                    size={96}
                    level="M"
                  />
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-xs text-gray-500">
                    <span className="font-medium text-gray-600">Status:</span>{" "}
                    Generated
                  </p>
                  <p className="text-xs text-gray-500 break-all">
                    <span className="font-medium text-gray-600">URL:</span>{" "}
                    {formData.qrCodeUrl || qrUrl}
                  </p>
                </div>
              </div>
            )}

            {!formData.qrCodeGenerated && (
              <p className="text-xs text-gray-400">
                Enter a table code and click Generate to create a QR code.
              </p>
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
  );
};

export default TableModal;
