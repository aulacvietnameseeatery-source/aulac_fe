"use client";

import { useState, useMemo, useCallback, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Plus, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALCard } from "@/components/ui/al-card";
import { ALDatePicker } from "@/components/ui/al-date-picker";
import { BaseTable } from "@/components/ui/table/base-table";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";
import type { TableColumn } from "@/types/table.types";
import type { TableDataChangeParams } from "@/types/table-data-change.types";
import { useShiftAssignmentsQuery, useCancelAssignmentMutation } from "../hooks/use-shift-queries";
import { ShiftStatusBadge } from "./shift-status-badge";
import { ShiftAssignmentForm } from "./shift-assignment-form";
import { TableActionColumn, TableAction } from "@/components/ui/table/table-action-column";
import { AttendanceAdjustmentDialog } from "./attendance-adjustment-dialog";
import type { ShiftAssignmentListDto, AttendanceRecordDto } from "../types/shift-management.types";

export function ShiftScheduleList() {
  const t = useTranslations("shift.scheduleList");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tableParams, setTableParams] = useState<TableDataChangeParams>({ page: 1, pageSize: 10 });

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ShiftAssignmentListDto | null>(null);
  const [adjustTarget, setAdjustTarget] = useState<AttendanceRecordDto | null>(null);

  const handleTableDataChange = useCallback((next: TableDataChangeParams) => {
    setTableParams((prev) => {
      const isSame =
        (prev.page ?? 1) === (next.page ?? 1) &&
        (prev.pageSize ?? 10) === (next.pageSize ?? 10);
      return isSame ? prev : next;
    });
  }, []);

  const params = useMemo(
    () => ({
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      isActive: true as const,
      pageIndex: tableParams.page ?? 1,
      pageSize: tableParams.pageSize ?? 10,
    }),
    [fromDate, toDate, tableParams.page, tableParams.pageSize]
  );

  const { data, isLoading, refetch } = useShiftAssignmentsQuery(params);
  const assignments = data?.pageData ?? [];
  const cancelAssignment = useCancelAssignmentMutation();

  const handleCreate = () => { setEditTarget(null); setFormOpen(true); };
  const handleEdit = (a: ShiftAssignmentListDto) => { setEditTarget(a); setFormOpen(true); };
  const handleCancel = (id: number) => {
    if (!confirm(t("confirmCancel"))) return;
    cancelAssignment.mutate(id);
  };

  function formatTime(iso: string) {
    try { return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
    catch { return iso; }
  }

  const columns = useMemo<TableColumn[]>(
    () => [
      {
        field: "rowNo", header: t("table.no"), width: "72px", align: "center", sortable: false,
        cellRender: ({ rowIndex }) =>
          ((tableParams.page ?? 1) - 1) * (tableParams.pageSize ?? 10) + rowIndex + 1,
      },
      { field: "workDate", header: t("table.date"), width: "140px", sortable: false },
      {
        field: "templateName", header: t("table.template"), sortable: false,
        cellRender: ({ item }) => item.templateName,
      },
      { field: "staffName", header: t("table.staff"), sortable: false },
      {
        field: "timeRange", header: t("table.plannedTime"), sortable: false,
        cellRender: ({ item }) =>
          `${formatTime(item.plannedStartAt)} – ${formatTime(item.plannedEndAt)}`,
      },
      {
        field: "isActive", header: t("table.status"), width: "120px", sortable: false,
        cellRender: ({ item }) => (
          <ShiftStatusBadge
            statusCode={item.isActive ? "active" : "cancelled"}
            type="assignment"
          />
        ),
      },
    ],
    [tableParams.page, tableParams.pageSize, t]
  );

  const activeCount = useMemo(
    () => assignments.filter((item) => item.isActive).length,
    [assignments]
  );

  const cancelledCount = useMemo(
    () => assignments.filter((item) => !item.isActive).length,
    [assignments]
  );

  const handleGlobalRenderCell = (
    value: unknown, item: ShiftAssignmentListDto, column: TableColumn, rowIndex: number
  ) => {
    const content = column.cellRender ? column.cellRender({ value, item, column, rowIndex }) : value;
    if (column.align) return <div style={{ textAlign: column.align }}>{content as ReactNode}</div>;
    return content as ReactNode;
  };

  return (
    <div >
      <BaseTable<ShiftAssignmentListDto>
        data={assignments}
        loading={isLoading}
        columns={columns}
        rowKey="shiftAssignmentId"
        total={data?.totalCount ?? 0}
        onDataChange={handleTableDataChange}
        onRefresh={refetch}
        searchPlaceholder={t("searchPlaceholder")}
        defaultRowsPerPage={10}
        rowsPerPageOptions={[10, 20, 50, 100]}
        renderTitle={() => (
          <div className="w-full space-y-4 mb-4">
            <ALCard className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-[#D5BA98]/50">
              <div>
                <h1 className="text-2xl font-semibold tracking-wide text-[#1A3A52]">{t("title")}</h1>
                <p className="text-sm text-[#1A3A52]/70 mt-1">
                  {t("description")}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-blue-600 bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                    {t("activeCount", { count: activeCount })}
                  </span>
                  <span className="rounded-full border border-slate-700 bg-slate-700 px-2 py-0.5 text-xs font-semibold text-white">
                    {t("cancelledCount", { count: cancelledCount })}
                  </span>
                </div>
                <PermissionGuard permission={Permissions.AssignShift}>
                  <Button onClick={handleCreate} className="gap-2 bg-[#1A3A52] text-[#FDFBF9] hover:bg-[#1A3A52]/90">
                    <Plus className="w-4 h-4" />
                    {t("newAssignment")}
                  </Button>
                </PermissionGuard>
              </div>
            </ALCard>

            <ALCard padding="md" className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <ALDatePicker
                  title={t("filters.fromDate")}
                  value={fromDate}
                  onChange={setFromDate}
                  placeholder={t("filters.fromDatePlaceholder")}
                  clearable
                  inputSize="sm"
                  wrapperClassName="w-48"
                />
                <ALDatePicker
                  title={t("filters.toDate")}
                  value={toDate}
                  onChange={setToDate}
                  placeholder={t("filters.toDatePlaceholder")}
                  clearable
                  inputSize="sm"
                  wrapperClassName="w-48"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="bg-white border-slate-300 text-[#1A3A52] hover:bg-slate-100"
              >
                <RefreshCcw className="w-4 h-4" />
                <span className="ml-1">{t("filters.refresh")}</span>
              </Button>
            </ALCard>
          </div>
        )}
        renderCell={handleGlobalRenderCell}
        renderActionColumn={(a) => {
          const actions: TableAction<ShiftAssignmentListDto>[] = [
            {
              action: "edit",
              onClick: () => handleEdit(a),
              permission: Permissions.AssignShift,
            },
          ];

          if (a.isActive) {
            actions.push({
              action: "cancel",
              onClick: () => handleCancel(a.shiftAssignmentId),
              permission: Permissions.AssignShift,
            });
          }

          return <TableActionColumn actions={actions} item={a} />;
        }}
        renderNoData={() => (
          <ALCard className="flex items-center justify-center border-[#D5BA98]/60 bg-[#FDFBF9] py-16 text-sm text-[#1A3A52]/70">
            {t("noData")}
          </ALCard>
        )}
      />

      <ShiftAssignmentForm open={formOpen} onClose={() => setFormOpen(false)} editTarget={editTarget} />

      {adjustTarget && (
        <AttendanceAdjustmentDialog
          open={!!adjustTarget}
          onClose={() => setAdjustTarget(null)}
          attendanceRecord={adjustTarget}
        />
      )}
    </div>
  );
}
