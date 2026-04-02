import React from 'react';
import { useTranslations } from 'next-intl';
import { Utensils, ShoppingBag, LayoutGrid, UserSearch, Minus, Plus, Trash2, FileText, X } from 'lucide-react';
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
  onCloseMobile: () => void; // Dùng để đóng drawer trên mobile
}

export const CurrentTicket: React.FC<Props> = ({
  cart, orderType, selectedTable, customer,
  onSetOrderType, onClearCart, onUpdateQuantity, onRemoveFromCart, onUpdateNote,
  onOpenTableModal, onOpenCustomerModal, onPlaceOrder, onCreateInvoice, onCloseMobile
}) => {
  const t = useTranslations("orders.management.Create");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isPlaceOrderDisabled = cart.length === 0 || (orderType === 'DINE_IN' && !selectedTable);

  const formatCurrency = (val: number) => {
      return new Intl.NumberFormat('fr-CH', { 
          style: 'currency', 
          currency: 'CHF',
          minimumFractionDigits: 2
      }).format(val);
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans w-full">

      {/* ── Header: Nút X (chỉ hiện mobile) & Tiêu đề ── */}
      <div className="px-5 py-4 border-b border-[#D5BA98]/30 flex items-center justify-between shrink-0 bg-[#FDFBF9]">
        <div className="flex items-center gap-3">
          <button onClick={onCloseMobile} className="lg:hidden p-1 bg-[#D5BA98]/20 text-[#1A3A52] rounded-md">
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-[#1A3A52] font-bold text-lg tracking-wide">{t('currentTicket')}</h3>
        </div>
        <button onClick={onClearCart} className="text-[11px] font-bold text-[#8C3A3A] hover:bg-[#8C3A3A]/10 px-2 py-1 rounded transition uppercase">
          {t('clear')}
        </button>
      </div>

      {/* ── Tabs Dine-In / Take-Away ── */}
      <div className="px-5 py-3 border-b border-[#D5BA98]/30 shrink-0 bg-[#FDFBF9]">
        <div className="flex gap-2">
          <button
            onClick={() => onSetOrderType('DINE_IN')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs transition-all flex-1 font-bold ${orderType === 'DINE_IN'
                ? "bg-[#1A3A52] text-[#D5BA98] shadow-md"
                : "bg-white text-[#1A3A52]/70 border border-[#D5BA98]/40 hover:bg-[#D5BA98]/10"
              }`}
          >
            <Utensils className="w-4 h-4" /> {t('dineIn')}
          </button>
          <button
            onClick={() => onSetOrderType('TAKEAWAY')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs transition-all flex-1 font-bold ${orderType === 'TAKEAWAY'
                ? "bg-[#1A3A52] text-[#D5BA98] shadow-md"
                : "bg-white text-[#1A3A52]/70 border border-[#D5BA98]/40 hover:bg-[#D5BA98]/10"
              }`}
          >
            <ShoppingBag className="w-4 h-4" /> {t('takeAway')}
          </button>
        </div>
      </div>

      {/* ── Select Bàn & Khách Hàng ── */}
      <div className="px-5 py-3 border-b border-[#D5BA98]/30 flex gap-3 flex-col shrink-0 bg-white">
        {orderType === 'DINE_IN' && (
          <button onClick={onOpenTableModal} className="flex items-center justify-between w-full border border-[#D5BA98]/40 rounded-lg px-3 py-2.5 bg-[#FDFBF9] hover:border-[#1A3A52] transition-colors group">
            <div className="flex items-center gap-2 overflow-hidden">
              <LayoutGrid className="w-4 h-4 text-[#1A3A52]/60 shrink-0" />
              <span className="text-sm font-semibold text-[#1A3A52] truncate">
                {selectedTable ? `${selectedTable.tableCode} - ${selectedTable.zoneName}` : t('select')} {t('diningTable')}
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#1A3A52]/50 uppercase bg-[#D5BA98]/20 px-2 py-1 rounded group-hover:bg-[#1A3A52] group-hover:text-[#D5BA98] transition">
              {selectedTable ? t('change') : t('select')}
            </span>
          </button>
        )}

        <button onClick={onOpenCustomerModal} className="flex items-center justify-between w-full border border-[#D5BA98]/40 rounded-lg px-3 py-2.5 bg-[#FDFBF9] hover:border-[#1A3A52] transition-colors group">
          <div className="flex items-center gap-2 overflow-hidden">
            <UserSearch className="w-4 h-4 text-[#1A3A52]/60 shrink-0" />
            <span className="text-sm font-semibold text-[#1A3A52] truncate">
              {customer ? `${customer.fullName}` : t('guest')}
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#1A3A52]/50 uppercase bg-[#D5BA98]/20 px-2 py-1 rounded group-hover:bg-[#1A3A52] group-hover:text-[#D5BA98] transition">
            {customer ? t('change') : t('add')}
          </span>
        </button>
      </div>

      {/* ── Scrollable Order Items ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0 bg-[#FDFBF9]/50">
        {cart.map((item) => (
          <div key={item.dishId} className="border border-[#D5BA98]/40 rounded-xl p-3 bg-white shadow-sm hover:border-[#D5BA98] transition-colors">

            <div className="flex justify-between items-start gap-2 mb-2">
              <div className="min-w-0 pr-2">
                <p className="text-[#1A3A52] text-sm font-bold leading-tight truncate">
                  {item.localName}
                </p>
                <div className="text-[#1A3A52]/70 font-semibold text-xs mt-1">{formatCurrency(item.price * item.quantity)}</div>
              </div>
              <button
                onClick={() => onRemoveFromCart(item.dishId)}
                className="text-[#1A3A52]/40 hover:text-[#8C3A3A] hover:bg-[#8C3A3A]/10 p-1.5 rounded-md transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#D5BA98]/20">
              <input
                type="text"
                placeholder={t('note')}
                value={item.note || ''}
                onChange={(e) => onUpdateNote(item.dishId, e.target.value)}
                className="w-[55%] text-xs px-2 py-1.5 bg-[#FDFBF9] border border-[#D5BA98]/40 rounded text-[#1A3A52] outline-none focus:border-[#1A3A52]"
              />
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onUpdateQuantity(item.dishId, -1)}
                  className="w-7 h-7 rounded border border-[#D5BA98]/80 flex items-center justify-center text-[#1A3A52] hover:bg-[#D5BA98]/20 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-[#1A3A52] text-sm w-6 text-center font-bold">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.dishId, 1)}
                  className="w-7 h-7 rounded border border-[#1A3A52] bg-[#1A3A52] flex items-center justify-center text-[#D5BA98] hover:bg-[#1A3A52]/90 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {cart.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-[#1A3A52]/30 space-y-3">
            <Utensils className="w-12 h-12 opacity-30" />
            <p className="text-sm font-medium">{t('emptyTicket')}</p>
          </div>
        )}
      </div>

      {/* ── Summary & Actions (Cố định ở dưới) ── */}
      <div className="px-5 py-4 border-t border-[#D5BA98]/30 shrink-0 bg-white shadow-[0_-10px_30px_rgba(213,186,152,0.1)]">
        <div className="flex justify-between items-end mb-4">
          <span className="font-bold text-[#1A3A52]/70 text-sm uppercase tracking-wide">{t('total')}</span>
          <span className="font-bold text-[#1A3A52] text-2xl">{formatCurrency(total)}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onCreateInvoice}
            disabled={isPlaceOrderDisabled}
            className="col-span-1 bg-white border-2 border-[#1A3A52] text-[#1A3A52] font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:border-[#D5BA98] text-sm hover:bg-[#FDFBF9] transition"
          >
            <FileText className="w-4 h-4" /> Invoice
          </button>
          <button
            onClick={onPlaceOrder}
            disabled={isPlaceOrderDisabled}
            className="col-span-2 bg-[#1A3A52] text-[#D5BA98] font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 text-sm hover:bg-[#1A3A52]/90 transition shadow-lg shadow-[#1A3A52]/20"
          >
            {t('placeOrder')}
          </button>
        </div>
      </div>
    </div>
  );
};