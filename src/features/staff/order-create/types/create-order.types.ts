export type CategoryDto = {
  categoryId: number;
  nameVi: string;
  nameEn: string;
  nameFr: string;
};

export type LocalizedDishInfo = {
  dishName: string;
  description: string;
  slogan?: string | null;
  note?: string | null;
  shortDescription?: string | null;
};

export type DishDto = {
  dishId: number;
  categoryId: number;
  price: number;
  chefRecommended?: boolean | null;
  displayOrder?: number | null;
  imageUrl?: string | null;
  i18n: Record<string, LocalizedDishInfo>;
};

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'LOCKED';

export type TableDto = {
  tableId: number;
  tableCode: string;
  capacity: number;
  statusCode: TableStatus;
  hasActiveOrder: boolean;
  activeOrderId?: number | null;
  upcomingReservationTime?: string | null;
  zoneId: number;      
  zoneName: string;    
};

export type CustomerDto = {
  customerId: number;
  fullName: string;
  phone: string;
  email: string;
  isMember: boolean;
  loyaltyPoints: number;
  createdAt: string;
};

export type OrderSourceCode = 'DINE_IN' | 'TAKEAWAY';

export type CreateOrderItemDto = {
  dishId: number;
  quantity: number;
};

export type CreateOrderRequest = {
  tableId?: number;
  customerId?: number;
  source: OrderSourceCode;
  items: CreateOrderItemDto[];
};

export type CartItem = DishDto & {
  quantity: number;
  localName: string;
  note?: string;
};

export type RecentOrderDto = {
  orderId: number;
  customerName: string;
  source: 'DINE_IN' | 'TAKEAWAY';
  tableCode?: string | null;
  createdAt: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
};