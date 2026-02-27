"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Minus, Receipt, UtensilsCrossed, Trash2, X, UserSearch, LayoutGrid, Check, AlertTriangle, FileText } from 'lucide-react';

// IMPORT COMPONENT DIALOG CỦA BẠN (Sửa lại đường dẫn nếu cần)
import { Dialog } from '@/components/ui/dialog'; 

// --- Types ---
type Dish = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  filterTag: string;
};

type CartItem = Dish & {
  quantity: number;
};

type TableStatus = 'available' | 'occupied' | 'reserved' | 'locked';

export type TableDto = {
  tableId: number;
  tableCode: string;
  capacity: number;
  statusCode: TableStatus;
  hasActiveOrder: boolean;
  activeOrderId?: number | null;
  upcomingReservationTime?: string | null;
  zone: string;
};

type OrderType = 'dine-in' | 'take-away';

type CustomerInfo = {
  phone: string;
  name: string;
  email: string;
};

// --- Mock Data ---
const MOCK_DISHES: Dish[] = [
  { id: '1', name: 'Pho Bo (Beef)', description: 'Beef noodle soup with flank and brisket.', price: 14.50, category: 'Traditional Pho', filterTag: 'Pho' },
  { id: '2', name: 'Pho Ga (Chicken)', description: 'Clear chicken broth with tender breast slices.', price: 13.50, category: 'Traditional Pho', filterTag: 'Pho' },
  { id: '3', name: 'Pho Chay (Vegan)', description: 'Vegetable broth with tofu and mushrooms.', price: 13.50, category: 'Traditional Pho', filterTag: 'Pho' },
  { id: '4', name: 'Com Tam', description: 'Grilled pork chop with broken rice.', price: 16.00, category: 'Rice & Specialties', filterTag: 'Main' },
  { id: '5', name: 'Banh Mi Special', description: 'Signature Vietnamese baguette.', price: 9.50, category: 'Rice & Specialties', filterTag: 'Main' },
  { id: '6', name: 'Bun Thit Nuong', description: 'Cold vermicelli noodles with pork.', price: 14.00, category: 'Rice & Specialties', filterTag: 'Main' },
  { id: '7', name: 'Ca Phe Sua Da', description: 'Iced condensed milk coffee.', price: 5.50, category: 'Beverages', filterTag: 'Drinks' },
  { id: '8', name: 'Soda Chanh', description: 'Fresh lime soda with mint.', price: 4.50, category: 'Beverages', filterTag: 'Drinks' },
];

const MOCK_TABLES: TableDto[] = [
  { tableId: 1, tableCode: 'T01', capacity: 4, statusCode: 'available', hasActiveOrder: false, zone: 'Main Room' },
  { tableId: 2, tableCode: 'T02', capacity: 2, statusCode: 'occupied', hasActiveOrder: true, activeOrderId: 991, zone: 'Main Room' },
  { tableId: 3, tableCode: 'T03', capacity: 6, statusCode: 'reserved', hasActiveOrder: false, upcomingReservationTime: '2024-05-20T19:30:00', zone: 'Main Room' },
  { tableId: 4, tableCode: 'T04', capacity: 4, statusCode: 'locked', hasActiveOrder: false, zone: 'Main Room' },
  { tableId: 5, tableCode: 'V01', capacity: 8, statusCode: 'available', hasActiveOrder: false, zone: 'VIP' },
  { tableId: 6, tableCode: 'V02', capacity: 10, statusCode: 'available', hasActiveOrder: false, zone: 'VIP' },
  { tableId: 7, tableCode: 'B01', capacity: 2, statusCode: 'occupied', hasActiveOrder: true, activeOrderId: 992, zone: 'Balcony' },
  { tableId: 8, tableCode: 'B02', capacity: 4, statusCode: 'available', hasActiveOrder: false, zone: 'Balcony' },
];

const MOCK_CUSTOMERS: Record<string, { name: string; email: string }> = {
  '0987654321': { name: 'Nguyen Van A', email: 'a.nguyen@email.com' },
  '0123456789': { name: 'Le Thi B', email: 'b.le@email.com' },
};

const FILTER_TABS = ['All', 'Pho', 'Main', 'Drinks'];

export default function CreateOrderPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [tables, setTables] = useState<TableDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  
  // Table States
  const [selectedTable, setSelectedTable] = useState<TableDto | null>(null);
  const [showTablePopup, setShowTablePopup] = useState(false);
  const [activeZoneTab, setActiveZoneTab] = useState('All');

  // Dialog State (Occupied / Reserved confirmation)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'occupied' | 'reserved' | null;
    table: TableDto | null;
  }>({ isOpen: false, type: null, table: null });

  // Customer States
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [showCustomerPopup, setShowCustomerPopup] = useState(false);
  const [tempCustomer, setTempCustomer] = useState<CustomerInfo>({ phone: '', name: '', email: '' });

  useEffect(() => {
    setDishes(MOCK_DISHES);
    setTables(MOCK_TABLES);
  }, []);

  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      const matchSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = activeTab === 'All' || dish.filterTag === activeTab;
      return matchSearch && matchCategory;
    });
  }, [dishes, searchQuery, activeTab]);

  const groupedDishes = useMemo(() => {
    const groups: Record<string, Dish[]> = {};
    filteredDishes.forEach((dish) => {
      if (!groups[dish.category]) groups[dish.category] = [];
      groups[dish.category].push(dish);
    });
    return groups;
  }, [filteredDishes]);

  const zones = useMemo(() => ['All', ...Array.from(new Set(tables.map(t => t.zone)))], [tables]);
  
  const filteredTables = useMemo(() => {
    if (activeZoneTab === 'All') return tables;
    return tables.filter(t => t.zone === activeZoneTab);
  }, [tables, activeZoneTab]);

  const addToCart = (dish: Dish) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === dish.id);
      if (existing) return prev.map((item) => item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...dish, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => prev.map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((item) => item.id !== id));
  const clearCart = () => setCart([]);

  const handleSelectTableClick = (table: TableDto) => {
    if (table.statusCode === 'locked') return; // Không cho phép thao tác
    
    if (table.statusCode === 'occupied') {
      setConfirmDialog({ isOpen: true, type: 'occupied', table });
      return;
    }

    if (table.statusCode === 'reserved') {
      setConfirmDialog({ isOpen: true, type: 'reserved', table });
      return;
    }
    
    // Nếu available
    setSelectedTable(table);
    setShowTablePopup(false);
  };

  const handleConfirmSelectTable = () => {
    if (confirmDialog.table) {
      setSelectedTable(confirmDialog.table);
      setShowTablePopup(false);
    }
    setConfirmDialog({ isOpen: false, type: null, table: null });
  };

  const handlePlaceOrder = () => {
    console.log('Placing Order...', { orderType, tableId: selectedTable?.tableId, customer, items: cart });
    alert('Order placed successfully!');
    clearCart();
    setCustomer(null);
    setSelectedTable(null);
  };

  const handleCreateInvoice = () => {
    console.log('Generating Invoice...', { orderType, tableId: selectedTable?.tableId, customer, items: cart });
    alert('Invoice created!');
  };

  const handleSearchCustomer = () => {
    const found = MOCK_CUSTOMERS[tempCustomer.phone];
    if (found) setTempCustomer(prev => ({ ...prev, name: found.name, email: found.email }));
    else alert('Customer not found in database. You can add them manually.');
  };

  const handleSaveCustomer = () => {
    if (tempCustomer.phone.trim() === '') setCustomer(null);
    else setCustomer(tempCustomer);
    setShowCustomerPopup(false);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    // THÊM: bg-slate-100 và padding p-4 để tách biệt phần nội dung khỏi viền màn hình, giúp dễ nhìn hơn
    <div className="flex flex-col lg:flex-row h-full w-full font-sans lg:gap-6 overflow-y-auto lg:overflow-hidden">
      
      {/* ================= LEFT SECTION: MENU ================= */}
      <div className="flex-1 flex flex-col min-h-[60vh] lg:min-h-0 min-w-0 bg-white rounded-2xl shadow-sm overflow-hidden">
        
        {/* Header Tích hợp vào cột trái để căn bằng chiều cao */}
        <div className="shrink-0 px-6 py-5 border-b border-gray-100">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1A3A51]">Create Order</h1>
          <p className="text-sm text-gray-500 mt-1">Kitchen Portal • Vietnamese Eatery</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/50 flex flex-col">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
            {/* Đổi tên Title */}
            <h2 className="text-lg font-bold text-gray-800">Menu Catalog</h2>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Find a dish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-60 pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A51]"
                />
              </div>
              
              <div className="flex bg-white p-1 rounded-lg border border-gray-200 gap-1 overflow-x-auto hide-scrollbar">
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`cursor-pointer px-3 py-1.5 whitespace-nowrap text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            {Object.entries(groupedDishes).map(([category, items]) => (
              <div key={category} className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-px flex-1 bg-gray-200"></div>
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{category}</h2>
                  <div className="h-px flex-1 bg-gray-200"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {items.map((dish) => (
                    <div key={dish.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 leading-tight">{dish.name}</h3>
                          <span className="font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded-md text-sm shrink-0 border border-gray-100">
                            ${dish.price.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2">{dish.description}</p>
                      </div>
                      
                      <button
                        onClick={() => addToCart(dish)}
                        className="cursor-pointer mt-4 w-full flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-[#1A3A51] hover:bg-gray-50 active:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> ADD
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {filteredDishes.length === 0 && (
              <div className="text-center py-20 text-gray-400">No dishes found.</div>
            )}
          </div>
        </div>
      </div>

      {/* ================= RIGHT SECTION: CART ================= */}
      <div className="w-full lg:w-[400px] xl:w-[450px] h-[600px] lg:h-full flex flex-col bg-white rounded-2xl shadow-xl border border-gray-200 shrink-0 z-10 overflow-hidden relative">
        
        <div className="shrink-0 p-4 lg:p-5 border-b border-gray-100 flex flex-col gap-4 bg-white/95 backdrop-blur-sm z-20 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#1A3A51]" />
              <h2 className="text-lg font-bold text-gray-900">Current Ticket</h2>
            </div>
            <button onClick={clearCart} className="cursor-pointer text-xs font-bold text-gray-400 hover:text-red-500 uppercase tracking-wide">
              Clear
            </button>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setOrderType('dine-in')}
              className={`cursor-pointer flex-1 py-1.5 md:py-2 text-sm font-semibold rounded-md transition-all ${orderType === 'dine-in' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Dine-in
            </button>
            <button
              onClick={() => setOrderType('take-away')}
              className={`cursor-pointer flex-1 py-1.5 md:py-2 text-sm font-semibold rounded-md transition-all ${orderType === 'take-away' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Take-away
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {orderType === 'dine-in' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Dining Table</label>
                <div className="flex items-stretch gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm overflow-hidden">
                    <LayoutGrid className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="font-medium text-gray-700 truncate">
                      {selectedTable ? `${selectedTable.tableCode} - ${selectedTable.zone}` : 'No table selected'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowTablePopup(true)} 
                    className="cursor-pointer bg-[#1A3A51] hover:bg-[#122b3e] text-white font-medium text-sm px-4 rounded-lg transition-colors flex-shrink-0"
                  >
                    {selectedTable ? 'Change' : 'Select'}
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Customer</label>
              <div className="flex items-stretch gap-2">
                <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm overflow-hidden">
                  <UserSearch className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="font-medium text-gray-700 truncate">
                    {customer ? `${customer.name || 'No Name'} - ${customer.phone}` : 'Anonymous'}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setTempCustomer(customer || { phone: '', name: '', email: '' });
                    setShowCustomerPopup(true);
                  }} 
                  className="cursor-pointer bg-white hover:bg-gray-50 text-[#1A3A51] border border-[#1A3A51]/20 font-medium text-sm px-4 rounded-lg transition-colors flex-shrink-0"
                >
                  {customer ? 'Change' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-3 bg-slate-50 min-h-0">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
              <UtensilsCrossed className="w-10 h-10 opacity-20" />
              <p className="text-sm">Ticket is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm group">
                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="font-semibold text-sm text-gray-900 truncate">{item.name}</h4>
                  <div className="font-semibold text-sm text-[#1A3A51] mt-0.5">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg">
                    <button onClick={() => updateQuantity(item.id, -1)} className="cursor-pointer p-1.5 text-gray-500 hover:text-[#1A3A51] transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                    <span className="font-semibold text-sm w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="cursor-pointer p-1.5 text-gray-500 hover:text-[#1A3A51] transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="cursor-pointer p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="shrink-0 p-4 lg:p-5 border-t border-gray-100 bg-white flex flex-col gap-4 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (10%)</span>
              <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-end pb-1">
            <span className="font-bold text-gray-900 text-lg">Total</span>
            <span className="font-bold text-[#1A3A51] text-xl md:text-2xl">${total.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <button
              onClick={handleCreateInvoice}
              disabled={cart.length === 0 || (orderType === 'dine-in' && !selectedTable)}
              className="cursor-pointer bg-white hover:bg-gray-50 border-2 border-[#1A3A51] text-[#1A3A51] font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:border-gray-300 disabled:text-gray-400 text-sm shadow-sm"
            >
              <FileText className="w-4 h-4" />
              Create Invoice
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={cart.length === 0 || (orderType === 'dine-in' && !selectedTable)}
              className="cursor-pointer bg-[#1A3A51] hover:bg-[#122b3e] text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md text-sm"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODAL: SELECT TABLE ================= */}
      {showTablePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setShowTablePopup(false)} />
          
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
              <h3 className="font-bold text-gray-900 text-lg">Select Table</h3>
              <button onClick={() => setShowTablePopup(false)} className="cursor-pointer text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                {zones.map(zone => (
                  <button
                    key={zone}
                    onClick={() => setActiveZoneTab(zone)}
                    className={`cursor-pointer px-4 py-1.5 whitespace-nowrap text-sm font-medium rounded-full transition-colors border ${
                      activeZoneTab === zone ? 'bg-[#1A3A51] text-white border-[#1A3A51]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {zone}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredTables.map(table => {
                  const isSelected = selectedTable?.tableId === table.tableId;
                  const isAvailable = table.statusCode === 'available';
                  const isOccupied = table.statusCode === 'occupied';
                  const isReserved = table.statusCode === 'reserved';
                  const isLocked = table.statusCode === 'locked';

                  return (
                    // Bỏ disable đối với occupied/reserved để bắt sự kiện mở confirm Dialog
                    <button
                      key={table.tableId}
                      onClick={() => handleSelectTableClick(table)}
                      disabled={isLocked}
                      className={`cursor-pointer relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 text-left w-full h-full min-h-[100px]
                        ${isSelected ? 'border-[#1A3A51] bg-[#1A3A51]/5' : 'border-transparent bg-white shadow-sm'}
                        ${isAvailable && !isSelected ? 'hover:border-[#1A3A51]/50 hover:shadow-md' : ''}
                        ${isOccupied ? 'opacity-80 hover:border-red-300 bg-red-50/50 border-red-100' : ''}
                        ${isReserved ? 'border-orange-200 bg-orange-50 hover:border-orange-400' : ''}
                        ${isLocked ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}
                      `}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-[#1A3A51] text-white rounded-full p-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                      )}

                      <span className={`font-bold text-xl mb-1 ${isOccupied ? 'text-red-700' : isReserved ? 'text-orange-700' : isLocked ? 'text-gray-500' : 'text-gray-900'}`}>
                        {table.tableCode}
                      </span>
                      
                      <div className="text-xs font-medium text-gray-500 mb-1">{table.capacity} Seats</div>
                      
                      {isAvailable && <span className="text-[10px] uppercase font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full mt-auto">Available</span>}
                      {isOccupied && <span className="text-[10px] uppercase font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full mt-auto">Occupied</span>}
                      {isLocked && <span className="text-[10px] uppercase font-bold text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full mt-auto">Locked</span>}
                      {isReserved && (
                        <div className="flex flex-col items-center mt-auto">
                          <span className="text-[10px] uppercase font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full mb-0.5 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Reserved
                          </span>
                          {table.upcomingReservationTime && (
                            <span className="text-[10px] text-orange-700 font-semibold">
                              {new Date(table.upcomingReservationTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DIALOG CONFIRM OCCUPIED/RESERVED ================= */}
      <Dialog
        open={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, type: null, table: null })}
        title="Confirm Selection"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <button 
              className="cursor-pointer px-4 py-2 font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              onClick={() => setConfirmDialog({ isOpen: false, type: null, table: null })}
            >
              Cancel
            </button>
            <button 
              className="cursor-pointer px-4 py-2 font-medium bg-[#1A3A51] hover:bg-[#122b3e] text-white rounded-lg transition-colors" 
              onClick={handleConfirmSelectTable}
            >
              Confirm
            </button>
          </div>
        }
      >
        <div className="p-2 text-gray-600">
          {confirmDialog.type === 'occupied' && (
             <p>Table <b>{confirmDialog.table?.tableCode}</b> is currently occupied. Do you want to select it to add more items to the existing order?</p>
          )}
          {confirmDialog.type === 'reserved' && (
             <p>Table <b>{confirmDialog.table?.tableCode}</b> is reserved at <b>{confirmDialog.table?.upcomingReservationTime ? new Date(confirmDialog.table.upcomingReservationTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'later'}</b>. Are you sure you want to select it?</p>
          )}
        </div>
      </Dialog>

      {/* ================= MODAL: CUSTOMER ================= */}
      {showCustomerPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setShowCustomerPopup(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Customer Details</h3>
              <button onClick={() => setShowCustomerPopup(false)} className="cursor-pointer text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {/* Form Nội dung không đổi */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Phone Number</label>
                <div className="relative">
                  <input type="text" placeholder="Enter phone..." value={tempCustomer.phone} onChange={(e) => setTempCustomer({...tempCustomer, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A51]" />
                  <button onClick={handleSearchCustomer} className="cursor-pointer absolute right-1.5 top-1.5 bottom-1.5 bg-[#1A3A51] text-white px-2.5 rounded-lg hover:bg-[#122b3e] flex items-center justify-center transition-colors">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Full Name</label>
                <input type="text" placeholder="e.g. John Doe" value={tempCustomer.name} onChange={(e) => setTempCustomer({...tempCustomer, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A51]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Email</label>
                <input type="email" placeholder="john@example.com" value={tempCustomer.email} onChange={(e) => setTempCustomer({...tempCustomer, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A51]" />
              </div>
              <button onClick={handleSaveCustomer} className="cursor-pointer w-full bg-[#1A3A51] hover:bg-[#122b3e] text-white font-semibold py-3 rounded-xl text-sm mt-2 transition-colors shadow-md">
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}