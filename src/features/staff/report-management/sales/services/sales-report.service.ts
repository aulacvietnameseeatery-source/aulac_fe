import { ApiResponse, PagedResult } from "@/types/api-response.types";
import { api } from "@/lib/http";
import {SalesFilterParams, SalesItemDto} from "@/features/staff/report-management/sales/types/sales-report-types";

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
    }
};