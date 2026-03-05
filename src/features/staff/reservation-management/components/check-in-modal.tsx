// features/staff/reservation-management/components/CheckInModal.tsx
import React, { useState, useEffect } from "react";
import { ReservationDto } from "../types/reservation-types";
import { X, CheckCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

// Import Table Service và Types
import { reservationService } from "../services/reservation-service";
import {TABLE_STATUS_LV_IDS, TableManagementDto, tableService} from "@/features/staff/table-management";

interface CheckInModalProps {
    reservation: ReservationDto;
    onClose: () => void;
    onSuccess: () => void;
}

export const CheckInModal = ({ reservation, onClose, onSuccess }: CheckInModalProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingTables, setIsFetchingTables] = useState(true);

    const [availableTables, setAvailableTables] = useState<TableManagementDto[]>([]);
    const [selectedTable, setSelectedTable] = useState<string>(reservation.tableId?.toString() || "");

    // Tự động lấy danh sách bàn trống khi mở Modal
    useEffect(() => {
        const fetchAvailableTables = async () => {
            try {
                // Gọi tableService lọc theo status AVAILABLE
                const res = await tableService.getTables({
                    statusId: TABLE_STATUS_LV_IDS.AVAILABLE,
                    pageSize: 100
                });
                setAvailableTables(res.pageData);
            } catch (error) {
                toast.error("Failed to load available tables.");
                console.error(error);
            } finally {
                setIsFetchingTables(false);
            }
        };

        fetchAvailableTables();
    }, []);

    const handleConfirm = async () => {
        if (!selectedTable) return;

        setIsLoading(true);
        try {
            // Gọi API Check-in (BE cần làm endpoint này)
            await reservationService.checkInReservation(
                reservation.reservationId,
                Number(selectedTable)
            );

            toast.success("Guest checked in successfully!");
            onSuccess(); // Đóng modal và refresh lại danh sách ngoài Page
        } catch (error: any) {
            toast.error(error.message || "Failed to check in reservation");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Check-in Guest
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5">
                    <div className="mb-5 bg-blue-50/50 border border-blue-100 p-3 rounded-lg text-sm text-gray-700">
                        <span className="font-semibold text-gray-900">{reservation.customerName}</span> has arrived for their <span className="font-semibold text-gray-900">{format(new Date(reservation.reservedTime), "HH:mm")}</span> reservation ({reservation.pax} guests).
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-semibold text-gray-700">Assign Table</label>

                        {isFetchingTables ? (
                            <div className="flex items-center justify-center p-3 text-sm text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading tables...
                            </div>
                        ) : (
                            <select
                                value={selectedTable}
                                onChange={(e) => setSelectedTable(e.target.value)}
                                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                <option value="" disabled>-- Select an available table --</option>
                                {availableTables.length === 0 && (
                                    <option value="" disabled>No tables available</option>
                                )}
                                {availableTables.map(table => (
                                    <option key={table.tableId} value={table.tableId}>
                                        {table.tableCode} ({table.zoneName} - Capacity: {table.capacity})
                                    </option>
                                ))}
                            </select>
                        )}

                        {availableTables.length > 0 && reservation.pax > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                                Hint: Try to assign a table with capacity ≥ {reservation.pax}
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading || isFetchingTables || !selectedTable}
                        className="px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[130px]"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Check-in"}
                    </button>
                </div>
            </div>
        </div>
    );
};