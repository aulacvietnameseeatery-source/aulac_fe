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