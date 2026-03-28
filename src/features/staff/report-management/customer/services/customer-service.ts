import { ApiResponse, PagedResult } from "@/types/api-response.types";
import { api } from "@/lib/http";
import {
    CustomerFilterParams,
    CustomerReportRecordDto
} from "@/features/staff/report-management/customer/types/customer-report-types";

export const customerReportService = {
    getTopSpenders: async (
        params: CustomerFilterParams & { pageIndex: number; pageSize: number }
    ): Promise<PagedResult<CustomerReportRecordDto>> => {
        const query = new URLSearchParams();

        if (params.startDate) query.append("startDate", params.startDate);
        if (params.endDate) query.append("endDate", params.endDate);
        query.append("pageIndex", params.pageIndex.toString());
        query.append("pageSize", params.pageSize.toString());

        const response = await api.get<ApiResponse<PagedResult<CustomerReportRecordDto>>>(
            `/api/reports/customers/top-spenders?${query.toString()}`
        );

        return response.data;
    }
};