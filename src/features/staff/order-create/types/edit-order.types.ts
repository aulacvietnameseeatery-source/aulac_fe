import { OrderItemStatusCode } from "@/types/status-codes";

export type OrderItemStatus = 'Created' | 'In Progress' | 'Ready' | 'Served' | 'Rejected';
export type OrderStatus = 'Pending' | 'In progress' | 'Completed' | 'Cancelled';

export type OrderPromotionDto = {
  promotionId: number;
  promotionName: string;
  discountAmount: number;
};

export type OrderCouponDto = {
  couponId: number;
  couponCode: string;
  discountAmount: number;
};

export type OrderPaymentDto = {
  paymentId: number;
  receivedAmount: number;
  changeAmount: number;
  paidAt: string;
  method: string; // e.g., 'CARD' | 'CASH'
};

export type ExistingOrderItemDto = {
  orderItemId: number;
  dishId: number;
  dishName: string;
  dishNameI18n?: Record<string, string>;
  quantity: number;
  price: number;
  itemStatus: OrderItemStatusCode;
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
  
  subTotalAmount: number;  
  totalAmount: number;
  taxAmount: number;
  taxId?: number;          
  tipAmount: number;
  
  orderStatus: OrderStatus; 
  source: string;
  
  createdAt?: string;
  updatedAt?: string;
  isPaid: boolean;
  
  orderItems: ExistingOrderItemDto[];
  promotions: OrderPromotionDto[]; 
  coupons: OrderCouponDto[];       
  payments: OrderPaymentDto[];     
  itemCount: number;
};

export type AddOrderItemsRequest = {
  items: { dishId: number; quantity: number; note?: string }[];
};