"use client";

import React, { Suspense, useCallback, useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { ConfirmModal } from "@/components/layout/admin-sidebar/confirm-modal";
import { ProtectedRoute } from "@/components/protected-route";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useDishList } from "@/features/staff/dish-management/hooks/use-dish-list";
import { DishManagementDto, DishStatusCode } from "@/features/staff/dish-management/types/dish-types";
import { DishActions } from "@/features/staff/dish-management/components/dish-actions";
import { staffDishService } from "@/features/staff/dish-management/services/dish-service";

const DishListContent = () => {
  const t = useTranslations("Dish.List");

  // Data-fetching hook (driven by BaseTable onDataChange)
  const { dishes, isLoading, totalCount, paginationInfo, onDataChange, refresh, filterOptions, updateDishLocally } =
    useDishList();

  // ---- Dialog state ----
  const [dialogState, setDialogState] = useState({
    open: false,
    mode: "view" as "view" | "edit" | "create",
    dishId: null as number | null,
  });

  const openDialog = (mode: "view" | "edit" | "create", dishId: number | null = null) => {
    setDialogState({ open: true, mode, dishId });
  };
  const closeDialog = () => {
    setDialogState({ open: false, mode: "view", dishId: null });
  };

  // Status toggle state
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Action Handlers
  const handleView = (dish: DishManagementDto) => openDialog("view", dish.dishId);
  const handleEdit = (dish: DishManagementDto) => openDialog("edit", dish.dishId);
  const handleCreate = () => openDialog("create");

  // Handle Status Toggle (Available <-> Hidden)
  const handleStatusToggle = async (dish: DishManagementDto, checked: boolean) => {
    setTogglingId(dish.dishId);
    try {
      const newStatusCode = checked ? "AVAILABLE" : "HIDDEN";
      const newStatusId = checked ? DishStatusCode.AVAILABLE : DishStatusCode.HIDDEN;

      // Optimistic Update
      const updatedDish: DishManagementDto = {
        ...dish,
        statusId: newStatusId,
        status: newStatusCode
      };
      updateDishLocally(updatedDish);

      // API Call
      await staffDishService.updateDishStatus(dish.dishId, newStatusCode);
      toast.success(t("notifications.statusUpdated"));
    } catch (error: any) {
      console.error("Update status failed:", error);
      const errorMessage = error.response?.data?.userMessage || t("notifications.statusUpdateError");
      toast.error(errorMessage);

      // Revert on failure
      refresh();
    } finally {
      setTogglingId(null);
    }
  };

  // ---- Column filter options (derived from API data) ----
  const categoryFilterOptions = useMemo(
    () => filterOptions.categories.map((cat) => ({ label: cat, value: cat })),
    [filterOptions.categories]
  );

  const statusFilterOptions = useMemo(
    () =>
      filterOptions.statuses.map((s) => ({
        label: s.statusName,
        value: String(s.statusId),
      })),
    [filterOptions.statuses]
  );

  // Status Badge Render
  const renderStatusBadge = (statusId: number, statusName: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" = "outline";
    switch (statusId) {
      case 42:
        variant = "success";
        break;
      case 43:
        variant = "warning";
        break;
      case 44:
        variant = "secondary";
        break;
      default:
        variant = "outline";
    }
    return (
      <Badge variant={variant} className="font-bold">
        {statusName}
      </Badge>
    );
  };

  // ---- Table Columns with built-in filterType + filterOptions ----
  const columns: TableColumn[] = useMemo(
    () => [
      {
        field: "no",
        header: t("table.no"),
        width: "70px",
        align: "center" as const,
        sortable: false,
        cellRender: ({ rowIndex }: { rowIndex: number }) =>
          (paginationInfo.page - 1) * paginationInfo.pageSize + rowIndex + 1,
      },
      {
        field: "dishName",
        header: t("table.dishName"),
        width: "250px",
        filterType: "text" as const,
        cellRender: ({ value, item }: { value: any; item: any }) => (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{value}</span>
            {item.isOnline && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
              </span>
            )}
          </div>
        ),
      },
      {
        field: "categoryName",
        header: t("table.category"),
        width: "150px",
        filterType: "select" as const,
        filterOptions: categoryFilterOptions,
        cellRender: ({ value }: { value: any }) => (
          <span className="text-gray-600">{value}</span>
        ),
      },
      {
        field: "price",
        header: t("table.price"),
        width: "120px",
        align: "right" as const,
        filterType: "number" as const,
        cellRender: ({ value }: { value: any }) => (
          <span className="font-bold text-blue-600">
            ${typeof value === "number" ? value.toFixed(2) : value}
          </span>
        ),
      },
      {
        field: "status",
        header: t("table.status"),
        align: "center" as const,
        width: "130px",
        filterType: "select" as const,
        filterOptions: statusFilterOptions,
        cellRender: ({ value, item }: { value: any; item: any }) => (
          <div className="flex justify-center">
            <Switch
              checked={item.statusId === DishStatusCode.AVAILABLE}
              onChange={(checked) => handleStatusToggle(item, checked)}
              disabled={togglingId === item.dishId}
              showLabel={false}
            />
          </div>
        ),
      },
    ],
    [paginationInfo.page, paginationInfo.pageSize, t, categoryFilterOptions, statusFilterOptions]
  );

  // Global cell renderer (applies column alignment)
  const handleGlobalRenderCell = useCallback(
    (field: string, value: any, item: DishManagementDto, column: TableColumn, rowIndex: number) => {
      const content = column.cellRender
        ? column.cellRender({ value, item, column, rowIndex })
        : value;
      return column.align ? <div style={{ textAlign: column.align }}>{content}</div> : content;
    },
    []
  );

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <BaseTable<DishManagementDto>
        data={dishes}
        loading={isLoading}
        columns={columns}
        rowKey="dishId"
        total={totalCount}
        onDataChange={onDataChange}
        onRefresh={refresh}
        searchPlaceholder={t("searchPlaceholder")}
        defaultRowsPerPage={10}
        rowsPerPageOptions={[10, 20, 50]}
        renderTitle={() => (
          <div className="flex justify-between items-center w-full">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {t("title")}
              </h1>
              <p className="text-sm text-gray-500 mt-1">{t("description")}</p>
            </div>
            <PermissionGuard permission={Permissions.CreateDish}>
              <Button
                onClick={handleCreate}
                variant="outline"
                className="shadow-md whitespace-nowrap bg-blue-600 text-white hover:bg-blue-700 border-none"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("addNew")}
              </Button>
            </PermissionGuard>
          </div>
        )}
        renderCell={handleGlobalRenderCell}
        renderActionColumn={(item) => (
          <DishActions
            dish={item}
            onView={handleView}
            onEdit={handleEdit}
          />
        )}
      />

      {/* Dialogs & Modals */}
      {/* <DishDialog ... /> */}
    </div>
  );
};

export default function DishListPage() {
  return (
    <ProtectedRoute permission={Permissions.ViewDish}>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="animate-spin text-gray-400" />
          </div>
        }
      >
        <DishListContent />
      </Suspense>
    </ProtectedRoute>
  );
}
