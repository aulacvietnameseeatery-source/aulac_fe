import { I18nText, MenuCategory, MenuItemData } from "../data/mock-menu";

export interface DishDisplayDto {
    dishId: number;
    dishName: I18nText;
    price: number;
    categoryName: I18nText;
    description: I18nText;
    isChefRecommended: boolean;
    imageUrl: string | null;
}

// 1. TẠO TYPE MỚI CHO DỮ LIỆU THÔ CHỨA ĐA NGÔN NGỮ
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
}

// 2. Cập nhật hàm format trả về RawMenuCategory[]
export const formatMenuData = (dishes: DishDisplayDto[]): RawMenuCategory[] => {
    const groupedData: Record<string, { catI18n: I18nText, items: RawMenuItemData[] }> = {};

    dishes.forEach(dish => {
        const catKey = dish.categoryName?.en || "Uncategorized";

        if (!groupedData[catKey]) {
            groupedData[catKey] = {
                catI18n: dish.categoryName || { vi: "Khác", en: "Uncategorized", fr: "Autres" },
                items: []
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
        items: groupedData[key].items
    }));

    return formattedMenu.sort((a, b) => (a.name.en || "").localeCompare(b.name.en || ""));
};