"use client";

import React, { useState } from 'react';
import { useCreateOrder } from '../hooks/useCreateOrder';
import { createOrderService } from '../services/create-edit-order.service';
import { MenuCatalog } from './menu-catalog';
import { CurrentTicket } from './current-ticket';
import { TableSelectionModal } from './table-selection-modal';
import { CustomerSearchModal } from './customer-search-modal';
import { InvoiceModal } from './invoice-modal';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

// (Component này được export để sử dụng trong Next.js Page)
export const CreateOrderPage = () => {
  const t = useTranslations("Order.Create");
  const {
    locale, isLoading, dishes, categories, tables, cart, orderType, setOrderType,
    selectedTable, setSelectedTable, customer, setCustomer,
    getLocalizedDishName, getLocalizedCategoryName, addToCart, updateQuantity, updateNote, removeFromCart, clearCart
  } = useCreateOrder();

  const [showTablePopup, setShowTablePopup] = useState(false);
  const [showCustomerPopup, setShowCustomerPopup] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

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
    } catch (error) {
      console.error("Failed to place order", error);
      toast.error('Error placing order.');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A3A51]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[100dvh] lg:h-full w-full font-sans gap-4 lg:gap-6 overflow-hidden">
      
      {/* Cột trái: Menu Món Ăn */}
      <MenuCatalog 
        title={t('title')}
        subtitle={t('subtitle')}
        dishes={dishes} 
        categories={categories}
        locale={locale} 
        getLocalizedDishName={getLocalizedDishName} 
        getLocalizedCategoryName={getLocalizedCategoryName}
        onAddToCart={addToCart} 
      />

      {/* Cột phải: Phiếu Đặt Món (Cart) */}
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
        onCreateInvoice={() => setShowInvoiceModal(true)}
      />

      {/* Modal: Chọn bàn */}
      <TableSelectionModal 
        isOpen={showTablePopup} 
        onClose={() => setShowTablePopup(false)} 
        tables={tables} 
        selectedTable={selectedTable} 
        onSelectTable={setSelectedTable} 
      />

      {/* Modal: Tìm Khách Hàng */}
      <CustomerSearchModal 
        isOpen={showCustomerPopup} 
        onClose={() => setShowCustomerPopup(false)}
        currentCustomer={customer}
        onSelectCustomer={setCustomer}
      />

      <InvoiceModal 
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        cart={cart}
        orderType={orderType}
        selectedTable={selectedTable}
        customer={customer}
      />
    </div>
  );
};