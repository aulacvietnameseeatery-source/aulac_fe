import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, User, Phone, Mail, Users, Calendar, Clock, FileText } from "lucide-react";
import { ReservationDto, UpdateReservationRequest, ReservationTableDto } from "../types/reservation-types";
import { reservationService } from "../services/reservation-service";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { tableService } from "@/features/staff/table-management";
import { Armchair, MapPin } from "lucide-react";

interface EditReservationModalProps {
    reservationId: number;
    onClose: () => void;
    onSuccess: () => void;
}

export const EditReservationModal = ({ reservationId, onClose, onSuccess }: EditReservationModalProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<UpdateReservationRequest>({
        customerName: "",
        phone: "",
        email: "",
        partySize: 1,
        reservedTime: new Date().toISOString(),
        notes: "",
    });

    const [currentTables, setCurrentTables] = useState<ReservationTableDto[]>([]);
    const [availableTables, setAvailableTables] = useState<any[]>([]);
    const [isLoadingTables, setIsLoadingTables] = useState(false);
    const [selectedTableIds, setSelectedTableIds] = useState<number[]>([]);
    const [lockedZone, setLockedZone] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const detail = await reservationService.getReservationDetail(reservationId);
                setFormData({
                    customerName: detail.customerName,
                    phone: detail.phone,
                    email: detail.email || "",
                    partySize: detail.partySize,
                    reservedTime: detail.reservedTime,
                    notes: detail.notes || "",
                    statusId: detail.statusId,
                });
                setCurrentTables(detail.tables || []);
                setSelectedTableIds((detail.tables || []).map(t => t.tableId));
                if (detail.tables && detail.tables.length > 0) {
                    setLockedZone(detail.tables[0].zone);
                }
            } catch (error: any) {
                toast.error("Không thể lấy thông tin chi tiết đơn đặt bàn");
                onClose();
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetail();
    }, [reservationId, onClose]);

    // Fetch Available Tables when time changes
    useEffect(() => {
        if (!formData.reservedTime) return;

        const fetchTables = async () => {
            setIsLoadingTables(true);
            try {
                const data = await tableService.getAvailableTables(formData.reservedTime);

                // Merge current tables into available tables list so they are visible/selectable
                const merged = [...data];
                currentTables.forEach(ct => {
                    if (!merged.find(m => m.tableId === ct.tableId)) {
                        merged.push({
                            tableId: ct.tableId,
                            tableCode: ct.tableCode,
                            capacity: ct.capacity,
                            zone: ct.zone,
                            // current: true // for UI flag if needed
                        });
                    }
                });

                setAvailableTables(merged.sort((a, b) => a.tableCode.localeCompare(b.tableCode)));
            } catch (error) {
                console.error("Failed to fetch tables", error);
            } finally {
                setIsLoadingTables(false);
            }
        };

        fetchTables();
    }, [formData.reservedTime, currentTables]);

    const handleTableCheckChange = (table: any, checked: boolean) => {
        if (checked) {
            if (!lockedZone) setLockedZone(table.zone);
            setSelectedTableIds(prev => [...prev, table.tableId]);
        } else {
            const next = selectedTableIds.filter(id => id !== table.tableId);
            setSelectedTableIds(next);
            if (next.length === 0) setLockedZone(null);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "partySize" ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await reservationService.updateReservation(reservationId, {
                ...formData,
                tableIds: selectedTableIds
            });
            toast.success("Cập nhật đơn đặt bàn thành công!");
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || "Lỗi khi cập nhật đơn đặt bàn");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={true} onClose={onClose} title="Sửa thông tin đặt bàn" width="500px">
            {isLoading ? (
                <div className="flex justify-center items-center p-12">
                    <Loader2 className="animate-spin text-gray-400 w-8 h-8" />
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        {/* Tên khách hàng */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <User size={14} /> Tên khách hàng
                            </label>
                            <input
                                type="text"
                                name="customerName"
                                value={formData.customerName}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none transition-shadow"
                                placeholder="Nhập tên khách..."
                            />
                        </div>

                        {/* Số điện thoại */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Phone size={14} /> Số điện thoại
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none transition-shadow"
                                placeholder="Nhập số điện thoại..."
                            />
                        </div>

                        {/* Email & Party Size */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Mail size={14} /> Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none transition-shadow"
                                    placeholder="Không bắt buộc"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Users size={14} /> Số khách (Pax)
                                </label>
                                <input
                                    type="number"
                                    name="partySize"
                                    value={formData.partySize}
                                    onChange={handleInputChange}
                                    min={1}
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none transition-shadow"
                                />
                            </div>
                        </div>

                        {/* Thời gian đặt */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Clock size={14} /> Thời gian đến
                            </label>
                            <input
                                type="datetime-local"
                                name="reservedTime"
                                value={format(new Date(formData.reservedTime), "yyyy-MM-dd'T'HH:mm")}
                                onChange={(e) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        reservedTime: new Date(e.target.value).toISOString()
                                    }));
                                }}
                                required
                                className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none transition-shadow"
                            />
                        </div>

                        {/* Ghi chú */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FileText size={14} /> Ghi chú
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none transition-shadow resize-none"
                                placeholder="VD: Bàn gần cửa sổ, dự sinh nhật..."
                            />
                        </div>
                    </div>

                    {/* Table Selection */}
                    <div className="pt-4 border-t">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Armchair size={16} /> Danh sách bàn
                        </h4>

                        {isLoadingTables ? (
                            <div className="flex justify-center py-6"><Loader2 className="animate-spin text-gray-400 w-6 h-6" /></div>
                        ) : availableTables.length === 0 ? (
                            <p className="text-gray-400 text-xs text-center py-4">Không có bàn khả dụng.</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {availableTables.map(table => {
                                    const isChecked = selectedTableIds.includes(table.tableId);
                                    const isDisabled = lockedZone !== null && lockedZone !== table.zone && !isChecked;

                                    return (
                                        <label
                                            key={table.tableId}
                                            className={`flex items-start gap-2 p-2 border rounded-md transition-all ${isDisabled ? 'opacity-40 cursor-not-allowed bg-gray-50' : 'cursor-pointer'
                                                } ${isChecked ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                                        >
                                            <div className="pt-0.5">
                                                <Checkbox
                                                    checked={isChecked}
                                                    onCheckedChange={(c) => handleTableCheckChange(table, c as boolean)}
                                                    disabled={isDisabled}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-xs text-gray-900 truncate">{table.tableCode}</p>
                                                <div className="flex items-center text-[10px] text-gray-500 gap-2">
                                                    <span className="flex items-center gap-0.5"><Armchair size={10} /> {table.capacity}</span>
                                                    <span className="flex items-center gap-0.5"><MapPin size={10} /> {table.zone}</span>
                                                </div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                        {lockedZone && (
                            <p className="text-[10px] text-blue-600 mt-2 italic">
                                * Đang lọc bàn theo khu vực: <strong>{lockedZone}</strong>
                            </p>
                        )}
                    </div>
                    <div className="pt-4 flex justify-end gap-3 border-t">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 min-w-[100px]">
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Lưu thay đổi
                        </Button>
                    </div>
                </form>
            )}
        </Dialog>
    );
};
