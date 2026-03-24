import { BaseReportFilterParams } from "../../shared/types/shared-types";

export interface OrderReportRecordDto {
    orderId: string;
    date: string;
    customerName: string;
    tokenNo: string;
    orderType: string;
    menusCount: number;
    grandTotal: number;
    status: string;
}

export interface OrderFilterParams extends BaseReportFilterParams {
    customerIds?: number[];
}