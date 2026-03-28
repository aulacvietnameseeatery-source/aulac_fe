import { ApiResponse, PagedResult } from "@/types/api-response.types";
import { api } from "@/lib/http";
import { OrderFilterParams, OrderReportRecordDto } from "../types/order-report-types";

export const orderReportService = {
    // Tận dụng API History có sẵn của Order module
    getOrderHistory: async (
        params: OrderFilterParams & { pageIndex: number; pageSize: number }
    ): Promise<PagedResult<OrderReportRecordDto>> => {
        const query = new URLSearchParams();

        if (params.startDate) query.append("startDate", params.startDate);
        if (params.endDate) query.append("endDate", params.endDate);
        query.append("pageIndex", params.pageIndex.toString());
        query.append("pageSize", params.pageSize.toString());

        // Thay đổi URL thành endpoint thực tế lấy lịch sử đơn hàng của bạn
        const response = await api.get<ApiResponse<PagedResult<OrderReportRecordDto>>>(
            `/api/orders/history?${query.toString()}`
        );

        return response.data;
    }
};