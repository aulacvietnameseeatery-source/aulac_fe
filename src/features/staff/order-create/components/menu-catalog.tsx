import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { DishDto, CategoryDto } from '../types/create-order.types';
import { BASE_URL } from "@/lib/http";
import { useDraggableScroll } from '@/hooks/use-draggable-scroll';

interface Props {
  isReadOnly?: boolean;
  title: string; subtitle: string; dishes: DishDto[]; categories: CategoryDto[]; locale: string;
  getLocalizedDishName: (dish: DishDto) => string; getLocalizedCategoryName: (cat: CategoryDto) => string;
  onDishClick: (dish: DishDto) => void;
  onQuickAdd: (dish: DishDto) => void;
}

export const MenuCatalog: React.FC<Props> = ({ isReadOnly, title, subtitle, dishes, categories, locale, getLocalizedDishName, getLocalizedCategoryName, onDishClick, onQuickAdd }) => {
  const t = useTranslations("orders.management.Create");
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'ALL'>('ALL');

  const scrollProps = useDraggableScroll<HTMLDivElement>();

  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      const matchSearch = getLocalizedDishName(dish).toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategoryId === 'ALL' || dish.categoryId === selectedCategoryId;
      return matchSearch && matchCategory;
    });
  }, [dishes, searchQuery, selectedCategoryId, locale, getLocalizedDishName]);

  return (
    // Dùng h-full flex flex-col để phần header đứng yên, phần grid cuộn
    <div className="flex flex-col h-full gap-4">
      {/* Header & Search (Cố định - shrink-0) */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[#1A3A52] text-xl font-semibold tracking-wide">{title}</h2>
          <p className="text-sm text-[#1A3A52]/60 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center bg-white border border-[#D5BA98]/40 rounded-lg px-3 py-2 gap-2 focus-within:border-[#1A3A52] transition-colors shadow-sm">
          <Search className="w-4 h-4 text-[#1A3A52]/50" />
          <input
            type="text" placeholder={t('searchDish')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="outline-none text-sm text-[#1A3A52] bg-transparent w-full sm:w-48 placeholder:text-[#1A3A52]/40"
          />
        </div>
      </div>
      <div className="relative group">
        {/* Category Tabs (Cố định, cuộn ngang) */}
        <div {...scrollProps} className="shrink-0 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b border-[#D5BA98]/20 cursor-grab active:cursor-grabbing">
          <button
            onClick={() => setSelectedCategoryId('ALL')}
            className={`flex items-center px-4 py-2 rounded-lg border shrink-0 transition-all font-medium text-sm ${selectedCategoryId === 'ALL' ? "border-[#1A3A52] bg-[#1A3A52] text-[#D5BA98] shadow-sm" : "border-[#D5BA98]/40 bg-[#FDFBF9] text-[#1A3A52]/70 hover:bg-[#D5BA98]/20"
              }`}
          >
            {t('selectFilterAll')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.categoryId} onClick={() => setSelectedCategoryId(cat.categoryId)}
              className={`flex items-center px-4 py-2 rounded-lg border shrink-0 transition-all font-medium text-sm ${selectedCategoryId === cat.categoryId ? "border-[#1A3A52] bg-[#1A3A52] text-[#D5BA98] shadow-sm" : "border-[#D5BA98]/40 bg-[#FDFBF9] text-[#1A3A52]/70 hover:bg-[#D5BA98]/20"
                }`}
            >
              {getLocalizedCategoryName(cat)}
            </button>
          ))}
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#FDFBF9] to-transparent pointer-events-none" />
      </div>

      {/* Menu Grid (Phần này sẽ tự động cuộn dọc) */}
      <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:thin] pr-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
          {filteredDishes.map((dish) => {
            const categoryName = categories.find(c => c.categoryId === dish.categoryId) ? getLocalizedCategoryName(categories.find(c => c.categoryId === dish.categoryId)!) : 'Menu';
            const imgSrc = dish.imageUrl ? dish.imageUrl : '/images/logo.png';

            return (
              <div
                key={dish.dishId} onClick={() => !isReadOnly && onDishClick(dish)}
                className="bg-white border border-[#D5BA98]/30 hover:border-[#1A3A52] rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer flex flex-col group"
              >
                <div className="relative h-28 overflow-hidden bg-[#D5BA98]/10 flex items-center justify-center">
                  <img
                    src={`${BASE_URL}${imgSrc}`}
                    alt={getLocalizedDishName(dish)}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = '/images/logo.png';
                      e.currentTarget.className = "w-1/2 h-1/2 object-contain opacity-50";
                    }}
                  />
                  {!isReadOnly && <div className="absolute inset-0 bg-[#1A3A52]/0 group-hover:bg-[#1A3A52]/5 transition-colors" />}
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <span className="text-[10px] text-[#1A3A52]/50 uppercase font-semibold mb-1 tracking-wider">{categoryName}</span>
                  <p className="text-[#1A3A52] text-sm font-semibold leading-tight mb-2 line-clamp-2 flex-1">
                    {getLocalizedDishName(dish)}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[#1A3A52] font-bold text-base">CHF {dish.price.toFixed(2)}</span>
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickAdd(dish);
                        }}
                        className="w-6 h-6 rounded-full border border-[#1A3A52] flex items-center justify-center text-[#1A3A52] group-hover:bg-[#1A3A52] group-hover:text-[#D5BA98] hover:scale-110 transition-all"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};