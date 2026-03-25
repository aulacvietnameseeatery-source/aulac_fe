// src/features/dashboard/services/dashboard-service.ts

import {
    DashboardFilterParams,
    DashboardSummaryDto,
    RevenueChartItemDto,
    TopSellingItemDto,
    DashboardStatisticsDto
} from "../types/dashboard-types";

// Hàm helper để build query string
const buildQueryParams = (params?: DashboardFilterParams) => {
    if (!params) return "";
    const query = new URLSearchParams();
    if (params.startDate) query.append("startDate", params.startDate);
    if (params.endDate) query.append("endDate", params.endDate);
    if (params.period) query.append("period", params.period);
    return `?${query.toString()}`;
};

const fetchApi = async <T>(url: string): Promise<T> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, { headers });
    const json = await response.json();

    if (!response.ok || !json.success) {
        throw new Error(json.userMessage || "Lỗi khi tải dữ liệu Dashboard");
    }
    return json.data;
};

export const dashboardService = {
    // 1. Lấy thông số tổng quan
    getSummary: (params?: DashboardFilterParams): Promise<DashboardSummaryDto> => {
        return fetchApi(`/api/dashboard/summary${buildQueryParams(params)}`);
    },

    // 2. Lấy dữ liệu biểu đồ doanh thu
    getRevenueChart: (params?: DashboardFilterParams): Promise<RevenueChartItemDto[]> => {
        return fetchApi(`/api/dashboard/revenue-chart${buildQueryParams(params)}`);
    },

    // 3. Lấy Top món ăn bán chạy
    getTopSelling: (limit: number = 6, params?: DashboardFilterParams): Promise<TopSellingItemDto[]> => {
        const query = buildQueryParams(params);
        const limitQuery = query ? `${query}&limit=${limit}` : `?limit=${limit}`;
        return fetchApi(`/api/dashboard/top-selling${limitQuery}`);
    },

    // 4. Lấy thống kê Phân loại & Người dùng
    getStatistics: (params?: DashboardFilterParams): Promise<DashboardStatisticsDto> => {
        return fetchApi(`/api/dashboard/statistics${buildQueryParams(params)}`);
    }
};