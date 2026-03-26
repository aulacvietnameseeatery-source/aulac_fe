export interface DashboardFilterRequest {
    startDate?: string;
    endDate?: string;
}

export interface TrendValueDto {
    value: number;
    trend: number;
    isUp: boolean;
}

export interface DashboardSummaryDto {
    totalOrders: TrendValueDto;
    totalSales: TrendValueDto;
    averageOrderValue: TrendValueDto;
    totalReservations: TrendValueDto;
}

export interface RevenueChartItemDto {
    date: string;
    revenue: number;
    orders: number;
}

export interface TopSellingItemDto {
    dishId: number;
    dishName: string;
    totalQuantity: number;
    imageUrl?: string;
}

export interface TopCustomerDto {
    customerId: number;
    customerName: string;
    spent: number;
}

export interface DashboardStatisticsDto {
    ordersByType: Record<string, number>;
    topCustomer?: TopCustomerDto;
}

export interface ReservationActivityDto {
    reservationId: number;
    customerName: string;
    reservedTime: string;
    tableName?: string;
    pax: number;
    statusName: string;
}

export interface TableActivityDto {
    tableId: number;
    tableCode: string;
    capacity: number;
    zone: string;
}

export interface NotificationActivityDto {
    id: number;
    type: string;
    createdAt: string;
    metadata?: any;
}