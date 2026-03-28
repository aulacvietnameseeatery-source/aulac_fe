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