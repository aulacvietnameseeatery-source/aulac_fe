export interface PaymentListDto {
    paymentId: number;
    orderId: number;
    receivedAmount: number;
    changeAmount: number;
    finalAmount: number;
    method: string;
    paidAt: string | null;
    customerName: string | null;
    customerPhone: string | null;
}

export interface PaymentListQueryDto {
    pageIndex: number;
    pageSize: number;
    search?: string;
    method?: string | "All";
    fromDate?: string;
    toDate?: string;
}