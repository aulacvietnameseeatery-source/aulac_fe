"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, QrCode, CalendarClock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import type { RestaurantTable, TableStatus } from "../types";
import {
  TABLE_STATUS_CONFIG,
  ALLOWED_TRANSITIONS,
  canTransitionTo,
} from "../types";
import { useTableDetailQuery } from "../hooks/use-table-queries";
import StatusBadge from "./status-badge";

interface TableDetailPanelProps {
  table: RestaurantTable | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (table: RestaurantTable) => void;
  onDelete: (table: RestaurantTable) => void;
  onStatusChange?: (tableId: number, status: TableStatus) => void;
}

const ALL_STATUSES: TableStatus[] = ["AVAILABLE", "OCCUPIED", "RESERVED", "LOCKED"];

export const TableDetailPanel: React.FC<TableDetailPanelProps> = ({
  table,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  // Fetch full detail when panel is open
  const { data: detailData } = useTableDetailQuery(
    isOpen && table ? table.tableId : null
  );

  if (!table) return null;

  const config = TABLE_STATUS_CONFIG[table.status] ?? TABLE_STATUS_CONFIG.AVAILABLE;

  // Use detail data for enriched fields, fall back to list data
  const activeOrdersCount = detailData?.activeOrdersCount ?? table.activeOrders;
  const hasErrors = detailData?.hasErrors ?? table.hasErrors;
  const upcomingReservations = detailData?.upcomingReservations ?? [];
  const images = detailData?.images ?? table.images ?? [];
  const qrCodeUrl = detailData?.qrCodeUrl ?? table.qrCodeUrl;
  const qrCodeImageUrl = detailData?.qrCodeImageUrl ?? table.qrCodeImageUrl;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()} direction="right">
      <DrawerContent className="h-full w-full max-w-md ml-auto rounded-none data-[vaul-drawer-direction=right]:sm:max-w-md">
        {/* Header */}
        <DrawerHeader className="border-b px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DrawerTitle className={cn("text-2xl font-bold", config.textColor)}>
                {table.tableCode}
              </DrawerTitle>
              <span
                className={cn(
                  "text-xs font-medium px-1.5 py-0.5 rounded",
                  table.isOnline
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-gray-100 text-gray-400"
                )}
              >
                {table.isOnline ? "Online" : "Offline"}
              </span>
            </div>
            <DrawerClose className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600" />
          </div>
          <DrawerDescription className="sr-only">
            Details for table {table.tableCode}
          </DrawerDescription>
          <div className="mt-2">
            <StatusBadge status={table.status} size="md" />
          </div>
        </DrawerHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Table image */}
          {images.length > 0 && (
            <div className="relative w-full h-44 rounded-lg overflow-hidden bg-gray-50">
              <Image
                src={images[0].url}
                alt={table.tableCode}
                fill
                className="object-cover"
                sizes="400px"
              />
            </div>
          )}

          {/* Details section */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Details
            </h5>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Zone" value={table.zoneName} />
              <InfoRow label="Type" value={table.typeName} />
              <InfoRow label="Capacity" value={`${table.capacity} seats`} />
              <InfoRow
                label="Connection"
                value={table.isOnline ? "Online" : "Offline"}
                valueClassName={
                  table.isOnline ? "text-emerald-600" : "text-gray-400"
                }
              />
            </div>
          </div>

          {/* Active Orders */}
          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Active Orders
            </h5>
            {activeOrdersCount > 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                {activeOrdersCount} active order
                {activeOrdersCount > 1 ? "s" : ""} on this table
              </div>
            ) : (
              <p className="text-sm text-gray-400">No active orders</p>
            )}
          </div>

          {/* Error info */}
          {hasErrors && (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Errors
              </h5>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                This table has reported errors that need attention.
              </div>
            </div>
          )}

          {/* Upcoming Reservations */}
          {upcomingReservations.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarClock size={13} />
                Upcoming Reservations ({upcomingReservations.length})
              </h5>
              <div className="space-y-2">
                {upcomingReservations.map((r) => (
                  <div
                    key={r.reservationId}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/60 p-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <User size={14} className="text-gray-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {r.guestName}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {r.pax} pax &middot;{" "}
                          {new Date(r.reservedTime).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap",
                        r.statusCode === "CONFIRMED"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {r.statusCode === "CONFIRMED" ? "Confirmed" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QR Code */}
          {(qrCodeUrl || qrCodeImageUrl) && (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                QR Code
              </h5>
              <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center gap-2">
                {qrCodeImageUrl ? (
                  <Image
                    src={qrCodeImageUrl}
                    alt="QR Code"
                    width={96}
                    height={96}
                    className="rounded"
                  />
                ) : (
                  <QrCode size={64} className="text-gray-600" />
                )}
                {qrCodeUrl && (
                  <span className="text-xs text-gray-400 break-all text-center">
                    {qrCodeUrl}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Quick status change */}
          {onStatusChange && (
            <PermissionGuard permission={Permissions.UpdateTableStatus}>
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Quick Status Change
                </h5>
                <div className="flex flex-wrap gap-2">
                  {ALL_STATUSES.map((status) => {
                    const actionConf = TABLE_STATUS_CONFIG[status];
                    const isActive = table.status === status;
                    const isAllowed =
                      isActive || canTransitionTo(table.status, status);
                    return (
                      <button
                        key={status}
                        disabled={isActive || !isAllowed}
                        onClick={() =>
                          onStatusChange(
                            table.tableId,
                            status
                          )
                        }
                        className={cn(
                          "text-xs px-3 py-1.5 rounded-full border transition-colors font-medium",
                          isActive
                            ? cn(
                                actionConf.bgColor,
                                actionConf.borderColor,
                                actionConf.textColor,
                                "cursor-default"
                              )
                            : !isAllowed
                            ? "border-gray-100 text-gray-300 cursor-not-allowed opacity-50"
                            : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block w-1.5 h-1.5 rounded-full mr-1.5",
                            actionConf.dotColor
                          )}
                        />
                        {actionConf.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </PermissionGuard>
          )}
        </div>

        {/* Footer actions */}
        <DrawerFooter className="border-t bg-gray-50 flex-row gap-3">
          <PermissionGuard permission={Permissions.EditTable}>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onEdit(table)}
            >
              <Pencil size={14} className="mr-1.5" />
              Edit
            </Button>
          </PermissionGuard>
          <PermissionGuard permission={Permissions.DeleteTable}>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => onDelete(table)}
            >
              <Trash2 size={14} className="mr-1.5" />
              Delete
            </Button>
          </PermissionGuard>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

function InfoRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className={cn("text-sm font-medium text-gray-700", valueClassName)}>
        {value}
      </p>
    </div>
  );
}

export default TableDetailPanel;
