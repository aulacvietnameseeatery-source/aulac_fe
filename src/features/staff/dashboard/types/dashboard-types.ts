// src/features/dashboard/types/dashboard-types.ts

export interface DashboardFilterParams {
    startDate?: string;
    endDate?: string;
    period?: 'weekly' | 'monthly' | 'yearly' | 'all';
}

// Kiểu dữ liệu cho các con số có kèm % tăng giảm
export interface TrendValue {
    value: number;
    trend: number;
    isUp: boolean;
}

// 1. API Tổng quan (4 thẻ trên cùng)
export interface DashboardSummaryDto {
    totalOrders: TrendValue;
    totalSales: TrendValue;
    averageOrderValue: TrendValue;
    totalReservations: TrendValue;
}

// 2. API Biểu đồ Doanh thu
export interface RevenueChartItemDto {
    date: string; // Ngày/Tháng tùy filter
    revenue: number;
    orders: number;
}

// 3. API Top Món Bán Chạy
export interface TopSellingItemDto {
    dishId: number;
    dishName: string;
    totalQuantity: number;
    isVeg: boolean;
    imageUrl?: string;
}

// 4. API Thống kê Category & Users
export interface DashboardStatisticsDto {
    ordersByType: {
        dineIn: number;
        takeAway: number;
        delivery: number;
    };
    topCustomer: {
        customerId: number;
        customerName: string;
        spent: number;
        avatarUrl?: string;
    } | null;
    totalNewUsers: TrendValue;
}