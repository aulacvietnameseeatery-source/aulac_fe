"use client";

import { useMemo, useState, useCallback, type ReactNode } from "react";
import { Plus, Pencil, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import type { ShiftTemplateDto } from "../types/shift-management.types";

function fmtTime(value: string) {
  return value?.slice(0, 5) || "--:--";
}

export function ShiftTemplateList() {
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
    if (!confirm(`Deactivate template \"${template.templateName}\"?`)) return;
    deactivate.mutate(template.shiftTemplateId);
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
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <BaseTable<ShiftTemplateDto>
        data={templates}
        loading={isLoading}
        columns={columns}
        rowKey="shiftTemplateId"
        total={data?.length ?? 0}
        onDataChange={handleTableDataChange}
        onRefresh={refetch}
        searchPlaceholder="Search template"
        defaultRowsPerPage={10}
        rowsPerPageOptions={[10, 20, 50, 100]}
        renderTitle={() => (
          <div className="w-full flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-[#1A3A52]">Shift Templates</h1>
              <p className="text-sm text-[#1A3A52]/70">
                Manage reusable shift templates and default time windows.
              </p>
            </div>
            <PermissionGuard permission={Permissions.ManageShiftTemplate}>
              <Button onClick={openCreate} className="gap-2 bg-[#1A3A52] text-[#FDFBF9] hover:bg-[#1A3A52]/90">
                <Plus className="h-4 w-4" />
                Create Template
              </Button>
            </PermissionGuard>
          </div>
        )}
        renderCell={handleGlobalRenderCell}
        renderActionColumn={(template) => (
          <div className="flex items-center justify-end gap-1.5">
            <PermissionGuard permission={Permissions.ManageShiftTemplate}>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 bg-white text-[#1A3A52] hover:bg-slate-100"
                onClick={() => openEdit(template)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </PermissionGuard>

            {template.isActive && (
              <PermissionGuard permission={Permissions.ManageShiftTemplate}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 bg-white text-red-600 hover:bg-red-50"
                  onClick={() => handleDeactivate(template)}
                  isLoading={deactivate.isPending}
                >
                  <Power className="h-4 w-4" />
                </Button>
              </PermissionGuard>
            )}
          </div>
        )}
        renderNoData={() => (
          <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-[#FDFBF9] py-16 text-sm text-[#1A3A52]/70">
            No shift templates found.
          </div>
        )}
      />

      <ShiftTemplateForm open={formOpen} onClose={() => setFormOpen(false)} editTarget={editTarget} />
    </div>
  );
}
