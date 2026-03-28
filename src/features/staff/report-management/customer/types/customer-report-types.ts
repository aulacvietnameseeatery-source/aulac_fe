export interface CustomerReportRecordDto {
    customerId: number;
    customerName: string;
    phone: string;
    totalOrders: number;
    totalSpent: number;
    lastVisitDate: string | null;
}

export interface CustomerFilterParams {
    startDate?: string;
    endDate?: string;
}