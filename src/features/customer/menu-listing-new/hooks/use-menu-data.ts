import { I18nText, MenuCategory, MenuItemData } from "../data/mock-menu";

export interface DishDisplayDto {
    dishId: number;
    dishName: I18nText;
    price: number;
    categoryId: number;
    categoryName: I18nText;
    description: I18nText;
    isChefRecommended: boolean;
    imageUrl: string | null;
}

export interface RawMenuItemData {
    id: string;
    name: I18nText;
    price: number | string;
    desc: I18nText;
    image: string;
}

export interface RawMenuCategory {
    id: string;
    name: I18nText;
    items: RawMenuItemData[];
    sequence?: number;
}

export const formatMenuData = (dishes: DishDisplayDto[]): RawMenuCategory[] => {
    const groupedData: Record<string, { catI18n: I18nText, items: RawMenuItemData[], sequence: number }> = {};

    dishes.forEach(dish => {
        const catKey = dish.categoryName?.en || "Uncategorized";

        if (!groupedData[catKey]) {
            groupedData[catKey] = {
                catI18n: dish.categoryName || { vi: "Khác", en: "Uncategorized", fr: "Autres" },
                items: [],
                sequence: dish.categoryId ?? 999
            };
        }

        groupedData[catKey].items.push({
            id: dish.dishId.toString(),
            name: dish.dishName,
            price: dish.price,
            desc: dish.description || { vi: "", en: "", fr: "" },
            image: dish.imageUrl || "/images/logo.png"
        });
    });

    const formattedMenu: RawMenuCategory[] = Object.keys(groupedData).map(key => ({
        id: key.toLowerCase().replace(/\s+/g, '-'),
        name: groupedData[key].catI18n,
        items: groupedData[key].items,
        sequence: groupedData[key].sequence
    }));

    // 4. Sort tự động theo Category ID (2 -> 3 -> 4...)
    return formattedMenu.sort((a, b) => (a.sequence || 999) - (b.sequence || 999));
};