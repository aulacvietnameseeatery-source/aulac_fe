import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {EarningTableItemDto,EarningFilterParams } from "@/features/staff/report-management/earning/types/earning-types";
import {earningReportService} from "@/features/staff/report-management/earning/services/earning-report.service";

export const useEarningReport = () => {
    const [data, setData] = useState<EarningTableItemDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    const [paginationInfo, setPaginationInfo] = useState({
        page: 1,
        pageSize: 10,
    });

    const [filters, setFilters] = useState<EarningFilterParams>({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });

    const fetchReportData = useCallback(async () => {
        if (!filters.startDate || !filters.endDate) return;

        setIsLoading(true);
        try {
            const response = await earningReportService.getEarningTable({
                startDate: filters.startDate,
                endDate: filters.endDate,
                pageIndex: paginationInfo.page,
                pageSize: paginationInfo.pageSize
            });

            if (response && response.pageData) {
                setData(response.pageData);
                setTotalCount(response.totalCount);
            }
        } catch (error: any) {
            console.error("Fetch earning report failed:", error);
            toast.error(error.response?.data?.userMessage || "Failed to load earning report.");
        } finally {
            setIsLoading(false);
        }
    }, [filters, paginationInfo.page, paginationInfo.pageSize]);

    const onDataChange = useCallback((params: {
        search?: string;
        filters?: Record<string, any>;
        sort?: any[];
        page?: number;
        pageSize?: number
    }) => {
        setPaginationInfo(prev => ({
            ...prev,
            page: params.page ?? prev.page,
            pageSize: params.pageSize ?? prev.pageSize,
        }));
    }, []);

    useEffect(() => {
        fetchReportData();
    }, [fetchReportData]);

    const applyDateFilter = useCallback((startDate: string, endDate: string) => {
        setFilters({ startDate, endDate });
        setPaginationInfo(prev => ({ ...prev, page: 1 }));
    }, []);

    return {
        data,
        isLoading,
        totalCount,
        paginationInfo,
        filters,
        onDataChange,
        refresh: fetchReportData,
        applyDateFilter
    };
};