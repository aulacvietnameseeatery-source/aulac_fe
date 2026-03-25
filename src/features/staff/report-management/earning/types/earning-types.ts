import { BaseReportFilterParams } from "../../shared/types/shared-types";

export interface EarningRecordDto {
    earningId: string;
    date: string;
    orderId: string;
    customerName: string;
    orderType: string;
    paymentMethod: string;
    grandTotal: number;
    status: string;
}

export interface EarningFilterParams extends BaseReportFilterParams {
    customerIds?: number[];
    paymentMethodIds?: number[];
}