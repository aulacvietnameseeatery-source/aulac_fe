import { ApiResponse, PagedResult } from "@/types/api-response.types";
import { api } from "@/lib/http";
import {
    EarningFilterParams,
    EarningTableItemDto,
    DailyEarningDetailDto
} from "../types/earning-types";

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
    },

    getDailyEarningDetail: async (date: string): Promise<DailyEarningDetailDto> => {
        const response = await api.get<ApiResponse<DailyEarningDetailDto>>(
            `/api/reports/earnings/daily-detail?date=${date}`
        );
        return response.data;
    }
};