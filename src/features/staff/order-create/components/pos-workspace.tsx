"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCreateOrder } from '../hooks/useCreateOrder';
import { MenuCatalog } from './menu-catalog';
import { RecentOrders } from './recent-orders';
import { CurrentTicket } from './current-ticket';
import { EditOrderSidebar } from './edit-order-sidebar';
import { DishDetailModal } from './dish-detail-modal';
import { TableSelectionModal } from './table-selection-modal';
import { CustomerSearchModal } from './customer-search-modal';
import { GripVertical, Menu } from 'lucide-react';
import { CustomerDto, DishDto } from '../types/create-order.types';
import { toast } from 'sonner';
import { createOrderService } from '../services/create-edit-order.service';
import { PrintOrderModal } from '../../order-management/components/PrintOrderModal';
import { ExistingOrderItemDto, OrderItemStatus, OrderStatus, OrderDetailDto } from '../types/edit-order.types';

interface PosWorkspaceProps {
  initialOrderId?: number | null;
}

export const PosWorkspace = ({ initialOrderId = null }: PosWorkspaceProps) => {
  const tCreate = useTranslations("orders.management.Create");
  const tEdit = useTranslations("orders.management.Edit");
  
  const {
    locale, isLoading, dishes, categories, tables, cart, orderType, setOrderType,
    selectedTable, setSelectedTable, customer, setCustomer,
    getLocalizedDishName, getLocalizedCategoryName, addToCart, updateQuantity, updateNote, removeFromCart, clearCart
  } = useCreateOrder();

  const [activeOrderId, setActiveOrderId] = useState<number | null>(initialOrderId);
  
  // State Hứng thông tin từ Sidebar Edit để tính isReadOnly
  const [editOrderInfo, setEditOrderInfo] = useState<OrderDetailDto | null>(null);
  
  const [showTablePopup, setShowTablePopup] = useState(false);
  const [showCustomerPopup, setShowCustomerPopup] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<DishDto | null>(null);
  const [showMobileTicket, setShowMobileTicket] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(400);

const startResizing = React.useCallback((mouseDownEvent: React.MouseEvent | React.TouchEvent) => {
  if (mouseDownEvent.cancelable) {
    mouseDownEvent.preventDefault();
  }

  const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
    let clientX: number;
    
    if ('touches' in moveEvent) {
      clientX = moveEvent.touches[0].clientX;
    } else {
      clientX = moveEvent.clientX;
    }

    const newWidth = window.innerWidth - clientX;
    
    if (newWidth >= 320 && newWidth <= 800) {
      setSidebarWidth(newWidth);
    }
  };

  const handleUp = () => {
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('mouseup', handleUp);
    document.removeEventListener('touchmove', handleMove);
    document.removeEventListener('touchend', handleUp);
    
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto'; 
  };

  document.addEventListener('mousemove', handleMove);
  document.addEventListener('mouseup', handleUp);

  document.addEventListener('touchmove', handleMove, { passive: false });
  document.addEventListener('touchend', handleUp);

  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
}, []);

  const handleOrderSelect = (orderId: number) => {
    if (activeOrderId === orderId) return;
    clearCart(); 
    setCustomer(null);
    //setEditOrderInfo(null); 
    setActiveOrderId(orderId);

    window.history.pushState(null, '', `/dashboard/orders/pos/${orderId}`);
  };

  const handleReturnToCreate = () => {
    clearCart();
    setCustomer(null);
    setSelectedTable(null);
    setEditOrderInfo(null);
    setActiveOrderId(null);

    window.history.pushState(null, '', `/dashboard/orders/pos`);
  };

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

  const handleAddDishWithQuantity = (dish: DishDto, quantity: number) => {
    const existing = cart.find(item => item.dishId === dish.dishId);
    if (!existing) {
      addToCart(dish);
      if (quantity > 1) updateQuantity(dish.dishId, quantity - 1);
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

  // --- LOGIC GIAO DIỆN (isReadOnly / Subtitle) ---
  const isFetchingNewOrder = activeOrderId !== null && editOrderInfo?.orderId !== activeOrderId;
  const isCancelled = editOrderInfo?.orderStatus === 'Cancelled';
  const isReadOnly = activeOrderId ? (isFetchingNewOrder || editOrderInfo?.isPaid || isCancelled || false) : false;

  let menuSubtitle = tCreate('subtitle');
  let menuTitle = tCreate('title');

  if (activeOrderId) {
    menuTitle = tEdit('menuTitle');

    if (isCancelled) menuSubtitle = tEdit('menuSubtitleCancelled');
    else if (editOrderInfo?.isPaid) menuSubtitle = tEdit('menuSubtitleView');
    else menuSubtitle = tEdit('menuSubtitleEdit');
  }

  // --- MAP DATA CHO MODAL TẠO MỚI ---
  const mappedOrderHistoryCreate = useMemo(() => {
    function toOrderSourceCode(value: string): string {
       if (!value) return "";
  
        const formatted = value.trim().toLowerCase().replace(/_/g, "-");
      
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return {
      orderId: 0,
      tableId: selectedTable?.tableId,
      tableCode: selectedTable?.tableCode || '',
      staffId: 0,
      staffName: '',
      customerId: customer?.customerId,
      customerName: customer?.fullName || '',
      subTotalAmount: cartTotal,
      totalAmount: cartTotal, 
      taxAmount: 0,
      tipAmount: 0,
      orderStatus: 'Pending' as OrderStatus,
      source: toOrderSourceCode(orderType),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPaid: false,
      orderItems: cart.map((item, index) => ({
        orderItemId: -(index + 1), 
        dishId: item.dishId,
        dishName: item.localName,
        quantity: item.quantity,
        price: item.price,
        itemStatus: 'Created' as OrderItemStatus,
        note: item.note || undefined
      })),
      promotions: [], coupons: [], payments: [], itemCount: totalItemCount
    };
  }, [cart, selectedTable, customer, orderType]);

  if (isLoading) return <div className="w-full h-screen flex items-center justify-center bg-[#FDFBF9]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A3A51]"></div></div>;

  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] lg:h-full w-full font-sans overflow-hidden">
      
      {!showMobileTicket && (
        <button onClick={() => setShowMobileTicket(true)} className="lg:hidden fixed bottom-4 right-4 z-50 bg-[#1A3A52] text-[#D5BA98] p-4 rounded-full shadow-2xl flex items-center justify-center">
          <Menu className="w-6 h-6" />
          {cart.length > 0 && <span className="absolute top-0 right-0 bg-[#8C3A3A] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>}
        </button>
      )}

      <div className="flex-1 flex flex-col overflow-hidden gap-4">
        
        <section className="shrink-0 bg-white rounded-xl border border-[#D5BA98]/30 shadow-sm p-4 relative">
          <RecentOrders activeOrderId={activeOrderId} onOrderSelect={handleOrderSelect} />
        </section>

        <section className="flex-1 min-h-0 bg-white rounded-xl border border-[#D5BA98]/30 shadow-sm p-4 flex flex-col">
          <MenuCatalog
            title={menuTitle}
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

      <div
        onMouseDown={startResizing}
        onTouchStart={startResizing}
        className="hidden lg:flex w-4 shrink-0 cursor-col-resize items-center justify-center group z-50 hover:bg-[#D5BA98]/10 transition-colors"
      >
        <div className="flex items-center justify-center p-0.5 rounded-full bg-[#FDFBF9] border border-[#D5BA98]/40 group-hover:border-[#1A3A52] group-hover:shadow-lg shadow-sm transition-all duration-150">
          <GripVertical className="w-4 h-4 text-[#D5BA98] group-hover:text-[#1A3A52]" />
        </div>
      </div>

      <aside 
      style={{ width: sidebarWidth, maxWidth: '100%' }}
      className={`fixed inset-y-0 right-0 z-40 h-full w-full sm:w-[380px] xl:w-[420px] bg-white shadow-2xl transition-transform duration-300 transform lg:relative lg:translate-x-0 lg:shadow-none lg:border-l rounded-xl border lg:border-[#D5BA98]/30 overflow-hidden ${showMobileTicket ? 'translate-x-0' : 'translate-x-full'}`}>
        {activeOrderId ? (
          <EditOrderSidebar 
            orderId={activeOrderId}
            newCart={cart}
            updateQuantity={updateQuantity}
            updateNote={updateNote}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
            sharedCustomer={customer}
            setSharedCustomer={(c) => setCustomer(c as CustomerDto)}
            onOrderFetched={(order) => setEditOrderInfo(order)} 
            onOpenCustomerModal={() => setShowCustomerPopup(true)}
            onCloseMobile={() => setShowMobileTicket(false)}
            onReturnToCreate={handleReturnToCreate} 
          />
        ) : (
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
        )}
      </aside>

      {showMobileTicket && <div className="fixed inset-0 bg-[#1A3A52]/50 z-30 lg:hidden backdrop-blur-sm" onClick={() => setShowMobileTicket(false)} />}

      <DishDetailModal dish={selectedDish} isOpen={!!selectedDish} onClose={() => setSelectedDish(null)} onAdd={handleAddDishWithQuantity} locale={locale} getLocalizedDishName={getLocalizedDishName} />
      <TableSelectionModal isOpen={showTablePopup} onClose={() => setShowTablePopup(false)} tables={tables} selectedTable={selectedTable} onSelectTable={setSelectedTable} />
      <CustomerSearchModal isOpen={showCustomerPopup} onClose={() => setShowCustomerPopup(false)} currentCustomer={customer} onSelectCustomer={setCustomer} />
      
      {/* CHỈ RENDER NẾU KHÔNG Ở TRONG CHẾ ĐỘ EDIT */}
      {!activeOrderId && (
        <PrintOrderModal
          order={mappedOrderHistoryCreate as any}
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          type="invoice"
        />
      )}
    </div>
  );
};