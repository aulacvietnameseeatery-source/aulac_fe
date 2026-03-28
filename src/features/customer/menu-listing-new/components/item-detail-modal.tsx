import React from 'react';
import { X } from 'lucide-react';
import { MenuItemData } from '../data/mock-menu';
import { useLandingPageSettings } from '@/hooks/use-landing-page-settings';

interface ItemDetailModalProps {
    item: MenuItemData | null;
    onClose: () => void;
    onAddToCart: (item: MenuItemData) => void;
}

export const ItemDetailModal = ({ item, onClose, onAddToCart }: ItemDetailModalProps) => {
    const { data: settings } = useLandingPageSettings();
    const showDishImage = settings?.showDishImage ?? true;

    if (!item) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-[#0f172a] border border-[#C5A059] w-full max-w-md p-6 rounded-lg shadow-2xl animate-in fade-in zoom-in duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-[#C5A059] hover:text-white"
                >
                    <X size={24} />
                </button>

                {showDishImage && (
                    <div className="aspect-video w-full rounded overflow-hidden mb-4 border border-[#C5A059]/30">
                        <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <h3 className="font-display text-2xl text-[#C5A059] mb-2">{item.name}</h3>
                <p className="font-serif text-[#E5D9B6]/80 text-sm mb-6 leading-relaxed">
                    {item.desc}
                    <br /><br />
                    A perfect choice for your dining experience. Prepared with fresh ingredients and traditional receipts.
                </p>

                <div className="flex items-center justify-between mt-auto">
                    <span className="font-display text-xl text-white font-bold">{item.price} CHF</span>

                    <button
                        onClick={() => {
                            onAddToCart(item);
                            onClose();
                        }}
                        className="bg-[#C5A059] text-[#0f172a] px-6 py-2 font-bold uppercase tracking-widest hover:bg-white transition-colors rounded-sm"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};
