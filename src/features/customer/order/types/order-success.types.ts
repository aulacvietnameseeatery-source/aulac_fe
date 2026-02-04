export interface OrderSuccessData {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  currency: 'CHF';
  diningOption: 'DINE_IN' | 'TAKE_AWAY';
  readyInMinutes: number;
}
