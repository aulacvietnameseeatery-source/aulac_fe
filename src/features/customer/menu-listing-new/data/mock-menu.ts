export interface I18nText {
    vi: string;
    en: string;
    fr: string;
}

export interface MenuItemData {
    id: string;
    name: I18nText;
    price: number | string;
    desc: I18nText;
    image: string;
}

export interface MenuCategory {
    id: string;
    name: I18nText;
    items: MenuItemData[];
}