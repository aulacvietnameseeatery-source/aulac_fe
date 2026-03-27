export interface CustomerProfileDto {
    customerId: number;
    fullName: string | null;
    phone: string;
    email: string | null;
    isMember: boolean;
    loyaltyPoints: number;
    createdAt: string;
    orderCount: number;
    reservationCount: number;
    lastOrderTime: string | null;
    totalSpent: number;
}

export interface CustomerOrderDto {
    orderId: number;
    createdAt: string;
    totalAmount: number;
    tipAmount: number | null;
    orderType: string;
    status: string;
}

export interface CustomerOrderQueryDto {
    customerId: number;
    pageIndex: number;
    pageSize: number;
    fromDate?: string;
    toDate?: string;
    orderType?: string;
}

// Order Detail Types
export interface CustomerOrderItemDto {
    orderItemId: number;
    dishId: number;
    dishName: string;
    quantity: number;
    price: number;
    status: string;
    note: string | null;
}

export interface CustomerOrderPromotionDto {
    promotionId: number;
    promotionName: string;
    discountAmount: number;
}

export interface CustomerOrderCouponDto {
    couponId: number;
    couponCode: string;
    discountAmount: number;
}

export interface CustomerOrderPaymentDto {
    paymentId: number;
    receivedAmount: number;
    changeAmount: number;
    paidAt: string | null;
    method: string;
}

export interface CustomerOrderDetailDto {
    orderId: number;
    createdAt: string;
    totalAmount: number;
    tipAmount: number | null;
    status: string;
    orderType: string;
    tableCode: string | null;
    staffName: string | null;
    items: CustomerOrderItemDto[];
    promotions: CustomerOrderPromotionDto[];
    coupons: CustomerOrderCouponDto[];
    payments: CustomerOrderPaymentDto[];
}