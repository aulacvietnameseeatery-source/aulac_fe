import React from 'react';
import { useTranslations } from 'next-intl';
import { X, Printer } from 'lucide-react';
import { CartItem, OrderSourceCode, TableDto, CustomerDto } from '../types/create-order.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  orderType: OrderSourceCode;
  selectedTable: TableDto | null;
  customer: CustomerDto | null;
}

export const InvoiceModal: React.FC<Props> = ({
  isOpen, onClose, cart, orderType, selectedTable, customer
}) => {
  const t = useTranslations("orders.management.Create");

  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  //   const tax = subtotal * 0.1;
  //   const total = subtotal + tax;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleString('vi-VN');

  return (
    // Sử dụng z-[9999] và print:absolute print:inset-0 để khi in, bill sẽ che toàn bộ màn hình
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 print:p-0 print:absolute print:inset-0 print:bg-white">
      {/* Background overlay (ẩn khi in) */}
      <div className="absolute inset-0 bg-black/60 print:hidden" onClick={onClose} />

      {/* Khung chứa nội dung hóa đơn */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden print:rounded-none print:shadow-none print:w-full print:max-w-none">

        {/* Header các nút bấm (ẩn khi in) */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50 print:hidden">
          <h3 className="font-bold text-gray-900 text-lg">Preview Invoice</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-white p-1.5 rounded-full border border-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- KHU VỰC IN (Printable Area) --- */}
        <div className="p-6 md:p-8 bg-white text-gray-900 font-mono text-sm">
          {/* Thông tin nhà hàng */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold uppercase tracking-wider mb-1">POS RESTAURANT</h2>
            <p className="text-gray-500 text-xs">123 Nguyen Van Linh, Da Nang</p>
            <p className="text-gray-500 text-xs">Tel: 0236 123 4567</p>
          </div>

          <div className="border-t-2 border-dashed border-gray-300 my-4" />

          {/* Thông tin đơn hàng */}
          <div className="mb-4 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="font-semibold">Date:</span>
              <span>{currentDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Type:</span>
              <span>{orderType === 'DINE_IN' ? 'Dine-In' : 'Takeaway'}</span>
            </div>
            {orderType === 'DINE_IN' && selectedTable && (
              <div className="flex justify-between">
                <span className="font-semibold">Table:</span>
                <span>{selectedTable.tableCode} ({selectedTable.zoneName})</span>
              </div>
            )}
            {customer && (
              <div className="flex justify-between">
                <span className="font-semibold">Customer:</span>
                <span>{customer.fullName}</span>
              </div>
            )}
          </div>

          <div className="border-t-2 border-dashed border-gray-300 my-4" />

          {/* Danh sách món ăn */}
          <div className="mb-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 font-semibold w-12">Qty</th>
                  <th className="py-2 font-semibold">Item</th>
                  <th className="py-2 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => (
                  <React.Fragment key={index}>
                    <tr>
                      <td className="py-2 align-top">{item.quantity}x</td>
                      <td className="py-2 align-top">
                        <div className="font-medium">{item.localName}</div>
                        {item.note && <div className="text-[10px] text-gray-500 italic">Note: {item.note}</div>}
                      </td>
                      <td className="py-2 align-top text-right">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t-2 border-dashed border-gray-300 my-4" />

          {/* Tổng tiền */}
          <div className="space-y-1.5 text-sm">
            {/* <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (10%):</span>
              <span>${tax.toFixed(2)}</span>
            </div> */}
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100">
              <span>TOTAL:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-gray-300 my-6" />

          <div className="text-center text-xs text-gray-500 font-semibold mb-2">
            THANK YOU & SEE YOU AGAIN!
          </div>
        </div>
        {/* --- KẾT THÚC KHU VỰC IN --- */}

        {/* Nút bấm in (ẩn khi in) */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 print:hidden flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 font-medium bg-white border border-gray-200 text-gray-700 rounded-xl">
            Cancel
          </button>
          <button onClick={handlePrint} className="flex-1 py-2.5 font-bold bg-[#1A3A51] text-white rounded-xl flex items-center justify-center gap-2">
            <Printer className="w-4 h-4" /> Print Invoice
          </button>
        </div>
      </div>

      {/* CSS Global Injector để đảm bảo ẩn các phần tử rác của Next.js khi in */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body > *:not(#__next), #__next > *:not(div) { 
            display: none !important; 
          }
          /* Ẩn thanh cuộn khi in */
          ::-webkit-scrollbar { display: none; }
        }
      `}} />
    </div>
  );
};