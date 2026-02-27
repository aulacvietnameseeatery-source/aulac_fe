import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { createOrderService } from '../services/create-edit-order.service';
import { DishDto, TableDto, CustomerDto, CartItem, OrderSourceCode, CategoryDto } from '../types/create-order.types';

export function useCreateOrder() {
  const locale = useLocale();
  
  const [dishes, setDishes] = useState<DishDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]); 
  const [tables, setTables] = useState<TableDto[]>([]);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderSourceCode>('DINE_IN');
  const [selectedTable, setSelectedTable] = useState<TableDto | null>(null);
  const [customer, setCustomer] = useState<CustomerDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      try {
        const [fetchedDishes, fetchedTables, fetchedCategories] = await Promise.all([
          createOrderService.getDishes(),
          createOrderService.getTables(),
          createOrderService.getCategories() 
        ]);
        setDishes(fetchedDishes);
        setTables(fetchedTables);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const getLocalizedDishName = (dish: DishDto) => {
    const localized = dish.i18n[locale] || dish.i18n['en'];
    return localized?.dishName || `Dish #${dish.dishId}`;
  };

  const getLocalizedCategoryName = (cat: CategoryDto) => {
    if (locale === 'vi') return cat.nameVi;
    if (locale === 'fr') return cat.nameFr;
    return cat.nameEn;
  };

  const addToCart = (dish: DishDto) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.dishId === dish.dishId);
      if (existing) {
        return prev.map((item) => item.dishId === dish.dishId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...dish, quantity: 1, localName: getLocalizedDishName(dish), note: '' }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) => prev.map((item) => item.dishId === id ? { ...item, quantity: item.quantity + delta } : item).filter(item => item.quantity > 0));
  };

  const updateNote = (id: number, note: string) => {
    setCart((prev) => prev.map((item) => item.dishId === id ? { ...item, note } : item));
  };

  const removeFromCart = (id: number) => setCart((prev) => prev.filter((item) => item.dishId !== id));
  const clearCart = () => setCart([]);

  return {
    locale, isLoading, dishes, categories, tables, cart, orderType, setOrderType,
    selectedTable, setSelectedTable, customer, setCustomer,
    getLocalizedDishName, getLocalizedCategoryName, addToCart, updateQuantity, updateNote, removeFromCart, clearCart
  };
}