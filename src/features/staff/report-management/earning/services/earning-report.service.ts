import { ApiResponse, PagedResult } from "@/types/api-response.types";
import { api } from "@/lib/http";
import { EarningFilterParams, EarningTableItemDto } from "../types/earning-types";

export const earningReportService = {
    getEarningTable: async (
        params: EarningFilterParams & { pageIndex: number; pageSize: number }
    ): Promise<PagedResult<EarningTableItemDto>> => {
        const query = new URLSearchParams();

        if (params.startDate) query.append("startDate", params.startDate);
        if (params.endDate) query.append("endDate", params.endDate);
        query.append("pageIndex", params.pageIndex.toString());
        query.append("pageSize", params.pageSize.toString());

        const response = await api.get<ApiResponse<PagedResult<EarningTableItemDto>>>(
            `/api/reports/earnings/table?${query.toString()}`
        );

        return response.data;
    }
};