// features/admin/dish-management/dish-list/services/dish.service.ts

import { ApiResponse, PagedResult } from "@/types/api-response.types";
import { DishManagementDto, GetDishesParams } from "../types/dish-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const staffDishService = {
    getDishes: async (params: GetDishesParams): Promise<PagedResult<DishManagementDto>> => {
        const query = new URLSearchParams();
        query.append("pageIndex", params.pageIndex.toString());
        query.append("pageSize", params.pageSize.toString());

        if (params.search) query.append("search", params.search);
        if (params.category && params.category !== "All") query.append("category", params.category);
        if (params.status && params.status !== "All") query.append("status", params.status.toString());
        if (params.sortBy) query.append("sortBy", params.sortBy);
        if (params.isDescending !== undefined) query.append("isDescending", params.isDescending.toString());

        const res = await fetch(`${API_BASE_URL}/dishes/management?${query.toString()}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        if (!res.ok) throw new Error("Staff API: Failed to fetch dishes");

        const response: ApiResponse<PagedResult<DishManagementDto>> = await res.json();
        return response.data;
    },
};