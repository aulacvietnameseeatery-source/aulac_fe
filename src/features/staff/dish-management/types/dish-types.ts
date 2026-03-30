// features/admin/dish-management/dish-list/types/dish.types.ts

import { DishStatusCode } from "@/types/status-codes";

export interface GetDishesParams {
    pageIndex: number;
    pageSize: number;
    search?: string;
    category?: string;
    status?: DishStatusCode | string;
    sortBy?: string;
    isDescending?: boolean;
    locale?: string;
}

export interface I18nTextDto {
    vi: string;
    en: string;
    fr: string;
}

export interface DishManagementDto {
    dishId: number;
    dishName: string;
    categoryName: string;

    nameI18n?: I18nTextDto;
    descriptionI18n?: I18nTextDto;
    categoryNameI18n?: I18nTextDto;

    price: number;
    status: string;
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