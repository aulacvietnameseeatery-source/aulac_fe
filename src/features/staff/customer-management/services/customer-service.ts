import { ApiResponse, PagedResult } from "@/types/api-response.types";
import { CustomerListDto, CustomerListQueryDto } from "../types/customer-types";
import { api } from "@/lib/http";

export const staffCustomerService = {
    getCustomers: async (params: CustomerListQueryDto): Promise<PagedResult<CustomerListDto>> => {
        const query = new URLSearchParams();
        query.append("pageIndex", params.pageIndex.toString());
        query.append("pageSize", params.pageSize.toString());

        if (params.search) query.append("search", params.search);
        
        // Xử lý filter IsMember (chỉ gửi lên nếu khác "All")
        if (params.isMember !== undefined && params.isMember !== "All") {
            query.append("isMember", params.isMember.toString());
        }

        if (params.fromDate) query.append("fromDate", params.fromDate);
        if (params.toDate) query.append("toDate", params.toDate);

        const response = await api.get<ApiResponse<PagedResult<CustomerListDto>>>(`/api/customers?${query.toString()}`);
        return response.data;
    }
};