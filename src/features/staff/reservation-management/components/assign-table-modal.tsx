import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Armchair, MapPin } from "lucide-react";
import { ReservationDto } from "../types/reservation-types";
import { reservationService } from "../services/reservation-service";
import { Checkbox } from "@/components/ui/checkbox"; // Đảm bảo đúng đường dẫn tới file Checkbox của bạn
import { format } from "date-fns";
import {tableService} from "@/features/staff/table-management";

interface AssignTableModalProps {
    reservation: ReservationDto;
    onClose: () => void;
    onSuccess: () => void;
}

export const AssignTableModal = ({ reservation, onClose, onSuccess }: AssignTableModalProps) => {
    const [availableTables, setAvailableTables] = useState<any[]>([]);
    const [isLoadingTables, setIsLoadingTables] = useState(true);

    const [selectedTableIds, setSelectedTableIds] = useState<number[]>([]);
    const [lockedZone, setLockedZone] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchAvailableTables = async () => {
            try {
                // Gọi API lấy bàn trống tại thời điểm ReservedTime
                const data = await tableService.getAvailableTables(reservation.reservedTime);
                setAvailableTables(data);
            } catch (error) {
                toast.error("Không thể lấy danh sách bàn trống.");
            } finally {
                setIsLoadingTables(false);
            }
        };

        fetchAvailableTables();
    }, [reservation.reservedTime]);

    // Xử lý logic Checkbox & Khóa Zone
    const handleCheckChange = (table: any, checked: boolean) => {
        if (checked) {
            if (!lockedZone) setLockedZone(table.zone); // Bàn đầu tiên -> Khóa Zone
            setSelectedTableIds([...selectedTableIds, table.tableId]);
        } else {
            const newIds = selectedTableIds.filter(id => id !== table.tableId);
            setSelectedTableIds(newIds);
            if (newIds.length === 0) setLockedZone(null); // Bỏ chọn hết -> Mở khóa
        }
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedTableIds.length === 0) {
            toast.error("Vui lòng chọn ít nhất 1 bàn!");
            return;
        }

        setIsSubmitting(true);
        try {
            await reservationService.assignTableAndConfirm(reservation.reservationId, selectedTableIds);
            toast.success("Duyệt đơn và xếp bàn thành công!");
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || "Lỗi khi xếp bàn");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={true} onClose={onClose} title={`Duyệt Đơn: ${reservation.customerName}`} width="550px">
            <form onSubmit={handleAssign} className="p-5 flex flex-col max-h-[80vh]">
                <div className="mb-4 bg-blue-50 border border-blue-100 p-3 rounded-lg text-sm text-blue-800 flex justify-between items-center">
                    <div>
                        <span className="font-semibold">{format(new Date(reservation.reservedTime), "HH:mm, dd/MM")}</span>
                        <span className="mx-2">•</span>
                        <span>Khách: <strong>{reservation.pax} người</strong></span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 min-h-[250px]">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Armchair size={16} /> Chọn bàn rảnh để ghép
                    </h4>

                    {isLoadingTables ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-400 w-8 h-8" /></div>
                    ) : availableTables.length === 0 ? (
                        <p className="text-red-500 text-sm text-center py-8">Không còn bàn trống nào trong khung giờ này!</p>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {availableTables.map(table => {
                                const isChecked = selectedTableIds.includes(table.tableId);
                                // Logic Khóa Zone: Đã có Zone khóa && Bàn này khác Zone && Bàn này chưa được tick
                                const isDisabled = lockedZone !== null && lockedZone !== table.zone && !isChecked;

                                return (
                                    <label
                                        key={table.tableId}
                                        className={`flex items-start gap-3 p-3 border rounded-lg transition-all ${
                                            isDisabled ? 'opacity-40 cursor-not-allowed bg-gray-50' : 'cursor-pointer'
                                        } ${isChecked ? 'border-green-500 bg-green-50/50' : 'border-gray-200 hover:border-gray-300'}`}
                                    >
                                        <div className="pt-0.5">
                                            <Checkbox
                                                checked={isChecked}
                                                onCheckedChange={(c) => handleCheckChange(table, c as boolean)}
                                                disabled={isDisabled}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 leading-none mb-1.5">{table.tableCode}</p>
                                            <div className="flex items-center text-xs text-gray-500 gap-3">
                                                <span className="flex items-center gap-1"><Armchair size={12}/> {table.capacity} chỗ</span>
                                                <span className="flex items-center gap-1"><MapPin size={12}/> {table.zone}</span>
                                            </div>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">Đã chọn: <strong className="text-green-600">{selectedTableIds.length}</strong> bàn</p>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
                        <Button type="submit" disabled={isSubmitting || selectedTableIds.length === 0} className="bg-green-600 hover:bg-green-700">
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Xác nhận (Confirmed)
                        </Button>
                    </div>
                </div>
            </form>
        </Dialog>
    );
};