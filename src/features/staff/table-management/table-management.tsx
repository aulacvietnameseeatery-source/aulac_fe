"use client";

import React, { useState, useMemo, useCallback } from "react";
import { CirclePlus, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  RestaurantTable,
  TableFormData,
  TableFilters,
  TableStatus,
  TableZone,
} from "./types";
import { TABLE_ZONE_LABELS } from "./types";
import { mockTables } from "./data";
import {
  DashboardSummary,
  FilterBar,
  ZoneSection,
  TableModal,
  DeleteModal,
  TableDetailPanel,
} from "./components";

const DEFAULT_FILTERS: TableFilters = {
  zone: "ALL",
  type: "ALL",
  status: "ALL",
  isOnline: "ALL",
  search: "",
};

const ZONE_ORDER: TableZone[] = ["INDOOR", "OUTDOOR", "ROOFTOP", "PATIO", "VIP_ROOM"];

const TableManagement: React.FC = () => {
  const [tables, setTables] = useState<RestaurantTable[]>(mockTables);
  const [filters, setFilters] = useState<TableFilters>(DEFAULT_FILTERS);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);

  // Detail panel state
  const [detailTable, setDetailTable] = useState<RestaurantTable | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Zone collapse state
  const [collapsedZones, setCollapsedZones] = useState<Set<TableZone>>(new Set());

  // Apply filters
  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      if (filters.zone !== "ALL" && t.zone !== filters.zone) return false;
      if (filters.type !== "ALL" && t.type !== filters.type) return false;
      if (filters.status !== "ALL" && t.status !== filters.status) return false;
      if (filters.isOnline === "ONLINE" && !t.isOnline) return false;
      if (filters.isOnline === "OFFLINE" && t.isOnline) return false;
      if (
        filters.search.trim() &&
        !t.tableCode.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [tables, filters]);

  // Group by zone for display
  const groupedByZone = useMemo(() => {
    const groups: Record<TableZone, RestaurantTable[]> = {
      INDOOR: [],
      OUTDOOR: [],
      ROOFTOP: [],
      PATIO: [],
      VIP_ROOM: [],
    };
    filteredTables.forEach((t) => {
      groups[t.zone].push(t);
    });
    return groups;
  }, [filteredTables]);

  // Show zone sections: if a specific zone is selected, show only that zone
  const zonesToShow = useMemo(() => {
    if (filters.zone !== "ALL") return [filters.zone];
    return ZONE_ORDER.filter((z) => groupedByZone[z].length > 0);
  }, [filters.zone, groupedByZone]);

  // Handlers
  const handleAddTable = useCallback(
    (formData: TableFormData) => {
      const newId = Math.max(0, ...tables.map((t) => t.tableId)) + 1;
      const newTable: RestaurantTable = {
        tableId: newId,
        tableCode: formData.tableCode,
        capacity: formData.capacity,
        status: (formData.status || "AVAILABLE") as TableStatus,
        type: (formData.type || "REGULAR") as RestaurantTable["type"],
        zone: (formData.zone || "INDOOR") as TableZone,
        isOnline: formData.isOnline,
        qrCodeUrl: formData.qrCodeUrl || undefined,
        qrCodeGenerated: formData.qrCodeGenerated || false,
        images: formData.images || [],
        activeOrders: 0,
        hasErrors: false,
      };
      setTables((prev) => [...prev, newTable]);
    },
    [tables]
  );

  const handleEditTable = useCallback(
    (formData: TableFormData) => {
      if (!selectedTable) return;
      setTables((prev) =>
        prev.map((t) =>
          t.tableId === selectedTable.tableId
            ? {
                ...t,
                tableCode: formData.tableCode,
                capacity: formData.capacity,
                status: (formData.status || t.status) as TableStatus,
                type: (formData.type || t.type) as RestaurantTable["type"],
                zone: (formData.zone || t.zone) as TableZone,
                isOnline: formData.isOnline,
                qrCodeUrl: formData.qrCodeUrl || t.qrCodeUrl,
                qrCodeGenerated: formData.qrCodeGenerated ?? t.qrCodeGenerated,
                images: formData.images ?? t.images,
              }
            : t
        )
      );
      setSelectedTable(null);
      // Update detail panel if the same table is open
      if (detailTable?.tableId === selectedTable.tableId) {
        setDetailTable((prev) =>
          prev
            ? {
                ...prev,
                tableCode: formData.tableCode,
                capacity: formData.capacity,
                status: (formData.status || prev.status) as TableStatus,
                type: (formData.type || prev.type) as RestaurantTable["type"],
                zone: (formData.zone || prev.zone) as TableZone,
                isOnline: formData.isOnline,
                qrCodeUrl: formData.qrCodeUrl || prev.qrCodeUrl,
                qrCodeGenerated: formData.qrCodeGenerated ?? prev.qrCodeGenerated,
                images: formData.images ?? prev.images,
              }
            : null
        );
      }
    },
    [selectedTable, detailTable]
  );

  const handleDeleteTable = useCallback(() => {
    if (!selectedTable) return;
    setTables((prev) => prev.filter((t) => t.tableId !== selectedTable.tableId));
    if (detailTable?.tableId === selectedTable.tableId) {
      setIsDetailOpen(false);
      setDetailTable(null);
    }
    setSelectedTable(null);
    setIsDeleteModalOpen(false);
  }, [selectedTable, detailTable]);

  const handleStatusChange = useCallback(
    (tableId: number, status: TableStatus) => {
      setTables((prev) =>
        prev.map((t) => (t.tableId === tableId ? { ...t, status } : t))
      );
      if (detailTable?.tableId === tableId) {
        setDetailTable((prev) => (prev ? { ...prev, status } : null));
      }
    },
    [detailTable]
  );

  const handleSelectTable = useCallback((table: RestaurantTable) => {
    setDetailTable(table);
    setIsDetailOpen(true);
  }, []);

  const handleToggleZoneCollapse = useCallback((zone: TableZone) => {
    setCollapsedZones((prev) => {
      const next = new Set(prev);
      if (next.has(zone)) next.delete(zone);
      else next.add(zone);
      return next;
    });
  }, []);

  const handleToggleZoneOnline = useCallback(
    (zone: TableZone, online: boolean) => {
      setTables((prev) =>
        prev.map((t) => (t.zone === zone ? { ...t, isOnline: online } : t))
      );
    },
    []
  );

  const handleRefresh = useCallback(() => {
    setTables(mockTables);
    setFilters(DEFAULT_FILTERS);
    setCollapsedZones(new Set());
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="grow">
          <h3 className="text-2xl font-bold text-gray-900 m-0">
            Table Management
          </h3>
          <p className="text-sm text-gray-400 mt-0.5">
            {filteredTables.length} table{filteredTables.length !== 1 ? "s" : ""}
            {filters.zone !== "ALL" && ` in ${TABLE_ZONE_LABELS[filters.zone]}`}
            {" "}&middot; {tables.filter((t) => t.status === "AVAILABLE").length} available
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCcw size={14} className="mr-1" />
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
          >
            <CirclePlus size={14} className="mr-1" />
            Add Table
          </Button>
        </div>
      </div>

      {/* Dashboard KPI Summary */}
      <DashboardSummary tables={tables} />

      {/* Filter bar */}
      <FilterBar filters={filters} onFiltersChange={setFilters} />

      {/* Zone Sections */}
      {zonesToShow.length > 0 ? (
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
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <p className="text-base font-medium">No tables found</p>
          <p className="text-sm mt-1">Try adjusting your filters or add a new table.</p>
        </div>
      )}

      {/* Add Modal */}
      <TableModal
        isOpen={isAddModalOpen}
        mode="add"
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTable}
      />

      {/* Edit Modal */}
      <TableModal
        isOpen={isEditModalOpen}
        mode="edit"
        table={selectedTable}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTable(null);
        }}
        onSubmit={handleEditTable}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTable(null);
        }}
        onConfirm={handleDeleteTable}
      />

      {/* Detail Panel */}
      <TableDetailPanel
        table={detailTable}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailTable(null);
        }}
        onEdit={(t) => {
          setSelectedTable(t);
          setIsEditModalOpen(true);
        }}
        onDelete={(t) => {
          setSelectedTable(t);
          setIsDeleteModalOpen(true);
        }}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default TableManagement;
