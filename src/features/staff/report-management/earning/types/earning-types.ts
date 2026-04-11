import { BaseReportFilterParams } from "../../shared/types/shared-types";

export interface EarningTableItemDto {
    date: string;
    totalOrders: number;
    grossRevenue: number;
    netRevenue: number;
    totalTax: number;
}

export interface EarningFilterParams extends BaseReportFilterParams {
    startDate?: string;
    endDate?: string;
}

export interface HourlyRevenueDto {
    time: string;
    revenue: number;
}

export interface RecentOrderDto {
    id: string;
    time: string;
    customer: string;
    amount: number;
    status: string;
}

export interface DailyEarningDetailDto {
    totalNet: number;
    avgOrder: number;
    totalOrders: number;
    hourlyRevenue: HourlyRevenueDto[];
    recentOrders: RecentOrderDto[];
}