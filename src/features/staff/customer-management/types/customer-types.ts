export interface CustomerListDto {
    customerId: number;
    fullName: string | null;
    phone: string;
    email: string | null;
    isMember: boolean | null;
    loyaltyPoints: number | null;
    createdAt: string | null;
    orderCount: number;
    reservationCount: number;
    lastOrderTime: string | null;
}

export interface CustomerListQueryDto {
    pageIndex: number;
    pageSize: number;
    search?: string;
    isMember?: boolean | "All";
    fromDate?: string;
    toDate?: string;
}