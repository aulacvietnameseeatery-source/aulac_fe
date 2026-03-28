import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Plus, Minus } from 'lucide-react';
import { DishDto } from '../types/create-order.types';
import { useTranslations } from 'next-intl';

interface Props {
  isOpen: boolean; dish: DishDto | null; onClose: () => void;
  onAdd: (dish: DishDto, quantity: number) => void;
  locale: string; getLocalizedDishName: (dish: DishDto) => string;
}

export const DishDetailModal: React.FC<Props> = ({ isOpen, dish, onClose, onAdd, locale, getLocalizedDishName }) => {
  const t = useTranslations("orders.management.DishDetail");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen) setQuantity(1);
  }, [isOpen, dish]);

  if (!isOpen || !dish) return null;

  const imgSrc = dish.imageUrl ? `${dish.imageUrl}` : '/images/logo.png';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1A3A52]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#FDFBF9] rounded-2xl shadow-2xl overflow-hidden z-50 border border-[#D5BA98]/50 animate-in fade-in zoom-in-95 duration-200">

        <button onClick={onClose} className="absolute top-3 right-3 bg-white/80 backdrop-blur rounded-full p-1.5 text-[#1A3A52] hover:bg-white z-10 shadow-sm transition-colors">
          <X className="w-5 h-5" />
        </button>

        {/* ── Cập nhật hiển thị Ảnh ── */}
        <div className="w-full h-48 bg-[#FDFBF9] flex items-center justify-center overflow-hidden border-b border-[#D5BA98]/30">
          <img
            src={imgSrc}
            alt={getLocalizedDishName(dish)}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = '/images/logo.png';
              e.currentTarget.className = "w-1/2 h-1/2 object-contain opacity-50";
            }}
          />
        </div>
        {/* ────────────────────────────── */}

        <div className="p-5">
          <h3 className="text-xl font-bold text-[#1A3A52] mb-1 leading-tight">{getLocalizedDishName(dish)}</h3>
          <p className="text-sm text-[#1A3A52]/70 mb-4 line-clamp-3">
            {dish.i18n[locale]?.description || dish.i18n['en']?.description || t('noDescription')}
          </p>

          <div className="flex items-center justify-between border-t border-[#D5BA98]/30 pt-4 mt-2">
            <div>
              <p className="text-xs text-[#1A3A52]/50 font-semibold uppercase tracking-wider mb-0.5">{t('price')}</p>
              <span className="text-xl font-bold text-[#1A3A52]">CHF {dish.price.toFixed(2)}</span>
            </div>

            <div className="flex items-center bg-white border border-[#D5BA98]/40 rounded-lg p-1 shadow-sm">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-md flex items-center justify-center text-[#1A3A52] hover:bg-[#D5BA98]/20 transition"><Minus className="w-4 h-4" /></button>
              <input type="number" value={quantity} readOnly className="w-10 text-center text-sm font-bold text-[#1A3A52] bg-transparent outline-none" />
              <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 rounded-md flex items-center justify-center text-[#D5BA98] bg-[#1A3A52] hover:bg-[#1A3A52]/90 transition shadow-md"><Plus className="w-4 h-4" /></button>
            </div>
          </div>

          <button onClick={() => onAdd(dish, quantity)} className="w-full mt-5 bg-[#1A3A52] text-[#D5BA98] font-bold px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#1A3A52]/90 transition-all shadow-md">
            <ShoppingBag className="w-5 h-5" /> {t('addToOrder')} (CHF {(dish.price * quantity).toFixed(2)})
          </button>
        </div>
      </div>
    </div>
  );
};