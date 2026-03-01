import React from "react";
import Image from "next/image";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
    <Dialog
      open={isOpen}
      onClose={onClose}
      width="400px"
      footer={
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
            disabled={isDeleting}
          >
            Close
          </Button>
          <Button
            variant="danger"
            className="w-full"
            onClick={onConfirm}
            disabled={isDeleting}
            isLoading={isDeleting}
          >
            Delete
          </Button>
        </div>
      }
    >
      <div className="text-center py-2">
        <div className="mb-4">
          <span className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50">
            <Image
              src="/assets/img/icons/trash-icon.svg"
              alt="trash"
              width={40}
              height={40}
              className="w-auto h-auto"
            />
          </span>
        </div>
        <h4 className="text-lg font-semibold mb-1">Delete Confirmation</h4>
        <p className="text-gray-500">
          {table
            ? `Are you sure you want to delete table "${table.tableCode}"?`
            : "Are you sure you want to delete?"}
        </p>
        {table && table.activeOrders > 0 && (
          <p className="text-sm text-amber-600 mt-2">
            ⚠ This table has {table.activeOrders} active order
            {table.activeOrders > 1 ? "s" : ""}. Deletion may be blocked.
          </p>
        )}
      </div>
    </Dialog>
  );
};

export default DeleteModal;
