
export interface OrderRealtimeDTO {
  orderId: number;
  status: string;
  tableId: number | null;
  updatedAt: string;
}

export interface UseOrdersSignalRProps {
  onOrderCreated?: (data: OrderRealtimeDTO) => void;
  onOrderUpdated?: (data: OrderRealtimeDTO) => void;
}