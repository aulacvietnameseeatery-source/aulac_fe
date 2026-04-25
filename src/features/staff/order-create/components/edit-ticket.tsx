import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Receipt, AlertTriangle, UtensilsCrossed, Minus, Plus, Trash2, CheckCircle2, Eye, FileText, X, UserSearch, ArrowLeft } from 'lucide-react';
import { CartItem, CustomerDto } from '../types/create-order.types';
import { ExistingOrderItemDto, OrderDetailDto, OrderItemAdjustment } from '../types/edit-order.types';
import { PermissionGuard } from '@/components/permission-guard';
import { Permissions } from '@/types/const';
import { OrderItemStatusCode } from '@/types/status-codes';

interface Props {
  orderInfo: OrderDetailDto;
  newCart: CartItem[];
  customer: Partial<CustomerDto> | null;
  onOpenCustomerModal: () => void;
  onUpdateQuantity: (id: number, delta: number) => void;
  onUpdateNote: (id: number, note: string) => void;
  onRemoveFromCart: (id: number) => void;
  onClearCart: () => void;
  onSubmitItems: () => void;
  onCreateInvoice: () => void;
  onCloseMobile: () => void;
  isCustomerChanged?: boolean;
  onReturnToCreate: () => void;
  /** Pending adjustments collected before submit. */
  adjustments: OrderItemAdjustment[];
  /** Record (or update) an adjustment on an existing order item. */
  onAdjustItem: (orderItemId: number, newQuantity: number, reason?: string, note?: string) => void;
  /**
   * Called when the user confirms reasons for served-item adjustments.
   * Parent merges reasons into adjustments and executes the submit.
   */
  onConfirmServedReasons: (reasons: Record<number, string>) => void;
}

export const EditTicket: React.FC<Props> = ({
  orderInfo, newCart, customer, onOpenCustomerModal, onUpdateQuantity, onUpdateNote, onRemoveFromCart, onClearCart, onSubmitItems, onCreateInvoice, onCloseMobile, isCustomerChanged, onReturnToCreate,
  adjustments, onAdjustItem, onConfirmServedReasons,
}) => {
  const t = useTranslations("orders.management.Edit");
  const tCommon = useTranslations("orders.management.List.card");
  const locale = useLocale();

  // Bulk served-reason modal: opened once at submit time
  const [showServedReasonsModal, setShowServedReasonsModal] = useState(false);
  const [servedReasonsDraft, setServedReasonsDraft] = useState<Record<number, string>>({});

  /** Returns adjustments for SERVED items that are missing a reason. */
  const getServedAdjsNeedingReasons = () =>
    adjustments.filter(adj => {
      const item = orderInfo.orderItems.find(i => i.orderItemId === adj.orderItemId);
      if (!item) return false;
      const s = item.itemStatus as string;
      const isServed = s === OrderItemStatusCode.SERVED || s === 'Served';
      return isServed && adj.newQuantity !== item.quantity && !adj.reason?.trim();
    });

  const handlePreSubmit = () => {
    const needingReasons = getServedAdjsNeedingReasons();
    if (needingReasons.length > 0) {
      const draft: Record<number, string> = {};
      needingReasons.forEach(adj => { draft[adj.orderItemId] = ''; });
      setServedReasonsDraft(draft);
      setShowServedReasonsModal(true);
    } else {
      onSubmitItems();
    }
  };

  const newSubtotal = newCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Adjustment delta: sum(newQty * price) - sum(oldQty * price) for each adjusted item
  const adjustmentDelta = adjustments.reduce((sum, adj) => {
    const original = orderInfo.orderItems.find(i => i.orderItemId === adj.orderItemId);
    if (!original) return sum;
    return sum + original.price * (adj.newQuantity - original.quantity);
  }, 0);

  const finalTotal = orderInfo.totalAmount + newSubtotal + adjustmentDelta;

  const isCancelled = orderInfo.orderStatus === 'Cancelled';
  const isReadOnly = orderInfo.isPaid || isCancelled;

  const isDisableSubmit = isReadOnly || (newCart.length === 0 && !isCustomerChanged && adjustments.length === 0);

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'pending': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'completed': return 'text-green-700 bg-green-50 border-green-200';
      case 'cancelled': return 'text-red-700 bg-red-50 border-red-200';
      case 'created': return 'text-[#1A3A52] bg-[#D5BA98]/10 border-[#D5BA98]/30';
      case 'in_progress': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'ready': return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'served': return 'text-teal-700 bg-teal-50 border-teal-200';
      case 'rejected': return 'text-[#8C3A3A] bg-[#8C3A3A]/10 border-[#8C3A3A]/20';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatStatusName = (status: string) => status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  const formatCurrency = (val: number) => {
      return new Intl.NumberFormat('fr-CH', { 
          style: 'currency', 
          currency: 'CHF',
          minimumFractionDigits: 2
      }).format(val);
  };

  const getLocalizedDishName = (item: ExistingOrderItemDto) => {
      if (item.dishNameI18n && item.dishNameI18n[locale]) {
          return item.dishNameI18n[locale];
      }
      return item.dishName || 'Unknown Item';
  };

  /**
   * Parses a note that may contain a structured ADJUSTED segment written by the BE.
   * Format: "Optional base note | ADJUSTED:{qty}|REASON:{reason}"
   * Returns { baseNote, adjusted: { qty, reason } | null }
   */
  const parseNote = (note: string | null | undefined): { baseNote: string | null; adjusted: { qty: number; reason: string } | null } => {
    if (!note) return { baseNote: null, adjusted: null };
    const adjIdx = note.indexOf('ADJUSTED:');
    if (adjIdx === -1) return { baseNote: note.trim() || null, adjusted: null };

    const rawBase = note.slice(0, adjIdx).replace(/\|\s*$/, '').trim();
    const adjPart = note.slice(adjIdx); // "ADJUSTED:2|REASON:abc"
    const qtyMatch = adjPart.match(/ADJUSTED:(\d+)/);
    const reasonMatch = adjPart.match(/REASON:(.*)/);
    return {
      baseNote: rawBase || null,
      adjusted: qtyMatch ? { qty: Number(qtyMatch[1]), reason: reasonMatch?.[1]?.trim() ?? '' } : null,
    };
  };

  /** Renders a note string, translating any embedded ADJUSTED segment. */
  const renderNote = (note: string | null | undefined) => {
    const { baseNote, adjusted } = parseNote(note);
    return (
      <>
        {baseNote && <span>{baseNote}</span>}
        {adjusted && (
          <span className={baseNote ? ' | ' : '' as any}>
            {baseNote ? ' | ' : ''}
            {t('adjustedNote', { qty: adjusted.qty, reason: adjusted.reason, fallback: `Adjusted → ${adjusted.qty} (Reason: ${adjusted.reason})` })}
          </span>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans w-full">

      {/* HEADER */}
      <div className="shrink-0 p-4 lg:p-5 border-b border-[#D5BA98]/30 flex flex-col gap-3 bg-[#FDFBF9] z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={onCloseMobile} className="lg:hidden p-1 bg-[#D5BA98]/20 text-[#1A3A52] rounded-md">
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={onReturnToCreate}
              className="p-1.5  hover:bg-[#D5BA98]/40 text-[#1A3A52] rounded-md transition-all duration-200 group flex items-center justify-center mr-1 cursor-pointer"
              title={t('returnToCreate', { fallback: 'Tạo đơn mới' })}
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            {/* {orderInfo.isPaid ? <Eye className="w-5 h-5 text-[#1A3A52]/50" /> : <Receipt className="w-5 h-5 text-[#1A3A52]" />} */}
            <h2 className={`text-lg font-bold ${orderInfo.isPaid ? 'text-[#1A3A52]/70' : 'text-[#1A3A52]'}`}>
              {orderInfo.isPaid ? t('viewOrderTitle', { id: orderInfo.orderId }) : t('editOrderTitle', { id: orderInfo.orderId })}
            </h2>
          </div>
          <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold border ${getStatusColor(orderInfo.orderStatus)}`}>
            {t(`status.${orderInfo.orderStatus}`, { fallback: orderInfo.orderStatus })}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm mt-1">
          <div className="bg-white col-span-1 p-2 rounded-lg border border-[#D5BA98]/40 shadow-sm">
            <span className="text-[10px] text-[#1A3A52]/50 block uppercase tracking-wide font-bold mb-0.5">{t('table')}</span>
            <span className="font-bold text-[#1A3A52]">{orderInfo.tableCode || t('takeAway')}</span>
          </div>
          <button
            onClick={onOpenCustomerModal}
            disabled={isReadOnly}
            className={`w-full col-span-2 group px-3 py-2.5 rounded-xl border shadow-sm text-left flex items-center justify-between transition-all bg-white border-[#D5BA98]/60 ${!isReadOnly
              ? 'hover:border-[#1A3A52] hover:shadow-md' : ''
              }`}
          >
            <span className="font-bold text-[#1A3A52] truncate block mt-0.5">
              {customer ? customer.fullName : t('guest', { fallback: 'Guest' })}
            </span>
            {!isReadOnly &&
              <span className="text-[10px] font-bold text-[#1A3A52]/50 uppercase bg-[#D5BA98]/20 px-2 py-1 rounded group-hover:bg-[#1A3A52] group-hover:text-[#D5BA98] transition">
                {t('change')}
              </span>}
          </button>
        </div>
      </div>

      {/* BODY: ITEMS LIST */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-4 bg-[#FDFBF9]/50 min-h-0">

        {/* MÓN CŨ — status-aware controls */}
        <div>
          <h3 className="text-[10px] font-bold text-[#1A3A52]/50 uppercase tracking-wider mb-2">{t('orderedItems')}</h3>
          <div className="space-y-2 text-opacity-80">
            {orderInfo.orderItems.map((item) => {
              const adj = adjustments.find(a => a.orderItemId === item.orderItemId);
              const displayQty = adj ? adj.newQuantity : item.quantity;
              const isRemoved = displayQty <= 0;

              const statusCode = item.itemStatus as string;
              const isCreated    = statusCode === OrderItemStatusCode.CREATED    || statusCode === 'Created';
              const isServed     = statusCode === OrderItemStatusCode.SERVED     || statusCode === 'Served';
              const isRejected   = statusCode === OrderItemStatusCode.REJECTED   || statusCode === 'Rejected';
              const isCancelled  = statusCode === OrderItemStatusCode.CANCELLED  || statusCode === 'Cancelled';
              const isInProgress = statusCode === OrderItemStatusCode.IN_PROGRESS || statusCode === 'In_Progress';
              const isReady      = statusCode === OrderItemStatusCode.READY       || statusCode === 'Ready';

              // CREATED + not yet removed + editable: gold accent full card
              if (isCreated && !isRemoved && !isReadOnly) {
                return (
                  <div key={item.orderItemId} className="bg-white border border-[#D5BA98]/50 rounded-xl p-3 shadow-sm flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D5BA98]" />
                    <div className="flex justify-between items-start gap-2 pl-1">
                      <div className="min-w-0 flex-1">
                        <p className="text-[#1A3A52] text-sm font-bold leading-tight truncate">{getLocalizedDishName(item)}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[#1A3A52]/70 font-semibold text-xs">{formatCurrency(item.price * displayQty)}</span>
                          {adj && adj.newQuantity !== item.quantity && (
                            <span className="text-[10px] text-orange-500 font-medium">({t('wasQty', { qty: item.quantity, fallback: `was ${item.quantity}` })})</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => onAdjustItem(item.orderItemId, 0, undefined, adj?.note ?? item.note ?? undefined)}
                        className="text-[#1A3A52]/40 hover:text-[#8C3A3A] hover:bg-[#8C3A3A]/10 p-1.5 rounded-md transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#D5BA98]/20 pl-1">
                      <input
                        type="text"
                        value={adj?.note ?? item.note ?? ''}
                        placeholder={t('noteOptional', { fallback: 'Note (optional)' })}
                        onChange={(e) => onAdjustItem(item.orderItemId, displayQty, undefined, e.target.value)}
                        className="w-[55%] text-xs px-2 py-1.5 bg-[#FDFBF9] border border-[#D5BA98]/40 rounded text-[#1A3A52] outline-none focus:border-[#1A3A52]"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onAdjustItem(item.orderItemId, displayQty - 1, undefined, adj?.note ?? item.note ?? undefined)}
                          className="w-7 h-7 rounded border border-[#D5BA98]/80 flex items-center justify-center text-[#1A3A52] hover:bg-[#D5BA98]/20 transition-colors"
                        >
                          {displayQty <= 1 ? <Trash2 className="w-3 h-3 text-[#8C3A3A]" /> : <Minus className="w-3.5 h-3.5" />}
                        </button>
                        <span className="text-[#1A3A52] text-sm w-6 text-center font-bold">{displayQty}</span>
                        <button
                          onClick={() => onAdjustItem(item.orderItemId, displayQty + 1, undefined, adj?.note ?? item.note ?? undefined)}
                          className="w-7 h-7 rounded border border-[#1A3A52] bg-[#1A3A52] flex items-center justify-center text-[#D5BA98] hover:bg-[#1A3A52]/90 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              // SERVED + not yet removed + editable: neutral border, status badge top-right, decrease-only controls
              if (isServed && !isRemoved && !isReadOnly) {
                return (
                  <div key={item.orderItemId} className="bg-white border border-[#1A3A52]/20 rounded-xl p-3 shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[#1A3A52] text-sm font-bold leading-tight truncate">{getLocalizedDishName(item)}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[#1A3A52]/70 font-semibold text-xs">{formatCurrency(item.price * displayQty)}</span>
                          {adj && adj.newQuantity !== item.quantity && (
                            <span className="text-[10px] text-orange-500 font-medium">({t('wasQty', { qty: item.quantity, fallback: `was ${item.quantity}` })})</span>
                          )}
                        </div>
                      </div>
                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border shrink-0 mt-0.5 ${getStatusColor(item.itemStatus as string)}`}>
                        {t(`itemStatus.${item.itemStatus}`, { fallback: formatStatusName(item.itemStatus as string) })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#1A3A52]/10">
                      <div className="flex-1 min-w-0 mr-2">
                        {item.note && <p className="text-xs text-[#1A3A52]/60 italic truncate">{renderNote(item.note)}</p>}
                        {adj && adj.newQuantity !== item.quantity && (
                          <span className="text-[10px] font-medium text-orange-500">
                            {adj.reason ? `✓ ${adj.reason}` : t('reasonNeeded', { fallback: '⚠ reason needed' })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onAdjustItem(item.orderItemId, displayQty - 1)}
                          className="w-7 h-7 rounded border border-[#D5BA98]/80 flex items-center justify-center text-[#1A3A52] hover:bg-[#D5BA98]/20 transition-colors"
                        >
                          {displayQty <= 1 ? <Trash2 className="w-3 h-3 text-[#8C3A3A]" /> : <Minus className="w-3.5 h-3.5" />}
                        </button>
                        <span className="text-[#1A3A52] text-sm w-6 text-center font-bold">{displayQty}</span>
                      </div>
                    </div>
                  </div>
                );
              }

              // View-only: IN_PROGRESS, READY, REJECTED, CANCELLED, removed
              return (
                <div
                  key={item.orderItemId}
                  className={`bg-white border border-[#1A3A52]/20 rounded-xl p-3 shadow-sm ${isRemoved ? 'opacity-50' : ''}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-[#1A3A52] truncate">
                        {getLocalizedDishName(item)}
                      </div>
                      <div className="text-[#1A3A52]/70 font-semibold text-xs mt-0.5">
                        {formatCurrency(item.price * displayQty)}
                      </div>
                    </div>
                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border shrink-0 mt-0.5 ${getStatusColor(item.itemStatus as string)}`}>
                      {isRemoved ? t('removing', { fallback: 'Removing' }) : t(`itemStatus.${item.itemStatus}`, { fallback: formatStatusName(item.itemStatus as string) })}
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-[#1A3A52]/10 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {item.rejectReason ? (
                        <span className="text-[10px] text-[#8C3A3A] flex gap-1 items-center">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span className="truncate">{item.rejectReason}</span>
                        </span>
                      ) : (
                        item.note && <p className="text-xs text-[#1A3A52]/60 italic truncate">{renderNote(item.note)}</p>
                      )}
                    </div>
                    <span className="text-sm font-bold text-[#1A3A52] w-6 text-center shrink-0">{displayQty}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MÓN MỚI */}
        {!orderInfo.isPaid && (
          <div className="pt-2 border-t-2 border-dashed border-[#D5BA98]/40 mt-4">
            <div className="flex justify-between items-center mb-2 mt-2">
              <h3 className="text-[10px] font-bold text-[#1A3A52] uppercase tracking-wider">{t('newItems')}</h3>
              {newCart.length > 0 && (
                <button onClick={onClearCart} className="text-[10px] font-bold text-[#8C3A3A] hover:bg-[#8C3A3A]/10 px-2 py-1 rounded transition uppercase">{t('clear')}</button>
              )}
            </div>

            {newCart.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-[#1A3A52]/40 py-6 border-2 border-dashed border-[#D5BA98]/40 rounded-xl bg-white">
                <UtensilsCrossed className="w-6 h-6 opacity-30 mb-1" />
                <p className="text-xs font-medium">{t('addMoreItemsHint')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {newCart.map((item) => (
                  <div key={item.dishId} className="bg-white border border-[#1A3A52]/30 rounded-xl p-3 shadow-sm flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1A3A52]"></div>

                    <div className="flex justify-between items-start gap-2 mb-1 pl-1">
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

                    <div className="flex items-center justify-between pt-2 border-t border-[#D5BA98]/20 pl-1">
                      <input
                        type="text"
                        placeholder={t('notePlaceholder')}
                        value={item.note || ''}
                        onChange={(e) => onUpdateNote(item.dishId, e.target.value)}
                        className="w-[55%] text-xs px-2 py-1.5 bg-[#FDFBF9] border border-[#D5BA98]/40 rounded text-[#1A3A52] outline-none focus:border-[#1A3A52]"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => onUpdateQuantity(item.dishId, -1)} className="w-7 h-7 rounded border border-[#D5BA98]/80 flex items-center justify-center text-[#1A3A52] hover:bg-[#D5BA98]/20 transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="text-[#1A3A52] text-sm w-6 text-center font-bold">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.dishId, 1)} className="w-7 h-7 rounded border border-[#1A3A52] bg-[#1A3A52] flex items-center justify-center text-[#D5BA98] hover:bg-[#1A3A52]/90 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER & ACTIONS */}
      <div className="shrink-0 p-4 lg:p-5 border-t border-[#D5BA98]/30 bg-white shadow-[0_-10px_30px_rgba(213,186,152,0.1)]">
        {/* === THÊM PHẦN CHI TIẾT KHI ORDER ĐÃ THANH TOÁN === */}
        {orderInfo.isPaid && (
          <div className="flex flex-col gap-1.5 mb-3 text-sm text-[#1A3A52]/80 border-b border-[#D5BA98]/20 pb-3">
            <div className="flex justify-between">
              <span>{t('subTotal', { fallback: 'Subtotal' })}</span>
              <span>{formatCurrency(orderInfo.subTotalAmount || 0)}</span>
            </div>

            {!!orderInfo.taxAmount && orderInfo.taxAmount > 0 && (
              <div className="flex justify-between">
                <span>{t('tax', { fallback: 'Tax' })}</span>
                <span>{formatCurrency(orderInfo.taxAmount)}</span>
              </div>
            )}

            {/* Hiển thị danh sách Promotion */}
            {orderInfo.promotions?.map((promo) => (
              <div key={promo.promotionId} className="flex justify-between text-[#8C3A3A]">
                <span>{promo.promotionName}</span>
                <span>- {formatCurrency(promo.discountAmount)}</span>
              </div>
            ))}

            {/* Hiển thị danh sách Coupon */}
            {orderInfo.coupons?.map((coupon) => (
              <div key={coupon.couponId} className="flex justify-between text-[#8C3A3A]">
                <span>{t('coupon', { fallback: 'Coupon' })}: {coupon.couponCode}</span>
                <span>- {formatCurrency(coupon.discountAmount)}</span>
              </div>
            ))}

            {!!orderInfo.tipAmount && orderInfo.tipAmount > 0 && (
              <div className="flex justify-between font-medium">
                <span>{t('tip', { fallback: 'Tip' })}</span>
                <span>{formatCurrency(orderInfo.tipAmount)}</span>
              </div>
            )}

            {/* Thông tin Payments nếu có */}
            {orderInfo.payments && orderInfo.payments.length > 0 && (
              <div className="mt-2 pt-2 border-t border-dashed border-[#D5BA98]/40">
                {orderInfo.payments.map((payment) => (
                  <div key={payment.paymentId} className="flex justify-between text-xs text-[#4A5D4E]">
                    <span>{t('paidVia', { fallback: 'Paid via' })} {t(`paymentMethod.${payment.method}`, { fallback: payment.method })}</span>
                    <span>{formatCurrency(payment.receivedAmount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* ================================================= */}
        <div className="flex justify-between items-end pb-3 mb-3 border-b border-[#D5BA98]/20">
          <span className="font-bold text-[#1A3A52]/70 uppercase tracking-wide text-xs">
            {newCart.length > 0 ? t('newTotal') : t('totalAmount')}
          </span>
          <span className="font-bold text-[#1A3A52] text-2xl">{formatCurrency(finalTotal)}</span>
        </div>

        {isCancelled ? (
          <div className="space-y-3">
            <div className="bg-[#8C3A3A]/10 border border-[#8C3A3A]/30 text-[#8C3A3A] p-2.5 rounded-xl flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p>{t('cancelledOrderWarning', { fallback: 'Đơn hàng đã bị hủy. Không thể chỉnh sửa hoặc in hóa đơn.' })}</p>
            </div>
          </div>
        ) : orderInfo.isPaid ? (
          <div className="space-y-3">
            <div className="bg-[#4A5D4E]/10 border border-[#4A5D4E]/30 text-[#4A5D4E] p-2.5 rounded-xl flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <p>{t('paidOrderWarning')}</p>
            </div>
            <button onClick={onCreateInvoice} className="w-full bg-white border-2 border-[#1A3A52] text-[#1A3A52] font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-[#FDFBF9] transition">
              <FileText className="w-4 h-4" /> {t('createReceipt')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={onCreateInvoice}
              className="col-span-2 bg-white border-2 border-[#1A3A52] text-[#1A3A52] font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-[#FDFBF9] transition"
            >
              <FileText className="w-4 h-4" /> {t('createInvoice')}
            </button>
            <PermissionGuard permission={Permissions.EditOrder} showDisabled={true}>
              <button
                onClick={handlePreSubmit}
                disabled={isDisableSubmit}
                className="col-span-2 bg-[#1A3A52] text-[#D5BA98] font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 text-sm hover:bg-[#1A3A52]/90 transition shadow-lg shadow-[#1A3A52]/20 w-full h-full"
              >
                {t('addItemsButton')}
              </button>
            </PermissionGuard>
          </div>
        )}
      </div>

      {/* ── Bulk served-reason modal (opened once at submit) ─────────── */}
      {showServedReasonsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#1A3A52]">
                  {t('servedAdjReasonTitle', { fallback: 'Reasons required for served items' })}
                </p>
                <p className="text-xs text-[#1A3A52]/60 mt-0.5">
                  {t('servedAdjReasonHint', {
                    fallback: 'Some items have already been served. Please provide a reason for each adjustment.',
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(servedReasonsDraft).map(([idStr, reason]) => {
                const oid = Number(idStr);
                const itm = orderInfo.orderItems.find(i => i.orderItemId === oid);
                const adj = adjustments.find(a => a.orderItemId === oid);
                return (
                  <div key={oid}>
                    <label className="text-xs font-bold text-[#1A3A52] block mb-1">
                      {itm ? getLocalizedDishName(itm) : `#${oid}`}
                      <span className="font-normal text-[#1A3A52]/50 ml-1">
                        ({itm?.quantity} → {adj?.newQuantity ?? 0})
                      </span>
                    </label>
                    <textarea
                      rows={2}
                      value={reason}
                      autoFocus={Object.keys(servedReasonsDraft)[0] === idStr}
                      onChange={e =>
                        setServedReasonsDraft(prev => ({ ...prev, [oid]: e.target.value }))
                      }
                      placeholder={t('servedAdjReasonPlaceholder', { fallback: 'e.g. Customer changed mind…' })}
                      className="w-full text-sm px-3 py-2 border border-[#D5BA98]/60 rounded-lg resize-none outline-none focus:border-[#1A3A52] text-[#1A3A52]"
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => { setShowServedReasonsModal(false); setServedReasonsDraft({}); }}
                className="px-4 py-2 text-sm font-medium border border-[#D5BA98]/50 text-[#1A3A52] rounded-lg hover:bg-[#D5BA98]/10 transition"
              >
                {t('cancel', { fallback: 'Cancel' })}
              </button>
              <button
                disabled={Object.values(servedReasonsDraft).some(r => !r.trim())}
                onClick={() => {
                  onConfirmServedReasons(servedReasonsDraft);
                  setShowServedReasonsModal(false);
                  setServedReasonsDraft({});
                }}
                className="px-4 py-2 text-sm font-bold bg-[#1A3A52] text-[#D5BA98] rounded-lg hover:bg-[#1A3A52]/90 transition disabled:opacity-40"
              >
                {t('confirm', { fallback: 'Confirm' })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};