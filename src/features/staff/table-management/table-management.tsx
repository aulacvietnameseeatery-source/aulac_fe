"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { CirclePlus, RefreshCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/http";
import type { ApiResponse, PagedResult } from "@/types/api-response.types";

import type {
    RestaurantTable,
    TableFormData,
    TableFilters,
    TableStatus,
    TableZone,
    TableType,
} from "./types";
import { TABLE_ZONE_LABELS } from "./types";
import {
    DashboardSummary,
    FilterBar,
    ZoneSection,
    TableModal,
    DeleteModal,
    TableDetailPanel,
    TableLegend,
} from "./components";

export interface TableManagementDto {
    tableId: number;
    tableCode: string;
    capacity: number;
    isOnline: boolean;
    statusId: number;
    statusCode: string;
    statusName: string;
    typeId: number;
    typeName: string;
    zoneId: number;
    zoneName: string;
}

const DEFAULT_FILTERS: TableFilters = {
    zone: "ALL",
    type: "ALL",
    status: "ALL",
    isOnline: "ALL",
    search: "",
};

const ZONE_ORDER: TableZone[] = ["INDOOR", "OUTDOOR", "ROOFTOP"];

const TableManagement: React.FC = () => {
    const [tables, setTables] = useState<RestaurantTable[]>([]);
    const [filters, setFilters] = useState<TableFilters>(DEFAULT_FILTERS);
    const [isLoading, setIsLoading] = useState(true); // Thêm state Loading

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);

    // Detail panel state
    const [detailTable, setDetailTable] = useState<RestaurantTable | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // ================= LOGIC GỌI API =================
    const fetchTables = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get<ApiResponse<PagedResult<TableManagementDto>>>("/api/tables?pageIndex=1&pageSize=100");
            const dtos = response.data.pageData;

            const mappedTables: RestaurantTable[] = dtos.map((dto) => ({
                tableId: dto.tableId,
                tableCode: dto.tableCode,
                capacity: dto.capacity,
                status: (dto.statusCode || "AVAILABLE") as TableStatus,
                // Xử lý format chữ (vd: "High Top" -> "HIGH_TOP")
                type: (dto.typeName?.toUpperCase().replace(/[- ]/g, "_") || "REGULAR") as TableType,
                zone: (dto.zoneName?.toUpperCase().replace(/[- ]/g, "_") || "INDOOR") as TableZone,
                isOnline: dto.isOnline,
                activeOrders: 0,
                hasErrors: false,
                image: "/images/logo.png",
            }));

            setTables(mappedTables);
        } catch (error) {
            console.error("Failed to fetch tables data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTables();
    }, [fetchTables]);

    // =================================================

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

        };
        filteredTables.forEach((t) => {
            if (groups[t.zone]) {
                groups[t.zone].push(t);
            }
        });
        return groups;
    }, [filteredTables]);

    // Show zone sections
    const zonesToShow = useMemo(() => {
        if (filters.zone !== "ALL") return [filters.zone];
        return ZONE_ORDER.filter((z) => groupedByZone[z] && groupedByZone[z].length > 0);
    }, [filters.zone, groupedByZone]);

    // Handlers
    const handleAddTable = useCallback(
        (formData: TableFormData) => {
            // TODO: gọi API POST /api/tables ở đây
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
            // TODO: gọi API PUT /api/tables/{id} ở đây
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
        // TODO: gọi API DELETE /api/tables/{id} ở đây
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
            // TODO: gọi API PATCH /api/tables/{id}/status ở đây
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

    const handleRefresh = useCallback(() => {
        fetchTables();
        setFilters(DEFAULT_FILTERS);
    }, [fetchTables]);

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
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                        <RefreshCcw size={14} className={isLoading ? "mr-1 animate-spin" : "mr-1"} />
                        {isLoading ? "Refreshing..." : "Refresh"}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="shadow-md"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <CirclePlus size={14} className="mr-1" />
                        Add Table
                    </Button>
                </div>
            </div>

            {/* Dashboard KPI Summary */}
            <DashboardSummary tables={tables} />

            {/* Legend */}
            <TableLegend />

            {/* Filter bar */}
            <FilterBar filters={filters} onFiltersChange={setFilters} />

            {/* Zone Sections or Loading State */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#C5A059]" />
                    <p className="text-sm font-medium">Fetching tables data...</p>
                </div>
            ) : zonesToShow.length > 0 ? (
                <div className="space-y-5">
                    {zonesToShow.map((zone) => (
                        <ZoneSection
                            key={zone}
                            zone={zone}
                            tables={groupedByZone[zone]}
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