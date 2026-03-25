"use client";

import React, { useState } from 'react';
import { useCreateOrder } from '../hooks/useCreateOrder';
import { createOrderService } from '../services/create-edit-order.service';
import { MenuCatalog } from './menu-catalog';
import { CurrentTicket } from './current-ticket';
import { TableSelectionModal } from './table-selection-modal';
import { CustomerSearchModal } from './customer-search-modal';
import { RecentOrders } from './recent-orders';
import { DishDetailModal } from './dish-detail-modal';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { DishDto } from '../types/create-order.types';
import { Menu } from 'lucide-react';
import { OrderHistory, OrderItem } from '../../order-management/types/order-history.types';
import { PrintOrderModal } from '../../order-management/components/PrintOrderModal';
import { ExistingOrderItemDto, OrderItemStatus, OrderStatus } from '../types/edit-order.types';

export const CreateOrderPage = () => {
  const t = useTranslations("orders.management.Create");
  const {
    locale, isLoading, dishes, categories, tables, cart, orderType, setOrderType,
    selectedTable, setSelectedTable, customer, setCustomer,
    getLocalizedDishName, getLocalizedCategoryName, addToCart, updateQuantity, updateNote, removeFromCart, clearCart
  } = useCreateOrder();

  const [showTablePopup, setShowTablePopup] = useState(false);
  const [showCustomerPopup, setShowCustomerPopup] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<DishDto | null>(null);
  const [showMobileTicket, setShowMobileTicket] = useState(false);

  const handlePlaceOrder = async () => {
    try {
      await createOrderService.createOrder({
        tableId: selectedTable?.tableId,
        customer: customer ? {
          customerId: customer.customerId === 0 ? null : customer.customerId,
          fullName: customer.fullName,
          phone: customer.phone,
          email: customer.email
        } : undefined,
        source: orderType,
        items: cart.map(item => ({
          dishId: item.dishId,
          quantity: item.quantity,
          note: item.note || undefined
        }))
      });
      toast.success('Order placed successfully!');
      clearCart();
      setCustomer(null);
      setSelectedTable(null);
      setShowMobileTicket(false);
    } catch (error) {
      toast.error('Error placing order.');
    }
  };

  // The Modal function handles adding items with custom quantities.
  const handleAddDishWithQuantity = (dish: DishDto, quantity: number) => {
    const existing = cart.find(item => item.dishId === dish.dishId);
    if (!existing) {
      addToCart(dish);
      if (quantity > 1) {
        updateQuantity(dish.dishId, quantity - 1);
      }
    } else {
      updateQuantity(dish.dishId, quantity);
    }
    setSelectedDish(null);
  };

  const handleQuickAdd = (dish: DishDto) => {
    const existing = cart.find(item => item.dishId === dish.dishId);
    if (!existing) {
      addToCart(dish);
    } else {
      updateQuantity(dish.dishId, 1);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#FDFBF9]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A3A51]"></div>
      </div>
    );
  }

  // ──MAPPING DATA TO PRINT ORDER MODAL ──
  function toOrderSourceCode(value: string): string {
    return value.trim().toUpperCase().replace(/[-\s]+/g, "_");
  }

  // Create Order Items from the current shopping cart
  const mappedOrderItems: ExistingOrderItemDto[] = cart.map((item, index) => ({
    orderItemId: -(index + 1), // Temporary ID
    dishId: item.dishId,
    dishName: item.localName,
    quantity: item.quantity,
    price: item.price,
    itemStatus: 'Created' as OrderItemStatus,
    note: item.note || undefined
  }));

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // create mock OrderDetailDto (Invoice tạm tính)
  const mappedOrderHistory = {
    orderId: 0, // Đơn chưa tạo nên chưa có ID chính thức
    tableId: selectedTable?.tableId,
    tableCode: selectedTable?.tableCode || '',
    staffId: 0,
    staffName: '',
    customerId: customer?.customerId,
    customerName: customer?.fullName || '',
    
    subTotalAmount: cartTotal,
    totalAmount: cartTotal, // Tạm thời bằng Subtotal vì chưa có tax/discount
    taxAmount: 0,
    tipAmount: 0,
    
    orderStatus: 'Pending' as OrderStatus,
    source: toOrderSourceCode(orderType),
    
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPaid: false,
    
    orderItems: mappedOrderItems,
    promotions: [], // Chưa có thông tin giảm giá
    coupons: [],    // Chưa có thông tin mã giảm giá
    payments: [],   // Chưa thanh toán
    itemCount: totalItemCount
  };

  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] lg:h-full w-full font-sans overflow-hidden">

      {/* ── Ticket opening button on Mobile ── */}
      {!showMobileTicket && (
        <button
          onClick={() => setShowMobileTicket(true)}
          className="lg:hidden fixed bottom-4 right-4 z-50 bg-[#1A3A52] text-[#D5BA98] p-4 rounded-full shadow-2xl flex items-center justify-center animate-in fade-in zoom-in duration-300"
        >
          <Menu className="w-6 h-6" />
          {cart.length > 0 && (
            <span className="absolute top-0 right-0 bg-[#8C3A3A] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>
      )}

      <div className="flex-1 flex flex-col overflow-hidden lg:pr-5 gap-4">

        {/* Recent Orders Section */}
        <section className="shrink-0 bg-white rounded-xl border border-[#D5BA98]/30 shadow-sm p-4">
          <RecentOrders />
        </section>

        {/* Menu Categories Section */}
        <section className="flex-1 min-h-0 bg-white rounded-xl border border-[#D5BA98]/30 shadow-sm p-4 flex flex-col">
          <MenuCatalog
            title={t('title')}
            subtitle={t('subtitle')}
            dishes={dishes}
            categories={categories}
            locale={locale}
            getLocalizedDishName={getLocalizedDishName}
            getLocalizedCategoryName={getLocalizedCategoryName}
            onDishClick={(dish) => setSelectedDish(dish)}
            onQuickAdd={handleQuickAdd}
          />
        </section>

      </div>

      {/* ── (Cart) ── */}
      <aside className={`
        fixed inset-y-0 right-0 z-40 h-full w-full sm:w-[380px] xl:w-[420px] bg-white shadow-2xl transition-transform duration-300 transform
        lg:relative lg:translate-x-0 lg:shadow-none lg:border-l rounded-xl border lg:border-[#D5BA98]/30 overflow-hidden
        ${showMobileTicket ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <CurrentTicket
          cart={cart}
          orderType={orderType}
          selectedTable={selectedTable}
          customer={customer}
          onSetOrderType={setOrderType}
          onClearCart={clearCart}
          onUpdateQuantity={updateQuantity}
          onRemoveFromCart={removeFromCart}
          onUpdateNote={updateNote}
          onOpenTableModal={() => setShowTablePopup(true)}
          onOpenCustomerModal={() => setShowCustomerPopup(true)}
          onPlaceOrder={handlePlaceOrder}
          onCreateInvoice={() => setIsPrintModalOpen(true)}
          onCloseMobile={() => setShowMobileTicket(false)}
        />
      </aside>

      {/* ── Background Overlay for Mobile ── */}
      {showMobileTicket && (
        <div
          className="fixed inset-0 bg-[#1A3A52]/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setShowMobileTicket(false)}
        />
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

      <TableSelectionModal isOpen={showTablePopup} onClose={() => setShowTablePopup(false)} tables={tables} selectedTable={selectedTable} onSelectTable={setSelectedTable} />
      <CustomerSearchModal isOpen={showCustomerPopup} onClose={() => setShowCustomerPopup(false)} currentCustomer={customer} onSelectCustomer={setCustomer} />
      <PrintOrderModal
        order={mappedOrderHistory}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        type="invoice"
      />
    </div>
  );
};