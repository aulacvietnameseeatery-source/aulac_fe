// features/admin/dish-management/dish-list/types/dish.types.ts

import { DishStatusCode } from "@/types/status-codes";

// DishStatusCode has been moved to @/types/status-codes.ts


export interface GetDishesParams {
    pageIndex: number;
    pageSize: number;
    search?: string;
    category?: string;
    status?: DishStatusCode | string; // Chấp nhận cả Enum hoặc "All"
    sortBy?: string;
    isDescending?: boolean;
    locale?: string;
}

export interface DishManagementDto {
    dishId: number;
    dishName: string;
    categoryName: string;
    price: number;
    status: string; // "AVAILABLE", "OUT_OF_STOCK", v.v.
    isOnline: boolean;
    createdAt: string;
}

export interface GetDishesRequest {
    pageIndex: number;
    pageSize: number;
    sortBy?: string;
    isDescending?: boolean;
    category?: string;
    status?: DishStatusCode;
    isCustomerView?: boolean;
}
