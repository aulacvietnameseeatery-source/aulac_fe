import { api } from '@/lib/http';
import { ApiResponse, PagedResult } from '@/types/api-response.types';
import { OrderHistory, OrderHistoryFilters, OrderStatusCount } from '../types/order-history.types';

export const orderHistoryService = {
    getOrderHistory: async (filters: OrderHistoryFilters): Promise<PagedResult<OrderHistory>> => {
        const params = new URLSearchParams();

        params.append('PageIndex', filters.pageIndex.toString());
        params.append('PageSize', filters.pageSize.toString());

        if (filters.orderStatusLvId !== undefined) {
            params.append('OrderStatusLvId', filters.orderStatusLvId.toString());
        }
        if (filters.fromDate) {
            params.append('FromDate', filters.fromDate);
        }
        if (filters.toDate) {
            params.append('ToDate', filters.toDate);
        }
        if (filters.search) {
            params.append('Search', filters.search);
        }

        const queryString = params.toString();
        const path = `/api/orders/history${queryString ? `?${queryString}` : ''}`;

        const response = await api.get<ApiResponse<PagedResult<OrderHistory>>>(path);
        return response.data;
    },

    getOrderStatusCount: async (): Promise<OrderStatusCount> => {
        const response = await api.get<ApiResponse<OrderStatusCount>>('/api/orders/count');
        return response.data;
    },

    processPayment: async (data: { orderId: number; receivedAmount: number; paymentMethod: string; note?: string; tipAmount?: number }): Promise<void> => {
        await api.post('/api/payments', data);
    },
};
