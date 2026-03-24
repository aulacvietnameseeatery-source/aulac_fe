export interface PrintStoreSettings {
  name: string;
  streetAddress: string;
  city: string;
  phone: string;
  email: string;
  vatNumber: string;
  logoUrl?: string;
}

export interface PrintOrderItem {
  name: string;
  qty: number;
  price: number;
  total: number;
}

export interface PrintDiscount {
  type: 'Promotion' | 'Coupon';
  name: string;
  amount: number;
}

export interface PrintPaymentInfo {
  method: string;
  received: number;
  change: number;
}

export interface PrintOrderData {
  id: string;
  date: string;
  time: string;
  orderType: string; // Dine-in hoặc Take-away
  tableNumber?: string | null;
  customerName?: string | null;
  items: PrintOrderItem[];
  
  // Tài chính
  subtotal: number;
  subtotalExclTax: number;
  discounts: PrintDiscount[]; // Chứa cả promotions và coupons
  
  taxAmount: number;
  tipAmount: number;
  totalAmount: number;
  
  paymentInfo?: PrintPaymentInfo; // Dành riêng cho Receipt
}

export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
  total: number;
}

export interface OrderReceipt {
  id: string;
  date: string;
  time: string;
  status: string;
  paymentMethod: string;
  tips: number;
  items: ReceiptItem[];
}