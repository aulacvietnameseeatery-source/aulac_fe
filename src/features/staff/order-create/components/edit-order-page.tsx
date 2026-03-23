"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createOrderService } from '../services/create-edit-order.service';
import { useCreateOrder } from '../hooks/useCreateOrder';
import { MenuCatalog } from './menu-catalog';
import { EditTicket } from './edit-ticket';
import { RecentOrders } from './recent-orders';
import { DishDetailModal } from './dish-detail-modal';
import { OrderDetailDto } from '../types/edit-order.types';
import { DishDto, CustomerDto } from '../types/create-order.types';
import { Dialog } from '@/components/ui/dialog';
import { AlertTriangle, Menu } from 'lucide-react';
import { CustomerSearchModal } from './customer-search-modal';
import { toast } from 'sonner';
import { OrderHistory, OrderItem } from '../../order-management/types/order-history.types';
import { PrintOrderModal } from '../../order-management/components/PrintOrderModal';

export const EditOrderPage = ({ orderId }: { orderId: number }) => {
  const t = useTranslations("orders.management.Edit");
  const [orderInfo, setOrderInfo] = useState<OrderDetailDto | null>(null);
  const [isOrderLoading, setIsOrderLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [showCustomerPopup, setShowCustomerPopup] = useState(false);

  const [selectedDish, setSelectedDish] = useState<DishDto | null>(null);
  const [showMobileTicket, setShowMobileTicket] = useState(false);

  const [customer, setCustomer] = useState<Partial<CustomerDto> | null>(null);
  const [initialCustomer, setInitialCustomer] = useState<Partial<CustomerDto> | null>(null);

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

        if (data.customerId) {
          if (data.customerId !== 68) {
            try {
              const fullCustomerData = await createOrderService.getCustomerById(data.customerId);
              setCustomer(fullCustomerData);
              setInitialCustomer(fullCustomerData);
            } catch (customerError) {
              const fallbackCustomer = { customerId: data.customerId, fullName: data.customerName };
              setCustomer(fallbackCustomer);
              setInitialCustomer(fallbackCustomer);
            }
          } else {
            const guestCustomer = { customerId: data.customerId, fullName: data.customerName };
            setCustomer(guestCustomer);
            setInitialCustomer(guestCustomer);
          }
        }
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

    if (orderInfo.orderStatus === 'Completed' && !orderInfo.isPaid && newCartTotal > 0) {
      setShowConfirmModal(true);
    } else {
      executeAddItems();
    }
  };

  const executeAddItems = async () => {
    if (!orderInfo) return;
    setIsSubmitting(true);
    try {
      const payload = {
        // Map object Customer
        customer: customer ? {
          customerId: customer.customerId === 0 ? null : customer.customerId,
          fullName: customer.fullName,
          phone: customer.phone,
          email: customer.email
        } : null,
        items: newCart.map(i => ({ dishId: i.dishId, quantity: i.quantity, note: i.note }))
      };

      const addItemsPromise = createOrderService.addItemsToOrder(orderInfo.orderId, payload as any).then(async () => {
        // Reload data
        const updatedOrder = await createOrderService.getOrderById(orderInfo.orderId);
        setOrderInfo(updatedOrder);
        clearCart();
        setShowConfirmModal(false);
        setShowMobileTicket(false);
      });
      toast.promise(addItemsPromise, {
        loading: t('saving'),
        success: t('successMessage'),
        error: t('errorMessage'),
      });

    } catch (error) {
      console.error(error);
      toast.error(t('errorMessage'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm add kèm số lượng từ Modal
  const handleAddDishWithQuantity = (dish: DishDto, quantity: number) => {
    const existing = newCart.find(item => item.dishId === dish.dishId);
    if (!existing) {
      addToCart(dish);
      if (quantity > 1) updateQuantity(dish.dishId, quantity - 1);
    } else {
      updateQuantity(dish.dishId, quantity);
    }
    setSelectedDish(null);
  };

  const handleQuickAdd = (dish: DishDto) => {
    const existing = newCart.find(item => item.dishId === dish.dishId);
    if (!existing) {
      addToCart(dish);
    } else {
      updateQuantity(dish.dishId, 1);
    }
  };

  const isCancelled = orderInfo?.orderStatus === 'Cancelled';
  const isReadOnly = orderInfo?.isPaid || isCancelled || false;

  let menuSubtitle = t('menuSubtitleEdit');
  if (isCancelled) {
    menuSubtitle = t('menuSubtitleCancelled');
  } else if (orderInfo?.isPaid) {
    menuSubtitle = t('menuSubtitleView');
  }

  if (isMenuLoading || isOrderLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-[#FDFBF9]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A3A52]"></div></div>;
  }

  if (!orderInfo) {
    return <div className="p-10 text-center text-[#8C3A3A] font-bold">Order not found.</div>;
  }

  function toOrderSourceCode(value: string): string {
    return value.trim().toUpperCase().replace(/[-\s]+/g, "_");
  }

  const printType = orderInfo.isPaid ? 'invoice' : 'receipt';

  const combinedOrderItems: OrderItem[] = [
    ...(orderInfo.orderItems.map(item => ({
      orderItemId: item.orderItemId,
      dishId: item.dishId,
      dishName: item.dishName,
      quantity: item.quantity,
      price: item.price,
      itemStatus: item.itemStatus,
      rejectReason: item.rejectReason || undefined,
      note: item.note || undefined
    }))),
    ...newCart.map((item, index) => ({
      orderItemId: -(index + 1), // Temporary ID
      dishId: item.dishId,
      dishName: item.localName,
      quantity: item.quantity,
      price: item.price,
      itemStatus: 'New',
      note: item.note || undefined
    }))
  ];

  const totalItemCount = combinedOrderItems.reduce((acc, item) => acc + item.quantity, 0);
  const newCartTotal = newCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const mappedOrderHistory: OrderHistory = {
    orderId: orderInfo.orderId,
    tableId: orderInfo.tableId || 0,
    tableCode: orderInfo.tableCode || '',
    staffId: orderInfo.staffId || 0,
    staffName: orderInfo.staffName || '',
    customerId: orderInfo.customerId || 0,
    customerName: orderInfo.customerName,
    totalAmount: orderInfo.totalAmount + newCartTotal,
    taxAmount: orderInfo.taxAmount || 0,
    tipAmount: orderInfo.tipAmount,
    orderStatus: orderInfo.orderStatus,
    source: toOrderSourceCode(orderInfo.source),
    createdAt: orderInfo.createdAt,
    updatedAt: orderInfo.updatedAt,
    isPaid: orderInfo.isPaid,
    orderItems: combinedOrderItems,
    itemCount: totalItemCount
  };

  const isCustomerChanged =
    customer?.customerId !== initialCustomer?.customerId ||
    customer?.fullName !== initialCustomer?.fullName ||
    customer?.phone !== initialCustomer?.phone ||
    customer?.email !== initialCustomer?.email;

  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] lg:h-full w-full font-sans overflow-hidden">

      {/* ── Nút mở Ticket trên Mobile ── */}
      {!showMobileTicket && (
        <button
          onClick={() => setShowMobileTicket(true)}
          className="lg:hidden fixed bottom-4 right-4 z-50 bg-[#1A3A52] text-[#D5BA98] p-4 rounded-full shadow-2xl flex items-center justify-center animate-in fade-in zoom-in duration-300"
        >
          <Menu className="w-6 h-6" />
          {newCart.length > 0 && (
            <span className="absolute top-0 right-0 bg-[#8C3A3A] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
              {newCart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>
      )}

      {/* ── Cột trái: Nội dung chính ── */}
      <div className="flex-1 flex flex-col overflow-hidden lg:pr-5 gap-4">

        <section className="shrink-0 bg-white rounded-xl border border-[#D5BA98]/30 shadow-sm p-4">
          <RecentOrders />
        </section>

        <section className="flex-1 min-h-0 bg-white rounded-xl border border-[#D5BA98]/30 shadow-sm p-4 flex flex-col">
          <MenuCatalog
            title={t('menuTitle')}
            subtitle={menuSubtitle}
            isReadOnly={isReadOnly}
            dishes={dishes}
            categories={categories}
            locale={locale}
            getLocalizedDishName={getLocalizedDishName}
            getLocalizedCategoryName={getLocalizedCategoryName}
            onDishClick={(dish) => !isReadOnly && setSelectedDish(dish)}
            onQuickAdd={handleQuickAdd}
          />
        </section>

      </div>

      {/* ── Cột phải: Phiếu Edit (Aside) ── */}
      <aside className={`
        fixed inset-y-0 right-0 z-40 h-full w-full sm:w-[380px] xl:w-[420px] bg-white shadow-2xl transition-transform duration-300 transform
        lg:relative lg:translate-x-0 lg:shadow-none lg:border-l rounded-xl border lg:border-[#D5BA98]/30 overflow-hidden
        ${showMobileTicket ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <EditTicket
          orderInfo={orderInfo}
          newCart={newCart}
          customer={customer}
          onOpenCustomerModal={() => setShowCustomerPopup(true)}
          onUpdateQuantity={updateQuantity}
          onUpdateNote={updateNote}
          onRemoveFromCart={removeFromCart}
          onClearCart={clearCart}
          onSubmitItems={handleSubmitAttempt}
          isCustomerChanged={isCustomerChanged}
          onCreateInvoice={() => setIsPrintModalOpen(true)}
          onCloseMobile={() => setShowMobileTicket(false)}
        />
      </aside>

      {/* ── Background Overlay Mobile ── */}
      {showMobileTicket && (
        <div className="fixed inset-0 bg-[#1A3A52]/50 z-30 lg:hidden backdrop-blur-sm" onClick={() => setShowMobileTicket(false)} />
      )}

      {/* ── Modals ── */}
      <DishDetailModal
        dish={selectedDish}
        isOpen={!!selectedDish}
        onClose={() => setSelectedDish(null)}
        onAdd={handleAddDishWithQuantity}
        locale={locale}
        getLocalizedDishName={getLocalizedDishName}
      />

      <CustomerSearchModal
        isOpen={showCustomerPopup}
        onClose={() => setShowCustomerPopup(false)}
        currentCustomer={customer}
        onSelectCustomer={setCustomer}
      />

      <PrintOrderModal
        order={mappedOrderHistory}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        type={printType}
      />

      <Dialog
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={t('warningTitle')}
        footer={
          <div className="flex justify-end gap-3 w-full">
            <button disabled={isSubmitting} onClick={() => setShowConfirmModal(false)} className="px-4 py-2 font-medium bg-[#FDFBF9] border border-[#D5BA98]/40 text-[#1A3A52] rounded-lg hover:bg-[#D5BA98]/10 transition">
              {t('cancel')}
            </button>
            <button disabled={isSubmitting} onClick={executeAddItems} className="px-4 py-2 font-bold bg-[#1A3A52] text-[#D5BA98] rounded-lg flex items-center gap-2 hover:bg-[#1A3A52]/90 transition">
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