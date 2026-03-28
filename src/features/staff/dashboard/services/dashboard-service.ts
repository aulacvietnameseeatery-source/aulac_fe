import { api } from "@/lib/http";
import type {ApiResponse, PagedResult} from "@/types/api-response.types";
import type {
    DashboardFilterRequest,
    DashboardSummaryDto,
    RevenueChartItemDto,
    TopSellingItemDto,
    DashboardStatisticsDto, ReservationActivityDto, TableActivityDto, NotificationActivityDto
} from "../types/dashboard-types";

const BASE = "/api/dashboard";

function toQuery(params: Record<string, string | number | boolean | undefined | null>): string {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== "") {
            q.set(k, String(v));
        }
    }
    const str = q.toString();
    return str ? `?${str}` : "";
}

export const dashboardService = {
    // 1. Thống kê tổng quan
    async getSummary(params: DashboardFilterRequest = {}): Promise<DashboardSummaryDto> {
        const query = toQuery({
            startDate: params.startDate,
            endDate: params.endDate
        });
        const res = await api.get<ApiResponse<DashboardSummaryDto>>(`${BASE}/summary${query}`);
        return res.data!;
    },

    // 2. Biểu đồ doanh thu
    async getRevenueChart(params: DashboardFilterRequest = {}): Promise<RevenueChartItemDto[]> {
        const query = toQuery({
            startDate: params.startDate,
            endDate: params.endDate
        });
        const res = await api.get<ApiResponse<RevenueChartItemDto[]>>(`${BASE}/revenue-chart${query}`);
        return res.data ?? [];
    },

    // 3. Top món bán chạy
    async getTopSelling(params: DashboardFilterRequest & { limit?: number } = {}): Promise<TopSellingItemDto[]> {
        const query = toQuery({
            startDate: params.startDate,
            endDate: params.endDate,
            limit: params.limit ?? 6 // 6 món
        });
        const res = await api.get<ApiResponse<TopSellingItemDto[]>>(`${BASE}/top-selling${query}`);
        return res.data ?? [];
    },

    // 4. Phân loại đơn & Top Khách hàng
    async getStatistics(params: DashboardFilterRequest = {}): Promise<DashboardStatisticsDto> {
        const query = toQuery({
            startDate: params.startDate,
            endDate: params.endDate
        });
        const res = await api.get<ApiResponse<DashboardStatisticsDto>>(`${BASE}/statistics${query}`);
        return res.data!;
    },

    async getRecentReservations(): Promise<ReservationActivityDto[]> {
        const res = await api.get<ApiResponse<PagedResult<ReservationActivityDto>>>("/api/reservations?pageIndex=1&pageSize=10");
        return res.data?.pageData ?? [];
    },

    async getAvailableTables(): Promise<TableActivityDto[]> {
        const res = await api.get<ApiResponse<TableActivityDto[]>>("/api/public/availability");
        return res.data ?? [];
    },

    async getNotifications(): Promise<NotificationActivityDto[]> {
        const res = await api.get<ApiResponse<any>>("/api/notifications");

        let notifArray: NotificationActivityDto[] = [];
        if (Array.isArray(res.data)) {
            notifArray = res.data;
        } else if (res.data && Array.isArray((res.data as any).pageData)) {
            notifArray = (res.data as any).pageData;
        }
        return notifArray;
    }
};