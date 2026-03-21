"use client";

import { useMemo, useState, useCallback, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ALCard } from "@/components/ui/al-card";
import { ALConfirmDialog } from "@/components/ui/al-confirm-dialog";
import { BaseTable } from "@/components/ui/table/base-table";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";
import type { TableColumn } from "@/types/table.types";
import type { TableDataChangeParams } from "@/types/table-data-change.types";
import {
  useDeactivateShiftTemplateMutation,
  useShiftTemplatesQuery,
} from "../hooks/use-shift-queries";
import { ShiftTemplateForm } from "./shift-template-form";
import { TableActionColumn, TableAction } from "@/components/ui/table/table-action-column";
import type { ShiftTemplateDto } from "../types/shift-management.types";

function fmtTime(value: string) {
  return value?.slice(0, 5) || "--:--";
}

export function ShiftTemplateList() {
  const t = useTranslations("shift.schedule.template");
  const dialogT = useTranslations("shift.schedule.template.confirmDialog");
  const [tableParams, setTableParams] = useState<TableDataChangeParams>({
    page: 1,
    pageSize: 10,
  });

  const handleTableDataChange = useCallback((next: TableDataChangeParams) => {
    setTableParams((prev) => {
      const isSame =
        prev.search === next.search &&
        (prev.page ?? 1) === (next.page ?? 1) &&
        (prev.pageSize ?? 10) === (next.pageSize ?? 10) &&
        JSON.stringify(prev.filters ?? {}) === JSON.stringify(next.filters ?? {}) &&
        JSON.stringify(prev.sort ?? []) === JSON.stringify(next.sort ?? []);

      return isSame ? prev : next;
    });
  }, []);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ShiftTemplateDto | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<ShiftTemplateDto | null>(null);

  const params = useMemo(
    () => ({
      keyword: tableParams.search?.trim() || undefined,
      pageIndex: tableParams.page ?? 1,
      pageSize: tableParams.pageSize ?? 10,
    }),
    [tableParams.page, tableParams.pageSize, tableParams.search]
  );

  const { data, isLoading, refetch } = useShiftTemplatesQuery(params);
  const deactivate = useDeactivateShiftTemplateMutation();
  const templates = data ?? [];

  const activeCount = useMemo(
    () => templates.filter((template) => template.isActive).length,
    [templates]
  );

  const inactiveCount = useMemo(
    () => templates.filter((template) => !template.isActive).length,
    [templates]
  );

  function openCreate() {
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(template: ShiftTemplateDto) {
    setEditTarget(template);
    setFormOpen(true);
  }

  function handleDeactivate(template: ShiftTemplateDto) {
    if (!template.isActive) return;
    setDeactivateTarget(template);
  }

  const columns = useMemo<TableColumn[]>(
    () => [
      {
        field: "rowNo",
        header: "No",
        width: "72px",
        align: "center",
        sortable: false,
        cellRender: ({ rowIndex }) =>
          ((tableParams.page ?? 1) - 1) * (tableParams.pageSize ?? 10) + rowIndex + 1,
      },
      {
        field: "templateName",
        header: "Template",
        sortable: false,
      },
      {
        field: "defaultTime",
        header: "Default Time",
        sortable: false,
        cellRender: ({ item }) => `${fmtTime(item.defaultStartTime)} - ${fmtTime(item.defaultEndTime)}`,
      },
      {
        field: "description",
        header: "Description",
        sortable: false,
        cellRender: ({ value }) => value || "--",
      },
      {
        field: "isActive",
        header: "Status",
        width: "120px",
        sortable: false,
        cellRender: ({ item }) => (
          <Badge
            variant={item.isActive ? "default" : "secondary"}
            className={item.isActive ? "bg-emerald-600 text-white" : "bg-slate-700 text-white"}
          >
            {item.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
    ],
    [tableParams.page, tableParams.pageSize]
  );

  const handleGlobalRenderCell = (
    value: unknown,
    item: ShiftTemplateDto,
    column: TableColumn,
    rowIndex: number
  ) => {
    const content = column.cellRender
      ? column.cellRender({ value, item, column, rowIndex })
      : value;

    if (column.align) {
      return <div style={{ textAlign: column.align }}>{content as ReactNode}</div>;
    }
    return content as ReactNode;
  };

  return (
    <div>
      <BaseTable<ShiftTemplateDto>
        data={templates}
        loading={isLoading}
        columns={columns}
        rowKey="shiftTemplateId"
        total={data?.length ?? 0}
        onDataChange={handleTableDataChange}
        onRefresh={refetch}
        searchPlaceholder={t("searchPlaceholder")}
        defaultRowsPerPage={10}
        rowsPerPageOptions={[10, 20, 50, 100]}
        renderTitle={() => (
          <div className="w-full space-y-3">
            <ALCard className="flex flex-wrap items-start justify-between gap-3 px-4 py-4 sm:px-5">
              <div>
                <h1 className="text-2xl font-semibold tracking-wide text-[#1A3A52]">{t("title")}</h1>
                <p className="text-sm text-[#1A3A52]/70">
                  {t("description")}
                </p>
              </div>
              <PermissionGuard permission={Permissions.ManageShiftTemplate}>
                <Button onClick={openCreate} className="gap-2 bg-[#1A3A52] text-[#FDFBF9] hover:bg-[#1A3A52]/90">
                  <Plus className="h-4 w-4" />
                  {t("create")}
                </Button>
              </PermissionGuard>
            </ALCard>

            <ALCard padding="sm" className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full border border-emerald-600 bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                {t("activeCount", { count: activeCount })}
              </span>
              <span className="rounded-full border border-slate-700 bg-slate-700 px-3 py-1 text-xs font-semibold text-white">
                {t("inactiveCount", { count: inactiveCount })}
              </span>
              <span className="ml-auto text-xs text-[#1A3A52]/60">
                {t("totalCount", { count: templates.length })}
              </span>
            </ALCard>
          </div>
        )}
        renderCell={handleGlobalRenderCell}
        renderActionColumn={(template) => {
          const actions: TableAction<ShiftTemplateDto>[] = [
            {
              action: "edit",
              onClick: () => openEdit(template),
              permission: Permissions.ManageShiftTemplate,
            },
          ];

          if (template.isActive) {
            actions.push({
              action: "deactivate",
              onClick: () => handleDeactivate(template),
              permission: Permissions.ManageShiftTemplate,
            });
          }

          return <TableActionColumn actions={actions} item={template} />;
        }}
      />

      <ShiftTemplateForm open={formOpen} onClose={() => setFormOpen(false)} editTarget={editTarget} />

      <ALConfirmDialog
        isOpen={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={() => {
          if (!deactivateTarget) return;
          deactivate.mutate(deactivateTarget.shiftTemplateId, {
            onSettled: () => setDeactivateTarget(null),
          });
        }}
        title={dialogT("title")}
        message={dialogT("message", { name: deactivateTarget?.templateName ?? "" })}
        cancelText={dialogT("cancel")}
        confirmText={dialogT("confirm")}
        isLoading={deactivate.isPending}
        variant="warning"
      />
    </div>
  );
}
