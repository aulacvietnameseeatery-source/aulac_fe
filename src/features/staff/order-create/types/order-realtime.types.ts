
export interface OrderRealtimeDTO {
  orderId: number;
  status: string;
  tableId: number | null;
  updatedAt: string;
}

export interface OrderItemRealtimeDTO {
  orderItemId: number;
  orderId: number;
  status: string;
  updatedAt: string;
}

export interface UseOrdersSignalRProps {
  activeOrderId?: number | null;
  onOrderCreated?: (data: OrderRealtimeDTO) => void;
  onOrderUpdated?: (data: OrderRealtimeDTO) => void;
  onOrderDetailUpdated?: (data: OrderRealtimeDTO) => void; 
  onOrderItemUpdated?: (data: OrderItemRealtimeDTO) => void;
}