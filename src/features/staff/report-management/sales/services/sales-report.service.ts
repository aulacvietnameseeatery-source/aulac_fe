import { ApiResponse, PagedResult } from "@/types/api-response.types";
import { api } from "@/lib/http";
import { SalesFilterParams, SalesItemDto, ItemDetailData } from "../types/sales-report-types";

export const salesReportService = {
    getSalesItems: async (
        params: SalesFilterParams & { pageIndex: number; pageSize: number }
    ): Promise<PagedResult<SalesItemDto>> => {
        const query = new URLSearchParams();

        if (params.startDate) query.append("startDate", params.startDate);
        if (params.endDate) query.append("endDate", params.endDate);
        query.append("pageIndex", params.pageIndex.toString());
        query.append("pageSize", params.pageSize.toString());

        const response = await api.get<ApiResponse<PagedResult<SalesItemDto>>>(
            `/api/reports/sales/items?${query.toString()}`
        );

        return response.data;
    },

    getDishPerformanceDetail: async (
        dishId: string,
        params: SalesFilterParams
    ): Promise<ItemDetailData> => {
        const query = new URLSearchParams();
        if (params.startDate) query.append("startDate", params.startDate);
        if (params.endDate) query.append("endDate", params.endDate);

        const response = await api.get<ApiResponse<ItemDetailData>>(
            `/api/reports/sales/items/${dishId}/performance?${query.toString()}`
        );

        return response.data;
    }
};