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

export interface CustomerDetailDto {
    customerId: number;
    fullName: string | null;
    phone: string;
    email: string | null;
    isMember: boolean | null;
    loyaltyPoints: number | null;
    createdAt: string | null;
}

export interface CreateCustomerRequest {
    phone: string;
    fullName?: string;
    email?: string;
    isMember: boolean;
    loyaltyPoints: number;
}

export interface UpdateCustomerRequest {
    phone: string;
    fullName?: string;
    email?: string;
    isMember: boolean;
    loyaltyPoints: number;
}

export interface CustomerListQueryDto {
    pageIndex: number;
    pageSize: number;
    search?: string;
    isMember?: boolean | "All";
    fromDate?: string;
    toDate?: string;
}
