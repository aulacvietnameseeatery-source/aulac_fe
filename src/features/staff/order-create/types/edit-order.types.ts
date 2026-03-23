export type OrderItemStatus = 'Created' | 'In Progress' | 'Ready' | 'Served' | 'Rejected';
export type OrderStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export type ExistingOrderItemDto = {
  orderItemId: number;
  dishId: number;
  dishName: string;
  quantity: number;
  price: number;
  itemStatus: OrderItemStatus;
  rejectReason?: string | null;
  note?: string | null;
};

export type OrderDetailDto = {
  orderId: number;
  tableId?: number;
  tableCode?: string;
  staffId?: number;
  staffName?: string;
  customerId?: number;
  customerName?: string;
  totalAmount: number;
  taxAmount: number;
  tipAmount: number;
  orderStatus: OrderStatus;
  source: string; // 'Dine-in' | 'Takeaway'
  createdAt: string;
  updatedAt: string;
  isPaid: boolean;
  orderItems: ExistingOrderItemDto[];
};

export type AddOrderItemsRequest = {
  items: { dishId: number; quantity: number; note?: string }[];
};