// src/features/dashboard/hooks/use-dashboard.ts

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { dashboardService } from "../services/dashboard-service";
import {
    DashboardFilterParams,
    DashboardSummaryDto,
    RevenueChartItemDto,
    TopSellingItemDto,
    DashboardStatisticsDto
} from "../types/dashboard-types";

export const useDashboard = () => {
    // STATES
    const [isLoading, setIsLoading] = useState(false);

    const [summary, setSummary] = useState<DashboardSummaryDto | null>(null);
    const [revenueData, setRevenueData] = useState<RevenueChartItemDto[]>([]);
    const [topSelling, setTopSelling] = useState<TopSellingItemDto[]>([]);
    const [statistics, setStatistics] = useState<DashboardStatisticsDto | null>(null);

    // FILTERS
    const [filters, setFilters] = useState<DashboardFilterParams>({
        period: 'weekly'
    });

    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [summaryRes, revenueRes, topSellingRes, statsRes] = await Promise.all([
                dashboardService.getSummary(filters),
                dashboardService.getRevenueChart(filters),
                dashboardService.getTopSelling(6, filters),
                dashboardService.getStatistics(filters)
            ]);

            setSummary(summaryRes);
            setRevenueData(revenueRes);
            setTopSelling(topSellingRes);
            setStatistics(statsRes);

        } catch (error: any) {
            toast.error(error.message || "Không thể tải dữ liệu Dashboard. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    // Tự động gọi khi filters thay đổi
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // ACTIONS
    const onFilterChange = (newFilters: Partial<DashboardFilterParams>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const refresh = () => {
        fetchDashboardData();
    };

    return {
        data: {
            summary,
            revenueData,
            topSelling,
            statistics
        },
        isLoading,
        filters,
        actions: {
            onFilterChange,
            refresh
        }
    };
};