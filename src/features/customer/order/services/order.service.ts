import { OrderSuccessData } from '../types/order-success.types';

export async function getOrderSuccess(
  orderId: string
): Promise<OrderSuccessData> {
  // TODO - Call API
  return {
    orderId,
    orderNumber: '#AL-GEN-8821',
    totalAmount: 84,
    currency: 'CHF',
    diningOption: 'TAKE_AWAY',
    readyInMinutes: 20,
  };
}
