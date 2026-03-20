'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Check } from 'lucide-react';
import { createOrderService } from '../../order-create/services/create-edit-order.service';
import { getDishById } from '../../create-edit-dish/services/dish.service';
import { DishDto, CategoryDto } from '../../order-create/types/create-order.types';
import { useTranslations, useLocale } from 'next-intl';

interface DishSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (dishDetail: any) => void;
    targetLocale?: string;
}

export const DishSelectionModal = ({ isOpen, onClose, onSelect, targetLocale }: DishSelectionModalProps) => {
    const t = useTranslations('SystemSettings');
    const locale = useLocale();
    const activeLang = targetLocale || locale;
    const [search, setSearch] = useState("");
    const [allDishes, setAllDishes] = useState<DishDto[]>([]);
    const [categories, setCategories] = useState<CategoryDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSelecting, setIsSelecting] = useState<number | null>(null);

    const getLocalizedDishName = (dish: DishDto) => {
        const localized = dish.i18n[activeLang] || dish.i18n['en'] || dish.i18n['vi'];
        return localized?.dishName || `Dish #${dish.dishId}`;
    };

    const getLocalizedCategoryName = (catId: number) => {
        const cat = categories.find(c => c.categoryId === catId);
        if (!cat) return t('DishModal.noCategory');
        if (activeLang === 'vi') return cat.nameVi;
        if (activeLang === 'fr') return cat.nameFr;
        return cat.nameEn;
    };

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const [fetchedDishes, fetchedCategories] = await Promise.all([
                createOrderService.getDishes(),
                createOrderService.getCategories()
            ]);
            setAllDishes(fetchedDishes);
            setCategories(fetchedCategories);
        } catch (error) {
            console.error("Failed to fetch initial data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
        } else {
            setSearch("");
            setAllDishes([]);
        }
    }, [isOpen]);

    const filteredDishes = allDishes.filter(dish =>
        getLocalizedDishName(dish).toLowerCase().includes(search.toLowerCase())
    );

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Filtering is done client-side via filteredDishes
    };

    const handleSelect = async (dishId: number) => {
        if (isSelecting !== null) return;

        setIsSelecting(dishId);
        try {
            const detail = await getDishById(dishId);
            if (!detail) throw new Error("No detail found");
            onSelect(detail);
            onClose();
        } catch (error) {
            console.error("Failed to fetch dish detail", error);
            const errorMsg = error instanceof Error ? error.message : "Internal Error";
            alert(t('DishModal.selectError', { error: errorMsg }));
        } finally {
            setIsSelecting(null);
        }
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            title={t('Common.selectFromMenu')}
            width="600px"
            footer={
                <div className="flex justify-end">
                    <Button variant="ghost" onClick={onClose}>
                        {t('Common.cancel')}
                    </Button>
                </div>
            }
        >
            <div className="px-6 py-4 space-y-4 flex flex-col h-full max-h-[60vh]">
                <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder={t('Common.search') + "..."}
                        className="pl-10 pr-20"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button
                        type="submit"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('Common.search')}
                    </Button>
                </form>

                <div className="flex-1 overflow-y-auto min-h-[350px] border rounded-lg bg-gray-50/30 custom-scrollbar">
                    {isLoading && allDishes.length === 0 ? (
                        <div className="h-full flex items-center justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
                        </div>
                    ) : filteredDishes.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12 px-4 text-center">
                            <p className="text-sm">{t('Common.noResults')}</p>
                        </div>
                    ) : (
                        <div className="divide-y bg-white">
                            {filteredDishes.map((dish) => (
                                <div
                                    key={dish.dishId}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group cursor-pointer"
                                    onClick={() => handleSelect(dish.dishId)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase">{t('DishModal.dishLabel')}</div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">
                                                {getLocalizedDishName(dish)}
                                            </h4>
                                            <p className="text-xs text-gray-500">{getLocalizedCategoryName(dish.categoryId)}</p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-primary h-8 w-8 p-0"
                                        disabled={isSelecting === dish.dishId}
                                    >
                                        {isSelecting === dish.dishId ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Check className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    );
};
