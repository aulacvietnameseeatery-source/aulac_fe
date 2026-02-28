import { api } from '@/lib/http';
import type { ApiResponse } from '@/types/api-response.types';
import type { KitchenOrder, UpdateItemStatusRequest } from '../types/kitchen.types';

export const kitchenService = {
    async getKitchenOrders(): Promise<KitchenOrder[]> {
        const response = await api.get<ApiResponse<KitchenOrder[]>>('/api/orders/kitchen');
        return response.data ?? [];
    },

    async updateItemStatus(orderItemId: number, request: UpdateItemStatusRequest): Promise<void> {
        await api.patch<ApiResponse<object>>(`/api/orders/items/${orderItemId}/status`, request);
    },
};
