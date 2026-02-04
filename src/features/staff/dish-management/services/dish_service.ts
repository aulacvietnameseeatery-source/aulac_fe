// Import ApiResponse từ root types
import { ApiResponse, PagedResult } from "@/types/api-response.types";
import { Dish, GetDishesParams } from "../types/dish_types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const staffDishService = {
    getDishes: async (params: GetDishesParams): Promise<PagedResult<Dish>> => {
        const query = new URLSearchParams();

        if (params.pageIndex) query.append("pageIndex", params.pageIndex.toString());
        if (params.pageSize) query.append("pageSize", params.pageSize.toString());
        if (params.search) query.append("search", params.search);
        if (params.category && params.category !== "All") query.append("category", params.category);
        if (params.status && params.status !== "All") query.append("status", params.status);

        const res = await fetch(`${API_BASE_URL}/dish?${query.toString()}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        if (!res.ok) throw new Error("Staff API: Failed to fetch dishes");

        const response: ApiResponse<PagedResult<Dish>> = await res.json();
        return response.data;
    },
};