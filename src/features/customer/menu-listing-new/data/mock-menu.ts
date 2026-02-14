export interface MenuItemData {
    id: string;
    name: string;
    price: number | string;
    desc: string;
    image: string;
}

export interface MenuCategory {
    id: string;
    name: string;
    items: MenuItemData[];
}

