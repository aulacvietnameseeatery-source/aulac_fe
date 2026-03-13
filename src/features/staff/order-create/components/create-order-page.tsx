"use client";

import React, { useState } from 'react';
import { useCreateOrder } from '../hooks/useCreateOrder';
import { createOrderService } from '../services/create-edit-order.service';
import { MenuCatalog } from './menu-catalog';
import { CurrentTicket } from './current-ticket';
import { TableSelectionModal } from './table-selection-modal';
import { CustomerSearchModal } from './customer-search-modal';
import { InvoiceModal } from './invoice-modal';
import { RecentOrders } from './recent-orders';
import { DishDetailModal } from './dish-detail-modal';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { DishDto } from '../types/create-order.types';
import { Menu } from 'lucide-react';
import { OrderHistory, OrderItem } from '../../order-management/types/order-history.types';
import { PrintOrderModal } from '../../order-management/components/PrintOrderModal';

export const CreateOrderPage = () => {
  const t = useTranslations("Order.Create");
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
        customerId: customer?.customerId,
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

  // Hàm xử lý thêm món với số lượng tùy chỉnh từ Modal
  const handleAddDishWithQuantity = (dish: DishDto, quantity: number) => {
    const existing = cart.find(item => item.dishId === dish.dishId);
    if (!existing) {
      addToCart(dish); // Add lần đầu (hook mặc định là 1)
      if (quantity > 1) {
        updateQuantity(dish.dishId, quantity - 1); // Cộng thêm phần dư
      }
    } else {
      updateQuantity(dish.dishId, quantity); // Nếu đã có thì cộng thêm
    }
    setSelectedDish(null);
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#FDFBF9]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A3A51]"></div>
      </div>
    );
  }

  // ── MAPPING SANG DỮ LIỆU CỦA PRINT ORDER MODAL ──
  function toOrderSourceCode(value: string): string {
    return value.trim().toUpperCase().replace(/[-\s]+/g, "_");
  }

  // Tạo OrderItems từ giỏ hàng hiện tại
  const mappedOrderItems: OrderItem[] = cart.map((item, index) => ({
    orderItemId: -(index + 1), // ID tạm thời do chưa tạo order thực tế
    dishId: item.dishId,
    dishName: item.localName,
    quantity: item.quantity,
    price: item.price,
    itemStatus: 'New', 
    note: item.note || undefined
  }));

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Tạo mock OrderHistory từ các state hiện tại
  const mappedOrderHistory: OrderHistory = {
    orderId: 0, // Đơn mới nên chưa có ID
    tableId: selectedTable?.tableId || 0,
    tableCode: selectedTable?.tableCode || '',
    staffId: 0,
    staffName: '', // Bạn có thể thêm logic lấy tên nhân viên đang login nếu cần
    customerId: customer?.customerId || 0,
    customerName: customer?.fullName || '',
    totalAmount: cartTotal,
    orderStatus: 'Pending',
    source: toOrderSourceCode(orderType),
    createdAt: new Date().toISOString(),
    isPaid: false,
    orderItems: mappedOrderItems,
    itemCount: totalItemCount
  };

  return (
    // Sử dụng h-[100dvh] và overflow-hidden để CHỐNG scroll toàn trang
    <div className="flex flex-col lg:flex-row h-[100dvh] lg:h-full w-full font-sans overflow-hidden bg-[#FDFBF9]">
      
      {/* ── Nút mở Ticket trên Mobile ── */}
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
        type="receipt" 
      />
    </div>
  );
};