import { BaseReportFilterParams } from "../../shared/types/shared-types";

export interface SalesReportRecordDto {
    salesId: string;
    date: string;
    category: string;
    itemsSold: number;
    totalOrders: number;
    grandTotal: number;
    status: string;
}

export interface SalesFilterParams extends BaseReportFilterParams {
    categoryIds?: number[];
}