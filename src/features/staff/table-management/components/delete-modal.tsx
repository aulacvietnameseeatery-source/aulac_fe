"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ALConfirmDialog } from "@/components/ui/al-confirm-dialog";
import type { RestaurantTable } from "../types";

interface DeleteModalProps {
  isOpen: boolean;
  table?: RestaurantTable | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  table,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  const t = useTranslations("tableManagement");
  return (
    <ALConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      variant="delete"
      title={t("delete.title")}
      message={
        table
          ? t("delete.confirmWithCode", { tableCode: table.tableCode })
          : t("delete.confirm")
      }
      isLoading={isDeleting}
    >
      {table && table.activeOrders > 0 && (
        <p className="text-sm text-amber-600">
          {t("delete.activeOrdersWarning", { count: table.activeOrders })}
        </p>
      )}
    </ALConfirmDialog>
  );
};

export default DeleteModal;
