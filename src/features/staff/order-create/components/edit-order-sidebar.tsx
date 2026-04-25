"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { createOrderService } from '../services/create-edit-order.service';
import { EditTicket } from './edit-ticket';
import { ExistingOrderItemDto, OrderDetailDto, OrderStatus, OrderItemAdjustment, UpdateOrderItemsRequest } from '../types/edit-order.types';
import { CustomerDto } from '../types/create-order.types';
import { Dialog } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { PrintOrderModal } from '../../order-management/components/PrintOrderModal';
import { OrderHistory, OrderItem } from '../../order-management/types/order-history.types';
import { useOrdersSignalR } from '../hooks/useOrdersSignalR';
import { OrderItemRealtimeDTO, OrderRealtimeDTO } from '../types/order-realtime.types';
import { OrderItemStatusCode } from '@/types/status-codes';

interface EditOrderSidebarProps {
  orderId: number;
  newCart: any[]; 
  updateQuantity: (id: number, qty: number) => void;
  updateNote: (id: number, note: string) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  onOpenCustomerModal: () => void;
  onCloseMobile: () => void;
  onReturnToCreate: () => void;
  sharedCustomer: Partial<CustomerDto> | null; 
  setSharedCustomer: (customer: Partial<CustomerDto> | null) => void; 
  onOrderFetched: (order: OrderDetailDto) => void;
}

export const EditOrderSidebar = ({
  orderId, newCart, updateQuantity, updateNote, removeFromCart, clearCart,
  onOpenCustomerModal, onCloseMobile, onReturnToCreate, sharedCustomer, setSharedCustomer, onOrderFetched
}: EditOrderSidebarProps) => {
  const t = useTranslations("orders.management.Edit");
  const [orderInfo, setOrderInfo] = useState<OrderDetailDto | null>(null);
  const [isOrderLoading, setIsOrderLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [initialCustomer, setInitialCustomer] = useState<Partial<CustomerDto> | null>(null);
  // Adjustments to existing order items (collected before the single PUT call)
  const [adjustments, setAdjustments] = useState<OrderItemAdjustment[]>([]);
  // Holds merged adjustments when the confirm-modal flow follows served-reason collection
  const pendingAdjustmentsRef = useRef<OrderItemAdjustment[] | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setIsOrderLoading(true);
      try {
        const data = await createOrderService.getOrderById(orderId);
        setOrderInfo(data);
        onOrderFetched(data); 

        if (data.customerId) {
          let fetchedCustomer: Partial<CustomerDto> | null = null;
          if (data.customerId !== 68) {
            try {
              fetchedCustomer = await createOrderService.getCustomerById(data.customerId);
            } catch (customerError) {
              fetchedCustomer = { customerId: data.customerId, fullName: data.customerName };
            }
          } else {
            fetchedCustomer = { customerId: data.customerId, fullName: data.customerName };
          }
          setInitialCustomer(fetchedCustomer);
          setSharedCustomer(fetchedCustomer); 
        } else {
          setInitialCustomer(null);
          setSharedCustomer(null);
        }
      } catch (error) {
        console.error("Failed to fetch order", error);
      } finally {
        setIsOrderLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  useOrdersSignalR({
    activeOrderId: orderId, 
    
    onOrderDetailUpdated: (data: OrderRealtimeDTO) => {
      setOrderInfo(prev => {
        if (!prev || Number(prev.orderId) !== Number(data.orderId)) return prev;
        
        // --- Helper function để map status ---
        const mapOrderStatus = (backendStatus: string): OrderStatus => {
          const statusMap: Record<string, OrderStatus> = {
            'PENDING': 'Pending',
            'IN_PROGRESS': 'In progress',
            'COMPLETED': 'Completed',
            'CANCELLED': 'Cancelled',
          };

          return statusMap[backendStatus] || (backendStatus as OrderStatus);
        };

        const updatedOrder = {
          ...prev,
          orderStatus: mapOrderStatus(data.status),
        };
        
        onOrderFetched(updatedOrder); 
        
        return updatedOrder;
      });
    },

    onOrderItemUpdated: (data: OrderItemRealtimeDTO) => {
      setOrderInfo(prev => {
        if (!prev || Number(prev.orderId) !== Number(data.orderId)) return prev;

        const updatedOrder = {
          ...prev,
          orderItems: prev.orderItems.map(item => 
            Number(item.orderItemId) === Number(data.orderItemId)
              ? { ...item, itemStatus: data.status as OrderItemStatusCode } 
              : item
          )
        };
        
        onOrderFetched(updatedOrder);
        
        return updatedOrder;
      });

      // Race condition guard: if an item just became IN_PROGRESS or REJECTED
      // (kitchen moved it while staff was editing), drop any pending adjustment for it.
      if (data.status === 'IN_PROGRESS' || data.status === 'REJECTED') {
        setAdjustments(prev => prev.filter(a => Number(a.orderItemId) !== Number(data.orderItemId)));
      }
    }
  });

  const handleSubmitAttempt = () => {
    if (!orderInfo) return;
    const newCartTotal = newCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    // Confirm dialog only when re-opening a COMPLETED order with NEW items (not for adjustments)
    if (orderInfo.orderStatus === 'Completed' && !orderInfo.isPaid && newCartTotal > 0) {
      setShowConfirmModal(true);
    } else {
      executeUpdateItemsWithAdjustments(adjustments);
    }
  };

  /**
   * Called by EditTicket when the user confirms reasons for served-item adjustments.
   * Merges reasons into the adjustments, then either shows the "completed order" warning
   * or proceeds directly to submit.
   */
  const handleConfirmServedReasons = (reasons: Record<number, string>) => {
    const merged = adjustments.map(adj =>
      reasons[adj.orderItemId] !== undefined
        ? { ...adj, reason: reasons[adj.orderItemId] }
        : adj
    );
    setAdjustments(merged);
    const newCartTotal = newCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    // Confirm dialog only when re-opening a COMPLETED order with NEW items (not for adjustments)
    if (orderInfo?.orderStatus === 'Completed' && !orderInfo.isPaid && newCartTotal > 0) {
      pendingAdjustmentsRef.current = merged;
      setShowConfirmModal(true);
    } else {
      executeUpdateItemsWithAdjustments(merged);
    }
  };

  /** Handler passed to EditTicket to record an adjustment on an existing item. */
  const handleAdjustItem = (orderItemId: number, newQuantity: number, reason?: string, note?: string) => {
    setAdjustments(prev => {
      const existing = prev.findIndex(a => a.orderItemId === orderItemId);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = { orderItemId, newQuantity, reason, note };
        return next;
      }
      return [...prev, { orderItemId, newQuantity, reason, note }];
    });
  };

  /**
   * Core submit function — accepts an explicit adjustments list to avoid React state
   * batching issues when reasons are merged right before submission.
   */
  const executeUpdateItemsWithAdjustments = async (adjs: OrderItemAdjustment[]) => {
    if (!orderInfo) return;
    setIsSubmitting(true);
    try {
      const payload: UpdateOrderItemsRequest = {
        adjustments: adjs,
        newItems: newCart.map(i => ({ dishId: i.dishId, quantity: i.quantity, note: i.note })),
        customer: sharedCustomer ? {
          customerId: sharedCustomer.customerId === 0 ? undefined : sharedCustomer.customerId,
          fullName:   sharedCustomer.fullName,
          phone:      sharedCustomer.phone,
          email:      sharedCustomer.email,
        } : null,
      };

      const updatePromise = createOrderService.updateOrderItems(orderInfo.orderId, payload).then(async () => {
        const updatedOrder = await createOrderService.getOrderById(orderInfo.orderId);
        setOrderInfo(updatedOrder);
        onOrderFetched(updatedOrder);
        setInitialCustomer(sharedCustomer);
        setAdjustments([]);
        clearCart();
        setShowConfirmModal(false);
        onCloseMobile();
      });

      toast.promise(updatePromise, { loading: t('saving'), success: t('successMessage'), error: t('errorMessage') });
    } catch (error) {
      toast.error(t('errorMessage'));
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Convenience wrapper that reads from current `adjustments` state. */
  const executeUpdateItems = () => executeUpdateItemsWithAdjustments(adjustments);

  // _OLD: executeAddItems was replaced by executeUpdateItems above

  // --- MAPPING DATA FOR PRINT MODAL ---
  const mappedOrderHistory = useMemo(() => {
    if (!orderInfo) return null;

    if (orderInfo.isPaid) {
      return {
        ...orderInfo,
        orderItems: orderInfo.orderItems.map(item => ({
          ...item,
          dishName: item.dishName || item.dishNameI18n?.['en'] || ''
        }))
      };
    }

    function toOrderSourceCode(value: string): string {
      if (!value) return "";

        const formatted = value.trim().toLowerCase().replace(/_/g, "-");
        
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }

    const combinedOrderItems: ExistingOrderItemDto[] = [
      ...orderInfo.orderItems.map(item => ({
        orderItemId: item.orderItemId,
        dishId: item.dishId,
        dishName: item.dishName || item.dishNameI18n?.['en'] || '',
        dishNameI18n: item.dishNameI18n,
        quantity: item.quantity,
        price: item.price,
        itemStatus: item.itemStatus,
        rejectReason: item.rejectReason || undefined,
        note: item.note || undefined
      })),
      ...newCart.map((item, index) => ({
        orderItemId: -(index + 1), 
        dishId: item.dishId,
        dishName: item.localName,
        quantity: item.quantity,
        price: item.price,
        itemStatus: 'New' as any,
        note: item.note || undefined
      }))
    ];

    const newCartTotal = newCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItemCount = combinedOrderItems.reduce((acc, item) => acc + item.quantity, 0);

    return {
      orderId: orderInfo.orderId,
      tableId: orderInfo.tableId || 0,
      tableCode: orderInfo.tableCode || '',
      staffId: orderInfo.staffId || 0,
      staffName: orderInfo.staffName || '',
      customerId: sharedCustomer?.customerId || orderInfo.customerId || 0,
      customerName: sharedCustomer?.fullName || orderInfo.customerName,
      totalAmount: orderInfo.totalAmount + newCartTotal,
      subTotalAmount: orderInfo.totalAmount + newCartTotal,
      taxAmount: orderInfo.taxAmount || 0,
      tipAmount: orderInfo.tipAmount,
      orderStatus: orderInfo.orderStatus,
      source: toOrderSourceCode(orderInfo.source),
      createdAt: orderInfo.createdAt,
      updatedAt: orderInfo.updatedAt,
      isPaid: orderInfo.isPaid,
      orderItems: combinedOrderItems,
      itemCount: totalItemCount
    } as OrderDetailDto;
  }, [orderInfo, newCart, sharedCustomer]);


  if (isOrderLoading) {
    return <div className="h-full w-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A3A52]"></div></div>;
  }
  if (!orderInfo || !mappedOrderHistory) return <div className="p-10 text-center text-[#8C3A3A] font-bold">Order not found.</div>;

  const isCustomerChanged =
    sharedCustomer?.customerId !== initialCustomer?.customerId ||
    sharedCustomer?.fullName !== initialCustomer?.fullName ||
    sharedCustomer?.phone !== initialCustomer?.phone ||
    sharedCustomer?.email !== initialCustomer?.email;

  const printType = orderInfo.isPaid ? 'receipt' : 'invoice';

  return (
    <div className="h-full flex flex-col relative bg-white">
      {/* <div className="p-2 border-b bg-gray-50 flex items-center gap-2">
        <button onClick={onReturnToCreate} className="text-xs bg-white border border-[#1A3A52] text-[#1A3A52] hover:bg-[#1A3A52] hover:text-white transition-colors px-3 py-1.5 rounded-md font-medium shadow-sm">
          ← {t('backToCreate', { fallback: "Tạo đơn mới" })}
        </button>
        <div className="text-sm font-semibold text-gray-600 ml-2">Chỉnh sửa đơn #{orderId}</div>
      </div> */}

      <div className="flex-1 overflow-hidden">
        <EditTicket
          orderInfo={orderInfo}
          newCart={newCart}
          customer={sharedCustomer}
          onOpenCustomerModal={onOpenCustomerModal}
          onUpdateQuantity={updateQuantity}
          onUpdateNote={updateNote}
          onRemoveFromCart={removeFromCart}
          onClearCart={clearCart}
          onSubmitItems={handleSubmitAttempt}
          isCustomerChanged={isCustomerChanged}
          onCreateInvoice={() => setIsPrintModalOpen(true)}
          onCloseMobile={onCloseMobile}
          onReturnToCreate={onReturnToCreate}
          adjustments={adjustments}
          onAdjustItem={handleAdjustItem}
          onConfirmServedReasons={handleConfirmServedReasons}
        />
      </div>

      <PrintOrderModal 
        order={mappedOrderHistory} 
        isOpen={isPrintModalOpen} 
        onClose={() => setIsPrintModalOpen(false)} 
        type={printType} 
      />

      <Dialog open={showConfirmModal} onClose={() => setShowConfirmModal(false)} title={t('warningTitle')}
        footer={
          <div className="flex justify-end gap-3 w-full">
            <button disabled={isSubmitting} onClick={() => setShowConfirmModal(false)} className="px-4 py-2 font-medium bg-[#FDFBF9] border border-[#D5BA98]/40 text-[#1A3A52] rounded-lg hover:bg-[#D5BA98]/10 transition">
              {t('cancel')}
            </button>
            <button disabled={isSubmitting} onClick={() => { const adjs = pendingAdjustmentsRef.current ?? adjustments; pendingAdjustmentsRef.current = null; executeUpdateItemsWithAdjustments(adjs); }} className="px-4 py-2 font-bold bg-[#1A3A52] text-[#D5BA98] rounded-lg flex items-center gap-2 hover:bg-[#1A3A52]/90 transition">
              {isSubmitting ? t('loading') : t('confirmChangeStatus')}
            </button>
          </div>
        }
      >
        <div className="p-2 text-[#1A3A52]/80 flex gap-3 items-start">
          <AlertTriangle className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
          <p>{t('completedOrderWarning')}</p>
        </div>
      </Dialog>
    </div>
  );
};