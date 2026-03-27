export interface OrderReportRecordDto {
    orderId: string | number;
    date: string;
    customerName: string;
    tokenNo: string;
    orderType: string;
    menusCount: number;
    grandTotal: number;
    status: string;
}

export interface OrderFilterParams {
    startDate?: string;
    endDate?: string;
}