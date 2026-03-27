import { ApiResponse, PagedResult } from "@/types/api-response.types";
import { PaymentListDto, PaymentListQueryDto } from "../types/payment-types";
import { api } from "@/lib/http";

export const staffPaymentService = {
    getPayments: async (params: PaymentListQueryDto): Promise<PagedResult<PaymentListDto>> => {
        const query = new URLSearchParams();
        query.append("pageIndex", params.pageIndex.toString());
        query.append("pageSize", params.pageSize.toString());

        if (params.search) query.append("search", params.search);
        
        if (params.method && params.method !== "All") {
            query.append("method", params.method);
        }

        if (params.fromDate) query.append("fromDate", params.fromDate);
        if (params.toDate) query.append("toDate", params.toDate);

        const response = await api.get<ApiResponse<PagedResult<PaymentListDto>>>(`/api/payments?${query.toString()}`);
        return response.data; 
    },

    getAllPayments: async (totalCount: number): Promise<PaymentListDto[]> => {
        const pageSize = totalCount > 0 ? totalCount : 10000;
        
        const queryParams = new URLSearchParams({
            pageIndex: "1",
            pageSize: pageSize.toString(),
        }).toString();

        const response = await api.get<ApiResponse<PagedResult<PaymentListDto>>>(`/api/payments?${queryParams}`);
        
        const allData = response?.data?.pageData || [];
        
        return allData as PaymentListDto[];
    }
};