import React from 'react';
import { useTranslations } from 'next-intl';
import { Receipt, AlertTriangle, UtensilsCrossed, Minus, Plus, Trash2, CheckCircle2, Eye, FileText } from 'lucide-react';
import { CartItem } from '../types/create-order.types';
import { OrderDetailDto } from '../types/edit-order.types';

interface Props {
  orderInfo: OrderDetailDto;
  newCart: CartItem[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onUpdateNote: (id: number, note: string) => void;
  onRemoveFromCart: (id: number) => void;
  onClearCart: () => void;
  onSubmitItems: () => void;
  onCreateInvoice: () => void;
}

export const EditTicket: React.FC<Props> = ({
  orderInfo, newCart, onUpdateQuantity, onUpdateNote, onRemoveFromCart, onClearCart, onSubmitItems, onCreateInvoice
}) => {
  const t = useTranslations("Order.Edit");

  // Tính tiền
  const newSubtotal = newCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  //   const newTax = newSubtotal * 0.1; // (Nếu áp dụng thuế cho món mới)
  const finalTotal = orderInfo.totalAmount + newSubtotal;

  const isDisableSubmit = newCart.length === 0 || orderInfo.isPaid;

  // Bảng màu trạng thái chuẩn chỉnh
  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      // Order Statuses
      case 'pending': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'completed': return 'text-green-700 bg-green-100 border-green-300';
      case 'cancelled': return 'text-red-700 bg-red-100 border-red-300';

      // Order Item Statuses
      case 'created': return 'text-gray-600 bg-gray-100 border-gray-200';
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'ready': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'served': return 'text-teal-600 bg-teal-50 border-teal-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';

      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  // Format lại tên trạng thái hiển thị (xoá dấu _, viết hoa chữ đầu)
  const formatStatusName = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="w-full lg:w-[400px] xl:w-[450px] h-[75vh] lg:h-full flex flex-col bg-white rounded-2xl shadow-xl border border-gray-200 shrink-0 z-10 overflow-hidden">

      {/* HEADER: Đổi Title tùy thuộc vào trạng thái Paid/Unpaid */}
      <div className="shrink-0 p-4 lg:p-5 border-b border-gray-100 flex flex-col gap-3 bg-gray-50 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {orderInfo.isPaid ? <Eye className="w-5 h-5 text-gray-500" /> : <Receipt className="w-5 h-5 text-[#1A3A51]" />}
            <h2 className={`text-lg font-bold ${orderInfo.isPaid ? 'text-gray-600' : 'text-gray-900'}`}>
              {orderInfo.isPaid ? t('viewOrderTitle', { id: orderInfo.orderId }) : t('editOrderTitle', { id: orderInfo.orderId })}
            </h2>
          </div>
          <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusColor(orderInfo.orderStatus)}`}>
            {t(`status.${orderInfo.orderStatus}`)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-white p-2 rounded border border-gray-200">
            <span className="text-xs text-gray-400 block uppercase tracking-wide">{t('tableLabel') || 'Bàn'}</span>
            <span className="font-semibold text-gray-800 text-blue-700">{orderInfo.tableCode || t('takeAway')}</span>
          </div>
          <div className="bg-white p-2 rounded border border-gray-200">
            <span className="text-xs text-gray-400 block uppercase tracking-wide">{t('customerLabel') || 'Khách hàng'}</span>
            <span className="font-semibold text-gray-800">{orderInfo.customerName || t('guest')}</span>
          </div>
        </div>
      </div>

      {/* BODY: ITEMS LIST */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-4 bg-slate-50 min-h-0">

        {/* MÓN CŨ (READ-ONLY) */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('orderedItems')}</h3>
          <div className="space-y-2 text-opacity-80">
            {orderInfo.orderItems.map((item) => (
              <div key={item.orderItemId} className={`bg-white border rounded-lg p-3 shadow-sm ${item.itemStatus === 'Rejected' ? 'border-red-200 bg-red-50/30' : 'border-gray-200'}`}>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="font-semibold text-sm text-gray-800">
                      {item.quantity}x {item.dishName}
                    </div>
                    {item.note && <div className="text-xs text-gray-500 italic mt-0.5">Note: {item.note}</div>}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold text-sm text-gray-900">CHF {(item.price * item.quantity).toFixed(2)}</div>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded mt-1.5 inline-block border ${getStatusColor(item.itemStatus)}`}>
                      {formatStatusName(item.itemStatus)}
                    </span>
                  </div>
                </div>
                {item.rejectReason && (
                  <div className="mt-2 text-xs text-red-600 bg-red-100/50 p-1.5 rounded flex gap-1 items-start">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Lý do hủy: {item.rejectReason}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* MÓN MỚI (Chỉ hiển thị vùng này nếu Order chưa Paid) */}
        {!orderInfo.isPaid && (
          <div className="pt-2 border-t-2 border-dashed border-gray-200 mt-4">
            <div className="flex justify-between items-center mb-2 mt-2">
              <h3 className="text-xs font-bold text-[#1A3A51] uppercase tracking-wider">{t('newItems')}</h3>
              {newCart.length > 0 && (
                <button onClick={onClearCart} className="text-xs font-bold text-gray-400 hover:text-red-500 uppercase">{t('clear')}</button>
              )}
            </div>

            {newCart.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-400 py-6 border-2 border-dashed border-gray-200 rounded-xl bg-white">
                <UtensilsCrossed className="w-6 h-6 opacity-30 mb-1" />
                <p className="text-xs">{t('addMoreItemsHint')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {newCart.map((item) => (
                  <div key={item.dishId} className="bg-white border border-blue-200 rounded-xl p-3 shadow-sm flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                    {/* ... (Phần render tăng giảm quantity giống code cũ) ... */}
                    <div className="flex items-start justify-between gap-3 pl-1">
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">{item.localName}</h4>
                        <div className="font-semibold text-sm text-[#1A3A51] mt-0.5">CHF {(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg">
                          <button onClick={() => onUpdateQuantity(item.dishId, -1)} className="p-1.5 text-gray-500 hover:text-[#1A3A51]"><Minus className="w-3 h-3" /></button>
                          <span className="font-semibold text-sm w-5 text-center">{item.quantity}</span>
                          <button onClick={() => onUpdateQuantity(item.dishId, 1)} className="p-1.5 text-gray-500 hover:text-[#1A3A51]"><Plus className="w-3 h-3" /></button>
                        </div>
                        <button onClick={() => onRemoveFromCart(item.dishId)} className="p-1.5 text-gray-400 hover:text-red-500 bg-gray-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder={t('notePlaceholder')}
                      value={item.note || ''}
                      onChange={(e) => onUpdateNote(item.dishId, e.target.value)}
                      className="w-full text-xs px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-gray-600 focus:outline-none focus:border-blue-400 pl-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER & ACTIONS */}
      <div className="shrink-0 p-4 lg:p-5 border-t border-gray-100 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <div className="flex justify-between items-end pb-3 mb-3 border-b border-gray-100">
          <span className="font-bold text-gray-900 text-sm">
            {newCart.length > 0 ? t('newTotal') : t('totalAmount')}
          </span>
          <span className="font-bold text-[#1A3A51] text-xl">CHF {finalTotal.toFixed(2)}</span>
        </div>

        {orderInfo.isPaid ? (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 text-green-700 p-2.5 rounded-xl flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <p>{t('paidOrderWarning')}</p>
            </div>
            <button onClick={onCreateInvoice} className="w-full cursor-pointer bg-white border-2 border-[#1A3A51] text-[#1A3A51] font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-gray-50">
              <FileText className="w-4 h-4" /> {t('createInvoice', { fallback: 'In Hóa Đơn' })}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onCreateInvoice}
              className="cursor-pointer bg-white border-2 border-[#1A3A51] text-[#1A3A51] font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 text-sm hover:bg-gray-50"
            >
              <FileText className="w-4 h-4" /> {t('createInvoice', { fallback: 'Hóa Đơn' })}
            </button>
            <button
              onClick={onSubmitItems}
              disabled={isDisableSubmit}
              className="cursor-pointer bg-[#1A3A51] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 text-sm hover:bg-[#122b3e]"
            >
              <Plus className="w-4 h-4" /> {t('addItemsButton')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};