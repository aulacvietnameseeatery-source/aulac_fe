"use client";

import React from "react";
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
  return (
    <ALConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      variant="delete"
      title="Delete Confirmation"
      message={
        table
          ? `Are you sure you want to delete table "${table.tableCode}"?`
          : "Are you sure you want to delete?"
      }
      isLoading={isDeleting}
    >
      {table && table.activeOrders > 0 && (
        <p className="text-sm text-amber-600">
          ⚠ This table has {table.activeOrders} active order
          {table.activeOrders > 1 ? "s" : ""}. Deletion may be blocked.
        </p>
      )}
    </ALConfirmDialog>
  );
};

export default DeleteModal;
