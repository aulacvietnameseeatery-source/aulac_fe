export interface Dish {
    dishId: number;
    dishName: string;
    price: number;
    description?: string;
    dishStatusLv?: {
        valueCode: string;
        valueName: string
    };
    category?: {
        categoryId: number;
        categoryName: string;
    };
    dishMedia?: { url: string }[];
}

export interface GetDishesParams {
    pageIndex?: number;
    pageSize?: number;
    search?: string;
    category?: string;
    status?: string;
}