// KDS-specific types — maps from KitchenOrderDTO / KitchenOrderItemDTO (backend)

export interface KitchenOrderItem {
    orderItemId: number;
    dishName: string;
    quantity: number;
    itemStatus: string; // CREATED | IN_PROGRESS | READY | SERVED | REJECTED
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
    status: string;
    rejectReason?: string;
}
