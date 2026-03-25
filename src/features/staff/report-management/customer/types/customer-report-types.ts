import { BaseReportFilterParams } from "../../shared/types/shared-types";

export interface CustomerReportRecordDto {
    customerId: string;
    customerName: string;
    totalOrders: number;
    grandTotal: number;
}

export interface CustomerFilterParams extends BaseReportFilterParams {
    customerIds?: number[];
}