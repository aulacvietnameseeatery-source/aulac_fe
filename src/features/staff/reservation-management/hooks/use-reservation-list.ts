// features/staff/reservation/hooks/use-reservation-list.ts

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useDebounce } from 'use-debounce';
import { reservationService } from "../services/reservation-service";
import { ReservationDto, ReservationStatusDto, GetReservationsParams } from "../types/reservation-types";

export const useReservationList = () => {
    const [reservations, setReservations] = useState<ReservationDto[]>([]);
    const [statuses, setStatuses] = useState<ReservationStatusDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [pagination, setPagination] = useState({
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
        totalPage: 0,
    });

    // Tách riêng state cho thanh search input (Để gõ không bị lag)
    const [searchInput, setSearchInput] = useState("");

    // Tạo ra 1 biến debouncedSearch (Chỉ cập nhật sau khi ngừng gõ 500ms)
    const [debouncedSearch] = useDebounce(searchInput, 500);

    const [filters, setFilters] = useState({
        date: null as Date | null,
        statusId: null as number | null,
    });

    // 1. Fetch Statuses
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

    // 2. Fetch Reservations - Lắng nghe thêm biến debouncedSearch
    const fetchReservations = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: GetReservationsParams = {
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize,
                search: debouncedSearch, // <-- DÙNG BIẾN DEBOUNCE ĐỂ GỌI API
                date: filters.date ? format(filters.date, "yyyy-MM-dd") : undefined,
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
    }, [pagination.pageIndex, pagination.pageSize, filters, debouncedSearch]); // <-- Thêm debouncedSearch vào dependencies

    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);

    // --- ACTIONS ---
    const onSearchChange = (value: string) => {
        // Chỉ cập nhật value cho thanh input, CHƯA gọi API
        setSearchInput(value);
        setPagination(prev => ({ ...prev, pageIndex: 1 }));
    };

    const onDateChange = (date: Date | null) => {
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
        statuses,
        isLoading,
        pagination,
        filters: {
            ...filters,
            search: searchInput
        },
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