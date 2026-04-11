import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useDebounce } from 'use-debounce';
import { reservationService } from "../services/reservation-service";
import { ReservationDto, ReservationStatusDto, GetReservationsParams } from "../types/reservation-types";
import { dateUtils } from "@/lib/date-utils";

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

    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch] = useDebounce(searchInput, 500);

    const [filters, setFilters] = useState({
        date: null as Date | null,
        statusId: null as number | null,
        sortBy: 'createdAt',
        creatorId: null as string | null,
        tableId: null as string | null,
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

    // 2. Fetch Reservations
    const fetchReservations = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: GetReservationsParams & any = {
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize,
                search: debouncedSearch,
                date: filters.date ? dateUtils.formatLocal(filters.date, "yyyy-MM-dd") : undefined,
                statusId: filters.statusId || undefined,

                sortBy: filters.sortBy,
                creatorId: filters.creatorId ? Number(filters.creatorId) : undefined,
                tableId: filters.tableId ? Number(filters.tableId) : undefined,
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
    }, [pagination.pageIndex, pagination.pageSize, filters, debouncedSearch]);

    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);

    // --- ACTIONS ---
    const onSearchChange = (value: string) => {
        setSearchInput(value);
        setPagination(prev => ({ ...prev, pageIndex: 1 }));
    };

    const onDateChange = (date: Date | null) => {
        setFilters(prev => ({ ...prev, date }));
        setPagination(prev => ({ ...prev, pageIndex: 1 }));
    };

    const onStatusChange = (statusId: number | null) => {
        setFilters(prev => ({ ...prev, statusId }));
        setPagination(prev => ({ ...prev, pageIndex: 1 }));
    };

    // ACTION CHO SORT VÀ FILTER
    const onSortChange = (val: string) => {
        setFilters(prev => ({ ...prev, sortBy: val }));
        setPagination(prev => ({ ...prev, pageIndex: 1 }));
    };

    const onCreatorFilterChange = (val: string | null) => {
        setFilters(prev => ({ ...prev, creatorId: val }));
        setPagination(prev => ({ ...prev, pageIndex: 1 }));
    };

    const onTableFilterChange = (val: string | null) => {
        setFilters(prev => ({ ...prev, tableId: val }));
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
            onSortChange,
            onCreatorFilterChange,
            onTableFilterChange,
            onPageChange,
            onPageSizeChange
        }
    };
};