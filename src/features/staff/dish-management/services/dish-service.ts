// features/admin/dish-management/dish-list/services/dish.service.ts

import { ApiResponse, PagedResult } from "@/types/api-response.types";
import { DishManagementDto, GetDishesParams } from "../types/dish-types";

// Định nghĩa thêm Type cho Status trả về từ API
export interface DishStatusOption {
    statusId: number;
    statusName: string;
}
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7083/api";

export const staffDishService = {
    // 1. Lấy danh sách món ăn (Giữ nguyên)
    getDishes: async (params: GetDishesParams): Promise<PagedResult<DishManagementDto>> => {
        const query = new URLSearchParams();
        query.append("pageIndex", params.pageIndex.toString());
        query.append("pageSize", params.pageSize.toString());

        if (params.search) query.append("search", params.search);
        if (params.category && params.category !== "All") query.append("category", params.category);
        if (params.status && params.status !== "All") query.append("status", params.status.toString());
        if (params.sortBy) query.append("sortBy", params.sortBy);
        // Lưu ý: convert boolean sang string
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

    // 2. Lấy danh sách Categories cho Dropdown
    getAllCategories: async (): Promise<string[]> => {
        const res = await fetch(`${API_BASE_URL}/dishes/categories`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch categories");
        const response: ApiResponse<string[]> = await res.json();
        return response.data;
    },

    // 3. Lấy danh sách Statuses cho Dropdown
    getDishStatuses: async (): Promise<DishStatusOption[]> => {
        const res = await fetch(`${API_BASE_URL}/dishes/statuses`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch statuses");
        const response: ApiResponse<DishStatusOption[]> = await res.json();
        return response.data;
    }
};