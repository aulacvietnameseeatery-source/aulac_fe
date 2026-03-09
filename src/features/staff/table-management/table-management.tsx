"use client";

import React, { useState, useMemo, useCallback } from "react";
import { CirclePlus, RefreshCcw, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";
import type {
  RestaurantTable,
  TableFormData,
  TableFilters,
  TableStatus,
  TableQueryParams,
} from "./types";
import { mapDtoToTable, TABLE_STATUS_LV_IDS } from "./types";
import {
  useTablesQuery,
  useCreateTableMutation,
  useUpdateTableMutation,
  useDeleteTableMutation,
  useUpdateTableStatusMutation,
  useBulkOnlineMutation,
} from "./hooks/use-table-queries";
import {
  DashboardSummary,
  FilterBar,
  ZoneSection,
  TableModal,
  DeleteModal,
  TableDetailPanel,
  AddZoneModal,
} from "./components";

const DEFAULT_FILTERS: TableFilters = {
  zone: "ALL",
  zoneId: null,
  type: "ALL",
  typeId: null,
  status: "ALL",
  statusId: null,
  isOnline: "ALL",
  search: "",
};

const TableManagement: React.FC = () => {
  const [filters, setFilters] = useState<TableFilters>(DEFAULT_FILTERS);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);

  // Detail panel state
  const [detailTable, setDetailTable] = useState<RestaurantTable | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Zone add modal state
  const [isAddZoneModalOpen, setIsAddZoneModalOpen] = useState(false);

  // Zone collapse state
  const [collapsedZones, setCollapsedZones] = useState<Set<string>>(new Set());

  // Tracks whether the detail panel was open before an edit modal was triggered from it
  const [detailOpenBeforeEdit, setDetailOpenBeforeEdit] = useState(false);

  // ── Build API query params from filters ──
  const queryParams = useMemo<TableQueryParams>(() => {
    const params: TableQueryParams = {
      pageIndex: 1,
      pageSize: 200, // Load all tables for zone grouping
    };
    if (filters.search.trim()) params.search = filters.search.trim();
    if (filters.zoneId) params.zoneId = filters.zoneId;
    if (filters.typeId) params.typeId = filters.typeId;
    if (filters.statusId) params.statusId = filters.statusId;
    if (filters.isOnline === "ONLINE") params.isOnline = true;
    if (filters.isOnline === "OFFLINE") params.isOnline = false;
    return params;
  }, [filters]);

  // ── Queries ──
  const {
    data: pagedResult,
    isLoading,
    refetch,
  } = useTablesQuery(queryParams);

  // ── Map DTOs to internal FE model ──
  const tables = useMemo<RestaurantTable[]>(() => {
    if (!pagedResult?.pageData) return [];
    return pagedResult.pageData.map(mapDtoToTable);
  }, [pagedResult]);

  // ── Build statusCode → statusLvId map from loaded table data.
  // Starts with the static placeholder IDs and is overridden by real data as tables load.
  const statusCodeToLvId = useMemo(() => {
    const map: Record<string, number> = { ...TABLE_STATUS_LV_IDS };
    tables.forEach((t) => {
      if (t.status && t.statusId) map[t.status] = t.statusId;
    });
    return map;
  }, [tables]);

  // ── Mutations ──
  const createMutation = useCreateTableMutation({
    onSuccess: () => {
      setIsAddModalOpen(false);
    },
  });

  const updateMutation = useUpdateTableMutation({
    onSuccess: () => {
      setIsEditModalOpen(false);
      setSelectedTable(null);
    },
  });

  const deleteMutation = useDeleteTableMutation({
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      setSelectedTable(null);
      if (detailTable?.tableId === selectedTable?.tableId) {
        setIsDetailOpen(false);
        setDetailTable(null);
      }
    },
  });

  const statusMutation = useUpdateTableStatusMutation({
    onSuccess: (data) => {
      // Keep the open detail panel in sync with the updated status
      if (detailTable?.tableId === data.tableId) {
        setDetailTable(mapDtoToTable(data));
      }
    },
  });
  const bulkOnlineMutation = useBulkOnlineMutation();

  // ── Group by zone for display ──
  const groupedByZone = useMemo(() => {
    const groups: Record<string, RestaurantTable[]> = {};
    tables.forEach((t) => {
      const zoneKey = t.zoneName;
      if (!groups[zoneKey]) groups[zoneKey] = [];
      groups[zoneKey].push(t);
    });
    return groups;
  }, [tables]);

  // Determine which zones to show
  const zonesToShow = useMemo(() => {
    if (filters.zone !== "ALL") {
      return [filters.zone].filter((z) => groupedByZone[z]?.length > 0);
    }
    return Object.keys(groupedByZone).filter(
      (z) => groupedByZone[z].length > 0
    );
  }, [filters.zone, groupedByZone]);

  // ── Handlers ──
  const handleAddTable = useCallback(
    (formData: TableFormData, pendingFiles: File[], _removedImageIds: number[]) => {
      if (!formData.typeLvId || !formData.zoneLvId || !formData.statusLvId)
        return;
      createMutation.mutate({
        tableCode: formData.tableCode,
        capacity: formData.capacity,
        isOnline: formData.isOnline,
        statusLvId: formData.statusLvId as number,
        typeLvId: formData.typeLvId as number,
        zoneLvId: formData.zoneLvId as number,
        images: pendingFiles.length > 0 ? pendingFiles : undefined,
      });
    },
    [createMutation]
  );

  const handleEditTable = useCallback(
    (formData: TableFormData, pendingFiles: File[], removedImageIds: number[]) => {
      if (!selectedTable) return;
      updateMutation.mutate({
        id: selectedTable.tableId,
        data: {
          tableCode: formData.tableCode,
          capacity: formData.capacity,
          isOnline: formData.isOnline,
          statusLvId: formData.statusLvId ? (formData.statusLvId as number) : undefined,
          typeLvId: formData.typeLvId ? (formData.typeLvId as number) : undefined,
          zoneLvId: formData.zoneLvId ? (formData.zoneLvId as number) : undefined,
          images: pendingFiles.length > 0 ? pendingFiles : undefined,
          removedImageIds: removedImageIds.length > 0 ? removedImageIds : undefined,
        },
      });
    },
    [selectedTable, updateMutation]
  );

  const handleDeleteTable = useCallback(() => {
    if (!selectedTable) return;
    deleteMutation.mutate(selectedTable.tableId);
  }, [selectedTable, deleteMutation]);

  const handleStatusChange = useCallback(
    (tableId: number, statusCode: string) => {
      const statusLvId = statusCodeToLvId[statusCode];
      if (!statusLvId) return;
      statusMutation.mutate({ id: tableId, data: { statusLvId } });
    },
    [statusMutation, statusCodeToLvId]
  );

  const handleSelectTable = useCallback((table: RestaurantTable) => {
    setDetailTable(table);
    setIsDetailOpen(true);
  }, []);

  // Edit triggered from the detail panel — hide the panel first, reopen when modal closes
  const handleEditFromDetail = useCallback((t: RestaurantTable) => {
    setDetailOpenBeforeEdit(true);
    setIsDetailOpen(false);
    setSelectedTable(t);
    setIsEditModalOpen(true);
  }, []);

  const handleToggleZoneCollapse = useCallback((zone: string) => {
    setCollapsedZones((prev) => {
      const next = new Set(prev);
      if (next.has(zone)) next.delete(zone);
      else next.add(zone);
      return next;
    });
  }, []);

  // Zone online toggle — PATCH /api/tables/bulk-online
  const handleToggleZoneOnline = useCallback(
    (zoneId: number, online: boolean) => {
      bulkOnlineMutation.mutate({ zoneId, isOnline: online });
    },
    [bulkOnlineMutation]
  );

  const handleRefresh = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setCollapsedZones(new Set());
    refetch();
  }, [refetch]);

  const availableCount = tables.filter(
    (t) => t.status === "AVAILABLE"
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="grow">
          <h3 className="text-2xl font-bold text-gray-900 m-0">
            Table Management
          </h3>
          <p className="text-sm text-gray-400 mt-0.5">
            {tables.length} table{tables.length !== 1 ? "s" : ""}
            {filters.zone !== "ALL" && ` in ${filters.zone}`}
            {" "}&middot; {availableCount} available
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 size={14} className="mr-1 animate-spin" />
            ) : (
              <RefreshCcw size={14} className="mr-1" />
            )}
            Refresh
          </Button>
          <PermissionGuard permission={Permissions.CreateTable}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddZoneModalOpen(true)}
            >
              <MapPin size={14} className="mr-1" />
              Add Zone
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
            >
              <CirclePlus size={14} className="mr-1" />
              Add Table
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Dashboard KPI Summary */}
      <DashboardSummary tables={tables} />

      {/* Filter bar */}
      <FilterBar filters={filters} onFiltersChange={setFilters} />

      {/* Loading state */}
      {isLoading && tables.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-gray-400 mr-2" />
          <span className="text-gray-400">Loading tables...</span>
        </div>
      )}

      {/* Zone Sections */}
      {!isLoading && zonesToShow.length > 0 ? (
        <div className="space-y-5">
          {zonesToShow.map((zone) => (
            <ZoneSection
              key={zone}
              zone={zone}
              tables={groupedByZone[zone]}
              collapsed={collapsedZones.has(zone)}
              onToggleCollapse={handleToggleZoneCollapse}
              onToggleZoneOnline={handleToggleZoneOnline}
              onEdit={(t) => {
                setSelectedTable(t);
                setIsEditModalOpen(true);
              }}
              onDelete={(t) => {
                setSelectedTable(t);
                setIsDeleteModalOpen(true);
              }}
              onSelect={handleSelectTable}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <p className="text-base font-medium">No tables found</p>
            <p className="text-sm mt-1">
              Try adjusting your filters or add a new table.
            </p>
          </div>
        )
      )}

      {/* Add Modal */}
      <TableModal
        isOpen={isAddModalOpen}
        mode="add"
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTable}
        isSubmitting={createMutation.isPending}
      />

      {/* Edit Modal */}
      <TableModal
        isOpen={isEditModalOpen}
        mode="edit"
        table={selectedTable}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTable(null);
          // Reopen detail panel if it was shown before the edit was triggered
          if (detailOpenBeforeEdit) {
            setIsDetailOpen(true);
            setDetailOpenBeforeEdit(false);
          }
        }}
        onSubmit={handleEditTable}
        isSubmitting={updateMutation.isPending}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        table={selectedTable}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTable(null);
        }}
        onConfirm={handleDeleteTable}
        isDeleting={deleteMutation.isPending}
      />

      {/* Detail Panel */}
      <TableDetailPanel
        table={detailTable}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailTable(null);
        }}
        onEdit={handleEditFromDetail}
        onDelete={(t) => {
          setSelectedTable(t);
          setIsDeleteModalOpen(true);
        }}
        onStatusChange={handleStatusChange}
      />

      {/* Add Zone Modal */}
      <AddZoneModal
        isOpen={isAddZoneModalOpen}
        onClose={() => setIsAddZoneModalOpen(false)}
      />
    </div>
  );
};

export default TableManagement;
