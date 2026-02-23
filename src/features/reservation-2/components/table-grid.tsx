import React from "react";
import TableCard from "./table-card";
import { TableAvailabilityDto } from "../types/reservation.types";
import { useTranslations } from "next-intl";
import "../styles/index.css";

interface TableGridProps {
    tables?: TableAvailabilityDto[];
    selectedTableId: number | null;
    selectedTableIds?: number[]; // Added support for multi-select
    onSelect: (id: number) => void;
    isLoading?: boolean;
}

export default function TableGrid({
    tables = [],
    selectedTableId,
    selectedTableIds,
    onSelect,
    isLoading = false,
}: TableGridProps) {
    const t = useTranslations("Reservation.TableGrid");

    if (isLoading) {
        return (
            <div className="table-grid-loading">
                {/* Simplified skeleton for now, can bring back full skeleton if needed */}
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    if (tables.length === 0) {
        return <div className="table-grid-empty">{t("empty")}</div>;
    }

    return (
        <div className="table-grid-wrapper">
            {tables.map((table) => {
                // Derive status
                const isSelected = selectedTableIds
                    ? selectedTableIds.includes(table.tableId)
                    : selectedTableId === table.tableId;

                const status = !table.isAvailable
                    ? "reserved"
                    : isSelected
                        ? "selected"
                        : "available";

                return (
                    <TableCard
                        key={table.tableId}
                        {...table}
                        status={status}
                        onClick={() => onSelect(table.tableId)}
                    />
                );
            })}
        </div>
    );
}
