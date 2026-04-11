export interface SalesItemDto {
    dishId: number;
    dishName: string;
    categoryName: string;
    quantitySold: number;
    totalRevenue: number;
}

export interface SalesFilterParams {
    startDate?: string;
    endDate?: string;
}

export interface TrendData {
    date: string;
    quantity: number;
}

export interface CrossSellItem {
    id: string;
    name: string;
    frequency: number;
}

export interface ItemDetailData {
    totalRevenue: number;
    totalSold: number;
    avgDailySold: number;
    trend: TrendData[];
    frequentlyBoughtWith: CrossSellItem[];
}