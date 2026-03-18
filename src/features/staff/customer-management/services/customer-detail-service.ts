import { ApiResponse, PagedResult } from "@/types/api-response.types";
import { api } from "@/lib/http";
import { 
    CustomerProfileDto, 
    CustomerOrderDto, 
    CustomerOrderQueryDto, 
    CustomerOrderDetailDto 
} from "../types/customer-detail-types";

export const customerDetailService = {
    // 1. Profile
    getProfile: async (customerId: number): Promise<CustomerProfileDto> => {
        const response = await api.get<ApiResponse<CustomerProfileDto>>(`/api/customers/detail/${customerId}`);
        return response.data;
    },

    // 2. Order History
    getOrders: async (params: CustomerOrderQueryDto): Promise<PagedResult<CustomerOrderDto>> => {
        const query = new URLSearchParams();
        query.append("pageIndex", params.pageIndex.toString());
        query.append("pageSize", params.pageSize.toString());
        
        if (params.fromDate) query.append("fromDate", params.fromDate);
        if (params.toDate) query.append("toDate", params.toDate);
        if (params.orderType) query.append("orderType", params.orderType.toString());

        const response = await api.get<ApiResponse<PagedResult<CustomerOrderDto>>>(
            `/api/customers/${params.customerId}/orders?${query.toString()}`
        );
        return response.data;
    },

    // 3. Order Detail
    getOrderDetail: async (customerId: number, orderId: number): Promise<CustomerOrderDetailDto> => {
        const response = await api.get<ApiResponse<CustomerOrderDetailDto>>(
            `/api/customers/${customerId}/orders/${orderId}`
        );
        return response.data;
    }
};