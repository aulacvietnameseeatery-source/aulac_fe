import { I18nText, MenuCategory, MenuItemData } from "../data/mock-menu";

// Cập nhật DTO khớp với backend mới
export interface DishDisplayDto {
    dishId: number;
    dishName: I18nText;
    price: number;
    categoryName: I18nText;
    description: I18nText;
    isChefRecommended: boolean;
    imageUrl: string | null;
}

// Hàm format dữ liệu dùng chung (Không dùng Hook nữa)
export const formatMenuData = (dishes: DishDisplayDto[]): MenuCategory[] => {
    const groupedData: Record<string, { catI18n: I18nText, items: MenuItemData[] }> = {};

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

    const formattedMenu: MenuCategory[] = Object.keys(groupedData).map(key => ({
        id: key.toLowerCase().replace(/\s+/g, '-'),
        name: groupedData[key].catI18n,
        items: groupedData[key].items
    }));

    return formattedMenu.sort((a, b) => (a.name.en || "").localeCompare(b.name.en || ""));
};