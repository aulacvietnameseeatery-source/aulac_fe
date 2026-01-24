"use client";

import { OrderReceipt } from "../types/receipt.types";

export function useOrderReceipt() {
  const order: OrderReceipt = {
    id: "#AL-GEN-8821",
    date: "May 24, 2024",
    time: "19:45 CET",
    status: "Paid",
    paymentMethod: "Visa **** 1234",
    tips: 5.0,
    items: [
      {
        name: "Imperial Hue Beef Noodle Soup",
        qty: 2,
        price: 28.0,
        total: 56.0,
      },
      {
        name: "Gỏi Cuốn - Spring Rolls",
        qty: 2,
        price: 14.0,
        total: 28.0,
      },
    ],
  };

  const subtotal = order.items.reduce((acc, item) => acc + item.total, 0);
  const totalAmount = subtotal + order.tips;

  return {
    order,
    subtotal,
    totalAmount,
  };
}
