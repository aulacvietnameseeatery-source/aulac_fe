"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Dialog } from "@/components/ui/dialog";
import { ALInput } from "@/components/ui/al-input";
import { Button } from "@/components/ui/button";
import { useCreateZoneMutation } from "../hooks/use-table-queries";

interface AddZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-fill zone name (e.g. when quick-creating from combobox) */
  defaultName?: string;
  /** Called after successful creation with the new zone's valueId */
  onCreated?: (valueId: number) => void;
}

export const AddZoneModal: React.FC<AddZoneModalProps> = ({
  isOpen,
  onClose,
  defaultName = "",
  onCreated,
}) => {
  const t = useTranslations("tableManagement");
  const [zoneName, setZoneName] = useState(defaultName);

  useEffect(() => {
    if (isOpen) setZoneName(defaultName);
  }, [isOpen, defaultName]);

  const createMutation = useCreateZoneMutation({
    onSuccess: (data) => {
      onCreated?.(data.valueId);
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName.trim()) return;
    createMutation.mutate({ valueName: zoneName.trim() });
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={t("zone.addTitle")}
      width="400px"
      footer={
        <div className="flex items-center gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onClose}
            disabled={createMutation.isPending}
          >
            {t("actions.cancel")}
          </Button>
          <Button
            type="submit"
            form="add-zone-form"
            variant="primary"
            className="w-full"
            disabled={!zoneName.trim() || createMutation.isPending}
            isLoading={createMutation.isPending}
          >
            {t("actions.createZone")}
          </Button>
        </div>
      }
    >
      <form id="add-zone-form" onSubmit={handleSubmit}>
        <div className="p-5 space-y-4">
          <ALInput
            title={t("zone.name")}
            required
            placeholder={t("zone.namePlaceholder")}
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
            autoFocus
          />
          <p className="text-xs text-gray-400">
            {t("zone.createHint")}
          </p>
        </div>
      </form>
    </Dialog>
  );
};

export default AddZoneModal;
