"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { CirclePlus, RefreshCcw, Loader2, MapPin, Search, Clock } from "lucide-react"; // Thêm icon Clock
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";
import { useDebounce } from "use-debounce";
import { format } from "date-fns"; // Dùng để format ngày giờ
import type {
  RestaurantTable,
  TableFormData,
  TableFilters,
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
  targetTime: "",
};

export const TableManagementContent: React.FC = () => {
  const [filters, setFilters] = useState<TableFilters>(DEFAULT_FILTERS);

  // --- STATE CHO DEBOUNCE SEARCH ---
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebounce(searchInput, 500);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);

  const [detailTable, setDetailTable] = useState<RestaurantTable | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddZoneModalOpen, setIsAddZoneModalOpen] = useState(false);
  const [collapsedZones, setCollapsedZones] = useState<Set<string>>(new Set());
  const [detailOpenBeforeEdit, setDetailOpenBeforeEdit] = useState(false);

  // ── Build API query params from filters ──
  const queryParams = useMemo<TableQueryParams>(() => {
    const params: TableQueryParams & { targetTime?: string } = {
      pageIndex: 1,
      pageSize: 200,
    };
    if (filters.search.trim()) params.search = filters.search.trim();
    if (filters.zoneId) params.zoneId = filters.zoneId;
    if (filters.typeId) params.typeId = filters.typeId;
    if (filters.statusId) params.statusId = filters.statusId;
    if (filters.isOnline === "ONLINE") params.isOnline = true;
    if (filters.isOnline === "OFFLINE") params.isOnline = false;

    if (filters.targetTime) {
      params.targetTime = new Date(filters.targetTime).toISOString();
    }

    return params;
  }, [filters]);

  const { data: pagedResult, isLoading, refetch } = useTablesQuery(queryParams);

  const tables = useMemo<RestaurantTable[]>(() => {
    if (!pagedResult?.pageData) return [];
    return pagedResult.pageData.map(mapDtoToTable);
  }, [pagedResult]);

  const statusCodeToLvId = useMemo(() => {
    const map: Record<string, number> = { ...TABLE_STATUS_LV_IDS };
    tables.forEach((t) => {
      if (t.status && t.statusId) map[t.status] = t.statusId;
    });
    return map;
  }, [tables]);

  // ... (Các mutation giữ nguyên) ...
  const createMutation = useCreateTableMutation({ onSuccess: () => setIsAddModalOpen(false) });
  const updateMutation = useUpdateTableMutation({ onSuccess: () => { setIsEditModalOpen(false); setSelectedTable(null); } });
  const deleteMutation = useDeleteTableMutation({ onSuccess: () => { setIsDeleteModalOpen(false); setSelectedTable(null); if (detailTable?.tableId === selectedTable?.tableId) { setIsDetailOpen(false); setDetailTable(null); } } });
  const statusMutation = useUpdateTableStatusMutation({ onSuccess: (data) => { if (detailTable?.tableId === data.tableId) { setDetailTable(mapDtoToTable(data)); } } });
  const bulkOnlineMutation = useBulkOnlineMutation();

  const groupedByZone = useMemo(() => {
    const groups: Record<string, RestaurantTable[]> = {};
    tables.forEach((t) => {
      const zoneKey = t.zoneName;
      if (!groups[zoneKey]) groups[zoneKey] = [];
      groups[zoneKey].push(t);
    });
    return groups;
  }, [tables]);

  const zonesToShow = useMemo(() => {
    if (filters.zone !== "ALL") {
      return [filters.zone].filter((z) => groupedByZone[z]?.length > 0);
    }
    return Object.keys(groupedByZone).filter((z) => groupedByZone[z].length > 0);
  }, [filters.zone, groupedByZone]);

  // ... (Các handlers khác giữ nguyên) ...
  const handleAddTable = useCallback((formData: TableFormData, pendingFiles: File[], _removedImageIds: number[]) => {
    if (!formData.typeLvId || !formData.zoneLvId || !formData.statusLvId) return;
    createMutation.mutate({ tableCode: formData.tableCode, capacity: formData.capacity, isOnline: formData.isOnline, statusLvId: formData.statusLvId as number, typeLvId: formData.typeLvId as number, zoneLvId: formData.zoneLvId as number, images: pendingFiles.length > 0 ? pendingFiles : undefined });
  }, [createMutation]);

  const handleEditTable = useCallback((formData: TableFormData, pendingFiles: File[], removedImageIds: number[]) => {
    if (!selectedTable) return;
    updateMutation.mutate({ id: selectedTable.tableId, data: { tableCode: formData.tableCode, capacity: formData.capacity, isOnline: formData.isOnline, statusLvId: formData.statusLvId as number | undefined, typeLvId: formData.typeLvId as number | undefined, zoneLvId: formData.zoneLvId as number | undefined, images: pendingFiles.length > 0 ? pendingFiles : undefined, removedImageIds: removedImageIds.length > 0 ? removedImageIds : undefined } });
  }, [selectedTable, updateMutation]);

  const handleDeleteTable = useCallback(() => { if (!selectedTable) return; deleteMutation.mutate(selectedTable.tableId); }, [selectedTable, deleteMutation]);
  const handleStatusChange = useCallback((tableId: number, statusCode: string) => { const statusLvId = statusCodeToLvId[statusCode]; if (!statusLvId) return; statusMutation.mutate({ id: tableId, data: { statusLvId } }); }, [statusMutation, statusCodeToLvId]);
  const handleSelectTable = useCallback((table: RestaurantTable) => { setDetailTable(table); setIsDetailOpen(true); }, []);
  const handleEditFromDetail = useCallback((t: RestaurantTable) => { setDetailOpenBeforeEdit(true); setIsDetailOpen(false); setSelectedTable(t); setIsEditModalOpen(true); }, []);
  const handleToggleZoneCollapse = useCallback((zone: string) => { setCollapsedZones((prev) => { const next = new Set(prev); if (next.has(zone)) next.delete(zone); else next.add(zone); return next; }); }, []);
  const handleToggleZoneOnline = useCallback((zoneId: number, online: boolean) => { bulkOnlineMutation.mutate({ zoneId, isOnline: online }); }, [bulkOnlineMutation]);

  const handleRefresh = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchInput("");
    setCollapsedZones(new Set());
    refetch();
  }, [refetch]);

  const availableCount = tables.filter((t) => t.status === "AVAILABLE").length;

  return (
      <div className="space-y-6">
        {/* Page Header & Toolbar */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5 mb-2">

          {/* Title Info */}
          <div className="shrink-0">
            <h3 className="text-[28px] font-bold text-gray-900 m-0">
              Table Management
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {tables.length} table{tables.length !== 1 ? "s" : ""}
              {filters.zone !== "ALL" && ` in ${filters.zone}`}
              {" "}&middot; <span className="text-green-600 font-medium">{availableCount} available</span>
            </p>
          </div>

          {/* Toolbar: Search + Actions */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center xl:justify-end gap-3 w-full xl:w-auto">

            {/* 1. MÁY QUÉT THỜI GIAN (TIME MACHINE) */}
            <div className="relative flex items-center bg-white border border-gray-300 rounded-lg shadow-sm h-[38px] w-full sm:w-auto sm:min-w-[220px] focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all overflow-hidden group">
              <div
                  className="px-3 bg-indigo-50/50 border-r border-gray-200 h-full flex items-center justify-center shrink-0 cursor-pointer group-hover:bg-indigo-50 transition-colors"
                  onClick={() => {
                    const input = document.getElementById('time-machine-input');
                    if (input && 'showPicker' in input) {
                      (input as any).showPicker();
                    }
                  }}
              >
                <Clock className="w-4 h-4 text-indigo-600" />
              </div>
              <input
                  id="time-machine-input"
                  type="datetime-local"
                  value={filters.targetTime}
                  onChange={(e) => setFilters(prev => ({ ...prev, targetTime: e.target.value }))}
                  className="px-3 py-1.5 w-full h-full outline-none text-[13px] text-gray-700 bg-transparent font-medium"
                  title="Chọn giờ để xem bàn trống"
              />
              {filters.targetTime && (
                  <button
                      onClick={() => setFilters(prev => ({ ...prev, targetTime: "" }))}
                      className="absolute right-2 text-gray-400 hover:text-red-500 transition-colors bg-white pl-1"
                      title="Xóa bộ lọc thời gian"
                  >
                    <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                  </button>
              )}
            </div>

            {/* 2. THANH SEARCH TEXT */}
            <div className="relative flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm h-[38px] w-full sm:w-auto sm:min-w-[220px] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <div className="px-3 bg-gray-50/50 border-r border-gray-200 h-full flex items-center justify-center shrink-0">
                <Search className="w-4 h-4 text-gray-500" />
              </div>
              <input
                  type="text"
                  placeholder="Search table code..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="px-3 py-1.5 w-full h-full outline-none text-[13px] text-gray-700 placeholder:text-gray-400"
              />
            </div>

            {/* 3. NÚT CHỨC NĂNG */}
            <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading} className="h-[38px] text-[13px] px-3">
                {isLoading ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <RefreshCcw size={14} className="mr-1.5 text-gray-500" />}
                Refresh
              </Button>
              <PermissionGuard permission={Permissions.CreateTable}>
                <Button variant="outline" size="sm" onClick={() => setIsAddZoneModalOpen(true)} className="h-[38px] text-[13px] px-3">
                  <MapPin size={14} className="mr-1.5 text-gray-500" /> Add Zone
                </Button>
                <Button variant="default" size="sm" onClick={() => setIsAddModalOpen(true)} className="h-[38px] text-[13px] px-3 bg-gray-900 hover:bg-gray-800">
                  <CirclePlus size={14} className="mr-1.5" /> Add Table
                </Button>
              </PermissionGuard>
            </div>
          </div>
        </div>

        {/* THÔNG BÁO NẾU ĐANG BẬT MÁY QUÉT THỜI GIAN */}
        {filters.targetTime && (
            <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <Clock size={16} />
              Đang hiển thị các bàn <strong>TRỐNG</strong> vào lúc: {format(new Date(filters.targetTime), "HH:mm - dd/MM/yyyy")}
            </div>
        )}

        <DashboardSummary tables={tables} />
        <FilterBar filters={filters} onFiltersChange={setFilters} />

        {isLoading && tables.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-gray-400 mr-2" />
              <span className="text-gray-400">Loading tables...</span>
            </div>
        )}

        {/* ... (Các phần dưới giữ nguyên) ... */}
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
                      onEdit={(t) => { setSelectedTable(t); setIsEditModalOpen(true); }}
                      onDelete={(t) => { setSelectedTable(t); setIsDeleteModalOpen(true); }}
                      onSelect={handleSelectTable}
                      onStatusChange={handleStatusChange}
                  />
              ))}
            </div>
        ) : (
            !isLoading && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <p className="text-base font-medium">No tables found</p>
                  <p className="text-sm mt-1">Try adjusting your filters or add a new table.</p>
                </div>
            )
        )}

        <TableModal isOpen={isAddModalOpen} mode="add" onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddTable} isSubmitting={createMutation.isPending} />
        <TableModal isOpen={isEditModalOpen} mode="edit" table={selectedTable} onClose={() => { setIsEditModalOpen(false); setSelectedTable(null); if (detailOpenBeforeEdit) { setIsDetailOpen(true); setDetailOpenBeforeEdit(false); } }} onSubmit={handleEditTable} isSubmitting={updateMutation.isPending} />
        <DeleteModal isOpen={isDeleteModalOpen} table={selectedTable} onClose={() => { setIsDeleteModalOpen(false); setSelectedTable(null); }} onConfirm={handleDeleteTable} isDeleting={deleteMutation.isPending} />
        <TableDetailPanel table={detailTable} isOpen={isDetailOpen} onClose={() => { setIsDetailOpen(false); setDetailTable(null); }} onEdit={handleEditFromDetail} onDelete={(t) => { setSelectedTable(t); setIsDeleteModalOpen(true); }} onStatusChange={handleStatusChange} />
        <AddZoneModal isOpen={isAddZoneModalOpen} onClose={() => setIsAddZoneModalOpen(false)} />
      </div>
  );
};

export default function TableManagementPage() {
  return (
      <div className="w-full h-full bg-[#f8f9fa] p-4 md:p-6 font-sans">
        <TableManagementContent />
      </div>
  );
}