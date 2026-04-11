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

export interface CategoryPreferenceDto {
    name: string;
    value: number;
    color: string;
}

export interface RecentOrderDto {
    id: string;
    time: string;
    customer: string;
    amount: number;
    status: string;
}

export interface CustomerProfileDetailDto {
    totalSpent: number;
    totalOrders: number;
    avgOrder: number;
    points: number;
    preferences: CategoryPreferenceDto[];
    recentOrders: RecentOrderDto[];
}