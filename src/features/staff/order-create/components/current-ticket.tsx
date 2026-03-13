import React from 'react';
import { useTranslations } from 'next-intl';
import { Receipt, LayoutGrid, UserSearch, UtensilsCrossed, Minus, Plus, Trash2, FileText } from 'lucide-react';
import { CartItem, OrderSourceCode, TableDto, CustomerDto } from '../types/create-order.types';

interface Props {
  cart: CartItem[];
  orderType: OrderSourceCode;
  selectedTable: TableDto | null;
  customer: CustomerDto | null;
  onSetOrderType: (type: OrderSourceCode) => void;
  onClearCart: () => void;
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemoveFromCart: (id: number) => void;
  onOpenTableModal: () => void;
  onOpenCustomerModal: () => void;
  onPlaceOrder: () => void;
  onUpdateNote: (id: number, note: string) => void;
  onCreateInvoice: () => void;
}

export const CurrentTicket: React.FC<Props> = ({
  cart, orderType, selectedTable, customer,
  onSetOrderType, onClearCart, onUpdateQuantity, onRemoveFromCart, onUpdateNote,
  onOpenTableModal, onOpenCustomerModal, onPlaceOrder, onCreateInvoice
}) => {
  const t = useTranslations("Order.Create");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  //   const tax = subtotal * 0.1;
  //   const total = subtotal + tax;

  const isPlaceOrderDisabled = cart.length === 0 || (orderType === 'DINE_IN' && !selectedTable);

  return (
    <div className="w-full lg:w-[400px] xl:w-[450px] h-[80vh] lg:h-full flex flex-col bg-white rounded-2xl shadow-xl border border-gray-200 shrink-0 z-10 overflow-hidden relative">
      <div className="shrink-0 p-4 lg:p-5 border-b border-gray-100 flex flex-col gap-4 bg-white/95 backdrop-blur-sm z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#1A3A51]" />
            <h2 className="text-lg font-bold text-gray-900">{t('currentTicket')}</h2>
          </div>
          <button onClick={onClearCart} className="cursor-pointer text-xs font-bold text-gray-400 hover:text-red-500 uppercase">
            {t('clear')}
          </button>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button onClick={() => onSetOrderType('DINE_IN')} className={`cursor-pointer flex-1 py-1.5 md:py-2 text-sm font-semibold rounded-md transition-all ${orderType === 'DINE_IN' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
            {t('dineIn')}
          </button>
          <button onClick={() => onSetOrderType('TAKEAWAY')} className={`cursor-pointer flex-1 py-1.5 md:py-2 text-sm font-semibold rounded-md transition-all ${orderType === 'TAKEAWAY' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
            {t('takeAway')}
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {orderType === 'DINE_IN' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">{t('diningTable')}</label>
              <div className="flex items-stretch gap-2">
                <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <LayoutGrid className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="font-bold text-blue-700 truncate">
                    {selectedTable ? `${selectedTable.tableCode} - ${selectedTable.zoneName}` : t('noTableSelected')}
                  </span>
                </div>
                <button onClick={onOpenTableModal} className="cursor-pointer bg-[#1A3A51] hover:bg-[#122b3e] text-white font-medium text-sm px-4 rounded-lg">
                  {selectedTable ? t('change') : t('select')}
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">{t('customer')}</label>
            <div className="flex items-stretch gap-2">
              <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <UserSearch className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="font-medium text-gray-700 truncate">
                  {customer ? `${customer.fullName} - ${customer.phone}` : t('anonymous')}
                </span>
              </div>
              <button onClick={onOpenCustomerModal} className="cursor-pointer bg-white border border-[#1A3A51]/20 text-[#1A3A51] font-medium text-sm px-4 rounded-lg">
                {customer ? t('change') : t('add')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-3 bg-slate-50 min-h-0">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
            <UtensilsCrossed className="w-10 h-10 opacity-20" />
            <p className="text-sm">{t('emptyTicket')}</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.dishId} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm flex flex-col gap-2">
              {/* Top row: Name, Price, Actions */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="font-semibold text-sm text-gray-900 truncate">{item.localName}</h4>
                  <div className="font-semibold text-sm text-[#1A3A51] mt-0.5">CHF {(item.price * item.quantity).toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg">
                    <button onClick={() => onUpdateQuantity(item.dishId, -1)} className="cursor-pointer p-1.5 text-gray-500 hover:text-[#1A3A51]"><Minus className="w-3.5 h-3.5" /></button>
                    <span className="font-semibold text-sm w-6 text-center">{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.dishId, 1)} className="cursor-pointer p-1.5 text-gray-500 hover:text-[#1A3A51]"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                  <button onClick={() => onRemoveFromCart(item.dishId)} className="cursor-pointer p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bottom row: Note input */}
              <input
                type="text"
                placeholder={t('note')}
                value={item.note || ''}
                onChange={(e) => onUpdateNote(item.dishId, e.target.value)}
                className="w-full text-xs px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-gray-600 focus:outline-none focus:border-[#1A3A51]"
              />
            </div>
          ))
        )}
      </div>

      <div className="shrink-0 p-4 lg:p-5 border-t border-gray-100 bg-white flex flex-col gap-4 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        {/* <div className="space-y-2 text-sm text-gray-500">
          <div className="flex justify-between"><span>{t('subtotal')}</span><span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>{t('tax')}</span><span className="font-medium text-gray-900">${tax.toFixed(2)}</span></div>
        </div> */}
        <div className="flex justify-between items-end pb-1">
          <span className="font-bold text-gray-900 text-lg">{t('total')}</span>
          <span className="font-bold text-[#1A3A51] text-xl md:text-2xl">CHF {total.toFixed(2)}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onCreateInvoice} disabled={cart.length === 0} className="cursor-pointer bg-white border-2 border-[#1A3A51] text-[#1A3A51] font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 text-sm">
            <FileText className="w-4 h-4" /> {t('createInvoice')}
          </button>
          <button onClick={onPlaceOrder} disabled={isPlaceOrderDisabled} className="cursor-pointer bg-[#1A3A51] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 text-sm">
            {t('placeOrder')}
          </button>
        </div>
      </div>
    </div>
  );
};