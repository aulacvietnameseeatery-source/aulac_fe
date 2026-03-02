import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Plus, Filter } from 'lucide-react';
import { DishDto, CategoryDto } from '../types/create-order.types';

interface Props {
  title: string;          
  subtitle: string;      
  isReadOnly?: boolean;
  dishes: DishDto[];
  categories: CategoryDto[];
  locale: string;
  getLocalizedDishName: (dish: DishDto) => string;
  getLocalizedCategoryName: (cat: CategoryDto) => string;
  onAddToCart: (dish: DishDto) => void;
}

export const MenuCatalog: React.FC<Props> = ({ title, subtitle, isReadOnly = false, dishes, categories, locale, getLocalizedDishName, getLocalizedCategoryName, onAddToCart }) => {
  const t = useTranslations("Order.Create");
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'ALL'>('ALL');

  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      // 1. Lọc theo tên
      const matchSearch = getLocalizedDishName(dish).toLowerCase().includes(searchQuery.toLowerCase());
      // 2. Lọc theo danh mục
      const matchCategory = selectedCategoryId === 'ALL' || dish.categoryId === selectedCategoryId;
      
      return matchSearch && matchCategory;
    });
  }, [dishes, searchQuery, selectedCategoryId, locale, getLocalizedDishName]);

  return (
    <div className="flex-1 flex flex-col min-h-[60vh] lg:min-h-0 min-w-0 bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="shrink-0 px-6 py-5 border-b border-gray-100">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1A3A51]">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/50 flex flex-col">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold text-gray-800">{t('menuCatalog')}</h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Filter Category */}
            <div className="relative w-full sm:w-auto">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                className="w-full sm:w-48 pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A51] appearance-none cursor-pointer"
              >
                <option value="ALL">{t('selectFilterAll')}</option>
                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {getLocalizedCategoryName(cat)}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder={t('searchDish')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A51]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* ... (Phần render danh sách món ăn giữ nguyên như cũ) */}
          {filteredDishes.map((dish) => (
            <div key={dish.dishId} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow">
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 leading-tight">{getLocalizedDishName(dish)}</h3>
                  <span className="font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded-md text-sm shrink-0 border border-gray-100">
                    CHF {dish.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{dish.i18n[locale]?.description || dish.i18n['en']?.description}</p>
              </div>
              <button onClick={() => onAddToCart(dish)} disabled={isReadOnly} className="cursor-pointer mt-4 w-full flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-[#1A3A51] hover:bg-gray-50 transition-colors">
                <Plus className="w-4 h-4" /> {t('add').toUpperCase()}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};