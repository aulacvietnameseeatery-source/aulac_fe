"use client";

import { useState, useMemo, useCallback, type ReactNode } from "react";
import { Plus, RefreshCcw, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALDatePicker } from "@/components/ui/al-date-picker";
import { BaseTable } from "@/components/ui/table/base-table";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";
import type { TableColumn } from "@/types/table.types";
import type { TableDataChangeParams } from "@/types/table-data-change.types";
import { useShiftAssignmentsQuery, useCancelAssignmentMutation } from "../hooks/use-shift-queries";
import { ShiftStatusBadge } from "./shift-status-badge";
import { ShiftAssignmentForm } from "./shift-assignment-form";
import { AttendanceAdjustmentDialog } from "./attendance-adjustment-dialog";
import type { ShiftAssignmentListDto, AttendanceRecordDto } from "../types/shift-management.types";

export function ShiftScheduleList() {
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
    if (!confirm("Cancel this assignment?")) return;
    cancelAssignment.mutate(id);
  };

  function formatTime(iso: string) {
    try { return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
    catch { return iso; }
  }

  const columns = useMemo<TableColumn[]>(
    () => [
      {
        field: "rowNo", header: "No", width: "72px", align: "center", sortable: false,
        cellRender: ({ rowIndex }) =>
          ((tableParams.page ?? 1) - 1) * (tableParams.pageSize ?? 10) + rowIndex + 1,
      },
      { field: "workDate", header: "Date", width: "140px", sortable: false },
      {
        field: "templateName", header: "Template", sortable: false,
        cellRender: ({ item }) => item.templateName,
      },
      { field: "staffName", header: "Staff", sortable: false },
      {
        field: "timeRange", header: "Planned Time", sortable: false,
        cellRender: ({ item }) =>
          `${formatTime(item.plannedStartAt)} – ${formatTime(item.plannedEndAt)}`,
      },
      {
        field: "isActive", header: "Status", width: "120px", sortable: false,
        cellRender: ({ item }) => (
          <ShiftStatusBadge
            statusCode={item.isActive ? "active" : "cancelled"}
            type="assignment"
          />
        ),
      },
    ],
    [tableParams.page, tableParams.pageSize]
  );

  const handleGlobalRenderCell = (
    value: unknown, item: ShiftAssignmentListDto, column: TableColumn, rowIndex: number
  ) => {
    const content = column.cellRender ? column.cellRender({ value, item, column, rowIndex }) : value;
    if (column.align) return <div style={{ textAlign: column.align }}>{content as ReactNode}</div>;
    return content as ReactNode;
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <BaseTable<ShiftAssignmentListDto>
        data={assignments}
        loading={isLoading}
        columns={columns}
        rowKey="shiftAssignmentId"
        total={data?.totalCount ?? 0}
        onDataChange={handleTableDataChange}
        onRefresh={refetch}
        searchPlaceholder="Search assignments"
        defaultRowsPerPage={10}
        rowsPerPageOptions={[10, 20, 50, 100]}
        renderTitle={() => (
          <div className="w-full flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-wide text-[#1A3A52]">Shift Assignments</h1>
              <p className="text-sm text-[#1A3A52]/70">
                Assign staff to shift templates and track attendance.
              </p>
            </div>
            <PermissionGuard permission={Permissions.AssignShift}>
              <Button onClick={handleCreate} className="gap-2 bg-[#1A3A52] text-[#FDFBF9] hover:bg-[#1A3A52]/90">
                <Plus className="w-4 h-4" />
                New Assignment
              </Button>
            </PermissionGuard>
          </div>
        )}
        renderToolbarAppend={() => (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            <ALDatePicker value={fromDate} onChange={setFromDate} placeholder="From date" clearable inputSize="sm" wrapperClassName="w-38" />
            <span className="text-sm text-[#1A3A52]/60">-</span>
            <ALDatePicker value={toDate} onChange={setToDate} placeholder="To date" clearable inputSize="sm" wrapperClassName="w-38" />
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}
              className="border-slate-300 bg-white text-[#1A3A52] hover:bg-slate-100">
              <RefreshCcw className="w-4 h-4" />
            </Button>
          </div>
        )}
        renderCell={handleGlobalRenderCell}
        renderActionColumn={(a) => (
          <div className="flex items-center justify-end gap-1.5">
            <PermissionGuard permission={Permissions.AssignShift}>
              <Button variant="outline" size="sm"
                className="border-slate-300 bg-white text-[#1A3A52] hover:bg-slate-100"
                onClick={() => handleEdit(a)}>
                <Pencil className="w-4 h-4" />
              </Button>
            </PermissionGuard>
            {a.isActive && (
              <PermissionGuard permission={Permissions.AssignShift}>
                <Button variant="outline" size="sm"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10"
                  onClick={() => handleCancel(a.shiftAssignmentId)}
                  disabled={cancelAssignment.isPending}>
                  Cancel
                </Button>
              </PermissionGuard>
            )}
          </div>
        )}
        renderNoData={() => (
          <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-[#FDFBF9] py-16 text-sm text-[#1A3A52]/70">
            No assignments found. Adjust the date range or create a new assignment.
          </div>
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
