"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createOrderService } from '../services/create-edit-order.service';
import { useCreateOrder } from '../hooks/useCreateOrder'; 
import { MenuCatalog } from './menu-catalog';
import { EditTicket } from './edit-ticket';
import { OrderDetailDto } from '../types/edit-order.types';
import { Dialog } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { InvoiceModal } from './invoice-modal';
import { toast } from 'sonner';

export const EditOrderPage = ({ orderId }: { orderId: number }) => {
  const t = useTranslations("Order.Edit");
  const [orderInfo, setOrderInfo] = useState<OrderDetailDto | null>(null);
  const [isOrderLoading, setIsOrderLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const { 
    locale, isLoading: isMenuLoading, dishes, categories, cart: newCart, 
    getLocalizedDishName, getLocalizedCategoryName, 
    addToCart, updateQuantity, updateNote, removeFromCart, clearCart 
  } = useCreateOrder();

  // Fetch Order by ID
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await createOrderService.getOrderById(orderId);
        setOrderInfo(data);
      } catch (error) {
        console.error("Failed to fetch order", error);
      } finally {
        setIsOrderLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleSubmitAttempt = () => {
    if (!orderInfo) return;
    
    if (orderInfo.orderStatus === 'Completed' && !orderInfo.isPaid) {
      setShowConfirmModal(true);
    } else {
      executeAddItems();
    }
  };

  const executeAddItems = async () => {
    if (!orderInfo || newCart.length === 0) return;
    setIsSubmitting(true);
    try {
      const addItemsPromise = createOrderService.addItemsToOrder(orderInfo.orderId, {
        items: newCart.map(i => ({ dishId: i.dishId, quantity: i.quantity, note: i.note }))
        }).then(async () => {
        // Reload data
        const updatedOrder = await createOrderService.getOrderById(orderInfo.orderId);
        setOrderInfo(updatedOrder);
        clearCart();
        setShowConfirmModal(false);
        });
      toast.promise(addItemsPromise, {
        loading: 'Đang thêm món...',
        success: t('successMessage'),
        error: 'Có lỗi xảy ra khi thêm món!',
        });
      
    } catch (error) {
      console.error(error);
      alert('Error adding items');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReadOnly = orderInfo?.isPaid || false;

  const menuSubtitle = isReadOnly 
    ? t('menuSubtitleView') 
    : t('menuSubtitleEdit');

  if (isMenuLoading || isOrderLoading) {
    return <div className="h-screen w-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A3A51]"></div></div>;
  }

  if (!orderInfo) {
    return <div className="p-10 text-center text-red-500">Order not found.</div>;
  }

  // Map dữ liệu order cũ và cart mới thành format cho InvoiceModal
  const combinedCartForInvoice = [
    // Biến đổi các item cũ sang dạng CartItem để truyền vào hóa đơn
    ...(orderInfo?.orderItems.map(item => ({
      dishId: item.dishId,
      quantity: item.quantity,
      price: item.price,
      localName: item.dishName,
      note: item.note || undefined,
      categoryId: 0, imageBase64: '', isActive: true, i18n: {} 
    })) || []),
    ...newCart
  ];

  function toOrderSourceCode(value: string): string {
    return value
        .trim()
        .toUpperCase()
        .replace(/[-\s]+/g, "_");
    }

  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] lg:h-full w-full font-sans gap-4 lg:gap-6 overflow-hidden">
      
      {/* Tái sử dụng Menu Catalog */}
      <MenuCatalog 
        title={t('menuTitle')}
        subtitle={menuSubtitle}
        isReadOnly={isReadOnly}
        dishes={dishes} 
        categories={categories}
        locale={locale} 
        getLocalizedDishName={getLocalizedDishName} 
        getLocalizedCategoryName={getLocalizedCategoryName}
        onAddToCart={addToCart} 
      />

      {/* Ticket đặc chế cho việc Edit */}
      <EditTicket 
        orderInfo={orderInfo}
        newCart={newCart}
        onUpdateQuantity={updateQuantity}
        onUpdateNote={updateNote}
        onRemoveFromCart={removeFromCart}
        onClearCart={clearCart}
        onSubmitItems={handleSubmitAttempt}
        onCreateInvoice={() => setShowInvoiceModal(true)}
      />

      {orderInfo && (
        <InvoiceModal 
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          cart={combinedCartForInvoice}
          orderType={toOrderSourceCode(orderInfo.source) as any}
          selectedTable={{ 
            tableId: orderInfo.tableId || 0, 
            tableCode: orderInfo.tableCode || '', 
            zoneId: 0,
            zoneName: '', capacity: 0, statusCode: 'AVAILABLE' ,
            hasActiveOrder: false
          }}
          customer={{ 
            customerId: orderInfo.customerId || 0, 
            fullName: orderInfo.customerName || '',
            phone: '',
            email: '',
            isMember: false,
            loyaltyPoints: 0,
            createdAt: ''
          }}
        />
      )}

      {/* Dialog Cảnh báo Case B */}
      <Dialog 
        open={showConfirmModal} 
        onClose={() => setShowConfirmModal(false)} 
        title={t('warningTitle')}
        footer={
          <div className="flex justify-end gap-3 w-full">
            <button disabled={isSubmitting} onClick={() => setShowConfirmModal(false)} className="px-4 py-2 font-medium bg-gray-100 text-gray-700 rounded-lg">
              {t('cancel')}
            </button>
            <button disabled={isSubmitting} onClick={executeAddItems} className="px-4 py-2 font-medium bg-[#1A3A51] text-white rounded-lg flex items-center gap-2">
              {isSubmitting ? 'Loading...' : t('confirmChangeStatus')}
            </button>
          </div>
        }
      >
        <div className="p-2 text-gray-700 flex gap-3 items-start">
          <AlertTriangle className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
          <p>{t('completedOrderWarning')}</p>
        </div>
      </Dialog>
    </div>
  );
};