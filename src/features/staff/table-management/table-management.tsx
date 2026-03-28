"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { CirclePlus, RefreshCcw, Loader2, MapPin, Search, Clock } from "lucide-react"; // Thêm icon Clock
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ALDatePicker } from "@/components/ui/al-date-picker";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";
import { LookupManagerModal, LOOKUP_TYPE, useLookupCrud } from "@/features/lookup";
import { useDebounce } from "use-debounce";
import { format } from "date-fns"; // Dùng để format ngày giờ
import { dateUtils } from "@/lib/date-utils";
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
  TABLE_QUERY_KEYS,
} from "./hooks/use-table-queries";
import { useQueryClient } from "@tanstack/react-query";
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
  const t = useTranslations("tableManagement");
  const [filters, setFilters] = useState<TableFilters>(DEFAULT_FILTERS);
  const queryClient = useQueryClient();

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
      params.targetTime = dateUtils.formatLocal(filters.targetTime, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
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

  const zoneLookup = useLookupCrud({
    typeId: LOOKUP_TYPE.TableZone,
    queryKey: ["lookups", "table-zone", "table-management"],
    entityLabel: t("zone.label"),
    typeLabel: t("zone.label"),
    isConfigurable: true,
  });

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
    void _removedImageIds;
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
      <div className="space-y-6 rounded-2xl border border border-[#D5BA98]/60 bg-white p-5 shadow-sm sm:p-6">
        {/* Page Header & Toolbar */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5 mb-2">

          {/* Title Info */}
          <div className="shrink-0">
            <h3 className="m-0 text-[28px] font-bold tracking-wide text-[#1A3A52]">
              {t("title")}
            </h3>
            <p className="mt-1 text-sm text-[#1A3A52]/70">
              {t("header.tablesCount", { count: tables.length })}
              {filters.zone !== "ALL" && ` ${t("header.inZone", { zone: filters.zone })}`}
              {" "}&middot; <span className="font-medium text-[#4A5D4E]">{t("header.availableCount", { count: availableCount })}</span>
            </p>
          </div>

          {/* Toolbar: Search + Actions */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center xl:justify-end gap-3 w-full xl:w-auto">

            {/* 1. MÁY QUÉT THỜI GIAN (TIME MACHINE) */}
            <div className="w-full sm:min-w-55 sm:w-auto">
              <ALDatePicker
                value={filters.targetTime}
                onChange={(val) => setFilters((prev) => ({ ...prev, targetTime: val }))}
                placeholder={t("filters.targetDatePlaceholder")}
                clearable
                inputSize="sm"
                wrapperClassName="w-full"
                groupClassName="border-[#D5BA98]/60 bg-[#FDFBF9] text-[#1A3A52]"
              />
            </div>

            {/* 2. THANH SEARCH TEXT */}
            <div className="relative flex h-9.5 w-full items-center overflow-hidden rounded-lg border border-[#D5BA98]/60 bg-[#FDFBF9] shadow-sm transition-all focus-within:border-[#1A3A52]/40 focus-within:ring-1 focus-within:ring-[#1A3A52]/30 sm:min-w-55 sm:w-auto">
              <div className="flex h-full shrink-0 items-center justify-center border-r border-[#D5BA98]/50 bg-[#D5BA98]/20 px-3">
                <Search className="h-4 w-4 text-[#1A3A52]/70" />
              </div>
              <input
                  type="text"
                  placeholder={t("filters.searchPlaceholder")}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="h-full w-full px-3 py-1.5 text-[13px] text-[#1A3A52] placeholder:text-[#1A3A52]/45 outline-none"
              />
            </div>

            {/* 3. NÚT CHỨC NĂNG */}
            <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading} className="h-9.5 border-[#D5BA98]/70 bg-[#FDFBF9] px-3 text-[13px] text-[#1A3A52] hover:bg-[#D5BA98]/20">
                {isLoading ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <RefreshCcw size={14} className="mr-1.5 text-[#1A3A52]/70" />}
                {t("actions.refresh")}
              </Button>
              <PermissionGuard permission={Permissions.CreateTable}>
                <Button variant="outline" size="sm" onClick={() => setIsAddZoneModalOpen(true)} className="h-9.5 border-[#D5BA98]/70 bg-[#FDFBF9] px-3 text-[13px] text-[#1A3A52] hover:bg-[#D5BA98]/20">
                  <MapPin size={14} className="mr-1.5 text-[#1A3A52]/70" /> {t("actions.addZone")}
                </Button>
                <Button variant="default" size="sm" onClick={() => setIsAddModalOpen(true)} className="h-9.5 bg-[#1A3A52] px-3 text-[13px] text-[#FDFBF9] hover:bg-[#1A3A52]/90">
                  <CirclePlus size={14} className="mr-1.5" /> {t("actions.addTable")}
                </Button>
              </PermissionGuard>
            </div>
          </div>
        </div>

        {/* THÔNG BÁO NẾU ĐANG BẬT MÁY QUÉT THỜI GIAN */}
        {filters.targetTime && (
            <div className="flex items-center gap-2 rounded-lg border border-[#D5BA98]/70 bg-[#D5BA98]/20 px-4 py-2 text-sm text-[#1A3A52]">
              <Clock size={16} />
              {t("filters.targetDateInfo")} <strong>{t("filters.availableEmphasis")}</strong> {t("filters.targetDateOn")} {format(new Date(filters.targetTime), "dd/MM/yyyy")}
            </div>
        )}

        <DashboardSummary tables={tables} />
        <FilterBar filters={filters} onFiltersChange={setFilters} />

        {isLoading && tables.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="mr-2 animate-spin text-[#1A3A52]/60" />
              <span className="text-[#1A3A52]/60">{t("states.loading")}</span>
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
                <div className="flex flex-col items-center justify-center py-16 text-[#1A3A52]/65">
                  <p className="text-base font-medium text-[#1A3A52]">{t("states.emptyTitle")}</p>
                  <p className="text-sm mt-1">{t("states.emptyDescription")}</p>
                </div>
            )
        )}

        <TableModal isOpen={isAddModalOpen} mode="add" onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddTable} isSubmitting={createMutation.isPending} />
        <TableModal isOpen={isEditModalOpen} mode="edit" table={selectedTable} onClose={() => { setIsEditModalOpen(false); setSelectedTable(null); if (detailOpenBeforeEdit) { setIsDetailOpen(true); setDetailOpenBeforeEdit(false); } }} onSubmit={handleEditTable} isSubmitting={updateMutation.isPending} />
        <DeleteModal isOpen={isDeleteModalOpen} table={selectedTable} onClose={() => { setIsDeleteModalOpen(false); setSelectedTable(null); }} onConfirm={handleDeleteTable} isDeleting={deleteMutation.isPending} />
        <TableDetailPanel table={detailTable} isOpen={isDetailOpen} onClose={() => { setIsDetailOpen(false); setDetailTable(null); }} onEdit={handleEditFromDetail} onDelete={(t) => { setSelectedTable(t); setIsDeleteModalOpen(true); }} onStatusChange={handleStatusChange} />
        <LookupManagerModal
          {...zoneLookup}
          isOpen={isAddZoneModalOpen}
          onClose={() => setIsAddZoneModalOpen(false)}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: TABLE_QUERY_KEYS.zones() });
            refetch();
          }}
        />
      </div>
  );
};

export default function TableManagementPage() {
  return (
      <div className="h-full w-full bg-[#FDFBF9]">
        <TableManagementContent />
      </div>
  );
}