export interface I18nText {
    vi: string;
    en: string;
    fr: string;
}

// UI chỉ nhận string
export interface MenuItemData {
    id: string;
    name: string;
    price: number | string;
    desc: string;
    image: string;
}

// UI chỉ nhận string
export interface MenuCategory {
    id: string;
    name: string;
    displayOrder?: number;
    items: MenuItemData[];
}