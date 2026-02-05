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
