import React, { forwardRef } from 'react';
import { formatPhoneToDomesticDisplay } from '@/lib/phone-format';
import { PrintOrderData, PrintStoreSettings } from '../types/receipt.types';

interface OrderPrintDocumentProps {
  type: 'invoice' | 'receipt';
  order: PrintOrderData;
  settings: PrintStoreSettings;
  translations: { [key: string]: string };
}

export const OrderPrintDocument = forwardRef<HTMLDivElement, OrderPrintDocumentProps>(
  ({ type, order, settings, translations: t }, ref) => {
    const isInvoice = type === 'invoice';
    const displayPhone = formatPhoneToDomesticDisplay(settings.phone);

    return (
      <div 
        ref={ref} 
        className="w-full max-w-[100mm] mx-auto bg-white text-black p-4 text-sm font-sans"
        style={{ color: '#000' }} // Ép màu đen toàn cục
      >
        {/* HEADER */}
        <div className="text-center mb-6">
          <img 
            src={settings.logoUrl || '/images/logo.png'} 
            alt="Logo" 
            className="w-16 h-16 mx-auto mb-2 object-contain grayscale"
          />
          <h1 className="font-bold text-lg uppercase tracking-wider">{settings.name}</h1>
          <p className="text-xs">{settings.streetAddress}, {settings.city}</p>
          <p className="text-xs">Tel: {displayPhone}</p>
          {settings.email && <p className="text-xs">{settings.email}</p>}
          {settings.vatNumber && <p className="text-xs font-semibold mt-1">UID: {settings.vatNumber}</p>}
           
        </div>

        <div className="border-t border-black border-dashed my-3"></div>

        {/* ORDER INFO */}
        <div className="mb-4 text-xs space-y-1">
          <div className="flex justify-between font-bold text-sm mb-2">
            <span>{isInvoice ? t['invoice'] : t['receipt']}</span>
            <span>#{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span>{t['date']}: {order.date}</span>
            <span>{order.time}</span>
          </div>
          <div className="flex justify-between">
            <span>{t['orderType']}: {order.orderType === 'Dine-in' ? t['dineIn'] : t['takeAway']}</span>
            {order.tableNumber && order.orderType === 'Dine-in' && <span className="font-bold">{t['table']}: {order.tableNumber}</span>}
          </div>
          <div className="flex justify-between">
            <span>{t['customer']}:</span>
            <span>{order.customerName || t['guest']}</span>
          </div>
        </div>

        <div className="border-t border-black my-2"></div>

        {/* ITEM LIST */}
        <div className="mb-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-black text-left">
                <th className="py-1 w-8">{t['qty']}</th>
                <th className="py-1">{t['item']}</th>
                <th className="py-1 text-right">{t['total']}</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx} className="align-top">
                  <td className="py-1 font-semibold">{item.qty}x</td>
                  <td className="py-1">
                    {item.name}
                    <div className="text-[10px] text-gray-600">@ {item.price.toFixed(2)}</div>
                  </td>
                  <td className="py-1 text-right">{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-black my-2"></div>

        {/* FINANCIAL SUMMARY */}
        <div className="text-xs space-y-1 mb-4">
          
          {/* Subtotal luôn hiện */}
          <div className="flex justify-between font-semibold">
            <span>{t['subtotal']}</span>
            <span>{order.subtotal.toFixed(2)} CHF</span>
          </div>

          {/* CHỈ HIỆN CÁC PHẦN SAU NẾU KHÔNG PHẢI INVOICE */}
          {!isInvoice && (
            <>
              {/* Discounts (Đã bỏ chữ đỏ, thêm phân loại) */}
              {order.discounts.map((discount, idx) => (
                <div key={idx} className="flex justify-between text-black">
                  <span>{discount.type} ({discount.name})</span>
                  <span>-{discount.amount.toFixed(2)} CHF</span>
                </div>
              ))}

              {/* Thuế */}
              <div className="flex justify-between">
                <span>{t['tax']}</span>
                <span>{order.taxAmount.toFixed(2)} CHF</span>
              </div>

              {/* Tiền Tip */}
              {order.tipAmount > 0 && (
                <div className="flex justify-between">
                  <span>{t['tip']}</span>
                  <span>{order.tipAmount.toFixed(2)} CHF</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="border-t-2 border-black my-2"></div>

        {/* TOTAL - Chỉ hiện nếu không phải Invoice */}
        {!isInvoice && (
          <div className="flex justify-between font-bold text-lg mb-4">
            <span>{t['totalAmount']}</span>
            <span>{order.totalAmount.toFixed(2)} CHF</span>
          </div>
        )}

        {/* PAYMENT METHOD & DETAILS */}
        {!isInvoice && order.paymentInfo && (
          <>
            <div className="border-t border-black border-dashed my-2"></div>
            <div className="text-xs space-y-1 mt-2">
              <div className="flex justify-between font-bold">
                <span>{t['paidVia']}</span>
                <span className="uppercase">{order.paymentInfo.method}</span>
              </div>
              <div className="flex justify-between text-black">
                <span>{t['given']}</span>
                <span>{order.paymentInfo.received.toFixed(2)} CHF</span>
              </div>
              <div className="flex justify-between text-black">
                <span>{t['change']}</span>
                <span>{order.paymentInfo.change.toFixed(2)} CHF</span>
              </div>
            </div>
          </>
        )}

        {/* FOOTER */}
        <div className="text-center mt-8 text-[10px] space-y-1">
          <p className="font-bold">{t['thankYou']}</p>
          <p>Please retain for your records</p>
        </div>
      </div>
    );
  }
);

OrderPrintDocument.displayName = 'OrderPrintDocument';