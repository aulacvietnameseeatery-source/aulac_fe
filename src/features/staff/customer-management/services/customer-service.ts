import { ApiResponse, PagedResult } from "@/types/api-response.types";
import { CustomerListDto, CustomerListQueryDto, CustomerDetailDto, CreateCustomerRequest, UpdateCustomerRequest } from "../types/customer-types";
import { api } from "@/lib/http";

export const staffCustomerService = {
    getCustomers: async (params: CustomerListQueryDto): Promise<PagedResult<CustomerListDto>> => {
        const query = new URLSearchParams();
        query.append("pageIndex", params.pageIndex.toString());
        query.append("pageSize", params.pageSize.toString());

        if (params.search) query.append("search", params.search);
        
        if (params.isMember !== undefined && params.isMember !== "All") {
            query.append("isMember", params.isMember.toString());
        }

        if (params.fromDate) query.append("fromDate", params.fromDate);
        if (params.toDate) query.append("toDate", params.toDate);

        const response = await api.get<ApiResponse<PagedResult<CustomerListDto>>>(`/api/customers?${query.toString()}`);
        return response.data;
    },

    getById: async (id: number): Promise<CustomerDetailDto> => {
        const response = await api.get<ApiResponse<CustomerDetailDto>>(`/api/customers/${id}`);
        return response.data;
    },

    createCustomer: async (request: CreateCustomerRequest): Promise<CustomerDetailDto> => {
        const response = await api.post<ApiResponse<CustomerDetailDto>, CreateCustomerRequest>(
            `/api/customers`,
            request
        );
        return response.data;
    },

    updateCustomer: async (id: number, request: UpdateCustomerRequest): Promise<CustomerDetailDto> => {
        const response = await api.put<ApiResponse<CustomerDetailDto>, UpdateCustomerRequest>(
            `/api/customers/${id}`,
            request
        );
        return response.data;
    },

    deleteCustomer: async (id: number): Promise<void> => {
        await api.delete(`/api/customers/${id}`);
    },
};
