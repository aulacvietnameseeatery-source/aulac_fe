// features/staff/reservation/hooks/use-reservation-list.ts

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { reservationService } from "../services/reservation-service";
import { ReservationDto, ReservationStatusDto, GetReservationsParams } from "../types/reservation-types";

export const useReservationList = () => {
    const [reservations, setReservations] = useState<ReservationDto[]>([]);
    const [statuses, setStatuses] = useState<ReservationStatusDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Pagination State
    const [pagination, setPagination] = useState({
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
        totalPage: 0,
    });

    // Filter State
    const [filters, setFilters] = useState({
        search: "",
        date: new Date(), // Mặc định là Today
        statusId: null as number | null, // null = All
    });

    // 1. Fetch Statuses (Tabs) - Chạy 1 lần
    useEffect(() => {
        const fetchStatuses = async () => {
            try {
                const data = await reservationService.getReservationStatuses();
                setStatuses(data);
            } catch (error) {
                console.error("Failed to load statuses", error);
            }
        };
        fetchStatuses();
    }, []);

    // 2. Fetch Reservations - Chạy khi filter thay đổi
    const fetchReservations = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: GetReservationsParams = {
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize,
                search: filters.search,
                date: format(filters.date, "yyyy-MM-dd"), // Format gửi lên BE
                statusId: filters.statusId || undefined,
            };

            const data = await reservationService.getReservations(params);

            setReservations(data.pageData);
            setPagination(prev => ({
                ...prev,
                totalCount: data.totalCount,
                totalPage: data.totalPage,
            }));
        } catch (error: any) {
            toast.error(error.message || "Failed to load reservations");
        } finally {
            setIsLoading(false);
        }
    }, [pagination.pageIndex, pagination.pageSize, filters]);

    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);

    // --- ACTIONS ---
    const onSearchChange = (value: string) => {
        setFilters(prev => ({ ...prev, search: value }));
        setPagination(prev => ({ ...prev, pageIndex: 1 }));
    };

    const onDateChange = (date: Date) => {
        setFilters(prev => ({ ...prev, date: date }));
        setPagination(prev => ({ ...prev, pageIndex: 1 }));
    };

    const onStatusChange = (statusId: number | null) => {
        setFilters(prev => ({ ...prev, statusId: statusId }));
        setPagination(prev => ({ ...prev, pageIndex: 1 }));
    };

    const onPageChange = (page: number) => setPagination(prev => ({ ...prev, pageIndex: page }));
    const onPageSizeChange = (size: number) => setPagination(prev => ({ ...prev, pageSize: size, pageIndex: 1 }));

    return {
        reservations,
        statuses, // Danh sách tabs
        isLoading,
        pagination,
        filters,
        actions: {
            refresh: fetchReservations,
            onSearchChange,
            onDateChange,
            onStatusChange,
            onPageChange,
            onPageSizeChange
        }
    };
};