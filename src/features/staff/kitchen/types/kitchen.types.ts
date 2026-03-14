// KDS-specific types — maps from KitchenOrderDTO / KitchenOrderItemDTO (backend)
import type { OrderItemStatusCode } from '@/types/status-codes';

export interface KitchenOrderItem {
    orderItemId: number;
    dishName: string;
    quantity: number;
    itemStatus: OrderItemStatusCode | string;
    note?: string;
    rejectReason?: string;
}

export interface KitchenOrder {
    orderId: number;
    tableCode: string;
    orderStatus: string;
    createdAt?: string;
    items: KitchenOrderItem[];
}

export interface UpdateItemStatusRequest {
    status: OrderItemStatusCode;
    rejectReason?: string;
}
