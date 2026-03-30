import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { dashboardService } from "../services/dashboard-service";
import type {
    DashboardFilterRequest,
    DashboardSummaryDto,
    RevenueChartItemDto,
    TopSellingItemDto,
    DashboardStatisticsDto,
    ReservationActivityDto,
    TableActivityDto,
    NotificationActivityDto,
    TopCustomerDto
} from "../types/dashboard-types";

export interface DashboardFilterParams extends DashboardFilterRequest {
    period?: 'today' | 'weekly' | 'monthly' | 'yearly' | 'custom';
}

export const useDashboard = () => {
    const [isLoading, setIsLoading] = useState(false);

    const [summary, setSummary] = useState<DashboardSummaryDto | null>(null);
    const [revenueData, setRevenueData] = useState<RevenueChartItemDto[]>([]);
    const [topSelling, setTopSelling] = useState<TopSellingItemDto[]>([]);
    const [statistics, setStatistics] = useState<DashboardStatisticsDto | null>(null);

    const [topSpenders, setTopSpenders] = useState<TopCustomerDto[]>([]);

    const [reservations, setReservations] = useState<ReservationActivityDto[]>([]);
    const [tables, setTables] = useState<TableActivityDto[]>([]);
    const [notifications, setNotifications] = useState<NotificationActivityDto[]>([]);

    const [filters, setFilters] = useState<DashboardFilterParams>({ period: 'weekly' });

    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        try {
            const apiFilters: DashboardFilterRequest = {
                startDate: filters.startDate,
                endDate: filters.endDate
            };

            const [
                summaryRes, revenueRes, topSellingRes, statsRes,
                reserRes, tablesRes, notifRes, topSpendersRes
            ] = await Promise.allSettled([
                dashboardService.getSummary(apiFilters),
                dashboardService.getRevenueChart(apiFilters),
                dashboardService.getTopSelling({ ...apiFilters, limit: 6 }),
                dashboardService.getStatistics(apiFilters),
                dashboardService.getRecentReservations(),
                dashboardService.getAvailableTables(),
                dashboardService.getNotifications(),
                dashboardService.getTopSpenders(apiFilters)
            ]);

            if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value);
            if (revenueRes.status === 'fulfilled') setRevenueData(revenueRes.value);
            if (topSellingRes.status === 'fulfilled') setTopSelling(topSellingRes.value);
            if (statsRes.status === 'fulfilled') setStatistics(statsRes.value);
            if (reserRes.status === 'fulfilled') setReservations(reserRes.value);
            if (tablesRes.status === 'fulfilled') setTables(tablesRes.value);
            if (notifRes.status === 'fulfilled') setNotifications(notifRes.value);

            if (topSpendersRes.status === 'fulfilled') setTopSpenders(topSpendersRes.value);

            [summaryRes, revenueRes, topSellingRes, statsRes, reserRes, tablesRes, notifRes, topSpendersRes].forEach(res => {
                if (res.status === 'rejected') console.error("Dashboard API Error:", res.reason);
            });

        } catch (error: any) {
            toast.error(error.message || "Lỗi khi tải dữ liệu Dashboard.");
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const onFilterChange = (newFilters: Partial<DashboardFilterParams>) => setFilters(prev => ({ ...prev, ...newFilters }));
    const refresh = () => fetchDashboardData();

    return {
        data: { summary, revenueData, topSelling, statistics, reservations, tables, notifications, topSpenders },
        isLoading,
        filters,
        actions: { onFilterChange, refresh }
    };
};