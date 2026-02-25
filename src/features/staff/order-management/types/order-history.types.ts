// Map từ OrderItemDTO (backend)
export interface OrderItem {
    orderItemId: number;
    dishId: number;
    dishName: string;
    quantity: number;
    price: number;
    itemStatus: string;
    rejectReason?: string;
}

// Map từ OrderHistoryDTO (backend)
export interface OrderHistory {
    orderId: number;
    tableId: number;
    tableCode: string;
    staffId: number;
    staffName: string;
    customerId: number;
    customerName?: string;
    totalAmount: number;
    tipAmount?: number;
    orderStatus: string;
    source: string; // 'DINE_IN' | 'TAKE_AWAY' | 'DELIVERY'
    createdAt?: string;
    updatedAt?: string;
    orderItems: OrderItem[];
    itemCount: number;
}

// Map từ OrderHistoryQueryDTO (backend)
export interface OrderHistoryFilters {
    pageIndex: number;
    pageSize: number;
    orderStatusLvId?: number;
    fromDate?: string;
    toDate?: string;
    search?: string;
}

// Thống kê tổng hợp cho status cards
export interface OrderStatusSummary {
    label: string;
    count: number;
    icon: string;
    colorClass: string;
    statusLvId?: number;
}
